// Particle layer for the CBRE and Savills scenes, in the same visual language
// as the Cavendish field: additive light points with shutter streaks, arriving,
// settling cleanly and holding still enough to read.
//  - Price momentum: points stream in from the left and fill each bar in value
//    order; the +21.6% headline forms as a dotted marker on the same scale, then
//    one restrained light sweep crosses both bars.
//  - Current pricing: points converge out of depth into two lattice "fields"
//    whose lengths are proportional to the two rates.
import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import {FPS, H, T, W, clamp01, inOutCubic, mulberry32, outCubic, seg, smooth, worldSpeed, worldTime} from './world';
import {color, rgb} from './tokens';
import {PRICE, RATE, fieldRowDx, fieldRowY} from './publisherLayout';
import {X0} from './theme';

type Pt = {tx: number; ty: number; sx: number; sy: number; t0: number; dur: number; size: number; a: number; col: number[]; ph: number; z: number; kind: 0 | 1 | 2};

const PRICE_PTS: Pt[] = (() => {
  const r = mulberry32(21600244);
  const pts: Pt[] = [];
  const a = T.priceIn;
  PRICE.rows.forEach((row, k) => {
    const n = Math.round((row.len * row.h) / 11); // equal density: count ∝ value
    for (let i = 0; i < n; i++) {
      const fx = r();
      const tx = X0 + fx * row.len;
      const ty = row.barY + r() * row.h;
      pts.push({
        tx, ty, sx: tx - 150 - r() * 230, sy: ty + (r() - 0.5) * 14,
        t0: a + 0.9 + k * 0.2 + fx * 0.9 + r() * 0.25, dur: 1.0 + r() * 0.2,
        size: 1.5 + r() * 0.9, a: 0.55 + r() * 0.45, col: row.color, ph: r() * 6.28, z: 0, kind: 0,
      });
    }
  });
  // dotted marker at the headline value, forming top → bottom
  const m = 44;
  for (let i = 0; i < m; i++) {
    if (i % 4 === 3) continue; // dashes
    const f = i / (m - 1);
    const ty = PRICE.markerY0 + f * (PRICE.markerY1 - PRICE.markerY0);
    pts.push({tx: PRICE.markerX, ty, sx: PRICE.markerX, sy: ty - 16, t0: a + 2.0 + f * 0.45, dur: 0.35, size: 2.0, a: 0.9, col: rgb(color.spWhite), ph: 0, z: 0, kind: 1});
  }
  return pts;
})();

const RATE_PTS: Pt[] = (() => {
  const r = mulberry32(17200121);
  const pts: Pt[] = [];
  const c = T.rateIn;
  RATE.rows.forEach((row, k) => {
    for (let rr = 0; rr < RATE.fieldRowsN; rr++) {
      const dx = fieldRowDx(rr);
      const n = Math.floor(row.len / dx);
      for (let i = 0; i <= n; i++) {
        const tx = X0 + i * dx;
        const ty = row.fieldY + fieldRowY(rr);
        const fx = i / n;
        pts.push({
          tx, ty, sx: tx + (r() - 0.5) * 320, sy: ty + (r() - 0.5) * 14,
          t0: c + 0.45 + k * 0.35 + fx * 0.8 + r() * 0.15, dur: 0.9,
          size: 1.3 + rr * 0.24, a: 0.7 + rr * 0.06, col: row.color, ph: i * 0.3 + rr, z: 0.6 + r() * 0.8, kind: 2,
        });
      }
    }
  });
  return pts;
})();

