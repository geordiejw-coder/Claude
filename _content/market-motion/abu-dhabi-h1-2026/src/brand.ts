// Signature-ending configuration, measured from the OFFICIAL logo file
// public/brand/sp_ce-logo.svg (supplied as small.svg; white wordmark, viewBox 342 × 144).
// Glyph extents are used to size and centre the logo by its visible artwork.
export const LOGO = {
  file: 'brand/sp_ce-logo.svg',
  viewW: 342,
  viewH: 144,
  baseline: 97.47, // bottom of s / c / e
  xTop: 40.43, // top of the x-height (incl. overshoot)
  // ink extents in logo units [left, right]
  glyphs: {s: [24.0, 70.69], p: [81.76, 133.03], c: [207.75, 258.87], e: [264.47, 317.58]} as Record<string, [number, number]>,
  underscore: {x0: 137.11, x1: 203.91, y0: 98.73, y1: 110.42},
};
