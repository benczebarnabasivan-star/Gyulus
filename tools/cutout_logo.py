"""Cuts the round APRÓBETŰ badge out of its square background.

    python3 tools/cutout_logo.py assets/logo-original.png assets/logo.png

Only pixels outside the gold ring become transparent; everything inside the ring (and the ring
itself) is copied unchanged. The ring is traced angle by angle because it is not perfectly round.
"""
import sys

import numpy as np
from PIL import Image


def main(src, dst):
    im = np.asarray(Image.open(src).convert("RGB")).astype(float)
    h, w, _ = im.shape
    gold = np.clip((im[..., 0] - im[..., 2] - 90) / 80, 0, 1)

    # Rough centre: least-squares circle through the outer gold pixels.
    ys, xs = np.nonzero(gold > 0.5)
    far = np.hypot(xs - w / 2, ys - h / 2) > 0.38 * min(w, h)
    x, y = xs[far].astype(float), ys[far].astype(float)
    c = np.linalg.lstsq(np.column_stack([x, y, np.ones_like(x)]), x * x + y * y, rcond=None)[0]
    cx, cy = c[0] / 2, c[1] / 2
    r0 = np.sqrt(c[2] + cx * cx + cy * cy)

    # Outer edge of the ring at every 0.5°, where gold falls below 50 % going outwards.
    angles = np.radians(np.arange(0, 360, 0.5))
    rs = np.arange(r0 - 40, r0 + 40, 0.1)
    edge = np.full(len(angles), np.nan)
    for i, th in enumerate(angles):
        px = np.clip(np.round(cx + rs * np.cos(th)).astype(int), 0, w - 1)
        py = np.clip(np.round(cy + rs * np.sin(th)).astype(int), 0, h - 1)
        inside = np.nonzero(gold[py, px] > 0.5)[0]
        if len(inside):
            edge[i] = rs[inside[-1]]
    ok = ~np.isnan(edge)
    edge = np.interp(np.arange(len(edge)), np.nonzero(ok)[0], edge[ok], period=len(edge))
    k = 9
    edge = np.convolve(np.r_[edge[-k:], edge, edge[:k]], np.ones(2 * k + 1) / (2 * k + 1), "valid")

    yy, xx = np.mgrid[0:h, 0:w]
    th = np.mod(np.arctan2(yy - cy, xx - cx), 2 * np.pi)
    r_edge = np.interp(th, angles, edge, period=2 * np.pi)
    alpha = np.clip(r_edge + 1.0 - np.hypot(xx - cx, yy - cy), 0, 1)

    rgba = np.dstack([im, alpha * 255]).round().astype(np.uint8)
    R = int(np.ceil(edge.max() + 2))
    box = (int(round(cx)) - R, int(round(cy)) - R, int(round(cx)) + R, int(round(cy)) + R)
    Image.fromarray(rgba, "RGBA").crop(box).save(dst, optimize=True)
    print(f"ring centre ({cx:.1f}, {cy:.1f}), outer edge {edge.min():.1f}–{edge.max():.1f}px -> {dst} {2 * R}x{2 * R}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
