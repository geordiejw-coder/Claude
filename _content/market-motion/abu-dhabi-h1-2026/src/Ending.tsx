// End card: the sp_ce tagline "Find your space." set to the design-system tagline spec
// (type.social-scale.tagline + type.tagline-scale.reel-end-card): Inter 600, line-height 1.02,
// -0.025em, sentence case with the full stop. Only "space" carries the Unicorn gradient
// (gradient.unicorn, 135°); "Find your" and the full stop are solid white on dark.
// Two lines, left-aligned as one block, centred on the canvas. No logo on the final card.
import React from 'react';
import data from '../data/market.json';
import {INK, LegalLine, Mask} from './theme';
import {TK} from './tokens';
import {T, seg} from './world';

const TAG = TK.type['social-scale'].tagline;
export const TAGLINE_SIZE = TK.type['tagline-scale']['reel-end-card'];
const UNICORN = TK.gradient.unicorn.value;
const BLOCK_TOP = 760;

export const Ending: React.FC<{t: number}> = ({t}) => {
  if (t < T.endIn) return null;
  const t0 = T.endIn;
  const line: React.CSSProperties = {
    fontSize: TAGLINE_SIZE, fontWeight: TAG.weight, lineHeight: TAG['line-height'], letterSpacing: TAG['letter-spacing'], color: INK, whiteSpace: 'nowrap',
  };
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: BLOCK_TOP, display: 'flex', justifyContent: 'center'}}>
        <div>
          <Mask inP={seg(t, t0 + 0.05, t0 + 0.65)}>
            <div style={line}>{data.ending.line1}</div>
          </Mask>
          <Mask inP={seg(t, t0 + 0.25, t0 + 0.85)}>
            <div style={line}>
              <span style={{background: UNICORN, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{data.ending.line2}</span>
              <span>{data.ending.stop}</span>
            </div>
          </Mask>
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: BLOCK_TOP + 2 * TAGLINE_SIZE * TAG['line-height'] + 96, display: 'flex', justifyContent: 'center'}}>
        <Mask inP={seg(t, t0 + 0.8, t0 + 1.4)}>
          <LegalLine align="center" />
        </Mask>
      </div>
    </div>
  );
};
