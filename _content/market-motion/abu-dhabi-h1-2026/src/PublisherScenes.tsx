// Two publisher-specific evidence scenes that follow the Cavendish Maxwell H1
// figures. Each carries its own source line; nothing is merged across series.
import React from 'react';
import data from '../data/market.json';
import {FOOT_B, ICE, INK, Mask, MUTED, QUIET, SlotString, VIOLET, X0} from './theme';
import {T, clamp01, inOutCubic, outExpo, seg} from './world';

const PM = data.priceMomentum;
const CP = data.currentPricing;
const COL_W = 1080 - 2 * X0;

const headline: React.CSSProperties = {fontSize: 30, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK};
const small: React.CSSProperties = {fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500, color: MUTED};

// Splits "+21.6%" / "AED 17,200" into [prefix, digits, suffix] for the slot roll.
function parts(display: string) {
  const m = display.match(/^([^\d]*)([\d.,]+)(.*)$/)!;
  return {pre: m[1], num: m[2], post: m[3]};
}

// A growing rule whose length is proportional to its value on a shared scale.
const Bar: React.FC<{p: number; frac: number; color: string; h?: number; opacity?: number}> = ({p, frac, color, h = 6, opacity = 1}) => (
  <div style={{position: 'relative', height: h, width: COL_W}}>
    <div style={{position: 'absolute', inset: 0, background: 'rgba(214,224,255,0.08)'}} />
    <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: COL_W * frac * outExpo(clamp01(p)), background: color, opacity}} />
  </div>
);

