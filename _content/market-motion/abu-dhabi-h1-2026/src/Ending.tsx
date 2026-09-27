// Signature ending: "find your / space" → the word opens its tracking, the "a"
// compresses onto the baseline into the underscore, letters settle onto the
// official logo's glyph positions → hand-off to the untouched official SVG.
//
// No glyph is ever stretched non-uniformly: letters only translate and scale
// uniformly (the "a" alone compresses vertically, as briefed). The final logo is
// the supplied SVG, placed on whole-pixel coordinates with no transform applied.
import React from 'react';
import {Img, getStaticFiles, staticFile} from 'remotion';
import data from '../data/market.json';
import {LOGO} from './brand';
import {ICE, INK, LegalLine, Mask, VIOLET, W_LABEL} from './theme';
import {T, W, clamp01, inOutCubic, lerp, seg} from './world';

const FS = 200; // word size
const WEIGHT = 700; // Inter weight closest to the official wordmark
const BASE_Y = 1000; // logo baseline on screen
const U = 1.9; // logo units → px (final logo ≈ 650 × 274 px, ink ≈ 558 px wide)

type Metrics = {adv: Record<string, number>; inkL: Record<string, number>; inkR: Record<string, number>; xh: number; sAsc: number; sDesc: number};
let mCache: Metrics | null = null;
function metrics(): Metrics {
  if (mCache) return mCache;
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = `${WEIGHT} ${FS}px Inter`;
  const sM = ctx.measureText('s');
  const m: Metrics = {adv: {}, inkL: {}, inkR: {}, xh: ctx.measureText('x').actualBoundingBoxAscent, sAsc: sM.actualBoundingBoxAscent, sDesc: sM.actualBoundingBoxDescent};
  for (const ch of 'space') {
    const r = ctx.measureText(ch);
    m.adv[ch] = r.width;
    m.inkL[ch] = -r.actualBoundingBoxLeft;
    m.inkR[ch] = r.actualBoundingBoxRight;
  }
  mCache = m;
  return m;
}

function layout(widths: number[], track: number) {
  const total = widths.reduce((a, b) => a + b, 0) + track * (widths.length - 1);
  let x = W / 2 - total / 2;
  const xs: number[] = [];
  widths.forEach((w) => { xs.push(x); x += w + track; });
  return {xs, left: W / 2 - total / 2, total};
}

