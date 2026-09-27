// Typography for the two publisher-specific evidence scenes. Each carries its
// own source and period; nothing is merged across series. Particle bars and
// fields are drawn by SceneParticles from the same geometry (publisherLayout).
import React from 'react';
import {CP, PM, PRICE, RATE} from './publisherLayout';
import {Fade, HAIR, ICE, INDEX_TOP, INK, MUTED, Mask, SourceLines, VIOLET, W_HERO, W_LABEL, X0, X1} from './theme';
import {T, seg} from './world';

const headline: React.CSSProperties = {fontSize: 30, fontWeight: W_LABEL, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK};
const small: React.CSSProperties = {fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: W_LABEL, color: MUTED};

// Splits "+21.6%" / "AED 17,200" into [prefix, number, suffix].
function parts(display: string) {
  const m = display.match(/^([^\d]*)([\d.,]+)(.*)$/)!;
  return {pre: m[1], num: m[2], post: m[3]};
}

const IndexRow: React.FC<{t: number; a: number; b: number; label: string}> = ({t, a, b, label}) => (
  <div style={{position: 'absolute', left: X0, top: INDEX_TOP, right: 1080 - X1}}>
    <div style={{height: 1, background: HAIR, marginBottom: 20}} />
    <Mask inP={seg(t, a + 0.1, a + 0.7)} outP={seg(t, b - 0.45, b)}>
      <div style={small}>{label}</div>
    </Mask>
  </div>
);

export const PublisherScenes: React.FC<{t: number; parX: number; parY: number}> = ({t}) => {
  if (t < T.priceIn - 0.1 || t > T.rateOut + 0.2) return null;

  const a = T.priceIn, b = T.priceOut;
  const c = T.rateIn, d = T.rateOut;
  const pmOn = t < b + 0.1;
  const cpOn = t > c - 0.1;
  const pmOut = seg(t, b - 0.55, b);
  const head = parts(PM.residential.display); // + 21.6 %

  return (
    <>
      {pmOn && (
        <>
          <div style={{position: 'absolute', left: X0, top: PRICE.headY}}>
            <Mask inP={seg(t, a, a + 0.6)} outP={pmOut}>
              <div style={headline}>{PM.headline}</div>
            </Mask>
          </div>
          <Fade inP={seg(t, a + 0.35, a + 0.75)} outP={pmOut}>
            <div style={{position: 'absolute', left: X0 - 6, top: PRICE.bigY, fontSize: 224, fontWeight: W_HERO, lineHeight: 1, letterSpacing: '-0.035em', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
              <span style={{color: ICE}}>
                <span style={{fontSize: '0.62em', marginRight: '0.02em'}}>{head.pre}</span>
                <span>{head.num}</span>
                <span style={{fontSize: '0.62em', marginLeft: '0.03em'}}>{head.post}</span>
              </span>
              <span style={{fontSize: '0.3em', fontWeight: W_LABEL, letterSpacing: '0.04em', marginLeft: '0.35em', color: INK}}>{PM.residential.suffix}</span>
            </div>
          </Fade>
          {PRICE.rows.map((row, k) => (
            <div key={k} style={{position: 'absolute', left: X0, right: 1080 - X1, top: row.labelY, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <Mask inP={seg(t, a + 0.7 + k * 0.15, a + 1.3 + k * 0.15)} outP={seg(t, b - 0.55 + k * 0.05, b - 0.05 + k * 0.05)}>
                <span style={{fontSize: 44, fontWeight: W_LABEL, color: INK}}>{row.r.label}</span>
              </Mask>
              <Fade inP={seg(t, a + 0.9 + k * 0.15, a + 1.3 + k * 0.15)} outP={seg(t, b - 0.55 + k * 0.05, b - 0.05 + k * 0.05)}>
                <span style={{fontSize: 52, fontWeight: W_HERO, color: k === 0 ? ICE : VIOLET, fontVariantNumeric: 'tabular-nums'}}>{row.r.display}</span>
              </Fade>
            </div>
          ))}
          <SourceLines lines={[PM.source]} opacity={seg(t, a + 0.3, a + 0.9) * (1 - pmOut)} />
          <IndexRow t={t} a={a} b={b} label="04 / 05 — Price momentum" />
        </>
      )}

      {cpOn && (
        <>
          <div style={{position: 'absolute', left: X0, top: RATE.headY}}>
            <Mask inP={seg(t, c, c + 0.6)} outP={seg(t, d - 0.5, d)}>
              <div style={headline}>{CP.headline}</div>
            </Mask>
          </div>
          {RATE.rows.map((row, k) => {
            const s0 = c + 0.3 + k * 0.35;
            const p = parts(row.r.display); // AED 17,200
            const out = seg(t, d - 0.55 + k * 0.06, d - 0.05 + k * 0.06);
            return (
              <React.Fragment key={k}>
                <div style={{position: 'absolute', left: X0, top: row.labelY}}>
                  <Mask inP={seg(t, s0, s0 + 0.6)} outP={out}>
                    <div style={{fontSize: 44, fontWeight: W_LABEL, color: INK}}>{row.r.label}</div>
                  </Mask>
                </div>
                <Fade inP={seg(t, s0 + 0.2, s0 + 0.6)} outP={out}>
                  <div style={{position: 'absolute', left: X0 - 4, top: row.figY, fontSize: RATE.figSize, fontWeight: W_HERO, lineHeight: 1, letterSpacing: '-0.035em', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
                    <span style={{fontSize: '0.4em', fontWeight: W_LABEL, letterSpacing: 0, marginRight: '0.22em'}}>{p.pre.trim()}</span>
                    <span>{p.num}</span>
                    <span style={{fontSize: '0.3em', fontWeight: W_LABEL, letterSpacing: '0.06em', marginLeft: '0.3em', color: k === 0 ? ICE : VIOLET}}>{row.r.unit}</span>
                  </div>
                </Fade>
              </React.Fragment>
            );
          })}
          <SourceLines lines={[CP.source, CP.caveat]} opacity={seg(t, c + 0.3, c + 0.9) * (1 - seg(t, d - 0.5, d))} />
          <IndexRow t={t} a={c} b={d} label="05 / 05 — Current pricing" />
        </>
      )}
    </>
  );
};
