// APRÓBETŰ intro: a deterministic canvas scene. Every frame is a pure function of time t,
// so the renderer can step through it frame by frame and get an identical result each run.
'use strict';
(function () {
  const W = 1080, H = 1920, CX = W / 2, CY = H / 2, TAU = Math.PI * 2;
  const DURATION = 7.5;

  // Timeline, in seconds.
  const T = {
    budapest: 0.25,  // origin node lights up
    firstArc: 0.45,  // Budapest → Brussels
    spread: 1.05,    // Brussels radiates to every capital
    build: 2.25,     // news graphics and institutions
    converge: 4.35,  // camera dives in, everything pulls to the centre
    impact: 5.30,    // logo reveal hit
    freeze: 6.40,    // from here on every frame is identical
  };

  const GOLD = [255, 204, 0];
  const GOLD_LIGHT = [255, 228, 150];
  const ICE = [172, 202, 255];
  const BLUE = [78, 130, 255];
  const STEEL = [58, 88, 156];
  const WHITE = [238, 244, 255];

  // ---------- helpers ----------
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t) | 0, lerp(c1[1], c2[1], t) | 0, lerp(c1[2], c2[2], t) | 0];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(4)})`;
  const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
  const smooth = (e0, e1, x) => { const p = prog(x, e0, e1); return p * p * (3 - 2 * p); };
  const ease = {
    inCubic: p => p * p * p,
    outCubic: p => 1 - Math.pow(1 - p, 3),
    inOutCubic: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    outExpo: p => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    inOutSine: p => -(Math.cos(Math.PI * p) - 1) / 2,
    outBack: p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  };
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  // ---------- pre-rendered textures ----------
  function buildBackground() {
    const c = makeCanvas(W, H), g = c.getContext('2d');
    const grd = g.createRadialGradient(CX, CY - 40, 0, CX, CY - 40, 1250);
    grd.addColorStop(0, '#0a2457');
    grd.addColorStop(0.32, '#071a44');
    grd.addColorStop(0.68, '#03102b');
    grd.addColorStop(1, '#010615');
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    const v = g.createLinearGradient(0, 0, 0, H);
    v.addColorStop(0, 'rgba(1,4,14,0.55)');
    v.addColorStop(0.24, 'rgba(1,4,14,0)');
    v.addColorStop(0.76, 'rgba(1,4,14,0)');
    v.addColorStop(1, 'rgba(1,4,14,0.6)');
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
    // Dither so the dark gradient does not band after 8-bit encoding.
    const img = g.getImageData(0, 0, W, H), d = img.data, r = rng(7);
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() + r() - 1) * 2.4;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function glowSprite(color, stops) {
    const s = 256, c = makeCanvas(s, s), g = c.getContext('2d');
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    for (const [o, a] of stops) grd.addColorStop(o, rgba(color, a));
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
    return c;
  }
  const SOFT = [[0, 1], [0.18, 0.5], [0.45, 0.13], [1, 0]];
  const BG = buildBackground();
  const SPR = {
    gold: glowSprite(GOLD, SOFT),
    goldHot: glowSprite(GOLD_LIGHT, [[0, 1], [0.1, 0.8], [0.35, 0.22], [1, 0]]),
    blue: glowSprite(BLUE, SOFT),
    white: glowSprite(WHITE, [[0, 1], [0.12, 0.7], [0.4, 0.15], [1, 0]]),
    bokehGold: glowSprite(GOLD_LIGHT, [[0, 0.5], [0.62, 0.42], [0.86, 0.2], [1, 0]]),
    bokehBlue: glowSprite(ICE, [[0, 0.5], [0.62, 0.42], [0.86, 0.2], [1, 0]]),
  };
  function radial(x, y, r, col, alpha, stops = SOFT) {
    if (alpha <= 0.002 || r <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    for (const [o, k] of stops) g.addColorStop(o, rgba(col, alpha * k));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  const LIGHT = [34, 84, 214];
  const LIGHT_STOPS = [[0, 0.5], [0.5, 0.18], [1, 0]];
  function sprite(img, x, y, size, alpha) {
    if (alpha <= 0.002) return;
    ctx.globalAlpha = clamp(alpha);
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    ctx.globalAlpha = 1;
  }

  // ---------- map & camera ----------
  const MAP = window.EUROPE;
  const DOTS = MAP.dots;
  const CAP = {};
  MAP.capitals.forEach(c => { CAP[c.id] = c; });
  const VIEW = { x: CAP.strasbourg.x, y: CAP.strasbourg.y, zoom: 1.12 }; // Strasbourg at frame centre

  const slowZoom = t => 1 + 0.12 * ease.inOutSine(prog(t, 0, T.converge));
  function camera(t) {
    const tt = Math.min(t, T.impact);
    let z = slowZoom(tt);
    if (tt > T.converge) z *= Math.exp(2.5 * ease.inCubic(prog(tt, T.converge, T.impact)));
    const rot = -0.035 * (1 - ease.outCubic(prog(tt, 0, T.converge)));
    return { z, s: VIEW.zoom * z, cos: Math.cos(rot), sin: Math.sin(rot) };
  }
  function proj(cam, x, y) {
    const dx = (x - VIEW.x) * cam.s, dy = (y - VIEW.y) * cam.s;
    return [CX + dx * cam.cos - dy * cam.sin, CY + dx * cam.sin + dy * cam.cos];
  }
  function mapAlpha(t) {
    const dim = lerp(1, 0.38, ease.inOutCubic(prog(t, T.build, T.build + 0.6)));
    return dim * (1 - smooth(4.7, 5.15, t));
  }

  function drawGraticule(t, cam, A) {
    const a = 0.07 * A * smooth(0.3, 1.6, t);
    if (a < 0.003) return;
    ctx.strokeStyle = rgba(ICE, a);
    ctx.lineWidth = 1;
    for (const line of MAP.graticule) {
      ctx.beginPath();
      for (let i = 0; i < line.length; i += 2) {
        const p = proj(cam, line[i], line[i + 1]);
        if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
      }
      ctx.stroke();
    }
  }

  function drawDots(t, cam, A) {
    if (A < 0.003) return;
    const bud = proj(cam, CAP.budapest.x, CAP.budapest.y);
    const waveR = ease.outCubic(prog(t, 0.2, 2.0)) * 1400;
    const r = 2.5 * Math.pow(cam.z, 0.55);
    const streak = t > T.converge + 0.08 && t < T.impact;
    const prev = streak ? camera(t - 0.035) : null;
    // Hungary glows gold as the origin, then settles to a warm tint.
    const hu = 0.85 - 0.5 * smooth(0.9, 2.2, t);
    const huCol = mix(BLUE, GOLD, hu);
    const dive = 1 / (1 + (cam.z - 1) * 0.12);
    if (streak) { ctx.lineCap = 'round'; ctx.lineWidth = r * 1.3; }
    for (let i = 0; i < DOTS.length; i += 3) {
      const x = DOTS[i], y = DOTS[i + 1], cls = DOTS[i + 2];
      const dx = (x - VIEW.x) * cam.s, dy = (y - VIEW.y) * cam.s;
      const sx = CX + dx * cam.cos - dy * cam.sin, sy = CY + dx * cam.sin + dy * cam.cos;
      if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) continue;
      const ex = (sx - CX) / 650, ey = (sy - CY) / 990;
      let a = 1 - smooth(0.7, 1.12, Math.sqrt(ex * ex + ey * ey));
      if (a <= 0) continue;
      const wx = sx - bud[0], wy = sy - bud[1];
      const front = waveR - Math.sqrt(wx * wx + wy * wy);
      if (front <= 0) continue;
      a *= clamp(front / 160);
      const rim = Math.exp(-((front - 40) * (front - 40)) / 3600);
      let col, base;
      if (cls === 1) { col = BLUE; base = 0.74; }
      else if (cls === 2) { col = huCol; base = 0.86; }
      else { col = STEEL; base = 0.28; }
      if (rim > 0.03) col = mix(col, WHITE, rim * 0.75);
      const alpha = A * a * dive * (base + rim * 0.45);
      if (alpha < 0.004) continue;
      if (streak) {
        const pdx = (x - VIEW.x) * prev.s, pdy = (y - VIEW.y) * prev.s;
        ctx.strokeStyle = rgba(col, alpha);
        ctx.beginPath();
        ctx.moveTo(CX + pdx * prev.cos - pdy * prev.sin, CY + pdx * prev.sin + pdy * prev.cos);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      } else {
        ctx.fillStyle = rgba(col, alpha);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, TAU);
        ctx.fill();
      }
    }
    ctx.lineCap = 'butt';
  }

  // ---------- network arcs ----------
  const ARCS = [];
  const NODE_TIME = { budapest: T.budapest };
  (function buildArcs() {
    const r = rng(11);
    const hub = CAP.brussels;
    ARCS.push({ a: 'budapest', b: 'brussels', t0: T.firstArc, dur: T.spread - T.firstArc, kind: 'gold' });
    const others = MAP.capitals.filter(c => c.id !== 'brussels' && c.id !== 'budapest');
    const maxD = Math.max(...others.map(c => Math.hypot(c.x - hub.x, c.y - hub.y)));
    for (const c of others) {
      const d = Math.hypot(c.x - hub.x, c.y - hub.y) / maxD;
      ARCS.push({ a: 'brussels', b: c.id, t0: T.spread + 0.5 * d + r() * 0.08, dur: 0.3 + 0.4 * d, kind: 'main' });
    }
    const mesh = [
      ['paris', 'madrid'], ['madrid', 'lisbon'], ['dublin', 'paris'], ['amsterdam', 'berlin'],
      ['berlin', 'warsaw'], ['warsaw', 'vilnius'], ['vilnius', 'riga'], ['riga', 'tallinn'],
      ['tallinn', 'helsinki'], ['helsinki', 'stockholm'], ['stockholm', 'copenhagen'],
      ['copenhagen', 'berlin'], ['berlin', 'prague'], ['prague', 'vienna'], ['vienna', 'budapest'],
      ['budapest', 'bucharest'], ['bucharest', 'sofia'], ['sofia', 'athens'], ['athens', 'nicosia'],
      ['athens', 'valletta'], ['valletta', 'rome'], ['rome', 'ljubljana'], ['zagreb', 'budapest'],
      ['budapest', 'warsaw'], ['rome', 'paris'], ['strasbourg', 'vienna'],
    ];
    for (const [a, b] of mesh) ARCS.push({ a, b, t0: 1.6 + r() * 0.9, dur: 0.45 + r() * 0.25, kind: 'mesh' });
    for (const arc of ARCS) {
      const A = CAP[arc.a], B = CAP[arc.b];
      const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy);
      let nx = -dy / len, ny = dx / len;
      if (ny > 0) { nx = -nx; ny = -ny; } // always bow upwards, like flight paths
      const bow = arc.kind === 'mesh' ? 0.14 : 0.2;
      arc.cx = (A.x + B.x) / 2 + nx * len * bow;
      arc.cy = (A.y + B.y) / 2 + ny * len * bow;
      arc.arrive = arc.t0 + arc.dur;
      arc.period = 0.8 + r() * 0.7;
      arc.phase = r();
      if (!(arc.b in NODE_TIME) || NODE_TIME[arc.b] > arc.arrive) NODE_TIME[arc.b] = arc.arrive;
    }
  })();
  function bez(arc, u) {
    const A = CAP[arc.a], B = CAP[arc.b], v = 1 - u;
    return [v * v * A.x + 2 * v * u * arc.cx + u * u * B.x, v * v * A.y + 2 * v * u * arc.cy + u * u * B.y];
  }

  function drawArcs(t, cam, A) {
    if (A < 0.003) return;
    const lw = Math.sqrt(cam.z);
    ctx.globalCompositeOperation = 'lighter';
    for (const arc of ARCS) {
      if (t < arc.t0) continue;
      const u = ease.inOutCubic(prog(t, arc.t0, arc.arrive));
      const col = arc.kind === 'gold' ? GOLD : ICE;
      const la = (arc.kind === 'mesh' ? 0.2 : arc.kind === 'gold' ? 0.6 : 0.36) * A;
      ctx.beginPath();
      const n = 30;
      for (let k = 0; k <= n; k++) {
        const b = bez(arc, (u * k) / n), p = proj(cam, b[0], b[1]);
        if (k) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
      }
      ctx.strokeStyle = rgba(col, la * 0.28);
      ctx.lineWidth = 5 * lw;
      ctx.stroke();
      ctx.strokeStyle = rgba(col, la);
      ctx.lineWidth = 1.3 * lw;
      ctx.stroke();
      if (u < 1) {
        const b = bez(arc, u), p = proj(cam, b[0], b[1]);
        sprite(SPR.goldHot, p[0], p[1], arc.kind === 'gold' ? 46 : 30, 0.95 * A);
      } else {
        // Data keeps flowing along every finished link.
        const ph = ((t - arc.arrive) / arc.period + arc.phase) % 1;
        const b = bez(arc, ph), p = proj(cam, b[0], b[1]);
        sprite(SPR.gold, p[0], p[1], 18 * lw, 0.8 * A * Math.sin(Math.PI * ph));
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawNodes(t, cam, A) {
    if (A < 0.003) return;
    ctx.globalCompositeOperation = 'lighter';
    for (const c of MAP.capitals) {
      const at = NODE_TIME[c.id];
      if (at === undefined || t < at) continue;
      const p = proj(cam, c.x, c.y), k = t - at;
      const special = c.id === 'brussels' || c.id === 'budapest';
      const col = special ? GOLD_LIGHT : ICE;
      const pingDur = special ? 1.1 : 0.8;
      if (k < pingDur) {
        const pp = k / pingDur;
        ctx.strokeStyle = rgba(col, (special ? 0.85 : 0.5) * (1 - pp) * A);
        ctx.lineWidth = special ? 2 : 1.2;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 3 + (special ? 46 : 15) * ease.outCubic(pp) * Math.sqrt(cam.z), 0, TAU);
        ctx.stroke();
      }
      const pop = ease.outBack(prog(k, 0, 0.3));
      sprite(special ? SPR.gold : SPR.blue, p[0], p[1], (special ? 64 : 26) * pop * Math.sqrt(cam.z), A * (special ? 0.85 : 0.6));
      ctx.fillStyle = rgba(special ? GOLD_LIGHT : WHITE, A);
      ctx.beginPath();
      ctx.arc(p[0], p[1], (special ? 3.8 : 2.3) * pop * Math.sqrt(cam.z), 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---------- ambient light, dust and bokeh ----------
  function drawAmbientLight(t) {
    ctx.globalCompositeOperation = 'lighter';
    const a = smooth(0, 1.2, t);
    radial(CX - 260 + 120 * Math.sin(t * 0.35), CY - 420 + 80 * Math.cos(t * 0.3), 750, LIGHT, 0.4 * a, LIGHT_STOPS);
    radial(CX + 300 + 100 * Math.cos(t * 0.28), CY + 520 + 60 * Math.sin(t * 0.33), 650, LIGHT, 0.28 * a, LIGHT_STOPS);
    ctx.globalCompositeOperation = 'source-over';
  }

  const DUST = [];
  (function () {
    const r = rng(23);
    for (let i = 0; i < 130; i++) {
      const d = 0.55 + r() * 1.25;
      DUST.push({
        x: r() * (W + 300) - 260, y: r() * H, d,
        size: (0.6 + r() * 1.5) * d,
        vx: (14 + r() * 46) * d, vy: -(4 + r() * 18) * d,
        ph: r() * TAU, f: 0.6 + r() * 1.6, a: 0.25 + r() * 0.6,
        born: r() * 1.1, conv: r() * 0.35, spin: (r() < 0.5 ? -1 : 1) * (0.35 + r() * 0.5),
        gold: r() < 0.82,
      });
    }
  })();
  function dustPos(p, t) {
    let x = p.x + p.vx * t + Math.sin(t * p.f + p.ph) * 7;
    let y = p.y + p.vy * t + Math.cos(t * p.f * 0.8 + p.ph) * 5;
    const k = 1 + (slowZoom(t) - 1) * p.d * 1.6;
    x = CX + (x - CX) * k;
    y = CY + (y - CY) * k;
    const e = ease.inCubic(prog(t, T.converge + p.conv, T.impact - 0.04));
    if (e > 0) {
      const dx = x - CX, dy = y - CY, ang = e * p.spin, s = 1 - e, c = Math.cos(ang), sn = Math.sin(ang);
      x = CX + (dx * c - dy * sn) * s;
      y = CY + (dx * sn + dy * c) * s;
    }
    return [x, y, e];
  }
  function drawDust(t) {
    if (t >= T.impact) return;
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const p of DUST) {
      const fa = smooth(p.born, p.born + 0.6, t);
      if (fa <= 0) continue;
      const [x, y, e] = dustPos(p, t);
      const tw = 0.65 + 0.35 * Math.sin(t * 3 * p.f + p.ph);
      const a = p.a * fa * tw * (1 + e * 1.4) * (1 - smooth(0.85, 1, e));
      const col = p.gold ? GOLD_LIGHT : ICE;
      if (e > 0.02) {
        const q = dustPos(p, t - 0.03);
        ctx.strokeStyle = rgba(col, a * 0.8);
        ctx.lineWidth = p.size * 1.4;
        ctx.beginPath();
        ctx.moveTo(q[0], q[1]);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      sprite(p.gold ? SPR.gold : SPR.blue, x, y, p.size * 9, a * 0.55);
      ctx.fillStyle = rgba(col, a);
      ctx.beginPath();
      ctx.arc(x, y, p.size * 0.6, 0, TAU);
      ctx.fill();
    }
    ctx.lineCap = 'butt';
    ctx.globalCompositeOperation = 'source-over';
  }

  const BOKEH = [];
  (function () {
    const r = rng(41);
    for (let i = 0; i < 11; i++) {
      BOKEH.push({
        x: r() * W, y: 150 + r() * (H - 300), size: 50 + r() * 120,
        vx: (r() - 0.5) * 30, vy: -(5 + r() * 15), a: 0.05 + r() * 0.08, gold: r() < 0.6, d: 1.5 + r() * 1.5,
      });
    }
  })();
  function drawBokeh(t) {
    if (t >= T.impact) return;
    ctx.globalCompositeOperation = 'lighter';
    const fly = ease.inCubic(prog(t, T.converge, T.impact));
    for (const b of BOKEH) {
      let x = b.x + b.vx * t, y = b.y + b.vy * t;
      const k = (1 + (slowZoom(t) - 1) * b.d * 2) * (1 + 7 * fly * b.d);
      x = CX + (x - CX) * k;
      y = CY + (y - CY) * k;
      sprite(b.gold ? SPR.bokehGold : SPR.bokehBlue, x, y, b.size * (1 + fly * 3), b.a * smooth(0.2, 1.4, t) * (1 - smooth(4.8, 5.2, t)));
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---------- build-up graphics ----------
  // Two hairlines sweep in, frame the centre band, then collapse into the reveal line.
  const FRAME_LINES = [{ y: 700, dir: 1, t0: 2.25, col: GOLD }, { y: 1220, dir: -1, t0: 2.36, col: ICE }];
  const SWEEPS = [
    { y: 736, dir: 1, t0: 2.5, col: ICE }, { y: 1184, dir: -1, t0: 2.62, col: GOLD },
    { y: 268, dir: -1, t0: 3.05, col: ICE }, { y: 1652, dir: 1, t0: 3.2, col: GOLD },
  ];
  function streakLine(y, dir, headX, len, col, alpha, width) {
    const tailX = headX - dir * len;
    const g = ctx.createLinearGradient(tailX, 0, headX, 0);
    g.addColorStop(0, rgba(col, 0));
    g.addColorStop(1, rgba(col, alpha));
    ctx.strokeStyle = g;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(tailX, y);
    ctx.lineTo(headX, y);
    ctx.stroke();
    sprite(SPR.goldHot, headX, y, 34, alpha * 0.8);
  }
  function drawFrameLines(t) {
    ctx.globalCompositeOperation = 'lighter';
    const c0 = T.converge + 0.2, c1 = T.impact - 0.05;
    const q = ease.inOutCubic(prog(t, c0, c1));
    for (const L of FRAME_LINES) {
      if (t < L.t0 || t >= T.impact) continue;
      const p = ease.outExpo(prog(t, L.t0, L.t0 + 0.75));
      const headX = L.dir > 0 ? lerp(-40, W + 40, p) : lerp(W + 40, -40, p);
      const startX = L.dir > 0 ? -40 : W + 40;
      if (q <= 0) {
        ctx.strokeStyle = rgba(L.col, 0.24);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, L.y);
        ctx.lineTo(headX, L.y);
        ctx.stroke();
        if (p < 1) streakLine(L.y, L.dir, headX, 320, GOLD_LIGHT, 0.95 * (1 - p * 0.6), 2);
      } else {
        const y = lerp(L.y, CY, q);
        const half = lerp(W / 2 + 40, 130, ease.inCubic(q));
        const col = mix(L.col, GOLD_LIGHT, q);
        const g = ctx.createLinearGradient(CX - half, 0, CX + half, 0);
        g.addColorStop(0, rgba(col, 0));
        g.addColorStop(0.5, rgba(col, lerp(0.3, 1, q)));
        g.addColorStop(1, rgba(col, 0));
        ctx.strokeStyle = g;
        ctx.lineWidth = lerp(1, 2.5, q);
        ctx.beginPath();
        ctx.moveTo(CX - half, y);
        ctx.lineTo(CX + half, y);
        ctx.stroke();
      }
    }
    for (const S of SWEEPS) {
      const p = prog(t, S.t0, S.t0 + 0.6);
      if (p <= 0 || p >= 1) continue;
      const e = ease.inOutCubic(p);
      const headX = S.dir > 0 ? lerp(-60, W + 400, e) : lerp(W + 60, -400, e);
      streakLine(S.y, S.dir, headX, 380, S.col, 0.7 * Math.sin(Math.PI * p), 1.2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawBrackets(t) {
    if (t < 2.3 || t > T.converge + 0.6) return;
    const x0 = 72, x1 = W - 72, y0 = 290, y1 = H - 290, arm = 54;
    const corners = [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]];
    const q = ease.inCubic(prog(t, T.converge, T.converge + 0.55));
    ctx.lineWidth = 2.5;
    corners.forEach(([x, y, sx, sy], i) => {
      const p = ease.outCubic(prog(t, 2.3 + i * 0.05, 2.75 + i * 0.05));
      if (p <= 0) return;
      const off = (1 - p) * 50;
      const cx = lerp(x - sx * off, lerp(x, CX, 0.55), q), cy = lerp(y - sy * off, lerp(y, CY, 0.55), q);
      ctx.strokeStyle = rgba(ICE, 0.5 * p * (1 - q));
      ctx.beginPath();
      ctx.moveTo(cx, cy + sy * arm);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + sx * arm, cy);
      ctx.stroke();
    });
  }

  // European Parliament style hemicycle: rows of seats in a half circle.
  const SEATS = [];
  (function () {
    for (let row = 0; row < 9; row++) {
      const rad = 120 + row * 21, n = Math.round((Math.PI * rad) / 14.5);
      for (let k = 0; k < n; k++) SEATS.push({ rad, th: Math.PI + (Math.PI * (k + 0.5)) / n });
    }
  })();
  function drawHemicycle(t) {
    if (t < 2.4 || t > 4.45) return;
    const hx = CX, hy = 610;
    const sweep = Math.PI + Math.PI * 1.15 * ease.inOutCubic(prog(t, 2.42, 3.05));
    const q = ease.inCubic(prog(t, 3.9, 4.45)), drift = ease.inOutSine(prog(t, 2.4, 4.45));
    const s = (0.96 + 0.07 * drift) * (1 + 0.35 * q), oy = 22 * drift - 90 * q, fade = 1 - q;
    ctx.globalCompositeOperation = 'lighter';
    for (const seat of SEATS) {
      const pop = clamp((sweep - seat.th) / 0.35);
      if (pop <= 0) continue;
      const x = hx + Math.cos(seat.th) * seat.rad * s, y = hy + oy + Math.sin(seat.th) * seat.rad * s;
      ctx.fillStyle = rgba(ICE, 0.42 * pop * fade);
      ctx.beginPath();
      ctx.arc(x, y, 2.8 * ease.outBack(pop) * s, 0, TAU);
      ctx.fill();
    }
    const rp = ease.outCubic(prog(t, 2.6, 3.1));
    ctx.strokeStyle = rgba(GOLD, 0.7 * rp * fade);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hx, hy + oy, 96 * s, Math.PI, Math.PI + Math.PI * rp);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx - 70 * rp * s, hy + oy + 14);
    ctx.lineTo(hx + 70 * rp * s, hy + oy + 14);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }

  // A classical portico in line art: steps, columns, entablature, pediment.
  const TEMPLE = [];
  (function () {
    const bx = CX, by = 1622;
    TEMPLE.push([bx - 230, by, bx + 230, by], [bx - 215, by - 12, bx + 215, by - 12], [bx - 200, by - 24, bx + 200, by - 24]);
    for (let i = 0; i < 6; i++) {
      const cx = bx - 165 + i * 66;
      TEMPLE.push([cx - 11, by - 24, cx - 11, by - 176], [cx + 11, by - 24, cx + 11, by - 176], [cx - 16, by - 182, cx + 16, by - 182]);
    }
    TEMPLE.push([bx - 205, by - 190, bx + 205, by - 190], [bx - 205, by - 208, bx + 205, by - 208]);
    TEMPLE.push([bx - 218, by - 214, bx + 218, by - 214], [bx - 218, by - 214, bx, by - 284], [bx + 218, by - 214, bx, by - 284]);
  })();
  function drawTemple(t) {
    if (t < 2.75 || t > 4.45) return;
    const q = ease.inCubic(prog(t, 3.95, 4.45)), drift = ease.inOutSine(prog(t, 2.75, 4.45));
    const s = (0.96 + 0.07 * drift) * (1 + 0.3 * q), oy = -22 * drift + 110 * q, fade = 1 - q;
    const ox = CX, oyBase = 1622;
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    TEMPLE.forEach((seg, i) => {
      const p = ease.outCubic(prog(t, 2.75 + i * 0.022, 3.0 + i * 0.022));
      if (p <= 0) return;
      const tx = v => ox + (v - ox) * s, ty = v => oyBase + oy + (v - oyBase) * s;
      const x1 = tx(seg[0]), y1 = ty(seg[1]), x2 = tx(lerp(seg[0], seg[2], p)), y2 = ty(lerp(seg[1], seg[3], p));
      const pediment = i >= TEMPLE.length - 3;
      ctx.strokeStyle = rgba(pediment ? GOLD : ICE, (pediment ? 0.75 : 0.5) * fade);
      ctx.lineWidth = pediment ? 2.2 : 1.6;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
    ctx.lineCap = 'butt';
    ctx.globalCompositeOperation = 'source-over';
  }

  // HUD rings around the centre that later shrink into the reveal.
  function drawRings(t) {
    if (t < 2.55 || t >= T.impact) return;
    const q = ease.inCubic(prog(t, T.converge + 0.05, T.impact - 0.05));
    const k = 1 - 0.82 * q, fade = 1 - smooth(0.55, 1, q);
    const spin = 3 * q * q;
    ctx.globalCompositeOperation = 'lighter';
    const pa = ease.outCubic(prog(t, 2.55, 3.2));
    ctx.setLineDash([2, 10]);
    ctx.strokeStyle = rgba(ICE, 0.45 * fade);
    ctx.lineWidth = 2;
    ctx.beginPath();
    const ra = -Math.PI / 2 + 0.25 * t + spin;
    ctx.arc(CX, CY, 250 * k, ra, ra + TAU * pa);
    ctx.stroke();
    ctx.setLineDash([]);
    const pb = ease.outCubic(prog(t, 2.7, 3.3));
    ctx.strokeStyle = rgba(GOLD, 0.55 * fade);
    ctx.lineWidth = 2;
    const rb = 0.5 - 0.4 * t - spin;
    for (let i = 0; i < 3; i++) {
      const a0 = rb + (i * TAU) / 3;
      ctx.beginPath();
      ctx.arc(CX, CY, 300 * k, a0, a0 + 1.0 * pb);
      ctx.stroke();
    }
    const pc = smooth(2.9, 3.4, t);
    ctx.strokeStyle = rgba(ICE, 0.24 * pc * fade);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const rc = 0.1 * t + spin * 0.5;
    for (let i = 0; i < 90; i++) {
      const a = rc + (i * TAU) / 90, r0 = 336 * k, r1 = r0 + (i % 5 === 0 ? 14 : 6) * k;
      ctx.moveTo(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0);
      ctx.lineTo(CX + Math.cos(a) * r1, CY + Math.sin(a) * r1);
    }
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }

  // Small geometric shapes zipping across the frame.
  const SHAPES = [];
  (function () {
    const r = rng(31), types = ['square', 'plus', 'ring', 'bar'];
    for (let i = 0; i < 14; i++) {
      SHAPES.push({
        type: types[Math.floor(r() * types.length)], y: 300 + r() * 1320, dir: r() < 0.5 ? 1 : -1,
        speed: 900 + r() * 1100, t0: 2.3 + r() * 1.9, size: 7 + r() * 9, gold: r() < 0.45,
        a: 0.3 + r() * 0.35, rot: r() * TAU, rotV: (r() - 0.5) * 6, len: 60 + r() * 140,
      });
    }
  })();
  function drawShapes(t) {
    if (t < 2.3 || t > T.converge + 0.4) return;
    const fade = 1 - smooth(T.converge, T.converge + 0.4, t);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1.6;
    for (const s of SHAPES) {
      if (t < s.t0) continue;
      const d = s.speed * (t - s.t0), x = s.dir > 0 ? -80 + d : W + 80 - d;
      if (x < -300 || x > W + 300) continue;
      const col = s.gold ? GOLD : ICE, a = s.a * fade;
      if (s.type === 'bar') {
        const g = ctx.createLinearGradient(x - s.dir * s.len, 0, x, 0);
        g.addColorStop(0, rgba(col, 0));
        g.addColorStop(1, rgba(col, a));
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - s.dir * s.len, s.y);
        ctx.lineTo(x, s.y);
        ctx.stroke();
        continue;
      }
      ctx.save();
      ctx.translate(x, s.y);
      ctx.rotate(s.rot + s.rotV * t);
      ctx.strokeStyle = rgba(col, a);
      ctx.beginPath();
      if (s.type === 'square') ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size);
      else if (s.type === 'plus') { ctx.moveTo(-s.size / 2, 0); ctx.lineTo(s.size / 2, 0); ctx.moveTo(0, -s.size / 2); ctx.lineTo(0, s.size / 2); }
      else ctx.arc(0, 0, s.size / 2, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawCore(t) {
    const p = prog(t, 4.65, T.impact);
    if (p <= 0 || t >= T.impact + 0.12) return;
    const e = ease.inCubic(p) * (1 - prog(t, T.impact, T.impact + 0.12));
    ctx.globalCompositeOperation = 'lighter';
    radial(CX, CY, 60 + 260 * e, GOLD_LIGHT, 0.75 * e, [[0, 1], [0.1, 0.8], [0.35, 0.22], [1, 0]]);
    radial(CX, CY, 20 + 80 * e, WHITE, 0.6 * e, [[0, 1], [0.12, 0.7], [0.4, 0.15], [1, 0]]);
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---------- EU stars ----------
  function starPath(x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + rot + (i * Math.PI) / 5, rr = i % 2 ? r * 0.382 : r;
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath();
  }
  function drawStars(t) {
    if (t < 4.72 || !logo) return;
    const R = logo.ringR;
    const settle = 0.22 * (1 - ease.outCubic(prog(t, T.impact, T.freeze)));
    const bump = Math.sin(Math.PI * prog(t, T.impact + 0.04, T.impact + 0.4)) * 0.035;
    for (let i = 0; i < 12; i++) {
      const base = -Math.PI / 2 + (i * Math.PI) / 6;
      const t0 = 4.72 + i * 0.022;
      const e = ease.inOutCubic(prog(t, t0, T.impact));
      const ang = base + settle - 1.3 * (1 - e);
      const rad = lerp(1500, R, e) * (1 + bump);
      const size = logo.starR * (1 + 1.2 * (1 - e));
      const alpha = 0.95 * smooth(t0, t0 + 0.2, t);
      const x = CX + Math.cos(ang) * rad, y = CY + Math.sin(ang) * rad;
      if (e < 1) {
        // motion trail
        for (let g = 1; g <= 3; g++) {
          const eg = ease.inOutCubic(prog(t - g * 0.018, t0, T.impact));
          const ag = base + settle - 1.3 * (1 - eg), rg = lerp(1500, R, eg);
          ctx.fillStyle = rgba(GOLD, alpha * 0.25 / g);
          starPath(CX + Math.cos(ag) * rg, CY + Math.sin(ag) * rg, size, (1 - eg) * 2.5);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'lighter';
      sprite(SPR.gold, x, y, size * 5, alpha * 0.3);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = rgba(GOLD, alpha);
      starPath(x, y, size, (1 - e) * 2.5);
      ctx.fill();
      const k = t - T.impact;
      if (k >= 0 && k < 0.5) {
        const f = 1 - k / 0.5;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba(GOLD_LIGHT, 0.8 * f);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - 34 * f, y); ctx.lineTo(x + 34 * f, y);
        ctx.moveTo(x, y - 22 * f); ctx.lineTo(x, y + 22 * f);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }

  // ---------- logo ----------
  let logo = null;
  let fx = null; // scratch canvas for blur + wipe during the reveal

  function alphaBounds(c) {
    const g = c.getContext('2d'), { width: w, height: h } = c;
    const d = g.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1, lum = 0, n = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4, a = d[i + 3];
        if (a > 10) {
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
        if (a > 128 && (x + y) % 3 === 0) { lum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; n++; }
      }
    }
    if (x1 < 0) return null;
    return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, lum: n ? lum / n : 1 };
  }
  function resample(src, bb, w, h) {
    let cur = makeCanvas(bb.w, bb.h);
    cur.getContext('2d').drawImage(src, bb.x, bb.y, bb.w, bb.h, 0, 0, bb.w, bb.h);
    while (cur.width / 2 >= w && cur.height / 2 >= h) {
      const n = makeCanvas(Math.round(cur.width / 2), Math.round(cur.height / 2)), g = n.getContext('2d');
      g.imageSmoothingQuality = 'high';
      g.drawImage(cur, 0, 0, n.width, n.height);
      cur = n;
    }
    const out = makeCanvas(w, h), g = out.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(cur, 0, 0, w, h);
    return out;
  }
  function ringRadius(w, h, starR) {
    const hx = w / 2 + 62 + starR, hy = h / 2 + 50 + starR;
    for (let R = 300; R <= 500; R += 2) {
      let ok = true;
      for (let i = 0; i < 12 && ok; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 6;
        if (Math.abs(Math.cos(a) * R) < hx && Math.abs(Math.sin(a) * R) < hy) ok = false;
      }
      if (ok) return R;
    }
    return 500;
  }

  async function setup(opts = {}) {
    const img = new Image();
    img.src = opts.src;
    await img.decode();
    const isSvg = /^data:image\/svg|\.svg(\?|$)/i.test(opts.src);
    const maxW = opts.maxW || 700, maxH = opts.maxH || 500;
    const nw = img.naturalWidth || 1200, nh = img.naturalHeight || 400;
    const k = isSvg ? Math.max(1, 2 * Math.min(maxW / nw, maxH / nh)) : 1;
    const raw = makeCanvas(Math.round(nw * k), Math.round(nh * k));
    raw.getContext('2d').drawImage(img, 0, 0, raw.width, raw.height);
    let bb = { x: 0, y: 0, w: raw.width, h: raw.height, lum: 1 };
    try { bb = alphaBounds(raw) || bb; } catch (e) { /* tainted canvas in file:// preview: skip trimming */ }
    const s = Math.min(maxW / bb.w, maxH / bb.h);
    const w = Math.round(bb.w * s), h = Math.round(bb.h * s);
    const out = resample(raw, bb, w, h);
    const pad = 90;
    const glow = makeCanvas(w + pad * 2, h + pad * 2), gg = glow.getContext('2d');
    gg.filter = 'blur(22px)';
    gg.drawImage(out, pad, pad);
    const starR = 14;
    logo = {
      canvas: out, glow, pad, w, h, starR,
      x: Math.round(CX - w / 2), y: Math.round(CY - h / 2),
      ringR: ringRadius(w, h, starR),
    };
    fx = makeCanvas(w + pad * 2, h + pad * 2);
    buildFinalDust();
    return { width: w, height: h, sourceWidth: bb.w, sourceHeight: bb.h, upscale: s, luminance: bb.lum, ringRadius: logo.ringR, isSvg };
  }

  function drawLogoBacklight(t) {
    if (!logo || t < T.impact) return;
    const a = ease.outCubic(prog(t, T.impact, T.impact + 0.9));
    ctx.globalCompositeOperation = 'lighter';
    ctx.save();
    ctx.translate(CX, CY);
    ctx.scale(1, Math.max(0.45, (logo.h + 260) / (logo.w + 260)));
    radial(0, 0, (logo.w + 420) * 0.75, LIGHT, 0.62 * a, LIGHT_STOPS);
    radial(0, 0, (logo.w + 300) / 2, GOLD, 0.07 * a);
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawLogo(t) {
    if (!logo || t < T.impact) return;
    const k = t - T.impact;
    const alpha = ease.outCubic(prog(k, 0, 0.3));
    const scale = 1 + 0.1 * (1 - ease.outExpo(prog(k, 0, 0.9)));
    const blur = 10 * (1 - ease.outCubic(prog(k, 0, 0.5)));
    const wipe = ease.outCubic(prog(k, 0, 0.42));
    const { w, h, pad } = logo;

    // Luminous pulse behind the letters right after the hit.
    const pulse = Math.exp(-k * 3.2) * (1 - smooth(0.6, 0.9, k));
    if (pulse > 0.003) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.85 * pulse;
      const gw = logo.glow.width * scale, gh = logo.glow.height * scale;
      ctx.drawImage(logo.glow, CX - gw / 2, CY - gh / 2, gw, gh);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    if (scale === 1 && blur === 0 && wipe === 1 && alpha === 1) {
      // Settled: draw the pre-resampled logo 1:1 on whole pixels, untouched.
      ctx.drawImage(logo.canvas, logo.x, logo.y);
    } else {
      const g = fx.getContext('2d');
      g.clearRect(0, 0, fx.width, fx.height);
      if (blur > 0.05) g.filter = `blur(${blur.toFixed(2)}px)`;
      g.drawImage(logo.canvas, pad, pad);
      g.filter = 'none';
      if (wipe < 1) {
        // Soft-edged horizontal wipe opening from the centre line.
        const half = (w / 2 + pad) * wipe, feather = 60;
        const m = g.createLinearGradient(fx.width / 2 - half - feather, 0, fx.width / 2 + half + feather, 0);
        const span = 2 * (half + feather), f = feather / span;
        m.addColorStop(0, 'rgba(0,0,0,0)');
        m.addColorStop(f, 'rgba(0,0,0,1)');
        m.addColorStop(1 - f, 'rgba(0,0,0,1)');
        m.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalCompositeOperation = 'destination-in';
        g.fillStyle = m;
        g.fillRect(0, 0, fx.width, fx.height);
        g.globalCompositeOperation = 'source-over';
      }
      const dw = fx.width * scale, dh = fx.height * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(fx, CX - dw / 2, CY - dh / 2, dw, dh);
      ctx.globalAlpha = 1;
    }

    // One light glint across the letters, finished well before the hold.
    const gp = prog(t, 5.85, 6.3);
    if (gp > 0 && gp < 1) {
      const g = fx.getContext('2d');
      g.clearRect(0, 0, fx.width, fx.height);
      g.drawImage(logo.canvas, pad, pad);
      g.globalCompositeOperation = 'source-in';
      const bx = lerp(pad - 200, pad + w + 200, ease.inOutCubic(gp));
      const band = g.createLinearGradient(bx - 120, 0, bx + 120, h * 0.6);
      band.addColorStop(0, 'rgba(255,255,255,0)');
      band.addColorStop(0.5, 'rgba(255,250,230,1)');
      band.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = band;
      g.fillRect(0, 0, fx.width, fx.height);
      g.globalCompositeOperation = 'source-over';
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.45 * Math.sin(Math.PI * gp);
      const dw = fx.width * scale, dh = fx.height * scale;
      ctx.drawImage(fx, CX - dw / 2, CY - dh / 2, dw, dh);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  // Golden specks thrown out by the hit; they come to rest around (never on) the logo.
  let FINAL_DUST = [];
  function buildFinalDust() {
    const r = rng(57), R = logo.ringR;
    const hx = logo.w / 2 + 40, hy = logo.h / 2 + 40;
    FINAL_DUST = [];
    while (FINAL_DUST.length < 26) {
      const a = r() * TAU, d = R * (0.7 + r() * 1.0);
      const x = Math.cos(a) * d, y = Math.sin(a) * d;
      if (Math.abs(x) < hx && Math.abs(y) < hy) continue;
      if (Math.abs(x) > W / 2 - 50 || Math.abs(y) > H / 2 - 260) continue;
      FINAL_DUST.push({ x, y, size: 0.8 + r() * 1.6, a: 0.16 + r() * 0.3 });
    }
  }
  function drawFinalDust(t) {
    if (t < T.impact) return;
    const e = ease.outExpo(prog(t, T.impact, T.freeze));
    const fa = ease.outCubic(prog(t, T.impact, T.freeze));
    ctx.globalCompositeOperation = 'lighter';
    for (const p of FINAL_DUST) {
      const x = CX + p.x * e, y = CY + p.y * e;
      const a = lerp(0.9, p.a, fa) * smooth(T.impact, T.impact + 0.05, t);
      sprite(SPR.gold, x, y, p.size * 10, a * 0.5);
      ctx.fillStyle = rgba(GOLD_LIGHT, a);
      ctx.beginPath();
      ctx.arc(x, y, p.size * 0.7, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawImpact(t) {
    const k = t - T.impact;
    if (k < 0 || k > 1.0) return;
    const end = 1 - smooth(0.7, 1.0, k);
    ctx.globalCompositeOperation = 'lighter';
    // bloom
    const fa = Math.exp(-k * 6.5) * 0.6 * end;
    radial(CX, CY, 750, WHITE, fa * 0.6, [[0, 1], [0.12, 0.7], [0.4, 0.15], [1, 0]]);
    radial(CX, CY, 550, GOLD_LIGHT, fa, [[0, 1], [0.1, 0.8], [0.35, 0.22], [1, 0]]);
    // anamorphic streak
    const sa = Math.exp(-k * 5) * end;
    const sw = 1700 * ease.outExpo(prog(k, 0, 0.35));
    const g = ctx.createLinearGradient(CX - sw / 2, 0, CX + sw / 2, 0);
    g.addColorStop(0, 'rgba(255,240,200,0)');
    g.addColorStop(0.5, `rgba(255,248,225,${(0.95 * sa).toFixed(4)})`);
    g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g;
    ctx.fillRect(CX - sw / 2, CY - 1.5, sw, 3);
    ctx.save();
    ctx.translate(CX, CY);
    ctx.scale(1, 0.035);
    sprite(SPR.goldHot, 0, 0, sw, 0.5 * sa);
    ctx.restore();
    // shockwaves
    for (const [delay, col, wmax, amax] of [[0, GOLD_LIGHT, 4, 0.6], [0.09, ICE, 2, 0.35]]) {
      const p = prog(k, delay, delay + 0.9);
      if (p <= 0 || p >= 1) continue;
      ctx.strokeStyle = rgba(col, amax * Math.pow(1 - p, 1.5));
      ctx.lineWidth = 0.8 + wmax * (1 - p);
      ctx.beginPath();
      ctx.arc(CX, CY, 40 + 1000 * ease.outCubic(p), 0, TAU);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // ---------- frame ----------
  function frame(tIn) {
    const t = Math.min(Math.max(tIn, 0), T.freeze);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
    ctx.drawImage(BG, 0, 0);
    drawAmbientLight(t);
    drawBokeh(t);

    const cam = camera(t), A = mapAlpha(t);
    drawGraticule(t, cam, A);
    drawDots(t, cam, A);
    drawArcs(t, cam, A);
    drawNodes(t, cam, A);

    drawHemicycle(t);
    drawTemple(t);
    drawRings(t);
    drawBrackets(t);
    drawShapes(t);
    drawFrameLines(t);
    drawDust(t);
    drawCore(t);

    drawLogoBacklight(t);
    drawFinalDust(t);
    drawImpact(t);
    drawStars(t);
    drawLogo(t);
  }

  window.APROBETU = { setup, frame, DURATION, T, W, H };

  // Live preview when the page is opened directly in a browser.
  if (!window.__RENDER__) {
    const tryLoad = srcs => (srcs.length ? setup({ src: srcs[0] }).catch(() => tryLoad(srcs.slice(1))) : Promise.reject());
    tryLoad(['../assets/logo.svg', '../assets/logo.png', '../assets/logo-placeholder.png']).then(() => {
      const start = performance.now();
      const loop = now => {
        frame(((now - start) / 1000) % (DURATION + 0.8));
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
  }
})();