export const Ending: React.FC<{t: number}> = ({t}) => {
  if (t < T.endIn) return null;
  const MT = metrics();
  const A = MT.adv;
  if (!getStaticFiles().some((f) => f.name === LOGO.file)) throw new Error(`Official logo missing: public/${LOGO.file}`);

  // ---- official logo placement (whole pixels, proportional, untouched)
  const inkW = (LOGO.glyphs.e[1] - LOGO.glyphs.s[0]) * U;
  const logoLeft = Math.round(W / 2 - inkW / 2 - LOGO.glyphs.s[0] * U);
  const logoTop = Math.round(BASE_Y - LOGO.baseline * U);
  const logoW = LOGO.viewW * U;
  const logoH = LOGO.viewH * U;
  const baseY = logoTop + LOGO.baseline * U; // exact baseline after rounding

  // ---- timeline
  const t0 = T.endIn;
  const M0 = t0 + 1.3; // morph start (after the hold)
  const k1 = inOutCubic(seg(t, M0, M0 + 0.62)); // tracking opens
  const k2 = inOutCubic(seg(t, M0 + 0.38, M0 + 1.05)); // settle onto logo glyphs
  const kA = inOutCubic(seg(t, M0 + 0.06, M0 + 0.7)); // "a" compression
  // Single clean step: the settled letters are replaced by the official SVG on one frame (no blend, no ghosting).
  const logoIn = t >= M0 + 1.1 ? 1 : 0;
  const whiteK = seg(k2, 0.45, 1); // gradient → the logo's white as letters settle

  const word = ['s', 'p', 'a', 'c', 'e'];
  const G = ((LOGO.baseline - LOGO.xTop) * U) / (MT.sAsc + MT.sDesc); // uniform glyph scale onto the logo
  const src = layout(word.map((c) => A[c]), -0.02 * FS);
  const str = layout(word.map((c) => A[c]), 0.16 * FS);
  const tgt = word.map((ch) => {
    if (ch === 'a') return logoLeft + LOGO.underscore.x0 * U;
    return logoLeft + LOGO.glyphs[ch][0] * U - MT.inkL[ch] * G;
  });
  const glyphBase = lerp(BASE_Y, baseY - MT.sDesc * G, k2);

  const US = LOGO.underscore;
  const uW = (US.x1 - US.x0) * U;
  const uH = (US.y1 - US.y0) * U;
  const uY = baseY + (US.y0 - LOGO.baseline) * U;
  const aSy = lerp(1, uH / MT.xh, kA);
  const barP = seg(t, M0 + 0.5, M0 + 0.72);

  const wordIn = seg(t, t0 + 0.3, t0 + 0.9);
  const eIn = 1 - Math.pow(1 - clamp01(wordIn), 4);
  const gL = src.left, gR = src.left + src.total; // gradient spans the word

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* "find your" */}
      <div style={{position: 'absolute', left: 0, right: 0, top: BASE_Y - FS * 0.72 - 118, textAlign: 'center'}}>
        <Mask inP={seg(t, t0 + 0.05, t0 + 0.65)} outP={seg(t, M0 + 0.05, M0 + 0.55)} style={{display: 'inline-block'}}>
          <div style={{fontSize: 70, fontWeight: W_LABEL, color: INK, letterSpacing: '-0.01em'}}>{data.ending.line1}</div>
        </Mask>
      </div>

      {logoIn < 1 && (
        <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="unicorn" gradientUnits="userSpaceOnUse" x1={gL} y1={0} x2={gR} y2={0}>
              <stop offset="0" stopColor={ICE} />
              <stop offset="1" stopColor={VIOLET} />
            </linearGradient>
            <clipPath id="wordReveal">
              <rect x={0} y={BASE_Y - FS * (0.2 + 0.9 * eIn)} width={W} height={FS * 1.3} />
            </clipPath>
          </defs>
          <g clipPath="url(#wordReveal)" opacity={Math.min(1, eIn * 1.3)} transform={`translate(0, ${((1 - eIn) * 36).toFixed(2)})`}>
            {word.map((ch, i) => {
              const x = lerp(lerp(src.xs[i], str.xs[i], k1), tgt[i], k2);
              if (ch !== 'a') {
                const g = lerp(1, G, k2);
                const tr = `translate(${x.toFixed(2)}, ${glyphBase.toFixed(2)}) scale(${g.toFixed(4)})`;
                return (
                  <g key={i}>
                    <text x={0} y={0} transform={tr} fontFamily="Inter" fontWeight={WEIGHT} fontSize={FS} fill="url(#unicorn)">{ch}</text>
                    {whiteK > 0 && <text x={0} y={0} transform={tr} fontFamily="Inter" fontWeight={WEIGHT} fontSize={FS} fill={INK} opacity={whiteK}>{ch}</text>}
                  </g>
                );
              }
              // the "a": compresses onto the baseline, then becomes the flat underscore
              const aW = A.a;
              const barW = lerp(aW * 0.86, uW, k2);
              const barX = lerp(x + (aW - aW * 0.86) / 2, tgt[i], k2);
              const barY = lerp(BASE_Y - uH, uY, k2);
              return (
                <g key={i}>
                  <text x={0} y={0} opacity={1 - barP} transform={`translate(${x.toFixed(2)}, ${BASE_Y}) scale(1, ${aSy.toFixed(4)})`}
                    fontFamily="Inter" fontWeight={WEIGHT} fontSize={FS} fill="url(#unicorn)">a</text>
                  <rect x={barX} y={barY} width={barW} height={uH} opacity={barP} fill="url(#unicorn)" />
                  <rect x={barX} y={barY} width={barW} height={uH} opacity={barP * whiteK} fill={INK} />
                </g>
              );
            })}
          </g>
        </svg>
      )}

      {/* the official logo, untouched: proportional size, whole-pixel position, no transforms */}
      {logoIn > 0 && (
        <Img src={staticFile(LOGO.file)} style={{position: 'absolute', left: logoLeft, top: logoTop, width: logoW, height: logoH, opacity: logoIn}} />
      )}

      {/* final-frame licence line */}
      <div style={{position: 'absolute', left: 60, right: 60, top: Math.round(baseY + (120 - LOGO.baseline) * U + 70), display: 'flex', justifyContent: 'center'}}>
        <Mask inP={seg(t, M0 + 1.1, M0 + 1.7)}>
          <LegalLine align="center" />
        </Mask>
      </div>
    </div>
  );
};
