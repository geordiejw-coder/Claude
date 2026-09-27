// Reports how long each text frame is fully readable in FILM time (after the hold time-map),
// and the end-card hold. Used by verify.mjs; pack rule: ≥ 2.5 s each.
import {DURATION, FPS, LAST_LANDING, T, worldTime} from '../src/world';

const film = (w: number) => {
  for (let f = 0; f < DURATION; f++) if (worldTime(f) >= w) return f / FPS;
  return DURATION / FPS;
};
const spans = [
  // [label, world time the frame is complete, world time its first element starts to leave]
  ['15,500 frame (figure, label, y/y)', LAST_LANDING + 0.25, 8.15],
  ['AED 67.8bn frame (+177.9% annotation)', 12.25, 12.8],
  ['82.7% frame (labels, share-bar labels)', 16.0, 17.6],
  ['H1 three-number summary', 20.6, T.recapOut],
  ['CBRE price momentum', T.priceIn + 1.45, T.priceOut - 0.55],
  ['Savills current pricing', T.rateIn + 1.25, T.rateOut - 0.55],
  ['End card (find your space + official logo + licence)', T.endIn + 2.2, 1e9],
] as const;
const out = spans.map(([name, a, b]) => ({name, seconds: +(film(b) - film(a)).toFixed(2)}));
console.log(JSON.stringify({durationS: +(DURATION / FPS).toFixed(3), frames: DURATION, holds: out}));
