"""Original sound design for the APRÓBETŰ intro, synthesised from scratch (no samples, no music).

    python3 intro/audio.py output/build/sound.wav

Layers: a low suspended pad, a soft electronic pulse locked to the impact, digital pings and data
ticks for the map, two whooshes for the news graphics, a riser into the dive, and a cinematic hit
with a resolving chord when the logo lands. Output: 48 kHz / 24-bit stereo, about -14 LUFS.
"""
import sys
import wave

import numpy as np
from scipy.signal import fftconvolve, lfilter, resample_poly, butter, sosfilt

SR = 48000
DUR = 7.5
N = int(SR * DUR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(2024)

# Keep in sync with T in intro/scene.js.
T_BUDAPEST, T_FIRST_ARC, T_SPREAD, T_BUILD, T_CONVERGE, T_IMPACT = 0.25, 0.45, 1.05, 2.25, 4.35, 5.30

dry = np.zeros((2, N))
wet = np.zeros((2, N))  # reverb send


def place(sig, at, gain=1.0, pan=0.0, send=0.0):
    """Add a mono or stereo signal at time `at` (seconds) with equal-power pan."""
    sig = np.atleast_2d(sig)
    if sig.shape[0] == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.vstack([sig[0] * np.cos(a), sig[0] * np.sin(a)])
    i0 = int(round(at * SR))
    if i0 >= N:
        return
    n = min(sig.shape[1], N - i0)
    dry[:, i0:i0 + n] += sig[:, :n] * gain
    wet[:, i0:i0 + n] += sig[:, :n] * gain * send


def env_exp(n, decay, attack=0.002):
    t = np.arange(n) / SR
    return np.minimum(1.0, t / attack) * np.exp(-t / decay)


def sine_glide(f0, f1, dur, curve=0.08):
    t = np.arange(int(dur * SR)) / SR
    f = f1 + (f0 - f1) * np.exp(-t / curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def saw(freq, dur, cutoff, detune_cents=(-7, 0, 7), max_hz=7000):
    """Band-limited detuned saw stack with a time-varying low-pass (cutoff is an array or a number)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), (n,))
    out = np.zeros(n)
    for c in detune_cents:
        f = freq * 2 ** (c / 1200)
        ph = rng.uniform(0, 2 * np.pi)
        for k in range(1, int(max_hz / f) + 1):
            w = 1.0 / np.sqrt(1.0 + (k * f / cutoff) ** 4)
            out += np.sin(2 * np.pi * k * f * t + ph * k) * w / k
    return out / len(detune_cents)


def svf(x, fc, q, mode="band"):
    """Time-varying TPT state-variable filter."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    g = np.tan(np.pi * np.clip(fc, 20, SR * 0.45) / SR)
    k = 1.0 / q
    a1 = 1.0 / (1.0 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    ic1 = ic2 = 0.0
    y = np.empty_like(x)
    for i in range(len(x)):
        v3 = x[i] - ic2
        v1 = a1[i] * ic1 + a2[i] * v3
        v2 = ic2 + a2[i] * ic1 + a3[i] * v3
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        y[i] = v1 if mode == "band" else v2 if mode == "low" else x[i] - k * v1 - v2
    return y


def noise(dur):
    return rng.standard_normal(int(dur * SR))


# ---------------- pad: D sus2, slowly opening, ducks out before the hit ----------------
pad_dur = T_IMPACT + 0.05
n_pad = int(pad_dur * SR)
tp = np.arange(n_pad) / SR
cut = 380 + 900 * np.clip((tp - 0.5) / (T_IMPACT - 0.5), 0, 1) ** 1.6
pad = sum(saw(f, pad_dur, cut) * g for f, g in ((73.42, 0.55), (110.0, 0.4), (164.81, 0.3), (220.0, 0.18)))
pad_env = np.clip(tp / 1.2, 0, 1) ** 2 * (0.75 + 0.25 * np.clip((tp - T_BUILD) / 2.0, 0, 1))
pad_env *= np.clip((T_IMPACT - 0.1 - tp) / 0.12, 0, 1)  # short silence right before the hit
place(np.vstack([pad * pad_env, np.roll(pad, 240) * pad_env]), 0.0, gain=0.16, send=0.25)

# ---------------- soft electronic pulse, on a grid that lands on the impact ----------------
def pulse(level):
    n = int(0.45 * SR)
    kick = sine_glide(120, 46, 0.45, 0.035) * env_exp(n, 0.14, 0.002)
    t = np.arange(n) / SR
    pluck = (np.sin(2 * np.pi * 293.66 * t) + 0.5 * np.sin(2 * np.pi * 587.33 * t)) * env_exp(n, 0.07, 0.003)
    return np.tanh(1.6 * kick) * 0.9 + pluck * 0.18 * level


beats = [T_IMPACT - 0.5 * k for k in range(9, 1, -1)]          # quarter notes 0.80 … 4.30
beats += [T_IMPACT - 0.75, T_IMPACT - 0.5, T_IMPACT - 0.25]     # eighth notes into the hit
for i, b in enumerate(beats):
    level = 0.45 + 0.55 * i / len(beats)
    place(pulse(level), b, gain=0.42 * level, send=0.12)

# ---------------- digital pings: Budapest, then Brussels ----------------
def ping(freqs, decay=0.35, dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.05)) for f in freqs)
    return s * env_exp(n, decay, 0.002) / len(freqs)


place(ping([1318.5]), T_BUDAPEST, gain=0.10, pan=0.35, send=0.5)
place(ping([880.0, 1318.5], 0.5), T_SPREAD, gain=0.12, pan=-0.15, send=0.55)

# first arc: a soft rising tone
arc = sine_glide(1318.5, 659.25, T_SPREAD - T_FIRST_ARC, 0.2)[::-1]
n_arc = len(arc)
place(arc * np.sin(np.pi * np.arange(n_arc) / n_arc) ** 2, T_FIRST_ARC, gain=0.035, pan=0.1, send=0.6)

# data ticks as the network spreads across Europe
for _ in range(34):
    at = T_SPREAD + 0.05 + rng.beta(1.6, 2.4) * 1.7
    f = rng.choice([1760.0, 2093.0, 2349.3, 2637.0, 3136.0])
    n = int(0.08 * SR)
    tick = np.sin(2 * np.pi * f * np.arange(n) / SR) * env_exp(n, 0.012, 0.0005)
    place(tick, at, gain=rng.uniform(0.02, 0.045), pan=rng.uniform(-0.8, 0.8), send=0.35)

# ---------------- whooshes for the news graphics ----------------
def whoosh(dur, f_lo, f_hi, q=1.4, peak=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR / dur
    fc = f_lo * (f_hi / f_lo) ** np.sin(np.pi * np.clip(t, 0, 1)) ** 1.5
    body = svf(noise(dur), fc, q)
    air = svf(noise(dur), fc * 2.5, 0.8, "high") * 0.25
    e = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.5)
    return (body + air) * e


def pan_sweep(sig, p0, p1):
    p = np.linspace(p0, p1, len(sig))
    a = (p + 1) * np.pi / 4
    return np.vstack([sig * np.cos(a), sig * np.sin(a)])


place(pan_sweep(whoosh(0.75, 400, 5200), -0.9, 0.9), T_BUILD - 0.12, gain=0.32, send=0.3)
place(pan_sweep(whoosh(0.6, 600, 6500, q=1.8), 0.8, -0.8), 3.0, gain=0.16, send=0.3)

# ---------------- riser into the dive ----------------
r_dur = T_IMPACT - 0.1 - T_CONVERGE
n_r = int(r_dur * SR)
tr = np.arange(n_r) / n_r
riser = svf(noise(r_dur), 300 * (9000 / 300) ** tr ** 1.8, 2.2)
riser += 0.18 * np.sin(2 * np.pi * np.cumsum(146.83 * 4 ** tr ** 2) / SR)
riser *= tr ** 2.2 * np.clip((1 - tr) / 0.03, 0, 1)
place(np.vstack([riser, np.roll(riser, 180)]), T_CONVERGE, gain=0.3, send=0.35)

# ---------------- the hit ----------------
hit_dur = DUR - T_IMPACT
n_h = int(hit_dur * SR)
th = np.arange(n_h) / SR
sub = np.tanh(1.8 * sine_glide(92, 38, hit_dur, 0.12) * env_exp(n_h, 0.6, 0.003))
body = sine_glide(180, 72, hit_dur, 0.05) * env_exp(n_h, 0.18, 0.002)
crack = sosfilt(butter(2, 6500, "low", fs=SR, output="sos"), noise(hit_dur)) * env_exp(n_h, 0.014, 0.0005)
place(sub, T_IMPACT, gain=0.8, send=0.05)
place(body, T_IMPACT, gain=0.38, send=0.15)
place(np.vstack([crack, np.roll(crack, 90)]), T_IMPACT, gain=0.5, send=0.4)

# cinematic chord: D major add9, filter closing as it rings out
cutoff = 320 + 2600 * np.exp(-th / 0.3)
chord = sum(saw(f, hit_dur, cutoff) * g for f, g in ((73.42, 0.5), (110.0, 0.4), (146.83, 0.35), (185.0, 0.3), (329.63, 0.18)))
chord_env = np.minimum(1, th / 0.008) * (0.35 + 0.65 * np.exp(-th / 0.45)) * np.exp(-th / 2.6)
place(np.vstack([chord * chord_env, np.roll(chord, 300) * chord_env]), T_IMPACT, gain=0.3, send=0.35)

# shimmer bells, left and right
for f, pan, d in ((1174.66, -0.5, 1.6), (1479.98, 0.45, 1.4), (1760.0, -0.2, 1.2), (2349.3, 0.6, 0.9), (2637.0, -0.65, 0.8)):
    bell = np.sin(2 * np.pi * f * th) + 0.3 * np.sin(2 * np.pi * f * 2.76 * th) * np.exp(-th / 0.2)
    place(bell * env_exp(n_h, d, 0.004), T_IMPACT + 0.01, gain=0.035, pan=pan, send=0.7)

# a few sparkles under the glint across the logo
for i, f in enumerate((2637.0, 3136.0, 3520.0, 4186.0)):
    n = int(0.6 * SR)
    s = np.sin(2 * np.pi * f * np.arange(n) / SR) * env_exp(n, 0.16, 0.002)
    place(s, 5.88 + i * 0.07, gain=0.022, pan=-0.5 + i * 0.33, send=0.8)

# ---------------- reverb, master ----------------
def reverb_ir(seconds=2.4, predelay=0.02):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    decay = np.exp(-t * 6.91 / seconds)
    ir = np.zeros((2, n + int(predelay * SR)))
    lp = butter(1, 5500, "low", fs=SR, output="sos")
    for c in range(2):
        ir[c, -n:] = sosfilt(lp, rng.standard_normal(n)) * decay
    return ir / np.sqrt(np.sum(ir ** 2) / 2)


ir = reverb_ir()
rev = np.vstack([fftconvolve(wet[c], ir[c])[:N] for c in range(2)])
mix = dry + 0.32 * rev
mix = sosfilt(butter(2, 28, "high", fs=SR, output="sos"), mix)

fade = int(0.45 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 2
mix[:, :int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))


def lufs(x):
    """Integrated loudness per ITU-R BS.1770-4 (48 kHz K-weighting, gated)."""
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=1), axis=1)
    block, hop = int(0.4 * SR), int(0.1 * SR)
    z = np.array([np.mean(y[:, i:i + block] ** 2, axis=1).sum() for i in range(0, y.shape[1] - block + 1, hop)])
    loud = -0.691 + 10 * np.log10(z + 1e-12)
    z = z[loud > -70]
    rel = -0.691 + 10 * np.log10(z.mean()) - 10
    z = z[(-0.691 + 10 * np.log10(z + 1e-12)) > rel]
    return -0.691 + 10 * np.log10(z.mean())


