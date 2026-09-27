// End card: the sp_ce tagline "Find your space." set to the design-system tagline spec
// (type.social-scale.tagline + type.tagline-scale.reel-end-card): Inter 600, line-height 1.02,
// -0.025em, sentence case with the full stop. Only "space" carries the Unicorn gradient
// (gradient.unicorn, 135°); "Find your" and the full stop are solid white on dark.
// Two lines, left-aligned as one block, centred on the canvas. No logo on the final card.
// The licence line sits low at the foot of the safe area: it is there for legal compliance only.
import React from 'react';
import data from '../data/market.json';
import {INK, LegalLine, Mask} from './theme';
import {TK} from './tokens';
import {T, seg} from './world';

const TAG = TK.type['social-scale'].tagline;
// Job exception (client): the pack's 88 px read too small on the end card. Both lines share one
// size so the tagline stays consistent; everything else follows the tagline tokens.
export const TAGLINE_SIZE = 160;
const UNICORN = TK.gradient.unicorn.value;
const BLOCK_H = 2 * TAGLINE_SIZE * TAG['line-height'];
const BLOCK_TOP = Math.round(860 - BLOCK_H / 2); // optically centred in the safe area
const LEGAL_BOTTOM = 1600; // legal requirement only: quietly at the foot of the safe area

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
      <div style={{position: 'absolute', left: 60, right: 60, top: LEGAL_BOTTOM, transform: 'translateY(-100%)', display: 'flex', justifyContent: 'center'}}>
        <Mask inP={seg(t, t0 + 0.8, t0 + 1.4)}>
          <LegalLine align="center" />
        </Mask>
      </div>
    </div>
  );
};
