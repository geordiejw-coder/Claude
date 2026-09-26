// One coherent 3D world: a ground plane (x lateral, y up, z into depth) seen
// through a single moving camera. Everything on screen — grid, contours,
// particles, annotation anchors — is projected through the same camera, so
// parallax and depth stay physically consistent for the whole film.
import data from '../data/market.json';

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const DURATION_S = 22;
export const DURATION = FPS * DURATION_S;

// One light point per recorded transaction.
export const N = data.metrics.transactions.value; // 15,500
export const OFF_SHARE = data.metrics.offPlanShare.value / 100; // 0.827
export const VALUE_MULT = 1 + data.metrics.salesValue.yoy.value / 100; // 2.779

// ---------------------------------------------------------------- time utils
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const inOutCubic = (k: number) =>
  k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
export const outCubic = (k: number) => 1 - Math.pow(1 - k, 3);
export const outQuint = (k: number) => 1 - Math.pow(1 - k, 5);
export const outExpo = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
export const inOutSine = (k: number) => -(Math.cos(Math.PI * k) - 1) / 2;
export const bump = (t: number, a: number, b: number, c: number, d: number) =>
  smooth(seg(t, a, b)) * (1 - smooth(seg(t, c, d)));

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// -------------------------------------------------------------------- camera
// [t, x, y, z, pitchDeg, yawDeg, rollDeg, principalY (fraction of H)]
// Interpolated with non-uniform cubic Hermite (Catmull-Rom tangents), so the
// camera never stops at a key: velocity is continuous through the whole film.
const CAM_KEYS: number[][] = [
  [-2, 0.0, 1.0, -10.5, 5, -6, 0, 0.56],
  [0, 0.0, 1.05, -8.6, 6, -5, 0.6, 0.56],
  [3, 0.15, 1.3, -6.4, 9, -2.5, 0.3, 0.6],
  [8, 0.35, 2.0, -4.0, 14, 2.0, -0.4, 0.62],
  [12.5, 0.9, 3.4, -3.2, 19, 7.5, -0.8, 0.63],
  [15.5, 0.2, 5.0, -3.0, 30, 1.5, 0.2, 0.6],
  [18, -0.1, 6.2, -4.0, 33, -1.5, 0.4, 0.62],
  [22, 0.0, 5.0, -12.0, 14, 0.5, 0, 0.66],
  [24, 0.0, 4.8, -13.6, 13, 1.0, 0, 0.66],
];

export type Cam = {
  x: number; y: number; z: number;
  cp: number; sp: number; cyw: number; syw: number; cr: number; sr: number;
  f: number; px: number; py: number;
};

export function camAt(t: number): Cam {
  const K = CAM_KEYS;
  let i = 1;
  while (i < K.length - 2 && t > K[i + 1][0]) i++;
  const k0 = K[i - 1], k1 = K[i], k2 = K[i + 1], k3 = K[Math.min(i + 2, K.length - 1)];
  const dt = k2[0] - k1[0];
  const u = clamp01((t - k1[0]) / dt);
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const v: number[] = [];
  for (let c = 1; c < 8; c++) {
    const m1 = (k2[c] - k0[c]) / (k2[0] - k0[0]);
    const m2 = (k3[c] - k1[c]) / (k3[0] - k1[0] || 1);
    v.push(h00 * k1[c] + h10 * dt * m1 + h01 * k2[c] + h11 * dt * m2);
  }
  const D = Math.PI / 180;
  // Subtle handheld-free "breathing" so even the final frame is never frozen.
  const br = 0.012 * Math.sin(t * 0.9);
  return {
    x: v[0] + br, y: v[1] + br * 0.6, z: v[2],
    cp: Math.cos(v[3] * D), sp: Math.sin(v[3] * D),
    cyw: Math.cos(v[4] * D), syw: Math.sin(v[4] * D),
    cr: Math.cos(v[5] * D), sr: Math.sin(v[5] * D),
    f: 1020, px: W / 2, py: H * v[6],
  };
}

