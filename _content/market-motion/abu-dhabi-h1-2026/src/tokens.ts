// sp_ce design tokens, read by name from the pack's design-tokens.json
// (tokens/design-tokens.json is a byte-identical copy; scripts/verify.mjs checks it).
import tokens from '../tokens/design-tokens.json';

export const TK = tokens;
const P = tokens.color.primary;
const A = tokens.color.accent;
const S = tokens.color.semantic;

export const color = {
  spBlack: P['sp-black'],
  spWhite: P['sp-white'],
  spCloud: P['sp-cloud'],
  spMist: P['sp-mist'],
  spIceBlue: A['sp-ice-blue'],
  softViolet: A['soft-violet'],
  textOnDark1: S['text-on-dark-1'],
  textOnDark2: S['text-on-dark-2'],
  textOnDark3: S['text-on-dark-3'],
  // colour part of stroke.hairline-dark ("1px solid rgba(...)")
  hairlineDark: tokens.stroke['hairline-dark'].replace(/^\S+\s+solid\s+/, ''),
};

export const scale = tokens.type['social-scale'];
export const motion = tokens.motion;

// "#AABCFF" → [170, 188, 255], for canvas drawing and alpha ramps of token colours.
export function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgba(hex: string, a: number) {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}