def true_peak(x):
    return np.max(np.abs(resample_poly(x, 4, 1, axis=1)))


def limit(x, ceiling):
    """Look-ahead peak limiter (2 ms look-ahead, 60 ms release)."""
    la = int(0.002 * SR)
    peak = np.max(np.abs(x), axis=0)
    peak = np.maximum.reduce([np.roll(peak, -k) for k in range(la)])
    g = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    rel = np.exp(-1 / (0.06 * SR))
    out = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else g[i] + (cur - g[i]) * rel
        out[i] = cur
    return x * out


TARGET_LUFS, CEILING = -14.0, 10 ** (-1.2 / 20)
for _ in range(3):
    mix *= 10 ** ((TARGET_LUFS - lufs(mix)) / 20)
    mix = limit(mix, CEILING)
mix *= min(1.0, CEILING / true_peak(mix))

out = sys.argv[1] if len(sys.argv) > 1 else "sound.wav"
pcm = (np.clip(mix.T, -1, 1) * (2 ** 23 - 1)).astype("<i4")
raw = np.frombuffer(pcm.tobytes(), dtype=np.uint8).reshape(-1, 4)[:, :3].tobytes()
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(3)
    w.setframerate(SR)
    w.writeframes(raw)
print(f"{out}: {DUR}s, {lufs(mix):.1f} LUFS, true peak {20 * np.log10(true_peak(mix)):.1f} dBTP")
