// Shared screen geometry for the CBRE and Savills scenes. Typography and the
// particle layer both read from here, so bars, fields and labels stay locked.
import data from '../data/market.json';
import {COL_W, X0} from './theme';

export const PM = data.priceMomentum;
export const CP = data.currentPricing;

// ------------------------------------------------------------- price momentum (CBRE)
const priceScaleMax = Math.max(PM.apartments.value, PM.villas.value, PM.residential.value) / 0.82;
export const PRICE = {
  headY: 470,
  bigY: 520,
  rows: [
    {r: PM.apartments, labelY: 880, barY: 948, h: 26, len: (COL_W * PM.apartments.value) / priceScaleMax, color: [170, 188, 255]},
    {r: PM.villas, labelY: 1030, barY: 1098, h: 26, len: (COL_W * PM.villas.value) / priceScaleMax, color: [224, 173, 249]},
  ],
  // The headline +21.6% as a particle marker on the same scale as the bars.
  markerX: X0 + (COL_W * PM.residential.value) / priceScaleMax,
  markerY0: 934,
  markerY1: 1138,
};

// ------------------------------------------------------------- current pricing (Savills)
const rateMax = Math.max(CP.apartments.value, CP.villasTownhouses.value) / 0.86;
export const RATE = {
  headY: 470,
  figSize: 136,
  fieldRowsN: 6,
  rows: [
    {r: CP.apartments, labelY: 530, figY: 588, fieldY: 772, len: (COL_W * CP.apartments.value) / rateMax, color: [170, 188, 255]},
    {r: CP.villasTownhouses, labelY: 880, figY: 938, fieldY: 1122, len: (COL_W * CP.villasTownhouses.value) / rateMax, color: [224, 173, 249]},
  ],
};
// Row geometry of the depth lattice (back row 0 → front row 5).
export const fieldRowY = (r: number) => r * 6.5 + r * r * 0.35;
export const fieldRowDx = (r: number) => 6 + r * 0.55;
