// Signature ending: "find your" (white) / "space" (Ice Blue → Soft Violet), then the
// official sp_ce SVG fades in on its own above the line, then the licence.
// Nothing morphs into the logo: the SVG is placed untouched, proportional, on
// whole pixels, and only its opacity animates, so the final frame cannot jump.
import React from 'react';
import {Img, getStaticFiles, staticFile} from 'remotion';
import data from '../data/market.json';
import {LOGO} from './brand';
import {ICE, INK, LegalLine, Mask, VIOLET, W_HERO, W_LABEL} from './theme';
import {T, W, inOutCubic, seg} from './world';

const LOGO_INK_W = 320; // visible wordmark width (pack logo.social-size.reel-end-card-wordmark-width)
const LOGO_INK_TOP = 560;
const LINE1_TOP = 760; // "find your"
const LINE2_TOP = 850; // "space"

export const Ending: React.FC<{t: number}> = ({t}) => {
  if (t < T.endIn) return null;
  if (!getStaticFiles().some((f) => f.name === LOGO.file)) throw new Error(`Official logo missing: public/${LOGO.file}`);
  const t0 = T.endIn;

  // official logo: proportional size from its visible ink width, whole-pixel position, no transforms
  const u = LOGO_INK_W / (LOGO.glyphs.e[1] - LOGO.glyphs.s[0]);
  const logoW = Math.round(LOGO.viewW * u);
  const logoH = (logoW * LOGO.viewH) / LOGO.viewW;
  const inkLeft = W / 2 - LOGO_INK_W / 2;
  const logoLeft = Math.round(inkLeft - LOGO.glyphs.s[0] * u);
  const logoTop = Math.round(LOGO_INK_TOP - LOGO.xTop * u);
  const logoIn = inOutCubic(seg(t, t0 + 1.0, t0 + 1.8)); // pack logo-in 800 ms, opacity only

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {logoIn > 0 && (
        <Img src={staticFile(LOGO.file)} style={{position: 'absolute', left: logoLeft, top: logoTop, width: logoW, height: logoH, opacity: logoIn}} />
      )}

      <div style={{position: 'absolute', left: 0, right: 0, top: LINE1_TOP, textAlign: 'center'}}>
        <Mask inP={seg(t, t0 + 0.05, t0 + 0.65)} style={{display: 'inline-block'}}>
          <div style={{fontSize: 70, fontWeight: W_LABEL, color: INK, letterSpacing: '-0.01em'}}>{data.ending.line1}</div>
        </Mask>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: LINE2_TOP, textAlign: 'center'}}>
        <Mask inP={seg(t, t0 + 0.3, t0 + 0.9)} style={{display: 'inline-block'}}>
          <div
            style={{
              fontSize: 200, fontWeight: W_HERO, lineHeight: 1.05, letterSpacing: '-0.02em',
              background: `linear-gradient(90deg, ${ICE}, ${VIOLET})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}
          >
            {data.ending.line2}
          </div>
        </Mask>
      </div>

      <div style={{position: 'absolute', left: 60, right: 60, top: 1150, display: 'flex', justifyContent: 'center'}}>
        <Mask inP={seg(t, t0 + 1.6, t0 + 2.2)}>
          <LegalLine align="center" />
        </Mask>
      </div>
    </div>
  );
};