const Footer: React.FC<{lines: string[]; p: number}> = ({lines, p}) => (
  <div style={{position: 'absolute', left: X0, right: X0, bottom: FOOT_B + 40, fontSize: 22, lineHeight: 1.4, color: QUIET, opacity: p}}>
    {lines.map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </div>
);

const IndexRow: React.FC<{t: number; a: number; b: number; label: string}> = ({t, a, b, label}) => (
  <div style={{position: 'absolute', left: X0, top: 1640, right: X0}}>
    <div style={{height: 1, background: 'rgba(214,224,255,0.18)', marginBottom: 20}} />
    <Mask inP={seg(t, a + 0.1, a + 0.7)} outP={seg(t, b - 0.45, b)}>
      <div style={{...small}}>{label}</div>
    </Mask>
  </div>
);

export const PublisherScenes: React.FC<{t: number; parX: number; parY: number}> = ({t, parX, parY}) => {
  if (t < T.priceIn - 0.1 || t > T.rateOut + 0.2) return null;
  const px = parX * 0.6;
  const py = parY * 0.6;

  // ---------------------------------------------------------- price momentum (CBRE)
  const a = T.priceIn, b = T.priceOut;
  const pmOn = t < b + 0.1;
  const pmOut = seg(t, b - 0.5, b);
  const head = parts(PM.residential.display); // + 21.6 %
  const scaleMax = Math.max(PM.apartments.value, PM.villas.value, PM.residential.value) / 0.82;
  const barP = (k: number) => seg(t, a + 1.0 + k * 0.18, a + 2.1 + k * 0.18);
  const markerP = inOutCubic(seg(t, a + 1.9, a + 2.5));

  // ---------------------------------------------------------- current pricing (Savills)
  const c = T.rateIn, d = T.rateOut;
  const cpOn = t > c - 0.1;
  const rows = [CP.apartments, CP.villasTownhouses];
  const rateMax = Math.max(...rows.map((r) => r.value)) / 0.8;

  return (
    <>
      {/* source lines sit outside the parallax layer so they align with the legal line */}
      {pmOn && <Footer lines={[PM.source]} p={seg(t, a + 0.3, a + 0.9) * (1 - pmOut)} />}
      {cpOn && <Footer lines={[CP.source, CP.caveat]} p={seg(t, c + 0.3, c + 0.9) * (1 - seg(t, d - 0.5, d))} />}
      {pmOn && (
        <div style={{position: 'absolute', inset: 0, transform: `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`}}>
          <div style={{position: 'absolute', left: X0, top: 470}}>
            <Mask inP={seg(t, a, a + 0.6)} outP={pmOut}>
              <div style={headline}>{PM.headline}</div>
            </Mask>
          </div>
          <div style={{position: 'absolute', left: X0 - 6, top: 530, fontSize: 224, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
            <Mask inP={seg(t, a + 0.15, a + 0.75)} outP={seg(t, b - 0.55, b - 0.05)} style={{display: 'inline-block', verticalAlign: 'top'}}>
              <span style={{color: ICE}}>
                <span style={{fontSize: '0.62em', marginRight: '0.02em'}}>{head.pre}</span>
                <SlotString text={head.num} t={t} start={a + 0.25} dur={1.3} />
                <span style={{fontSize: '0.62em', marginLeft: '0.03em'}}>{head.post}</span>
              </span>
              <span style={{fontSize: '0.3em', fontWeight: 500, letterSpacing: '0.04em', marginLeft: '0.35em', color: INK}}>{PM.residential.suffix}</span>
            </Mask>
          </div>

          {/* supporting figures as proportional bars; dashed marker at the headline value */}
          <div style={{position: 'absolute', left: X0, top: 900, width: COL_W}}>
            {[
              {r: PM.apartments, col: ICE, op: 1},
              {r: PM.villas, col: VIOLET, op: 0.75},
            ].map(({r, col, op}, k) => (
              <div key={k} style={{marginBottom: 56}}>
                <Mask inP={seg(t, a + 0.8 + k * 0.18, a + 1.4 + k * 0.18)} outP={seg(t, b - 0.5 + k * 0.05, b - 0.05 + k * 0.05)}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18}}>
                    <span style={{fontSize: 44, fontWeight: 400, color: INK}}>{r.label}</span>
                    <span style={{fontSize: 52, fontWeight: 400, color: col, fontVariantNumeric: 'tabular-nums'}}>{r.display}</span>
                  </div>
                </Mask>
                <div style={{opacity: 1 - pmOut}}>
                  <Bar p={barP(k)} frac={r.value / scaleMax} color={col} opacity={op} />
                </div>
              </div>
            ))}
            {/* headline marker spans both bars */}
            <div
              style={{
                position: 'absolute', left: COL_W * (PM.residential.value / scaleMax), top: 70, height: 250 * markerP, width: 0,
                borderLeft: '1.5px dashed rgba(255,255,255,0.55)', opacity: 1 - pmOut,
              }}
            />
          </div>
          <IndexRow t={t} a={a} b={b} label="04 / 05 — Price momentum" />
        </div>
      )}

      {cpOn && (
        <div style={{position: 'absolute', inset: 0, transform: `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`}}>
          <div style={{position: 'absolute', left: X0, top: 470}}>
            <Mask inP={seg(t, c, c + 0.6)} outP={seg(t, d - 0.5, d)}>
              <div style={headline}>{CP.headline}</div>
            </Mask>
          </div>
          {rows.map((r, k) => {
            const y = 570 + k * 390;
            const s0 = c + 0.25 + k * 0.35;
            const p = parts(r.display); // AED 17,200
            const out = seg(t, d - 0.55 + k * 0.06, d - 0.05 + k * 0.06);
            return (
              <div key={k} style={{position: 'absolute', left: X0, top: y, width: COL_W}}>
                <Mask inP={seg(t, s0, s0 + 0.6)} outP={out}>
                  <div style={{fontSize: 44, fontWeight: 400, color: INK, marginBottom: 14}}>{r.label}</div>
                </Mask>
                <div style={{fontSize: 150, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', marginLeft: -4}}>
                  <Mask inP={seg(t, s0 + 0.1, s0 + 0.7)} outP={out} style={{display: 'inline-block', verticalAlign: 'top'}}>
                    <span>
                      <span style={{fontSize: '0.4em', fontWeight: 400, letterSpacing: 0, marginRight: '0.22em'}}>{p.pre.trim()}</span>
                      <SlotString text={p.num} t={t} start={s0 + 0.2} dur={1.3} stagger={0.1} />
                      <span style={{fontSize: '0.3em', fontWeight: 500, letterSpacing: '0.06em', marginLeft: '0.3em', color: k === 0 ? ICE : VIOLET}}>{r.unit}</span>
                    </span>
                  </Mask>
                </div>
                <div style={{marginTop: 30, opacity: 1 - out}}>
                  <Bar p={seg(t, s0 + 0.9, s0 + 2.0)} frac={r.value / rateMax} color={k === 0 ? ICE : VIOLET} h={4} opacity={k === 0 ? 0.9 : 0.7} />
                </div>
              </div>
            );
          })}
          <IndexRow t={t} a={c} b={d} label="05 / 05 — Current pricing" />
        </div>
      )}
    </>
  );
};
