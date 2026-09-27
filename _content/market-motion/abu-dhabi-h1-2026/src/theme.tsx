// Shared palette, layout constants and type primitives.
import React from 'react';
import data from '../data/market.json';
import {FPS, clamp01, inOutCubic, outExpo, outQuint, seg} from './world';

export const INK = '#FFFFFF';
export const ICE = '#AABCFF';
export const VIOLET = '#E0ADF9';
export const MUTED = 'rgba(214,224,255,0.58)';
export const QUIET = 'rgba(214,224,255,0.42)';
export const X0 = 96;
export const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';

// ------------------------------------------------------------------ helpers
// Masked line: slides up out of its own mask on entry and exit.
export const Mask: React.FC<{inP: number; outP?: number; children: React.ReactNode; style?: React.CSSProperties; dir?: number}> = ({
  inP, outP = 0, children, style, dir = 1,
}) => {
  const a = outExpo(clamp01(inP));
  const b = inOutCubic(clamp01(outP));
  if (a <= 0 || b >= 1) return null;
  const ty = (1 - a) * 105 * dir - b * 105;
  const blur = (1 - a) * 8 + b * 8;
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em', ...style}}>
      <div style={{transform: `translateY(${ty}%)`, filter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined, opacity: Math.min(1, a * 1.4) * (1 - b)}}>
        {children}
      </div>
    </div>
  );
};

// Rolling digit column with velocity-driven vertical blur.
const Slot: React.FC<{target: number; p: number; turns?: number; v: number}> = ({target, p, turns = 2, v}) => {
  const pos = target + turns * 10 * (1 - p);
  const base = Math.floor(pos);
  const blur = Math.min(9, v * 0.9);
  const cells = [];
  for (let k = base - 1; k <= base + 2; k++) {
    const d = ((k % 10) + 10) % 10;
    cells.push(
      <span key={k} style={{position: 'absolute', left: 0, right: 0, top: `${(k - pos) * 1}em`, textAlign: 'center'}}>
        {d}
      </span>,
    );
  }
  return (
    <span style={{position: 'relative', display: 'inline-block', width: '0.62em', height: '1em', overflow: 'hidden', verticalAlign: 'top', filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined}}>
      <span style={{visibility: 'hidden'}}>0</span>
      {cells}
    </span>
  );
};

// Renders a display string ("67.8", "82.7%") with digits as rolling slots.
export const SlotString: React.FC<{text: string; t: number; start: number; dur: number; stagger?: number}> = ({text, t, start, dur, stagger = 0.13}) => {
  let di = 0;
  const chars = text.split('');
  const nd = chars.filter((ch) => /\d/.test(ch)).length;
  return (
    <>
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i}>{ch}</span>;
        const idx = nd - 1 - di++; // last digit settles last
        const a = start + (nd - 1 - idx) * stagger;
        const p = outQuint(seg(t, a, a + dur));
        const p2 = outQuint(seg(t + 1 / FPS, a, a + dur));
        const v = (p2 - p) * 20 * 2 * FPS / 10;
        return <Slot key={i} target={Number(ch)} p={p} turns={2 + idx} v={v} />;
      })}
    </>
  );
};

export const FOOT_B = 70;

// Discreet but phone-legible: 22px on a 1080px frame ≈ 8pt on a 390pt-wide phone.
export const LegalLine: React.FC<{align?: 'left' | 'center'}> = ({align = 'left'}) => (
  <div style={{fontSize: 22, lineHeight: 1.3, color: 'rgba(214,224,255,0.6)', letterSpacing: '0.01em', textAlign: align, whiteSpace: 'nowrap'}}>
    {data.legal}
  </div>
);