// Writes [sx, sy, depth] into out; returns false when behind the near plane.
export function project(c: Cam, x: number, y: number, z: number, out: Float32Array | number[], o = 0): boolean {
  const rx = x - c.x, ry = y - c.y, rz = z - c.z;
  const x1 = rx * c.cyw - rz * c.syw;
  const z1 = rx * c.syw + rz * c.cyw;
  const y2 = ry * c.cp + z1 * c.sp;
  const d = -ry * c.sp + z1 * c.cp;
  if (d < 0.25) return false;
  const x3 = x1 * c.cr - y2 * c.sr;
  const y3 = x1 * c.sr + y2 * c.cr;
  out[o] = c.px + (c.f * x3) / d;
  out[o + 1] = c.py - (c.f * y3) / d;
  out[o + 2] = d;
  return true;
}

// ------------------------------------------------------------------- terrain
// Abstract value landscape (static in world space). Particles flowing along z
// ride over it, the grid drapes on it, and its iso-lines are the contours.
export const PEAK = {x: 0.45, z: 8.6};
export function terrain(x: number, z: number): number {
  const g = (dx: number, dz: number, sx: number, sz: number) => Math.exp(-(dx * dx / sx + dz * dz / sz));
  return (
    1.0 * g(x - PEAK.x, z - PEAK.z, 2.2, 8.5) +
    0.42 * g(x + 1.7, z - 5.0, 0.9, 3.2) +
    0.36 * g(x - 2.1, z - 11.8, 0.75, 4.2) +
    0.22 * g(x + 0.9, z - 13.6, 1.6, 5.5) +
    0.06 * Math.sin(1.9 * x + 1.1 * z) * g(x, z - 8, 9, 60)
  );
}
export const TERRAIN_MAX = terrain(PEAK.x, PEAK.z);

// Landscape amplitude over time (world units at terrain = 1).
export function lift(t: number): number {
  const up = inOutCubic(seg(t, 8.0, 10.8));
  const down = inOutCubic(seg(t, 12.9, 15.0));
  const flat = inOutCubic(seg(t, 17.6, 20.0));
  return 3.1 * up * (1 - 0.88 * down) * (1 - flat);
}

// Flow of the field (along +z), shared by particles and annotations.
export const Z0 = -2.5;
export const ZLEN = 20;
export const WB = 4.8; // lateral width of the flow band
export const FLOW = 0.016; // band-lengths per second
export function meander(z: number, t: number) {
  return 0.55 * Math.sin(0.3 * z + 0.8) + 0.22 * Math.sin(0.68 * z - t * 0.35);
}
export const SPLIT_GAP = 0.55;

// -------------------------------------------------------------- particles
export const P = (() => {
  const r = mulberry32(20260630);
  const u = new Float32Array(N), v = new Float32Array(N), jit = new Float32Array(N * 4);
  const appear = new Float32Array(N), travel = new Float32Array(N), bright = new Float32Array(N);
  const off = new Uint8Array(N), rank = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    u[i] = r(); v[i] = r(); bright[i] = 0.35 + 0.65 * Math.pow(r(), 1.8);
    for (let k = 0; k < 4; k++) jit[i * 4 + k] = r() * 2 - 1;
    travel[i] = 0.7 + 0.45 * r();
  }
  // Appearance order: random permutation; cadence accelerates then settles
  // (inverse ease-in-out), so accumulation visibly gathers pace, then resolves.
  const order = Array.from({length: N}, (_, i) => i);
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const invEase = (q: number) => (q < 0.5 ? Math.cbrt(q / 4) : 1 - Math.cbrt((1 - q) / 4));
  for (let k = 0; k < N; k++) appear[order[k]] = 3.0 + 3.35 * invEase((k + 0.5) / N);
  // Exactly round(N * 0.827) off-plan points, randomly interleaved.
  const nOff = Math.round(N * OFF_SHARE);
  const perm = Array.from({length: N}, (_, i) => i);
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let k = 0; k < nOff; k++) off[perm[k]] = 1;
  // Rank inside each group by lateral position → minimal-crossing sort.
  const byU = Array.from({length: N}, (_, i) => i).sort((a, b) => u[a] - u[b]);
  let a = 0, b = 0;
  for (const i of byU) {
    if (off[i]) rank[i] = (a++ + 0.5) / nOff; else rank[i] = (b++ + 0.5) / (N - nOff);
  }
  const land = Float32Array.from(appear, (x, i) => x + travel[i]).sort();
  return {u, v, jit, appear, travel, bright, off, rank, land, nOff};
})();

