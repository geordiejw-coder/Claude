// Signature-ending configuration.
//
// The ending resolves onto the OFFICIAL sp_ce logo file at public/<file>.
// Until that file exists the render shows a labelled placeholder instead of
// faking the logo with ordinary type.
//
// Once the SVG is supplied, tune `fit` so the logo lands exactly on the morphed
// letterforms (check with `node scripts/stills.mjs 30.8 31.0 31.2`).
export const LOGO = {
  file: 'brand/sp_ce-logo.svg',
  // tracking of the typeset target the letters settle into (em)
  targetTrackingEm: -0.01,
  // logo width relative to the typeset "sp_ce" ink width, plus px offsets
  fit: {widthScale: 1.0, offsetX: 0, offsetY: 0},
  // underscore bar, in em of the word size
  underscore: {thicknessEm: 0.075, widthEm: 0.5},
};
