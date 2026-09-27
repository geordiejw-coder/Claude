import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import {
  CONTOURS, FPS, H, LAST_LANDING, N, P, PEAK, PState, VALUE_MULT, W, anchors, bump, camAt, clamp01,
  fieldPresence, inOutCubic, lift, outCubic, particleAt, project, seg, smooth, terrain,
} from './world';

const ICE = [170, 188, 255];
const PALE = [214, 224, 255];
const VIOLET = [224, 173, 249];
const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;

const AL = 8; // alpha buckets
const SZ = [0.9, 1.6, 2.5, 3.8]; // stroke widths
const TL = 4; // tint levels

// bucket index: group(2) × tint(TL) × alpha(AL) × size(SZ)
const NB = 2 * TL * AL * SZ.length;

function depthFade(d: number) {
  return smooth(seg(d, 0.9, 3.0)) * (1 - 0.75 * smooth(seg(d, 14, 34)));
}

function drawField(ctx: CanvasRenderingContext2D, t: number) {
  ctx.clearRect(0, 0, W, H);
  const c = camAt(t);
  const L = lift(t);
  const o = new Float32Array(3), o2 = new Float32Array(3);

  // ------------------------------------------------------ grid (draped)
  const wake = outCubic(seg(t, 0.15, 2.8)) * 26; // radial reveal radius
  const gridA = 0.075 * (1 - 0.35 * smooth(seg(t, 18, 20.5))) * (1 - 0.5 * smooth(seg(t, 28.2, 29.4)));
  const gb: Path2D[] = Array.from({length: 6}, () => new Path2D());
  const lineTo = (x0: number, z0: number, x1: number, z1: number) => {
    const r = Math.hypot((x0 + x1) / 2, (z0 + z1) / 2 - 5);
    const rev = clamp01((wake - r) / 3);
    if (rev <= 0) return;
    if (!project(c, x0, L * terrain(x0, z0) * 0.99, z0, o)) return;
    if (!project(c, x1, L * terrain(x1, z1) * 0.99, z1, o2)) return;
    const a = rev * depthFade((o[2] + o2[2]) / 2);
    const bi = Math.min(5, Math.floor(a * 6));
    if (bi <= 0) return;
    gb[bi].moveTo(o[0], o[1]);
    gb[bi].lineTo(o2[0], o2[1]);
  };
  for (let x = -7; x <= 7.001; x += 0.5) for (let z = -2; z < 22; z += 0.4) lineTo(x, z, x, z + 0.4);
  for (let z = -2; z <= 22.001; z += 0.5) for (let x = -7; x < 7; x += 0.35) lineTo(x, z, x + 0.35, z);
  ctx.lineWidth = 1;
  for (let b = 1; b < 6; b++) { ctx.strokeStyle = rgba(PALE, gridA * (b / 5)); ctx.stroke(gb[b]); }

  // ------------------------------------------------------ contours (lifted)
  const cb: Path2D[] = Array.from({length: 6}, () => new Path2D());
  const cs = CONTOURS;
  const contourA = 0.2 * (1 - 0.45 * smooth(seg(t, 13.5, 16))) * (1 - 0.4 * smooth(seg(t, 18.5, 21))) * (1 - 0.6 * smooth(seg(t, 28.2, 29.4)));
  for (let k = 0; k < cs.length; k += 5) {
    const lv = cs[k + 4];
    const rev = smooth(seg(t, 0.5 + lv * 2.2, 1.6 + lv * 2.2));
    if (rev <= 0) continue;
    const x0 = cs[k], z0 = cs[k + 1], x1 = cs[k + 2], z1 = cs[k + 3];
    const r = Math.hypot(x0 - PEAK.x, (z0 - PEAK.z) * 0.6);
    const rv2 = clamp01((wake * 0.9 - r) / 2);
    if (rv2 <= 0) continue;
    const y = L * lv;
    if (!project(c, x0, y, z0, o) || !project(c, x1, y, z1, o2)) continue;
    const a = rev * rv2 * depthFade(o[2]) * (0.55 + 0.45 * lv);
    const bi = Math.min(5, Math.floor(a * 6));
    if (bi <= 0) continue;
    cb[bi].moveTo(o[0], o[1]);
    cb[bi].lineTo(o2[0], o2[1]);
  }
  ctx.lineWidth = 1.1;
  for (let b = 1; b < 6; b++) { ctx.strokeStyle = rgba(ICE, contourA * (b / 5)); ctx.stroke(cb[b]); }

  // ------------------------------------------------------ resolve pulse ring
  const pr = seg(t, LAST_LANDING - 0.05, LAST_LANDING + 1.6);
  if (pr > 0 && pr < 1) {
    const R = 0.3 + outCubic(pr) * 9;
    const pa = 0.5 * (1 - pr);
    ctx.beginPath();
    let first = true;
    for (let k = 0; k <= 120; k++) {
      const th = (k / 120) * Math.PI * 2;
      const x = 0.2 + Math.cos(th) * R, z = 5.5 + Math.sin(th) * R * 0.9;
      if (project(c, x, 0.01, z, o)) { if (first) ctx.moveTo(o[0], o[1]); else ctx.lineTo(o[0], o[1]); first = false; } else first = true;
    }
    ctx.strokeStyle = rgba(ICE, pa);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ------------------------------------------------------ particles
  const buckets: Path2D[] = Array.from({length: NB}, () => new Path2D());
  const s: PState = {x: 0, y: 0, z: 0, a: 0, tint: 0, flash: 0};
  const sp: PState = {x: 0, y: 0, z: 0, a: 0, tint: 0, flash: 0};
  const shutter = 0.55 / FPS;
  const sweepZ = -3 + 24 * inOutCubic(seg(t, 9.4, 12.2));
  const sweepOn = bump(t, 9.4, 9.8, 11.6, 12.3);
  const glob = (1 - 0.18 * smooth(seg(t, 18.4, 20.6))) * fieldPresence(t);
  for (let i = 0; i < N; i++) {
    particleAt(i, t, s);
    if (s.a <= 0.004) continue;
    if (!project(c, s.x, s.y, s.z, o)) continue;
    particleAt(i, t - shutter, sp);
    let px = o[0] - 0.01, py = o[1];
    const d = o[2];
    if (sp.a > 0 && project(c, sp.x, sp.y, sp.z, o2)) { px = o2[0]; py = o2[1]; }
    if (o[0] < -40 || o[0] > W + 40 || o[1] < -40 || o[1] > H + 40) continue;
    const isOff = P.off[i] === 1;
    const sw = sweepOn * Math.exp(-((s.z - sweepZ) ** 2) / 0.9);
    let a = s.a * depthFade(d) * glob * (1 + 0.9 * s.flash + 1.2 * sw);
    // tinted remainder recedes; off-plan brightens
    a *= isOff ? 1 + 0.6 * s.tint : 1 - 0.3 * s.tint;
    a = Math.min(1, a * 1.05);
    const ai = Math.min(AL - 1, Math.floor(a * AL));
    if (ai <= 0 && a < 0.06) continue;
    const size = Math.min(6, Math.max(0.9, 9 / d)) * (1 + 0.6 * s.flash);
    const si = size < 1.3 ? 0 : size < 2.1 ? 1 : size < 3.2 ? 2 : 3;
    const ti = Math.min(TL - 1, Math.round(s.tint * (TL - 1)));
    const bi = (((isOff ? 0 : 1) * TL + ti) * AL + ai) * SZ.length + si;
    buckets[bi].moveTo(px, py);
    buckets[bi].lineTo(o[0], o[1]);
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let g = 0; g < 2; g++) for (let ti = 0; ti < TL; ti++) {
    const col = mix(PALE, g === 0 ? ICE : VIOLET, ti / (TL - 1));
    for (let ai = 0; ai < AL; ai++) for (let si = 0; si < SZ.length; si++) {
      const bi = ((g * TL + ti) * AL + ai) * SZ.length + si;
      ctx.strokeStyle = rgba(col, Math.max(0.05, (ai + 0.5) / AL));
      ctx.lineWidth = SZ[si];
      ctx.stroke(buckets[bi]);
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  // ------------------------------------------------------ value annotation linework
  const an = anchors(t);
  const m = bump(t, 10.1, 10.9, 12.8, 13.3);
  if (m > 0) {
    const draw = outCubic(seg(t, 10.1, 11.4));
    const prof = (scale: number, dash: number[], col: string, w: number) => {
      ctx.beginPath();
      let first = true;
      const xs = -3.4, xe = -3.4 + 7.2 * draw;
      for (let x = xs; x <= xe; x += 0.05) {
        if (project(c, x, (L * terrain(x, PEAK.z)) / scale + 0.012, PEAK.z, o)) {
          if (first) ctx.moveTo(o[0], o[1]); else ctx.lineTo(o[0], o[1]);
          first = false;
        }
      }
      ctx.setLineDash(dash);
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.stroke();
      ctx.setLineDash([]);
    };
    prof(VALUE_MULT, [6, 7], `rgba(255,255,255,${(0.45 * m).toFixed(3)})`, 1.4);
    prof(1, [], `rgba(170,188,255,${(0.9 * m).toFixed(3)})`, 2);
    if (an.crest && an.ghost) {
      const k = inOutCubic(seg(t, 10.8, 11.7));
      const x = an.crest.x + 0; // bracket at crest
      const yb = an.ghost.y, yt = yb + (an.crest.y - yb) * k;
      ctx.strokeStyle = `rgba(255,255,255,${(0.85 * m).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, yb); ctx.lineTo(x, yt);
      ctx.moveTo(x - 10, yb); ctx.lineTo(x + 10, yb);
      if (k > 0.98) { ctx.moveTo(x - 10, yt); ctx.lineTo(x + 10, yt); }
      ctx.stroke();
      // leader to the label
      const lk = outCubic(seg(t, 11.5, 12.1));
      if (lk > 0) {
        ctx.beginPath();
        ctx.moveTo(x + 14, an.crest.y);
        ctx.lineTo(x + 14 + 90 * lk, an.crest.y + 90 * lk);
        ctx.stroke();
      }
    }
  }

  // ------------------------------------------------------ split scale bar
  const sb = bump(t, 14.6, 15.4, 18.0, 18.6);
  if (sb > 0 && an.bar.l && an.bar.m1 && an.bar.m2 && an.bar.r) {
    const {l, m1, m2, r} = an.bar;
    const k = outCubic(seg(t, 14.6, 15.8));
    const yo = 46;
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(170,188,255,${(0.95 * sb).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y + yo); ctx.lineTo(l.x + (m1.x - l.x) * k, l.y + yo + (m1.y - l.y) * k);
    ctx.moveTo(l.x, l.y + yo - 9); ctx.lineTo(l.x, l.y + yo + 9);
    if (k > 0.99) { ctx.moveTo(m1.x, m1.y + yo - 9); ctx.lineTo(m1.x, m1.y + yo + 9); }
    ctx.stroke();
    ctx.strokeStyle = `rgba(224,173,249,${(0.6 * sb).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(m2.x, m2.y + yo); ctx.lineTo(m2.x + (r.x - m2.x) * k, m2.y + yo + (r.y - m2.y) * k);
    ctx.moveTo(m2.x, m2.y + yo - 9); ctx.lineTo(m2.x, m2.y + yo + 9);
    if (k > 0.99) { ctx.moveTo(r.x, r.y + yo - 9); ctx.lineTo(r.x, r.y + yo + 9); }
    ctx.stroke();
  }
}

// Precomputed film grain tiles (seeded, deterministic).
let grainTiles: HTMLCanvasElement[] | null = null;
function getGrain() {
  if (grainTiles) return grainTiles;
  grainTiles = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let n = 0; n < 4; n++) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const g = cv.getContext('2d')!;
    const img = g.createImageData(256, 256);
    for (let p = 0; p < 256 * 256; p++) {
      const v = Math.floor(rnd() * 255);
      img.data[p * 4] = img.data[p * 4 + 1] = img.data[p * 4 + 2] = v;
      img.data[p * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    grainTiles.push(cv);
  }
  return grainTiles;
}

export const Field: React.FC = () => {
  const frame = useCurrentFrame();
  const main = useRef<HTMLCanvasElement>(null);
  const bloom = useRef<HTMLCanvasElement>(null);
  const grain = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const t = frame / FPS;
    const ctx = main.current!.getContext('2d')!;
    drawField(ctx, t);
    const b = bloom.current!.getContext('2d')!;
    b.clearRect(0, 0, W / 4, H / 4);
    b.drawImage(main.current!, 0, 0, W / 4, H / 4);
    const g = grain.current!.getContext('2d')!;
    const tiles = getGrain();
    const pat = g.createPattern(tiles[frame % 4], 'repeat')!;
    g.clearRect(0, 0, W, H);
    g.save();
    g.translate((frame * 73) % 256, (frame * 131) % 256);
    g.fillStyle = pat;
    g.fillRect(-256, -256, W + 512, H + 512);
    g.restore();
  }, [frame]);
  return (
    <>
      <canvas ref={main} width={W} height={H} style={{position: 'absolute', inset: 0}} />
      <canvas
        ref={bloom}
        width={W / 4}
        height={H / 4}
        style={{position: 'absolute', inset: 0, width: W, height: H, filter: 'blur(6px)', opacity: 0.75, mixBlendMode: 'screen'}}
      />
      <canvas
        ref={grain}
        width={W}
        height={H}
        style={{position: 'absolute', inset: 0, opacity: 0.055, mixBlendMode: 'overlay'}}
      />
    </>
  );
};
