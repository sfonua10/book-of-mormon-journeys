// The hill country round Jerusalem: you start at the brothers' camp on the shoulder of a hill beside one great tree,
// the land falls away ahead and rises again to the city on its own hill, dry hills close it in on both sides and
// behind, and far off are mountains. Plain functions of (x, z), read once by the field and by the far land.
// (Remixed from Painted Valley's summer valley: the tarn is gone, the city's rise is new; see src/game/places.js.)
import { CITY, cityDistance, LEHI_HOUSE, PATHS } from '../game/places.js';

/** The way the valley runs from the start, a unit vector (x, z). */
export const HERO = [0.6, 0.8];
const [DX, DZ] = HERO;

/** Where you start, the great tree, and the tarn: [x, z]. */
export const START = [0, 0];
export const TREE = fromValley(9, -13);
/** Where the village stands, (u, v): near enough to be seen as a village, on a rise of its own. */
export const VILLAGE = [740, -210];
// (there is no tarn in these hills: it is put far out of the world, so everything that asks how near it is hears
// "far")
export const TARN = { at: fromValley(9000, 9000), rx: 46, rz: 27, level: 0 };

/** (metres down the valley, metres to the right of it) to (x, z). */
export function fromValley(u, v) {
  return [u * DX - v * DZ, u * DZ + v * DX];
}

/** (x, z) to (metres down the valley, metres to the right of it). */
export function toValley(x, z) {
  return [x * DX + z * DZ, -x * DZ + z * DX];
}

function hash(ix, iz, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(seed, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function vnoise(x, z, seed) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uz = fz * fz * fz * (fz * (fz * 6 - 15) + 10);
  const a = hash(ix, iz, seed);
  const b = hash(ix + 1, iz, seed);
  const c = hash(ix, iz + 1, seed);
  const d = hash(ix + 1, iz + 1, seed);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

/** 0 to 1, mostly near 0.5. */
export function fbm(x, z, octaves, seed) {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * vnoise(x, z, seed + o * 17);
    norm += amp;
    amp *= 0.5;
    x = x * 2.03 + 11.7;
    z = z * 2.03 - 5.3;
  }
  return sum / norm;
}

/** Sharp crests and broad flanks, 0 to 1: mountains. */
function ridged(x, z, octaves, seed) {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    const n = 1 - Math.abs(2 * vnoise(x, z, seed + o * 13) - 1);
    sum += amp * n * n;
    norm += amp;
    amp *= 0.42;
    x = x * 2.07 + 3.1;
    z = z * 2.07 - 8.9;
  }
  return sum / norm;
}

export const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** 0 in the middle of the tarn, 1 at its shore, more outside. */
export function tarnDistance(x, z) {
  const dx = x - TARN.at[0];
  const dz = z - TARN.at[1];
  // its long side lies across the valley, and its shore wanders
  const u = dx * DX + dz * DZ;
  const v = -dx * DZ + dz * DX;
  const wobble = 1 + 0.16 * Math.sin(Math.atan2(u, v) * 3 + 0.7) + 0.09 * Math.sin(Math.atan2(u, v) * 7 + 2.1);
  return Math.hypot(v / TARN.rx, u / TARN.rz) / wobble;
}

/** Where the river runs: metres to the right of the valley's line, at u metres down it. */
function riverLine(u) {
  return 60 + 330 * Math.sin(u / 520 + 0.6) + 80 * Math.sin(u / 170 + 2) + 900 * Math.exp(-Math.max(u, -400) / 350);
}

/** How far (x, z) is from the middle of the river, metres. */
export function riverDistance(x, z) {
  const u = x * DX + z * DZ;
  const v = -x * DZ + z * DX;
  const slope = (330 / 520) * Math.cos(u / 520 + 0.6) + (80 / 170) * Math.cos(u / 170 + 2) - (u > -400 ? (900 / 350) * Math.exp(-u / 350) : 0);
  return Math.abs(v - riverLine(u)) / Math.sqrt(1 + slope * slope);
}