export const LAST_LANDING = P.land[N - 1];

// Number of points that have settled into the field by time t.
export function landedCount(t: number): number {
  let lo = 0, hi = N;
  while (lo < hi) { const m = (lo + hi) >> 1; if (P.land[m] <= t) lo = m + 1; else hi = m; }
  return lo;
}

// Split progress of the stream into 82.7 / 17.3 channels at a depth fraction.
export function splitK(t: number, zf: number) {
  return inOutCubic(seg(t, 13.5 + 1.3 * zf, 15.5 + 1.3 * zf));
}
export function tintK(t: number, zf: number) {
  return smooth(seg(t, 12.8 + 0.9 * zf, 13.8 + 0.9 * zf));
}

// Lateral position of a flow coordinate (u in 0..1, or channel-mapped).
export function laneX(uu: number, z: number, t: number) {
  return (uu - 0.5) * WB + meander(z, t);
}
export function splitX(isOff: boolean, rk: number, z: number, t: number) {
  const us = isOff ? rk * OFF_SHARE : OFF_SHARE + rk * (1 - OFF_SHARE);
  return (us - 0.5) * WB + (isOff ? -SPLIT_GAP / 2 : SPLIT_GAP / 2) + meander(z, t);
}

// Final pull-back: stream narrows into a composed band.
export function settleK(t: number) {
  return inOutCubic(seg(t, 18.0, 20.6));
}

export type PState = {x: number; y: number; z: number; a: number; tint: number; flash: number};

export function particleAt(i: number, t: number, s: PState): void {
  const tl = t - P.appear[i];
  if (tl < 0) { s.a = 0; return; }
  const f = (((P.v[i] + t * FLOW) % 1) + 1) % 1;
  const z = Z0 + f * ZLEN;
  const zf = clamp01((z - Z0) / ZLEN);
  const isOff = P.off[i] === 1;
  const xa = laneX(P.u[i], z, t);
  const xs = splitX(isOff, P.rank[i], z, t);
  let x = lerp(xa, xs, splitK(t, zf));
  // settle: band narrows slightly for the final composition
  const sk = settleK(t);
  x = lerp(x, (x - meander(z, t)) * 0.82 + meander(z, t) * 0.6, sk);
  const j = i * 4;
  let y = 0.02 + 0.018 * Math.sin(t * 1.7 + P.jit[j] * 6) + lift(t) * terrain(x, z) + 0.04 * P.jit[j + 3] * (1 - sk);
  // arrival: swirl down from a scattered cloud onto the flow
  const k = clamp01(tl / P.travel[i]);
  if (k < 1) {
    const e = outCubic(k);
    const sx = x + P.jit[j] * 1.6, sy = 1.4 + (P.jit[j + 1] + 1) * 1.6, sz = z - 1.2 - (P.jit[j + 2] + 1) * 1.4;
    const cx = x + P.jit[j + 2] * 0.9, cy = y + 0.5, cz = z - 0.2;
    const a1 = 1 - e;
    x = a1 * a1 * sx + 2 * a1 * e * cx + e * e * x;
    y = a1 * a1 * sy + 2 * a1 * e * cy + e * e * y;
    s.z = a1 * a1 * sz + 2 * a1 * e * cz + e * e * z;
  } else s.z = z;
  s.x = x; s.y = y;
  const edge = smooth(seg(f, 0, 0.05)) * (1 - smooth(seg(f, 0.86, 1)));
  s.a = P.bright[i] * edge * smooth(clamp01(tl / 0.25));
  s.flash = tl > P.travel[i] ? Math.max(0, 1 - (tl - P.travel[i]) / 0.35) : 0;
  s.tint = tintK(t, zf);
}