const AL = 8;
function draw(ctx: CanvasRenderingContext2D, t: number, speed: number) {
  ctx.clearRect(0, 0, W, H);
  const inPrice = t > T.priceIn && t < T.priceOut + 0.1;
  const inRate = t > T.rateIn && t < T.rateOut + 0.1;
  if (!inPrice && !inRate) return;
  const pts = inPrice ? PRICE_PTS : RATE_PTS;
  const shutter = (0.3 / FPS) * speed;
  const exitK = inPrice ? inOutCubic(seg(t, T.priceOut - 0.6, T.priceOut)) : inOutCubic(seg(t, T.rateOut - 0.6, T.rateOut));
  const sweepX = X0 - 120 + 1100 * inOutCubic(seg(t, T.priceIn + 2.55, T.priceIn + 3.3));
  const sweepOn = inPrice ? smooth(seg(t, T.priceIn + 2.5, T.priceIn + 2.7)) * (1 - smooth(seg(t, T.priceIn + 3.1, T.priceIn + 3.35))) : 0;

  const pos = (p: Pt, tt: number, out: number[]) => {
    const k = clamp01((tt - p.t0) / p.dur);
    if (tt < p.t0) return false;
    let x: number, y: number, z = 0, a = p.a;
    if (p.kind === 0) {
      const e = outCubic(k);
      x = p.sx + (p.tx - p.sx) * e;
      y = p.sy + (p.ty - p.sy) * e;
      a *= smooth(clamp01(k / 0.25)) * (0.45 + 0.55 * e); // soft in flight, full once settled
      if (k >= 1) y += 0.45 * Math.sin(tt * 1.3 + p.ph); // settled: sub-pixel breathing only
      x += 40 * exitK;
    } else if (p.kind === 1) {
      const e = outCubic(k);
      x = p.tx;
      y = p.sy + (p.ty - p.sy) * e;
      a *= e;
    } else {
      const e = inOutCubic(k);
      x = p.sx + (p.tx - p.sx) * e;
      y = p.sy + (p.ty - p.sy) * e;
      z = p.z * (1 - e);
      a *= smooth(clamp01(k / 0.3)) * (1 - 0.55 * z);
      if (k >= 1) a *= 0.88 + 0.12 * Math.sin(tt * 1.6 - p.ph * 0.25); // slow glint along the field
      // exit: back into depth
      x += (p.sx - p.tx) * 0.35 * exitK;
      z += 1.2 * exitK;
    }
    a *= 1 - exitK;
    out[0] = x; out[1] = y; out[2] = z; out[3] = a; out[4] = k;
    return true;
  };

  const cur = [0, 0, 0, 0, 0], prev = [0, 0, 0, 0, 0];
  const buckets = new Map<string, Path2D>();
  for (const p of pts) {
    if (!pos(p, t, cur)) continue;
    const hasPrev = pos(p, t - shutter, prev);
    let a = cur[3];
    if (p.kind === 0) {
      const flash = cur[4] >= 1 ? Math.max(0, 1 - (t - p.t0 - p.dur) / 0.3) : 0;
      a *= 1 + 0.5 * flash + 0.8 * sweepOn * Math.exp(-((cur[0] - sweepX) ** 2) / (2 * 45 * 45));
    }
    a = Math.min(1, a);
    if (a < 0.03) continue;
    const size = p.size * (1 + 2.2 * cur[2]);
    const key = `${p.col.join(',')}|${Math.min(AL - 1, Math.floor(a * AL))}|${size.toFixed(1)}`;
    let path = buckets.get(key);
    if (!path) { path = new Path2D(); buckets.set(key, path); }
    path.moveTo(hasPrev ? prev[0] : cur[0] - 0.01, hasPrev ? prev[1] : cur[1]);
    path.lineTo(cur[0], cur[1]);
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const [key, path] of buckets) {
    const [col, ai, size] = key.split('|');
    ctx.strokeStyle = `rgba(${col},${((Number(ai) + 0.5) / AL).toFixed(3)})`;
    ctx.lineWidth = Number(size);
    ctx.stroke(path);
  }
  ctx.globalCompositeOperation = 'source-over';
}

export const SceneParticles: React.FC<{t: number}> = ({t}) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    draw(ref.current!.getContext('2d')!, worldTime(frame), worldSpeed(frame));
  }, [frame]);
  void t;
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};
