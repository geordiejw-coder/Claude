// Signature ending: "find your / space" → the "a" flattens into the underscore
// while the word stretches and its letters settle → hands off to the official
// sp_ce logo SVG.
import React from 'react';
import {Img, getStaticFiles, staticFile} from 'remotion';
import data from '../data/market.json';
import {LOGO} from './brand';
import {ICE, INK, LegalLine, Mask, VIOLET} from './theme';
import {T, W, clamp01, inOutCubic, lerp, seg} from './world';

const FS = 200; // word size
const WEIGHT = 600; // closest Inter weight to the official wordmark
const BASE_Y = 1000; // baseline of "space"

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

function layout(chars: string[], widths: number[], track: number) {
  const total = widths.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
  let x = W / 2 - total / 2;
  const xs: number[] = [];
  widths.forEach((w) => { xs.push(x); x += w + track; });
  return {xs, left: W / 2 - total / 2, total};
}

export const Ending: React.FC<{t: number}> = ({t}) => {
  if (t < T.endIn) return null;
  const MT = metrics();
  const A = MT.adv;
  const hasLogo = getStaticFiles().some((f) => f.name === LOGO.file);
  // Logo placement: scale so its x-height equals the typeset x-height, baseline on BASE_Y.
  // Match the full ink height of 's' (overshoot included on both sides).
  const U = (MT.sAsc + MT.sDesc) / (LOGO.baseline - LOGO.xTop);
  const logoW = LOGO.viewW * U;
  const logoLeft = W / 2 - ((LOGO.glyphs.s[0] + LOGO.glyphs.e[1]) / 2) * U; // centre the ink, not the viewBox
  const logoTop = BASE_Y - LOGO.baseline * U;

  const t0 = T.endIn;
  const M0 = t0 + 1.3; // morph start (after the hold)
  const k1 = inOutCubic(seg(t, M0, M0 + 0.62)); // stretch
  const k2 = inOutCubic(seg(t, M0 + 0.38, M0 + 1.05)); // settle into logo positions
  const kA = inOutCubic(seg(t, M0 + 0.06, M0 + 0.7)); // "a" compression
  const logoIn = hasLogo ? inOutCubic(seg(t, M0 + 1.0, M0 + 1.3)) : 0;

  const word = ['s', 'p', 'a', 'c', 'e'];
  const US = LOGO.underscore;
  const uW = (US.x1 - US.x0) * U;
  const uH = (US.y1 - US.y0) * U;
  const src = layout(word, word.map((c) => A[c]), -0.02 * FS);
  const str = layout(word, word.map((c) => A[c]), 0.16 * FS);
  // Target: each glyph's ink box lands on the matching glyph of the official logo.
  const tgtSx: number[] = [];
  const tgtX = word.map((ch, i) => {
    if (ch === 'a') { tgtSx.push(1); return logoLeft + US.x0 * U; }
    const [l, r] = LOGO.glyphs[ch];
    const sxi = ((r - l) * U) / (MT.inkR[ch] - MT.inkL[ch]);
    tgtSx.push(sxi);
    return logoLeft + l * U - MT.inkL[ch] * sxi;
  });
  const whiteK = seg(k2, 0.45, 1); // letters take on the logo's white as they settle

  const wordIn = seg(t, t0 + 0.3, t0 + 0.9);
  const eIn = 1 - Math.pow(1 - clamp01(wordIn), 4);
  const drift = 1 + 0.012 * seg(t, t0, t0 + 4);
  const sx = 1 + 0.07 * k1 * (1 - k2);
  const flat = uH / MT.xh;
  const aSy = lerp(1, flat, kA);
  const barP = seg(t, M0 + 0.5, M0 + 0.72);
  const gL = src.left, gR = src.left + src.total; // gradient spans the word

  const inkBot = BASE_Y + (120 - LOGO.baseline) * U;

  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${drift})`, transformOrigin: `50% ${BASE_Y}px`}}>
      {/* "find your" */}
      <div style={{position: 'absolute', left: 0, right: 0, top: BASE_Y - FS * 0.72 - 110, textAlign: 'center'}}>
        <Mask inP={seg(t, t0 + 0.05, t0 + 0.65)} outP={seg(t, M0 + 0.05, M0 + 0.55)} style={{display: 'inline-block'}}>
          <div style={{fontSize: 70, fontWeight: 300, color: INK, letterSpacing: '-0.01em'}}>{data.ending.line1}</div>
        </Mask>
      </div>

      <svg width={W} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - seg(logoIn, 0.6, 1)}}>
        <defs>
          <linearGradient id="unicorn" gradientUnits="userSpaceOnUse" x1={gL} y1={0} x2={gR} y2={0}>
            <stop offset="0" stopColor={ICE} />
            <stop offset="1" stopColor={VIOLET} />
          </linearGradient>
          <clipPath id="wordReveal">
            <rect x={0} y={BASE_Y - FS * (0.2 + 0.9 * eIn)} width={W} height={FS * 1.3} />
          </clipPath>
        </defs>
        <g clipPath="url(#wordReveal)" opacity={Math.min(1, eIn * 1.3)} transform={`translate(0, ${(1 - eIn) * 36})`}>
          {word.map((ch, i) => {
            const x = lerp(lerp(src.xs[i], str.xs[i], k1), tgtX[i], k2);
            if (ch !== 'a') {
              const gsx = lerp(sx, tgtSx[i], k2);
              const tr = `translate(${x.toFixed(2)}, ${(BASE_Y - MT.sDesc * k2).toFixed(2)}) scale(${gsx.toFixed(4)}, 1)`;
              return (
                <g key={i}>
                  <text x={0} y={0} transform={tr} fontFamily="Inter" fontWeight={WEIGHT} fontSize={FS} fill="url(#unicorn)">{ch}</text>
                  {whiteK > 0 && <text x={0} y={0} transform={tr} fontFamily="Inter" fontWeight={WEIGHT} fontSize={FS} fill={INK} opacity={whiteK}>{ch}</text>}
                </g>
              );
            }
            // the "a": compresses onto the baseline, then becomes a flat bar
            const aW = A.a;
            const aSx = sx * lerp(1, uW / aW, k2);
            const barW = lerp(aW * 0.86, uW, k2);
            const barY = lerp(BASE_Y - uH, BASE_Y + (US.y0 - LOGO.baseline) * U, k2);
            return (
              <g key={i}>
                <text x={0} y={0} opacity={1 - barP} transform={`translate(${x.toFixed(2)}, ${BASE_Y}) scale(${aSx.toFixed(4)}, ${aSy.toFixed(4)})`}
                  fontFamily="Inter" fontWeight={WEIGHT} fontSize={FS} fill="url(#unicorn)">
                  a
                </text>
                <rect x={x + (aW * aSx - barW) / 2 * (1 - k2)} y={barY} width={barW} height={uH} opacity={barP} fill="url(#unicorn)" />
                <rect x={x + (aW * aSx - barW) / 2 * (1 - k2)} y={barY} width={barW} height={uH} opacity={barP * whiteK} fill={INK} />
              </g>
            );
          })}
        </g>
      </svg>

      {/* official logo hand-off */}
      {hasLogo && logoIn > 0 && (
        <Img
          src={staticFile(LOGO.file)}
          style={{
            position: 'absolute', width: logoW, height: LOGO.viewH * U, left: logoLeft, top: logoTop, opacity: logoIn,
          }}
        />
      )}
      {!hasLogo && t > M0 + 1.0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1480, textAlign: 'center', fontSize: 22, color: '#FFB86B', letterSpacing: '0.08em', opacity: seg(t, M0 + 1.0, M0 + 1.3)}}>
          PLACEHOLDER — official sp_ce SVG not supplied ({`public/${LOGO.file}`})
        </div>
      )}

      {/* final-frame legal line */}
      <div style={{position: 'absolute', left: 60, right: 60, top: inkBot + 90, display: 'flex', justifyContent: 'center'}}>
        <Mask inP={seg(t, M0 + 1.1, M0 + 1.7)}>
          <LegalLine align="center" />
        </Mask>
      </div>
    </div>
  );
};