/** 0 to 1: how much of the far land at (x, z) is ploughed and hedged, the fields round the hamlet. */
export function fieldsAt(x, z) {
  const u = x * DX + z * DZ;
  const v = -x * DZ + z * DX;
  const d = Math.hypot((u - 1350) / 1000, (v + 60) / 820) + (fbm(x / 600 + 4, z / 600 + 8, 2, 83) - 0.5) * 0.4;
  // (it begins a little way past where the walk ends)
  return (1 - smooth(0.8, 1.0, d)) * smooth(545, 640, Math.hypot(x, z));
}

/** 0 to 1: forest on the far land at (x, z). None near the walk, none on the fields or the river's banks. */
export function forestAt(x, z) {
  const r = Math.hypot(x, z);
  let f = smooth(0.44, 0.52, fbm(x / 1700 + 7.3, z / 1700 + 3.1, 4, 91) * 0.72 + fbm(x / 430 + 1.7, z / 430 + 5.9, 3, 97) * 0.28);
  // the hills carry more of it than the plain
  f = Math.max(f, smooth(55, 120, land(x, z)) * smooth(0.36, 0.5, fbm(x / 900 + 2.2, z / 900 + 6.1, 3, 101)));
  f *= smooth(820, 1500, r) * smooth(30, 170, riverDistance(x, z)) * (1 - fieldsAt(x, z));
  // (the hill country is open: woods only in the folds of the hills)
  f *= 0.55 * smooth(0.5, 0.7, fbm(x / 1100 + 9.1, z / 1100 + 1.7, 2, 107));
  return f;
}

/** The level the city is built at, and how it rises towards its east end, set once from the land under it. */
let cityLevel = null;

function land(x, z) {
  const h = wildLand(x, z);
  const u = x * DX + z * DZ;
  const v = -x * DZ + z * DX;
  // inside the walls the ground is made level for building, and it eases back into the hill outside them
  const d = cityDistance(u, v);
  if (d > 40) return h;
  cityLevel ??= wildLand(...fromValley(CITY.at[0], CITY.at[1]));
  const level = cityLevel + (u - CITY.at[0]) * 0.03;
  return h + (level - h) * (1 - smooth(4, 40, d));
}

function wildLand(x, z) {
  const u = x * DX + z * DZ;
  const v = -x * DZ + z * DX;
  const r = Math.hypot(x, z);
  // rolling ground, calmer where you start so the crest is one clean line against the sky
  let h = (fbm(x / 260 + 3.1, z / 260 - 1.7, 4, 1) - 0.5) * 20 * (0.25 + 0.75 * smooth(60, 420, r));
  h += (fbm(x / 70 + 9.3, z / 70 + 4.1, 3, 5) - 0.5) * 3.0;
  // rises and hollows a stone's throw across, so the meadow is a land of its own and not one sheet (they die away
  // on the far plain, which is too coarsely made to carry them)
  let roll = (fbm(x / 120 + 1.7, z / 120 + 6.3, 2, 13) - 0.5) * 24 * smooth(14, 90, r) * (1 - smooth(900, 1800, r));
  roll += (fbm(x / 48 + 8.1, z / 48 + 2.9, 2, 17) - 0.5) * 5.5 * smooth(10, 50, r) * (1 - smooth(500, 900, r));
  // (down the middle of the view from the start they may dip but not rise: the valley is what is to be seen, and the
  // rises stand to either side of it)
  if (roll > 0) roll *= 1 - 0.9 * Math.exp(-((v / 95) ** 2)) * smooth(0, 40, u) * (1 - smooth(300, 460, u));
  h += roll;
  // the hill you start on, a long shoulder
  h += 54 * Math.exp(-((u + 30) ** 2) / (2 * 185 ** 2) - (v * v) / (2 * 330 ** 2));
  // Jerusalem's hill
  h += 24 * Math.exp(-((u - CITY.at[0]) ** 2 + (v - CITY.at[1]) ** 2) / (2 * 120 ** 2));
  // a dip between the camp's hill and the city's, so the city stands up across it
  h -= 7 * Math.exp(-((u - 190) ** 2) / (2 * 60 ** 2) - (v * v) / (2 * 260 ** 2));
  // the land of inheritance: a gentle shelf
  h -= 6 * Math.exp(-((u - LEHI_HOUSE[0]) ** 2 + (v - LEHI_HOUSE[1]) ** 2) / (2 * 70 ** 2));
  // wooded hills to either side, and behind
  const side = Math.abs(v) + 160 * (fbm(u / 520 + 5, v / 520, 2, 31) - 0.5);
  h += 120 * smooth(430, 1500, side) * (0.6 + 0.8 * fbm(x / 800 + 2, z / 800 + 9, 3, 37));
  h += 95 * smooth(260, 1200, -u);
  // a river crosses the plain to the right of the walk: the land lies down to it
  const river = riverDistance(x, z);
  if (river < 420) {
    const level = -9 - u * 0.0035;
    // (only across low ground: where its line meets the hills it is lost behind them, not cut through them)
    h += (level - h) * Math.exp(-(river * river) / (2 * 150 * 150)) * (1 - smooth(22, 60, h));
  }
  return h;
}

