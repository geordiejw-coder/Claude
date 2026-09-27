// Shared brand system: palette, type scale, safe area and type primitives.
import React from 'react';
import {Img, staticFile} from 'remotion';
import data from '../data/market.json';
import {LOGO} from './brand';
import {clamp01, inOutCubic, outExpo} from './world';

// ---------------------------------------------------------------- palette
// Pure black and white; Ice Blue / Soft Violet only as restrained accents.
export const BLACK = '#000000';
export const INK = '#FFFFFF';
export const ICE = '#AABCFF';
export const VIOLET = '#E0ADF9';
export const MUTED = 'rgba(255,255,255,0.66)';
export const QUIET = 'rgba(255,255,255,0.56)';
export const HAIR = 'rgba(255,255,255,0.16)';

// ---------------------------------------------------------------- type
// Inter Variable only (registered in Root.tsx; the render fails if it is missing).
export const FONT = 'Inter';
export const W_HERO = 700; // hero metrics (700–800)
export const W_TITLE = 800;
export const W_LABEL = 600; // labels
export const W_SOURCE = 400; // sources / licence (300–400)

// ---------------------------------------------------------------- layout / safe area
// Reels/TikTok safe area for footers, sources, counters and licence: x 96–984, y 220–1600.
export const X0 = 96;
export const X1 = 984;
export const COL_W = X1 - X0;
export const SAFE_TOP = 220;
export const SAFE_BOTTOM = 1600;
export const HEADER_INK_TOP = 226;
export const INDEX_TOP = 1400; // scene counter row
export const LEGAL_BOTTOM = SAFE_BOTTOM; // licence line sits on the safe-area floor
export const SOURCE_BOTTOM = SAFE_BOTTOM - 42; // source lines stack above it

// ---------------------------------------------------------------- primitives
// Masked line for labels: slides up out of its own clip on entry and exit.
export const Mask: React.FC<{inP: number; outP?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({inP, outP = 0, children, style}) => {
  const a = outExpo(clamp01(inP));
  const b = inOutCubic(clamp01(outP));
  if (a <= 0 || b >= 1) return null;
  const ty = (1 - a) * 105 - b * 105;
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.14em', marginBottom: '-0.14em', ...style}}>
      <div style={{transform: `translateY(${ty.toFixed(3)}%)`, opacity: Math.min(1, a * 1.4) * (1 - b)}}>{children}</div>
    </div>
  );
};

// Frame-stable number reveal: opacity only — no motion, blur, rolling or count-up.
export const Fade: React.FC<{inP: number; outP?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({inP, outP = 0, children, style}) => {
  const o = inOutCubic(clamp01(inP)) * (1 - inOutCubic(clamp01(outP)));
  if (o <= 0) return null;
  return <div style={{opacity: o, ...style}}>{children}</div>;
};

export const LegalLine: React.FC<{align?: 'left' | 'center'}> = ({align = 'left'}) => (
  <div style={{fontSize: 22, fontWeight: W_SOURCE, lineHeight: 1.3, color: 'rgba(255,255,255,0.66)', letterSpacing: '0.01em', textAlign: align, whiteSpace: 'nowrap'}}>
    {data.legal}
  </div>
);

// Source / period lines, bottom-aligned just above the licence line.
export const SourceLines: React.FC<{lines: string[]; opacity: number}> = ({lines, opacity}) => (
  <div style={{position: 'absolute', left: X0, right: 1080 - X1, top: SOURCE_BOTTOM, transform: 'translateY(-100%)', fontSize: 22, fontWeight: W_SOURCE, lineHeight: 1.4, color: QUIET, opacity}}>
    {lines.map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </div>
);

// Official sp_ce SVG (never retyped). `xh` = rendered x-height in px; `inkLeft`/`inkTop` place the ink box.
export const Logo: React.FC<{xh: number; inkLeft: number; inkTop: number; opacity?: number}> = ({xh, inkLeft, inkTop, opacity = 1}) => {
  const u = xh / (LOGO.baseline - LOGO.xTop);
  const w = LOGO.viewW * u;
  return (
    <Img
      src={staticFile(LOGO.file)}
      style={{position: 'absolute', width: w, height: w * (LOGO.viewH / LOGO.viewW), left: inkLeft - LOGO.glyphs.s[0] * u, top: inkTop - LOGO.xTop * u, opacity}}
    />
  );
};
