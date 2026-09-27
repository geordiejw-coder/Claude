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
const WEIGHT = 500;
const BASE_Y = 1000; // baseline of "space"
const XH = 0.546; // Inter x-height (em)

let advCache: Record<string, number> | null = null;
function advances() {
  if (advCache) return advCache;
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = `${WEIGHT} ${FS}px Inter`;
  advCache = {};
  for (const ch of 'space_') advCache[ch] = ctx.measureText(ch).width;
  return advCache;
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
  const A = advances();
  const hasLogo = getStaticFiles().some((f) => f.name === LOGO.file);

  const t0 = T.endIn;
  const M0 = t0 + 1.3; // morph start (after the hold)
  const k1 = inOutCubic(seg(t, M0, M0 + 0.62)); // stretch
  const k2 = inOutCubic(seg(t, M0 + 0.38, M0 + 1.05)); // settle into logo positions
  const kA = inOutCubic(seg(t, M0 + 0.06, M0 + 0.7)); // "a" compression
  const logoIn = hasLogo ? inOutCubic(seg(t, M0 + 1.0, M0 + 1.3)) : 0;

  const word = ['s', 'p', 'a', 'c', 'e'];
  const uW = LOGO.underscore.widthEm * FS;
  const uH = LOGO.underscore.thicknessEm * FS;
  const src = layout(word, word.map((c) => A[c]), -0.02 * FS);
  const str = layout(word, word.map((c) => A[c]), 0.16 * FS);
  const tgt = layout(word, word.map((c) => (c === 'a' ? uW : A[c])), LOGO.targetTrackingEm * FS);

  const wordIn = seg(t, t0 + 0.3, t0 + 0.9);
  const eIn = 1 - Math.pow(1 - clamp01(wordIn), 4);
  const drift = 1 + 0.012 * seg(t, t0, t0 + 4);
  const sx = 1 + 0.07 * k1 * (1 - k2);
  const flat = uH / (XH * FS);
  const aSy = lerp(1, flat, kA);
  const barP = seg(t, M0 + 0.5, M0 + 0.72);
  const gL = src.left, gR = src.left + src.total; // gradient spans the word

  // ink box of the typeset target, for fitting the official SVG
  const inkTop = BASE_Y - XH * FS, inkBot = BASE_Y + 0.2 * FS;
  const logoW = tgt.total * LOGO.fit.widthScale;

  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${drift})`, transformOrigin: `50% ${BASE_Y}px`}}>
      {/* "find your" */}
      <div style={{position: 'absolute', left: 0, right: 0, top: BASE_Y - FS * 0.72 - 110, textAlign: 'center'}}>
        <Mask inP={seg(t, t0 + 0.05, t0 + 0.65)} outP={seg(t, M0 + 0.05, M0 + 0.55)} style={{display: 'inline-block'}}>
          <div style={{fontSize: 70, fontWeight: 300, color: INK, letterSpacing: '-0.01em'}}>{data.ending.line1}</div>
        </Mask>
      </div>

      <svg width={W} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - logoIn}}>
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
            const x = lerp(lerp(src.xs[i], str.xs[i], k1), tgt.xs[i], k2);
            if (ch !== 'a') {
              return (
                <text key={i} x={0} y={0} transform={`translate(${x.toFixed(2)}, ${BASE_Y}) scale(${sx.toFixed(4)}, 1)`}
                  fontFamily="Inter" fontWeight={WEIGHT} fontSize={FS} fill="url(#unicorn)">
                  {ch}
                </text>
              );
            }
            // the "a": compresses onto the baseline, then becomes a flat bar
            const aW = A.a;
            const aSx = sx * lerp(1, uW / aW, k2);
            const barW = lerp(aW * 0.86, uW, k2);
            return (
              <g key={i}>
                <text x={0} y={0} opacity={1 - barP} transform={`translate(${x.toFixed(2)}, ${BASE_Y}) scale(${aSx.toFixed(4)}, ${aSy.toFixed(4)})`}
                  fontFamily="Inter" fontWeight={WEIGHT} fontSize={FS} fill="url(#unicorn)">
                  a
                </text>
                <rect x={x + (aW * aSx - barW) / 2 * (1 - k2)} y={BASE_Y - uH} width={barW} height={uH} opacity={barP} fill="url(#unicorn)" />
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
            position: 'absolute', width: logoW, left: W / 2 - logoW / 2 + LOGO.fit.offsetX,
            top: (inkTop + inkBot) / 2 + LOGO.fit.offsetY, transform: 'translateY(-50%)', opacity: logoIn,
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