const tarnFloor = land(TARN.at[0], TARN.at[1]);
TARN.level = tarnFloor - 0.55;

export function heightAt(x, z) {
  let h = land(x, z);
  const t = tarnDistance(x, z);
  if (t < 2.2) {
    // level ground round the water, a bank, and a bed that deepens to the middle
    const flat = 1 - smooth(1.25, 2.2, t);
    h += (tarnFloor - h) * flat;
    h -= 2.4 * (1 - smooth(0.25, 1.06, t));
  }
  return h;
}

/** How far (x, z) is from the middle of the nearest footpath, metres. */
/** Distance from (u, v) to a line of points, and how far along it that nearest point is, metres. */
function lineDistance(u, v, line) {
  let best = 1e9;
  for (let i = 0; i + 1 < line.length; i++) {
    const [au, av] = line[i];
    const [bu, bv] = line[i + 1];
    const du = bu - au;
    const dv = bv - av;
    const t = Math.min(1, Math.max(0, ((u - au) * du + (v - av) * dv) / (du * du + dv * dv)));
    best = Math.min(best, Math.hypot(u - au - du * t, v - av - dv * t));
  }
  return best;
}

/** How far (x, z) is from the middle of the nearest footpath, metres. */
export function pathDistance(x, z) {
  const u = x * DX + z * DZ;
  const v = -x * DZ + z * DX;
  // (each path wanders a little off its straight lines)
  const wander = 2.2 * Math.sin(u / 23 + v / 31) + 1.4 * Math.sin(u / 9.7 - v / 13);
  let best = 1e3;
  for (const line of PATHS) best = Math.min(best, lineDistance(u + wander * 0.3, v + wander, line));
  return Math.max(0, best - 0.6);
}

export function paint(x, z) {
  const u = x * DX + z * DZ;
  const v = -x * DZ + z * DX;
  // dry nearly everywhere: grass gone to straw, sage and thorn in the hollows
  const dry = 0.62 + 0.36 * smooth(0.4, 0.66, fbm(x / 90 + 2.2, z / 90 + 8.1, 3, 21));
  const wet = smooth(0.7, 0.78, fbm(x / 47 + 5.5, z / 47 + 9.9, 2, 33)) * 0.35;
  // thin cover, in clumps, with stony earth between
  const clumps = fbm(x / 9 + 1.3, z / 9 - 4.1, 3, 41) * 0.65 + fbm(x / 60 - 3.3, z / 60 + 2.7, 2, 43) * 0.35;
  let growth = 0.15 + 0.85 * smooth(0.34, 0.6, clumps);
  // a footpath worn to earth, its edges ragged
  const path = pathDistance(x, z);
  growth = Math.min(growth, smooth(0.6, 1.8, path + (fbm(x / 2.7, z / 2.7, 2, 61) - 0.5) * 0.9));
  // nothing grows in the city's streets or in the trodden ground round its walls, the camp, or the house
  growth *= smooth(-2, 12, cityDistance(u, v));
  growth *= smooth(9, 22, Math.hypot(u - 4, v - 6));
  growth *= smooth(16, 30, Math.hypot(u - LEHI_HOUSE[0], v - LEHI_HOUSE[1]));
  // a few red anemones and yellow flowers in drifts
  const flowers = smooth(0.58, 0.74, fbm(x / 38 - 6, z / 38 + 3, 2, 55)) * 0.35;
  return { dry: dry * (1 - wet), growth, wet, flowers };
}
