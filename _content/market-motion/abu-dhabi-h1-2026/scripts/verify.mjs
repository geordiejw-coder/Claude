// Verifies the render (dimensions, fps, duration, codec) and that every number
// the composition can put on screen as a settled value is one of the locked facts.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';

const LOCKED = {
  transactions: '15,500',
  transactionsYoy: '+103.6% y/y',
  salesValue: 'AED 67.8bn',
  salesValueYoy: '+177.9% y/y',
  offPlan: '82.7%',
  offPlanRemainder: '17.3%', // derived: 100 − 82.7, shown only as the quiet remainder label
  scope: 'City series excludes residential complexes, duplexes and penthouses.',
  source: 'Source: Cavendish Maxwell, Abu Dhabi Residential Market Performance — H1 2026, pp. 2, 4 and 5.',
};

let ok = true;
const check = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) ok = false; };

// ---- data file matches locked facts
const d = JSON.parse(fs.readFileSync('data/market.json', 'utf8'));
const m = d.metrics;
check(m.transactions.display === LOCKED.transactions && m.transactions.value === 15500, 'transactions = 15,500');
check(m.transactions.yoy.display === LOCKED.transactionsYoy, 'transactions y/y = +103.6%');
check(m.salesValue.display === LOCKED.salesValue && m.salesValue.valueAedBn === 67.8, 'sales value = AED 67.8bn');
check(m.salesValue.yoy.display === LOCKED.salesValueYoy, 'sales value y/y = +177.9%');
check(m.offPlanShare.display === LOCKED.offPlan && m.offPlanShare.value === 82.7, 'off-plan share = 82.7%');
check(m.offPlanShare.remainder.display === LOCKED.offPlanRemainder && Math.abs(100 - 82.7 - m.offPlanShare.remainder.value) < 1e-9, 'remainder = 17.3% (100 − 82.7)');
check(d.market === 'Abu Dhabi City' && d.period === 'H1 2026', 'scope = Abu Dhabi City, H1 2026');
check(d.scopeNote === LOCKED.scope, 'scope note text');
check(d.source.full === LOCKED.source, 'source text');
check(d.summaryLine.join(' · ') === '15,500 sales · AED 67.8bn · 82.7% off-plan', 'summary line');

// ---- no hard-coded numeric claims in the typography source
const film = fs.readFileSync('src/Film.tsx', 'utf8');
const jsxText = [...film.matchAll(/>([^<>{}]+)</g)].map((x) => x[1].trim()).filter((s) => /\d/.test(s) && !/[;=(){}&|\n]/.test(s));
const allowed = ['01 / 03', '02 / 03', '03 / 03', 'H1 2026'];
// '0' is the visibility:hidden width sizer inside each rolling digit slot.
const stray = jsxText.filter((s) => s !== '0' && !allowed.some((a) => s.includes(a)));
check(stray.length === 0, `no stray literal numbers in on-screen JSX text${stray.length ? ': ' + stray.join(' | ') : ''}`);

// ---- render properties
const file = 'out/abu-dhabi-h1-2026.mp4';
check(fs.existsSync(file), `${file} exists`);
if (fs.existsSync(file)) {
  const out = execFileSync('npx', ['remotion', 'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=codec_name,profile,width,height,r_frame_rate,nb_frames,pix_fmt:format=duration', '-of', 'json', file], {stdio: ['ignore', 'pipe', 'ignore']}).toString();
  const j = JSON.parse(out.slice(out.indexOf('{')));
  const s = j.streams[0];
  const dur = Number(j.format.duration);
  console.log('      ', JSON.stringify({...s, duration: dur}));
  check(s.codec_name === 'h264', 'codec H.264');
  check(s.width === 1080 && s.height === 1920, '1080 × 1920');
  check(s.r_frame_rate === '30/1', '30 fps');
  check(dur >= 20 && dur <= 24, `duration ${dur.toFixed(3)}s within 20–24s`);
  check(s.pix_fmt === 'yuv420p', 'yuv420p (phone/social compatible)');
  const audio = execFileSync('npx', ['remotion', 'ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', file], {stdio: ['ignore', 'pipe', 'ignore']}).toString().trim();
  check(audio === '', 'no audio track (no narration)');
}
console.log(ok ? '\nALL CHECKS PASSED' : '\nSOME CHECKS FAILED');
process.exit(ok ? 0 : 1);
