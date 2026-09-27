import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import data from '../data/market.json';
import {Field} from './Field';
import {FONT, FOOT_B, ICE, INK, LegalLine, Mask, MUTED, QUIET, SlotString, VIOLET, X0} from './theme';
import {Ending} from './Ending';
import {PublisherScenes} from './PublisherScenes';
import {
  FPS, H, LAST_LANDING, N, W, anchors, bump, camAt, clamp01, inOutCubic, landedCount, lerp, outCubic,
  outExpo, outQuint, seg, smooth, T,
} from './world';

const M = data.metrics;

// Interpolates a docking element between keyed layout states.
type K = {t: number; x: number; y: number; s: number};
function dock(keys: K[], t: number) {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b.t) {
      const e = inOutCubic(seg(t, a.t, b.t));
      return {t, x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), s: lerp(a.s, b.s, e)};
    }
  }
  return keys[keys.length - 1];
}

const BIG = 224;
const LED = 38;
const FIN = 150;
const LEDGER_Y = [196, 244, 292];
const FINAL_Y = [498, 720, 942];

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  const an = anchors(t);
  // gentle text parallax tied to camera yaw / roll
  const parX = -cam.syw * 260;
  const parY = cam.sr * 60;

  // ------------------------------------------------------------ title (0–3.6)
  const titleOut = seg(t, 2.85, 3.55);
  const titleDrift = outCubic(seg(t, 0, 3.6));
  const titleScale = 1 + 0.035 * titleDrift + 0.06 * inOutCubic(titleOut);

  // ------------------------------------------------------------ kicker
  const kickIn = seg(t, 3.25, 3.9);
  const kickToFinal = t > 19 ? 1 : 0;
  const kickY = lerp(468, 432, kickToFinal);
  const idx = t < 8.55 ? 0 : t < 13.25 ? 1 : 2;
  const idxLabels = ['01 / 05 — Transactions', '02 / 05 — Sales value', '03 / 05 — Off-plan share'];
  const idxSwitch = [0, 8.55, 13.25][idx];
  const idxP = seg(t, idxSwitch, idxSwitch + 0.6);

  // ------------------------------------------------------------ metric 1: transactions
  const count = landedCount(t);
  const countStr = count >= N ? M.transactions.display : count.toLocaleString('en-US');
  const rate = (landedCount(t + 0.05) - landedCount(t - 0.05)) / 0.1;
  const m1 = dock(
    [
      {t: 8.3, x: X0, y: 520, s: BIG},
      {t: 9.1, x: X0, y: LEDGER_Y[0], s: LED},
      {t: 19.0, x: X0, y: LEDGER_Y[0], s: LED},
      {t: 19.95, x: X0, y: FINAL_Y[0], s: FIN},
    ],
    t,
  );
  const m1In = seg(t, 3.55, 4.1);
  const resolve = seg(t, LAST_LANDING, LAST_LANDING + 0.9);

  // ------------------------------------------------------------ metric 2: sales value
  const m2 = dock(
    [
      {t: 12.95, x: X0, y: 520, s: 206},
      {t: 13.75, x: X0, y: LEDGER_Y[1], s: LED},
      {t: 18.75, x: X0, y: LEDGER_Y[1], s: LED},
      {t: 19.8, x: X0, y: FINAL_Y[1], s: FIN},
    ],
    t,
  );
  const m2In = seg(t, 8.75, 9.3);
  const valueNum = M.salesValue.display.replace(/^AED\s*/, '').replace(/bn$/, ''); // "67.8"

  // ------------------------------------------------------------ metric 3: off-plan
  const m3 = dock(
    [
      {t: 17.95, x: X0, y: 520, s: BIG},
      {t: 19.0, x: X0, y: FINAL_Y[2], s: FIN},
    ],
    t,
  );
  const m3In = seg(t, 13.55, 14.1);

  const ledgerCol = (dk: {s: number}) => {
    // numbers dim while parked in the ledger, then return to full white
    const k = clamp01((dk.s - LED) / (FIN - LED));
    return `rgba(255,255,255,${(0.62 + 0.38 * k).toFixed(3)})`;
  };
  const finalIn = (a: number) => seg(t, a, a + 0.7);

  const numStyle = (dk: {x: number; y: number; s: number}): React.CSSProperties => ({
    position: 'absolute', left: dk.x, top: dk.y, fontSize: dk.s, lineHeight: 1, fontWeight: 300,
    letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  });

  const labelBig: React.CSSProperties = {fontSize: 46, fontWeight: 400, color: INK, letterSpacing: '-0.01em'};
  const small: React.CSSProperties = {fontSize: 26, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500};

  const footerOn = bump(t, 3.4, 4.2, 18.4, 19.0);
  const recapOut = inOutCubic(seg(t, T.recapOut, T.recapOut + 0.6));
  const finalFoot = seg(t, 19.5, 20.4);
  const legalOn = bump(t, 3.4, 4.2, T.endIn - 0.3, T.endIn + 0.2);

  return (
    <AbsoluteFill style={{background: '#090D16', fontFamily: FONT, color: INK, overflow: 'hidden'}}>
      {/* atmosphere: deep navy lift toward the horizon, vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 55% at 50% ${(cam.py / H) * 100 - 6}%, rgba(28,40,78,${(0.55 + 0.25 * bump(t, 8, 10.5, 12.5, 14)).toFixed(3)}) 0%, rgba(14,20,38,0.35) 45%, rgba(9,13,22,0) 75%)`,
          opacity: smooth(seg(t, 0, 2.2)),
        }}
      />
      <Field />
      <AbsoluteFill style={{background: 'radial-gradient(140% 90% at 50% 45%, rgba(9,13,22,0) 55%, rgba(5,8,14,0.85) 100%)'}} />
      {/* legibility scrim behind the top typography */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(9,13,22,0.85) 0%, rgba(9,13,22,0.55) 30%, rgba(9,13,22,0) 48%)'}} />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(9,13,22,0) 60%, rgba(9,13,22,0.9) 100%)',
          opacity: 0.55 + 0.45 * smooth(seg(t, 19, 20.5)),
        }}
      />

      {/* ------------------------------------------------ brand bar */}
      <div style={{position: 'absolute', left: X0, top: 96, right: X0, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: smooth(seg(t, 0.3, 1.3)) * (1 - smooth(seg(t, T.endIn - 0.3, T.endIn + 0.3)))}}>
        <div style={{fontSize: 38, fontWeight: 600, letterSpacing: '-0.02em'}}>sp_ce</div>
        <div style={{...small, fontSize: 19, color: QUIET, letterSpacing: '0.22em'}}>Market intelligence</div>
      </div>

      {t < T.recapOut + 0.7 && (
      <div style={{position: 'absolute', inset: 0, transform: `translate(${parX.toFixed(2)}px, ${(parY - 70 * recapOut).toFixed(2)}px)`, opacity: 1 - recapOut, filter: recapOut > 0.01 ? `blur(${(recapOut * 7).toFixed(2)}px)` : undefined}}>
        {/* ------------------------------------------------ title */}
        {t < 3.7 && (
          <div style={{position: 'absolute', left: X0, top: 600 - 40 * titleDrift - 120 * inOutCubic(titleOut), transform: `scale(${titleScale})`, transformOrigin: '0% 50%'}}>
            <Mask inP={seg(t, 0.55, 1.35)} outP={seg(t, 2.85, 3.4)} style={{marginBottom: 10}}>
              <div style={{fontSize: 84, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.02}}>ABU DHABI</div>
            </Mask>
            <Mask inP={seg(t, 0.8, 1.6)} outP={seg(t, 2.95, 3.5)} style={{marginBottom: 10}}>
              <div style={{fontSize: 84, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.02}}>RESIDENTIAL MARKET</div>
            </Mask>
            <Mask inP={seg(t, 1.05, 1.85)} outP={seg(t, 3.05, 3.6)}>
              <div style={{fontSize: 84, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.02, color: ICE}}>H1 2026</div>
            </Mask>
            <div style={{height: 2, marginTop: 34, width: 420 * outCubic(seg(t, 1.4, 2.6)), background: `linear-gradient(90deg, ${ICE}, rgba(170,188,255,0))`, opacity: 1 - seg(t, 2.8, 3.3)}} />
          </div>
        )}

        {/* ------------------------------------------------ kicker + index */}
        <div style={{position: 'absolute', left: X0, top: kickY, right: X0, display: 'flex', justifyContent: 'space-between', opacity: 1 - 0.9 * (bump(t, 8.2, 8.45, 8.95, 9.25) + bump(t, 12.85, 13.1, 13.6, 13.9))}}>
          <Mask inP={t < 19 ? kickIn : seg(t, 19.6, 20.2)} outP={t < 19 ? seg(t, 18.3, 18.8) : 0}>
            <div style={{...small, color: ICE, letterSpacing: `${lerp(0.4, 0.16, outCubic(kickIn))}em`}}>Abu Dhabi · Residential · H1 2026</div>
          </Mask>
        </div>
        {t > 3.4 && t < 18.6 && (
          <div style={{position: 'absolute', left: X0, top: 1640, right: X0}}>
            <div style={{height: 1, background: 'rgba(214,224,255,0.18)', marginBottom: 20, width: `${100 * outCubic(seg(t, 3.5, 4.6))}%`}} />
            <Mask key={idx} inP={idx === 0 ? seg(t, 3.7, 4.3) : idxP} outP={idx === 2 ? seg(t, 17.9, 18.5) : seg(t, [8.55, 13.25][idx] - 0.45, [8.55, 13.25][idx])}>
              <div style={{...small, fontSize: 22, color: MUTED}}>{idxLabels[idx]}</div>
            </Mask>
          </div>
        )}

        {/* ------------------------------------------------ metric 1 */}
        {t > 3.5 && (
          <div style={{...numStyle(m1), color: ledgerCol(m1), opacity: smooth(m1In)}}>
            <span>
              {countStr.split('').map((ch, i, arr) => {
                const place = arr.slice(i + 1).filter((c) => /\d/.test(c)).length;
                const cps = rate / Math.pow(10, place);
                const b = /\d/.test(ch) && count < N ? Math.min(7, cps / 25) : 0;
                return (
                  <span key={i} style={{filter: b > 0.3 ? `blur(${b.toFixed(2)}px)` : undefined, display: 'inline-block'}}>{ch}</span>
                );
              })}
            </span>
            {t > 18.8 && (
              <span style={{fontSize: '0.36em', fontWeight: 400, letterSpacing: '-0.01em', marginLeft: '0.35em', opacity: smooth(finalIn(19.5))}}>sales</span>
            )}
          </div>
        )}
        {/* resolve underline sweep */}
        <div style={{position: 'absolute', left: X0, top: 520 + BIG * 1.02, height: 2, width: 700 * outExpo(resolve), background: `linear-gradient(90deg, ${ICE}, rgba(170,188,255,0))`, opacity: 1 - seg(t, 8.0, 8.5)}} />
        {t < 8.9 && (
          <div style={{position: 'absolute', left: X0, top: 520 + BIG + 34}}>
            <Mask inP={seg(t, 3.9, 4.6)} outP={seg(t, 8.15, 8.7)}>
              <div style={labelBig}>residential transactions</div>
            </Mask>
            <div style={{height: 16}} />
            <Mask inP={seg(t, LAST_LANDING + 0.25, LAST_LANDING + 0.95)} outP={seg(t, 8.2, 8.75)}>
              <div style={{fontSize: 34, color: ICE, fontWeight: 500, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums'}}>
                <span style={{display: 'inline-block', width: 36 * outCubic(seg(t, LAST_LANDING + 0.3, LAST_LANDING + 0.9)), height: 2, background: ICE, verticalAlign: 'middle', marginRight: 14}} />
                {M.transactions.yoy.display}
              </div>
            </Mask>
          </div>
        )}
        {t > 9.0 && t < 18.6 && (
          <div style={{position: 'absolute', left: X0 + 190, top: LEDGER_Y[0] + 8, fontSize: 22, color: QUIET, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: bump(t, 9.0, 9.5, 18.1, 18.5)}}>transactions</div>
        )}

        {/* ------------------------------------------------ metric 2 */}
        {t > 8.7 && (
          <div style={{...numStyle(m2), color: ledgerCol(m2)}}>
            <Mask inP={m2In} style={{display: 'inline-block', verticalAlign: 'top'}}>
              <span>
                <span style={{fontSize: '0.4em', fontWeight: 400, letterSpacing: '0em', marginRight: '0.22em'}}>AED</span>
                <SlotString text={valueNum} t={t} start={8.95} dur={1.45} />
                <span style={{fontSize: '0.4em', fontWeight: 400, letterSpacing: '0em', marginLeft: '0.08em'}}>bn</span>
              </span>
            </Mask>
          </div>
        )}
        {t > 8.9 && t < 13.6 && (
          <div style={{position: 'absolute', left: X0, top: 520 + 206 + 34}}>
            <Mask inP={seg(t, 9.6, 10.3)} outP={seg(t, 12.8, 13.35)}>
              <div style={labelBig}>residential sales value</div>
            </Mask>
          </div>
        )}
        {/* +177.9% annotation pinned to the landscape crest */}
        {an.crest && t > 11.4 && t < 13.4 && (
          <div style={{position: 'absolute', left: an.crest.x + 14 + 90 + 12 - parX, top: an.crest.y + 90 - 22 - parY}}>
            <Mask inP={seg(t, 11.8, 12.4)} outP={seg(t, 12.8, 13.3)}>
              <div style={{fontSize: 40, color: INK, fontWeight: 500, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{M.salesValue.yoy.display}</div>
            </Mask>
            <Mask inP={seg(t, 11.95, 12.55)} outP={seg(t, 12.85, 13.3)}>
              <div style={{fontSize: 22, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 6, whiteSpace: 'nowrap'}}>sales value</div>
            </Mask>
          </div>
        )}

        {/* ------------------------------------------------ metric 3 */}
        {t > 13.5 && (
          <div style={{...numStyle(m3), color: t < 18.2 ? ICE : INK}}>
            <Mask inP={m3In} style={{display: 'inline-block', verticalAlign: 'top'}}>
              <span>
                <SlotString text={M.offPlanShare.display.replace('%', '')} t={t} start={13.75} dur={1.7} stagger={0.16} />
                <span style={{fontSize: '0.62em', marginLeft: '0.03em'}}>%</span>
              </span>
            </Mask>
            {t > 18.8 && (
              <span style={{fontSize: '0.36em', fontWeight: 400, letterSpacing: '-0.01em', marginLeft: '0.35em', color: ICE, opacity: smooth(finalIn(19.7))}}>off-plan</span>
            )}
          </div>
        )}
        {t > 13.6 && t < 18.6 && (
          <div style={{position: 'absolute', left: X0, top: 520 + BIG + 30}}>
            <Mask inP={seg(t, 15.1, 15.8)} outP={seg(t, 17.6, 18.1)}>
              <div style={{...labelBig, fontSize: 64, fontWeight: 500}}>off-plan</div>
            </Mask>
            <div style={{height: 10}} />
            <Mask inP={seg(t, 15.3, 16.0)} outP={seg(t, 17.65, 18.15)}>
              <div style={{fontSize: 30, color: MUTED}}>share of residential sales volume</div>
            </Mask>
          </div>
        )}
        {/* scale-bar labels, pinned to the split stream */}
        {an.bar.l && an.bar.m1 && an.bar.m2 && an.bar.r && t > 15.0 && t < 18.7 && (
          <>
            <div style={{position: 'absolute', left: (an.bar.l.x + an.bar.m1.x) / 2 - parX, top: (an.bar.l.y + an.bar.m1.y) / 2 + 64 - parY, transform: 'translateX(-50%)'}}>
              <Mask inP={seg(t, 15.4, 16.0)} outP={seg(t, 18.0, 18.5)}>
                <div style={{fontSize: 30, color: ICE, fontWeight: 500, fontVariantNumeric: 'tabular-nums'}}>{M.offPlanShare.display} off-plan</div>
              </Mask>
            </div>
            <div style={{position: 'absolute', left: (an.bar.m2.x + an.bar.r.x) / 2 - parX, top: (an.bar.m2.y + an.bar.r.y) / 2 + 64 - parY, transform: 'translateX(-50%)'}}>
              <Mask inP={seg(t, 15.6, 16.2)} outP={seg(t, 18.0, 18.5)}>
                <div style={{fontSize: 26, color: VIOLET, opacity: 0.8, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{M.offPlanShare.remainder.display}</div>
              </Mask>
            </div>
          </>
        )}

        {/* ------------------------------------------------ final composition */}
        {t > 18.7 && (
          <>
            {[0, 1].map((r) => (
              <div key={r} style={{position: 'absolute', left: X0, right: X0, top: FINAL_Y[r] + 205, height: 1, background: 'rgba(214,224,255,0.16)', transformOrigin: '0 0', transform: `scaleX(${outCubic(seg(t, 19.6 + r * 0.15, 20.6 + r * 0.15))})`}} />
            ))}
            {[
              {y: FINAL_Y[0], text: M.transactions.yoy.display, sub: 'transactions y/y', a: 19.9},
              {y: FINAL_Y[1], text: M.salesValue.yoy.display, sub: 'sales value y/y', a: 20.05},
              {y: FINAL_Y[2], text: 'of sales volume', sub: '', a: 20.2},
            ].map((r, i) => (
              <div key={i} style={{position: 'absolute', left: X0 + 4, top: r.y + FIN + 10}}>
                <Mask inP={seg(t, r.a, r.a + 0.6)}>
                  <div style={{fontSize: 26, color: i < 2 ? ICE : MUTED, fontWeight: 500, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em'}}>
                    {i < 2 ? r.text.replace(' y/y', '') : r.text}
                    {i < 2 && <span style={{color: MUTED, fontWeight: 400, marginLeft: 12}}>{r.sub}</span>}
                  </div>
                </Mask>
              </div>
            ))}
          </>
        )}
      </div>
      )}

      <PublisherScenes t={t} parX={parX} parY={parY} />
      <Ending t={t} />

      {/* ------------------------------------------------ source footer (discreet during film) */}
      <div style={{position: 'absolute', left: X0, right: X0, bottom: FOOT_B + 40, fontSize: 22, lineHeight: 1.35, color: QUIET, opacity: footerOn}}>
        {data.source.short}
      </div>

      {/* ------------------------------------------------ recap footer */}
      {t > 19.3 && t < T.recapOut + 0.7 && (
        <div style={{position: 'absolute', left: X0, right: X0, bottom: FOOT_B + 44, fontSize: 25, lineHeight: 1.42, color: MUTED, opacity: 1 - recapOut}}>
          <div style={{height: 1, background: 'rgba(214,224,255,0.22)', marginBottom: 22, transformOrigin: '0 0', transform: `scaleX(${outCubic(finalFoot)})`}} />
          <Mask inP={seg(t, 19.7, 20.4)}>
            <div>{data.source.full}</div>
          </Mask>
          <div style={{height: 8}} />
          <Mask inP={seg(t, 19.9, 20.6)}>
            <div style={{color: QUIET}}>{data.scopeNote}</div>
          </Mask>
        </div>
      )}

      {/* ------------------------------------------------ legal line: every scene carrying a market claim */}
      <div style={{position: 'absolute', left: X0, right: X0, bottom: FOOT_B, opacity: legalOn}}>
        <LegalLine />
      </div>
    </AbsoluteFill>
  );
};

export {W, H};
