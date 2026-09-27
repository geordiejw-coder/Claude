import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {rgba} from './tokens';
import data from '../data/market.json';
import {Field} from './Field';
import {Ending} from './Ending';
import {PublisherScenes} from './PublisherScenes';
import {SceneParticles} from './SceneParticles';
import {
  BLACK, COL_W, FONT, Fade, HAIR, HEADER_INK_TOP, ICE, INDEX_TOP, INK, LEGAL_BOTTOM, LegalLine, Logo, Mask, MUTED, QUIET,
  RISE, SourceLines, VIOLET, W_HERO, W_LABEL, W_SOURCE, W_TITLE, X0, X1,
} from './theme';
import {FPS, H, LAST_LANDING, W, anchors, annotationBox, worldTime, bump, camAt, clamp01, inOutCubic, lerp, outCubic, outExpo, seg, smooth, T} from './world';

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
const BIG_Y = 520;
const LEDGER_Y = [300, 350];
const FINAL_Y = [498, 720, 942];
const KICK_Y = 468;
const rise = (p: number) => `translateY(${(RISE * (1 - inOutCubic(clamp01(p)))).toFixed(2)}px)`;

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = worldTime(frame); // world time (hold time-map applied)
  const cam = camAt(t);
  const an = anchors(t);
  const ann = annotationBox(t);
  // gentle text parallax tied to camera yaw / roll
  const parX = -cam.syw * 260;
  const parY = cam.sr * 60;

  // ------------------------------------------------------------ title (0–3.6)
  const titleOut = seg(t, 2.85, 3.55);
  const titleDrift = outCubic(seg(t, 0, 3.6));
  const titleScale = 1 + 0.035 * titleDrift + 0.06 * inOutCubic(titleOut);

  // ------------------------------------------------------------ kicker + scene counter
  const kickIn = seg(t, 3.25, 3.9);
  const kickY = t > 19 ? 432 : KICK_Y;
  const idx = t < 8.55 ? 0 : t < 13.25 ? 1 : 2;
  const idxLabels = ['01 / 05 — Transactions', '02 / 05 — Sales value', '03 / 05 — Off-plan share'];
  const idxSwitch = [0, 8.55, 13.25][idx];
  const idxP = seg(t, idxSwitch, idxSwitch + 0.6);

  // ------------------------------------------------------------ metric 1: transactions
  // The field accumulates first; the settled figure is then revealed by a clean fade.
  const n1In = seg(t, LAST_LANDING - 0.35, LAST_LANDING + 0.05);
  const m1 = dock(
    [
      {t: 8.3, x: X0, y: BIG_Y, s: BIG},
      {t: 9.1, x: X0, y: LEDGER_Y[0], s: LED},
      {t: 19.0, x: X0, y: LEDGER_Y[0], s: LED},
      {t: 19.95, x: X0, y: FINAL_Y[0], s: FIN},
    ],
    t,
  );
  const resolve = seg(t, LAST_LANDING, LAST_LANDING + 0.9);

  // ------------------------------------------------------------ metric 2: sales value
  const m2 = dock(
    [
      {t: 12.95, x: X0, y: BIG_Y, s: 206},
      {t: 13.75, x: X0, y: LEDGER_Y[1], s: LED},
      {t: 18.75, x: X0, y: LEDGER_Y[1], s: LED},
      {t: 19.8, x: X0, y: FINAL_Y[1], s: FIN},
    ],
    t,
  );
  const n2In = seg(t, 9.0, 9.4);
  const valueNum = M.salesValue.display.replace(/^AED\s*/, '').replace(/bn$/, ''); // "67.8"

  // ------------------------------------------------------------ metric 3: off-plan
  const m3 = dock(
    [
      {t: 17.95, x: X0, y: BIG_Y, s: BIG},
      {t: 19.0, x: X0, y: FINAL_Y[2], s: FIN},
    ],
    t,
  );
  const n3In = seg(t, 14.2, 14.6);

  const ledgerCol = (dk: {s: number}) => {
    // numbers dim while parked in the ledger, then return to full white
    const k = clamp01((dk.s - LED) / (FIN - LED));
    return rgba(INK, 0.66 + 0.34 * k);
  };
  const finalIn = (a: number) => seg(t, a, a + 0.7);

  const numStyle = (dk: {x: number; y: number; s: number}): React.CSSProperties => ({
    position: 'absolute', left: dk.x, top: dk.y, fontSize: dk.s, lineHeight: 1, fontWeight: W_HERO,
    letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  });

  const labelBig: React.CSSProperties = {fontSize: 46, fontWeight: W_LABEL, color: INK, letterSpacing: '-0.01em'};
  const small: React.CSSProperties = {fontSize: 26, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: W_LABEL};

  const footerOn = bump(t, 3.4, 4.2, 18.4, 19.0);
  const recapOut = inOutCubic(seg(t, T.recapOut, T.recapOut + 0.6));
  const finalFoot = seg(t, 19.5, 20.4);
  const legalOn = bump(t, 3.4, 4.2, T.endIn - 0.3, T.endIn + 0.2);
  const headerOn = smooth(seg(t, 0.3, 1.3)) * (1 - smooth(seg(t, T.endIn - 0.3, T.endIn + 0.3)));
  // bottom scrim: the particle map dissolves before the footer stack, so no text sits on particles
  const scrimOn = 1 - smooth(seg(t, T.endIn - 0.2, T.endIn + 0.6));

  return (
    <AbsoluteFill style={{background: BLACK, fontFamily: FONT, color: INK, overflow: 'hidden'}}>
      {/* atmosphere: faint ice-blue lift toward the horizon */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 55% at 50% ${(cam.py / H) * 100 - 6}%, ${rgba(ICE, 0.075 + 0.035 * bump(t, 8, 10.5, 12.5, 14))} 0%, ${rgba(ICE, 0.025)} 45%, ${rgba(BLACK, 0)} 75%)`,
          opacity: smooth(seg(t, 0, 2.2)),
        }}
      />
      <Field />
      <SceneParticles t={t} />
      <AbsoluteFill style={{background: `radial-gradient(140% 90% at 50% 45%, ${rgba(BLACK, 0)} 55%, ${rgba(BLACK, 0.85)} 100%)`}} />
      {/* legibility scrim behind the top typography */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${rgba(BLACK, 0.9)} 0%, ${rgba(BLACK, 0.6)} 30%, ${rgba(BLACK, 0)} 48%)`}} />
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 1290, bottom: 0, opacity: scrimOn,
          background: `linear-gradient(180deg, ${rgba(BLACK, 0)} 0px, ${rgba(BLACK, 0.96)} 95px, ${BLACK} 160px)`,
        }}
      />

      {/* ------------------------------------------------ brand header: official SVG + MARKET INTELLIGENCE */}
      <div style={{opacity: headerOn}}>
        <Logo xh={22} inkLeft={X0} inkTop={HEADER_INK_TOP} />
        <div style={{position: 'absolute', right: 1080 - X1, top: HEADER_INK_TOP + 3, fontSize: 18, fontWeight: W_LABEL, letterSpacing: '0.22em', textTransform: 'uppercase', color: QUIET}}>
          Market intelligence
        </div>
      </div>

      {t < T.recapOut + 0.7 && (
        <div style={{position: 'absolute', inset: 0, transform: `translate(${parX.toFixed(2)}px, ${(parY - 70 * recapOut).toFixed(2)}px)`, opacity: 1 - recapOut}}>
          {/* ------------------------------------------------ title */}
          {t < 3.7 && (
            <div style={{position: 'absolute', left: X0, top: 600 - 40 * titleDrift - 120 * inOutCubic(titleOut), transform: `scale(${titleScale})`, transformOrigin: '0% 50%'}}>
              <Mask inP={seg(t, 0.55, 1.35)} outP={seg(t, 2.85, 3.4)} style={{marginBottom: 10}}>
                <div style={{fontSize: 84, fontWeight: W_TITLE, letterSpacing: '-0.03em', lineHeight: 1.02}}>ABU DHABI</div>
              </Mask>
              <Mask inP={seg(t, 0.8, 1.6)} outP={seg(t, 2.95, 3.5)} style={{marginBottom: 10}}>
                <div style={{fontSize: 84, fontWeight: W_LABEL, letterSpacing: '-0.03em', lineHeight: 1.02}}>RESIDENTIAL MARKET</div>
              </Mask>
              <Mask inP={seg(t, 1.05, 1.85)} outP={seg(t, 3.05, 3.6)}>
                <div style={{fontSize: 84, fontWeight: W_LABEL, letterSpacing: '-0.03em', lineHeight: 1.02, color: ICE}}>H1 2026</div>
              </Mask>
              <div style={{height: 2, marginTop: 34, width: 420 * outCubic(seg(t, 1.4, 2.6)), background: `linear-gradient(90deg, ${ICE}, ${rgba(ICE, 0)})`, opacity: 1 - seg(t, 2.8, 3.3)}} />
            </div>
          )}

          {/* ------------------------------------------------ kicker */}
          <div style={{position: 'absolute', left: X0, top: kickY, right: 1080 - X1, opacity: 1 - 0.9 * (bump(t, 8.2, 8.45, 8.95, 9.25) + bump(t, 12.85, 13.1, 13.6, 13.9))}}>
            <Mask inP={t < 19 ? kickIn : seg(t, 19.6, 20.2)} outP={t < 19 ? seg(t, 18.3, 18.8) : 0}>
              <div style={{...small, color: ICE, letterSpacing: `${lerp(0.4, 0.16, outCubic(kickIn))}em`}}>Abu Dhabi · Residential · H1 2026</div>
            </Mask>
          </div>

          {/* ------------------------------------------------ metric 1 */}
          {t > LAST_LANDING - 0.4 && (
            <div style={{...numStyle(m1), color: ledgerCol(m1), opacity: inOutCubic(n1In), transform: rise(n1In)}}>
              <span>{M.transactions.display}</span>
              {t > 18.8 && (
                <span style={{fontSize: '0.36em', fontWeight: W_LABEL, letterSpacing: '-0.01em', marginLeft: '0.35em', opacity: smooth(finalIn(19.5))}}>sales</span>
              )}
            </div>
          )}
          {/* resolve underline sweep */}
          <div style={{position: 'absolute', left: X0, top: BIG_Y + BIG * 1.02, height: 2, width: 700 * outExpo(resolve), background: `linear-gradient(90deg, ${ICE}, ${rgba(ICE, 0)})`, opacity: 1 - seg(t, 8.0, 8.5)}} />
          {t < 8.9 && t > LAST_LANDING - 0.4 && (
            <div style={{position: 'absolute', left: X0, right: 1080 - X1, top: BIG_Y + BIG + 34}}>
              <Mask inP={seg(t, LAST_LANDING - 0.25, LAST_LANDING + 0.2)} outP={seg(t, 8.15, 8.7)}>
                <div style={labelBig}>residential transactions</div>
              </Mask>
              <div style={{height: 14}} />
              <Fade inP={seg(t, LAST_LANDING - 0.1, LAST_LANDING + 0.25)} outP={seg(t, 8.2, 8.6)}>
                <div style={{fontSize: 34, color: ICE, fontWeight: W_LABEL, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums'}}>
                  <span style={{display: 'inline-block', width: 36, height: 2, background: ICE, verticalAlign: 'middle', marginRight: 14}} />
                  {M.transactions.yoy.display}
                </div>
              </Fade>
            </div>
          )}
          {t > 9.0 && t < 18.6 && (
            <div style={{position: 'absolute', left: X0 + 176, top: LEDGER_Y[0] + 9, fontSize: 21, fontWeight: W_LABEL, color: QUIET, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: bump(t, 9.0, 9.5, 18.1, 18.5)}}>transactions</div>
          )}

          {/* ------------------------------------------------ metric 2 */}
          {t > 8.95 && (
            <div style={{...numStyle(m2), color: ledgerCol(m2), opacity: inOutCubic(n2In), transform: rise(n2In)}}>
              <span style={{fontSize: '0.4em', fontWeight: W_LABEL, letterSpacing: '0em', marginRight: '0.22em'}}>AED</span>
              <span>{valueNum}</span>
              <span style={{fontSize: '0.4em', fontWeight: W_LABEL, letterSpacing: '0em', marginLeft: '0.08em'}}>bn</span>
            </div>
          )}
          {t > 8.9 && t < 13.6 && (
            <div style={{position: 'absolute', left: X0, top: BIG_Y + 206 + 34}}>
              <Mask inP={seg(t, 9.4, 10.0)} outP={seg(t, 12.8, 13.35)}>
                <div style={labelBig}>residential sales value</div>
              </Mask>
            </div>
          )}
          {/* +177.9% annotation: pinned to the crest, set clear of the curve and the headline label */}
          {ann && t > 11.4 && t < 13.4 && (
            <div style={{position: 'absolute', left: ann.left - parX, top: ann.top - parY}}>
              <Fade inP={seg(t, 11.9, 12.25)} outP={seg(t, 12.85, 13.25)}>
                <div style={{fontSize: 40, color: INK, fontWeight: W_HERO, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{M.salesValue.yoy.display}</div>
                <div style={{fontSize: 22, color: MUTED, fontWeight: W_LABEL, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 6, whiteSpace: 'nowrap'}}>sales value</div>
              </Fade>
            </div>
          )}

          {/* ------------------------------------------------ metric 3 */}
          {t > 14.15 && (
            <div style={{...numStyle(m3), color: t < 18.2 ? ICE : INK, opacity: inOutCubic(n3In), transform: rise(n3In)}}>
              <span>{M.offPlanShare.display.replace('%', '')}</span>
              <span style={{fontSize: '0.62em', marginLeft: '0.03em'}}>%</span>
              {t > 18.8 && (
                <span style={{fontSize: '0.36em', fontWeight: W_LABEL, letterSpacing: '-0.01em', marginLeft: '0.35em', color: ICE, opacity: smooth(finalIn(19.7))}}>off-plan</span>
              )}
            </div>
          )}
          {t > 13.6 && t < 18.6 && (
            <div style={{position: 'absolute', left: X0, top: BIG_Y + BIG + 30}}>
              <Mask inP={seg(t, 14.5, 15.1)} outP={seg(t, 17.6, 18.1)}>
                <div style={{...labelBig, fontSize: 64}}>off-plan</div>
              </Mask>
              <div style={{height: 10}} />
              <Mask inP={seg(t, 14.7, 15.3)} outP={seg(t, 17.65, 18.15)}>
                <div style={{fontSize: 30, fontWeight: W_LABEL, color: MUTED}}>share of residential sales volume</div>
              </Mask>
            </div>
          )}
          {/* scale-bar labels, pinned to the split stream */}
          {an.bar.l && an.bar.m1 && an.bar.m2 && an.bar.r && t > 15.0 && t < 18.7 && (
            <>
              <div style={{position: 'absolute', left: (an.bar.l.x + an.bar.m1.x) / 2 - parX, top: (an.bar.l.y + an.bar.m1.y) / 2 + BAR_LABEL_DY - parY, transform: 'translateX(-50%)'}}>
                <Fade inP={seg(t, 15.4, 15.8)} outP={seg(t, 18.0, 18.4)}>
                  <div style={{fontSize: 30, color: ICE, fontWeight: W_LABEL, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{M.offPlanShare.display} off-plan</div>
                </Fade>
              </div>
              <div style={{position: 'absolute', left: (an.bar.m2.x + an.bar.r.x) / 2 - parX, top: (an.bar.m2.y + an.bar.r.y) / 2 + BAR_LABEL_DY - parY, transform: 'translateX(-50%)'}}>
                <Fade inP={seg(t, 15.6, 16.0)} outP={seg(t, 18.0, 18.4)}>
                  <div style={{fontSize: 26, color: VIOLET, fontWeight: W_LABEL, opacity: 0.85, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{M.offPlanShare.remainder.display}</div>
                </Fade>
              </div>
            </>
          )}

          {/* ------------------------------------------------ H1 three-number summary (Cavendish Maxwell only) */}
          {t > 18.7 && (
            <>
              {[0, 1].map((r) => (
                <div key={r} style={{position: 'absolute', left: X0, right: 1080 - X1, top: FINAL_Y[r] + 205, height: 1, background: HAIR, transformOrigin: '0 0', transform: `scaleX(${outCubic(seg(t, 19.6 + r * 0.15, 20.6 + r * 0.15))})`}} />
              ))}
              {[
                {y: FINAL_Y[0], text: M.transactions.yoy.display, sub: 'transactions y/y', a: 19.9},
                {y: FINAL_Y[1], text: M.salesValue.yoy.display, sub: 'sales value y/y', a: 20.05},
                {y: FINAL_Y[2], text: 'of sales volume', sub: '', a: 20.2},
              ].map((r, i) => (
                <div key={i} style={{position: 'absolute', left: X0 + 4, top: r.y + FIN + 10}}>
                  <Fade inP={seg(t, r.a, r.a + 0.4)}>
                    <div style={{fontSize: 26, color: i < 2 ? ICE : MUTED, fontWeight: W_LABEL, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em'}}>
                      {i < 2 ? r.text.replace(' y/y', '') : r.text}
                      {i < 2 && <span style={{color: MUTED, marginLeft: 12}}>{r.sub}</span>}
                    </div>
                  </Fade>
                </div>
              ))}
            </>
          )}

          {/* ------------------------------------------------ scene counter (safe area) */}
          {t > 3.4 && t < 18.6 && (
            <div style={{position: 'absolute', left: X0, top: INDEX_TOP, right: 1080 - X1}}>
              <div style={{height: 1, background: HAIR, marginBottom: 20, width: `${100 * outCubic(seg(t, 3.5, 4.6))}%`}} />
              <Mask key={idx} inP={idx === 0 ? seg(t, 3.7, 4.3) : idxP} outP={idx === 2 ? seg(t, 17.9, 18.5) : seg(t, [8.55, 13.25][idx] - 0.45, [8.55, 13.25][idx])}>
                <div style={{...small, fontSize: 22, color: MUTED}}>{idxLabels[idx]}</div>
              </Mask>
            </div>
          )}
        </div>
      )}

      <PublisherScenes t={t} parX={parX} parY={parY} />
      <Ending t={t} />

      {/* ------------------------------------------------ Cavendish source / period (scenes 1–3) */}
      <SourceLines lines={[data.source.short]} opacity={footerOn} />

      {/* ------------------------------------------------ summary footer: source, period, scope */}
      {t > 19.3 && t < T.recapOut + 0.7 && (
        <SourceLines lines={[data.source.full, data.scopeNote]} opacity={seg(t, 19.7, 20.3) * (1 - recapOut)} />
      )}
      {t > 19.3 && t < T.recapOut + 0.7 && (
        <div style={{position: 'absolute', left: X0, right: 1080 - X1, top: 1470, height: 1, background: HAIR, transformOrigin: '0 0', transform: `scaleX(${outCubic(finalFoot)})`, opacity: 1 - recapOut}} />
      )}

      {/* ------------------------------------------------ licence: every scene carrying a market claim */}
      <div style={{position: 'absolute', left: X0, right: 1080 - X1, top: LEGAL_BOTTOM, transform: 'translateY(-100%)', opacity: legalOn}}>
        <LegalLine />
      </div>
    </AbsoluteFill>
  );
};

// Scale-bar labels sit this far below the projected bar.
const BAR_LABEL_DY = 40;

export {W, H};