// ------------------------------------------------------------ contour lines
// Marching squares on the static terrain, computed once. Each contour carries
// its level so it can be lifted to altitude as the landscape rises.
export const CONTOURS = (() => {
  const levels = [0.04, 0.09, 0.15, 0.22, 0.3, 0.39, 0.49, 0.6, 0.72, 0.85, 0.96];
  const x0 = -7, x1 = 7, z0 = -2, z1 = 22, nx = 110, nz = 170;
  const dx = (x1 - x0) / nx, dz = (z1 - z0) / nz;
  const g = new Float32Array((nx + 1) * (nz + 1));
  for (let iz = 0; iz <= nz; iz++) for (let ix = 0; ix <= nx; ix++) g[iz * (nx + 1) + ix] = terrain(x0 + ix * dx, z0 + iz * dz);
  const segs: number[] = []; // x,z,x,z,level
  for (const L of levels) {
    for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
      const a = g[iz * (nx + 1) + ix], b = g[iz * (nx + 1) + ix + 1];
      const c = g[(iz + 1) * (nx + 1) + ix + 1], d = g[(iz + 1) * (nx + 1) + ix];
      const pts: number[] = [];
      const e = (va: number, vb: number, xa: number, za: number, xb: number, zb: number) => {
        if ((va < L) !== (vb < L)) { const k = (L - va) / (vb - va); pts.push(xa + (xb - xa) * k, za + (zb - za) * k); }
      };
      const X = x0 + ix * dx, Z = z0 + iz * dz;
      e(a, b, X, Z, X + dx, Z);
      e(b, c, X + dx, Z, X + dx, Z + dz);
      e(c, d, X + dx, Z + dz, X, Z + dz);
      e(d, a, X, Z + dz, X, Z);
      for (let k = 0; k + 3 < pts.length; k += 4) segs.push(pts[k], pts[k + 1], pts[k + 2], pts[k + 3], L);
    }
  }
  return new Float32Array(segs);
})();

// ------------------------------------------------------ annotation anchors
// Screen positions of geometry the typography is pinned to.
export function anchors(t: number) {
  const c = camAt(t);
  const o = [0, 0, 0];
  const L = lift(t);
  const px = PEAK.x;
  const pz = PEAK.z;
  const crest = project(c, px, L * TERRAIN_MAX, pz, o) ? {x: o[0], y: o[1]} : null;
  const ghost = project(c, px, (L * TERRAIN_MAX) / VALUE_MULT, pz, o) ? {x: o[0], y: o[1]} : null;
  // scale bar across the split stream, at a fixed depth in front of camera
  const zb = 3.2;
  const zfb = clamp01((zb - Z0) / ZLEN);
  const k = splitK(t, zfb);
  const sk = settleK(t);
  const adj = (x: number) => lerp(x, (x - meander(zb, t)) * 0.82 + meander(zb, t) * 0.6, sk);
  const xl = adj(lerp(laneX(0, zb, t), splitX(true, 0, zb, t), k));
  const xm1 = adj(lerp(laneX(OFF_SHARE, zb, t), splitX(true, 1, zb, t), k));
  const xm2 = adj(lerp(laneX(OFF_SHARE, zb, t), splitX(false, 0, zb, t), k));
  const xr = adj(lerp(laneX(1, zb, t), splitX(false, 1, zb, t), k));
  const pt = (x: number) => (project(c, x, 0, zb, o) ? {x: o[0], y: o[1]} : null);
  return {crest, ghost, bar: {l: pt(xl), m1: pt(xm1), m2: pt(xm2), r: pt(xr), z: zb}};
}
