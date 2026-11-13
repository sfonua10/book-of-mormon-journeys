// Where everything in 1 Nephi 3–4 happens, in one place so the land, the city and the story agree; and, for the
// journeys told in Babylon, the plain the city stands on there (PLAIN).
// Positions are (u, v): metres down the valley from the camp and metres to the right of that line, as world.js has
// them. fromValley turns them into world (x, z).

/**
 * Which land the page is laid out on: 'hills', the hill country round Jerusalem, or 'plain', the river plain of
 * Babylon. A page plays one journey, so it is chosen once, before anything is made (world.js, setLand).
 */
export let LAND = 'hills';
export function chooseLand(name) {
  LAND = name === 'plain' ? 'plain' : 'hills';
}

/** The brothers' tents, outside the city, where the walk starts (1 Nephi 3:9–10). */
export const CAMP = [0, 0];

/** Jerusalem: a walled city on its own rise. Half-sizes in u and v. */
export const CITY = { at: [330, 0], half: [70, 55], wall: 9, thick: 3 };

/** The gate in the city's west wall, facing the camp. */
export const GATE = [CITY.at[0] - CITY.half[0], 0];

/** The land of their inheritance, outside the city: Lehi's house (3:22). */
export const LEHI_HOUSE = [150, -250];

/** The cavity of a rock where the brothers hide (3:27). */
export const ROCK = [125, 205];

/** Inside the city, in metres from its middle (cu, cv): */
export const IN_CITY = {
  /** Laban's house: a big house with a walled court. [cu0, cv0, cu1, cv1] */
  laban: [30, 16, 58, 46],
  /** Its court, west of the house, with a gate onto the street at cu = 22. */
  court: [22, 20, 30, 42],
  /** The treasury: a stone storehouse beside the main street. */
  treasury: [36, -24, 56, -8],
  /** Where Laban lies in the street, near his house (4:7). */
  fallen: [17, 26],
  /** The treasury's door (on its north face, onto the main street). */
  treasuryDoor: [46, -7.5],
  /** The table at the back of the treasury where the plates are kept, and how high its top is. */
  table: [46, -22.15],
  tableTop: 0.95,
};

/** City-local (cu, cv) to (u, v). */
export const cityUV = (cu, cv) => [CITY.at[0] + cu, CITY.at[1] + cv];

/** Footpaths worn to earth, as lines of (u, v) points. */
export const PATHS = [
  // the camp to the gate
  [[6, 4], [60, 10], [120, 4], [180, -6], [225, -2], [GATE[0] - 2, 0]],
  // the land of inheritance to the road
  [[LEHI_HOUSE[0], LEHI_HOUSE[1] + 11], [LEHI_HOUSE[0] + 6, LEHI_HOUSE[1] + 30], [175, -190], [190, -110], [205, -40], [225, -2]],
  // a track off towards the rocks
  [[150, 4], [140, 80], [130, 150], [ROCK[0] + 6, ROCK[1] - 14]],
];

/** 0 outside the city walls, 1 inside (soft at the wall's foot), for (u, v). */
export function insideCity(u, v, margin = 0) {
  const du = Math.abs(u - CITY.at[0]) - (CITY.half[0] + margin);
  const dv = Math.abs(v - CITY.at[1]) - (CITY.half[1] + margin);
  return Math.max(du, dv) < 0 ? 1 : 0;
}

/** How far outside the city's walled rectangle (u, v) is, metres (negative inside). */
export function cityDistance(u, v) {
  const du = Math.abs(u - CITY.at[0]) - CITY.half[0];
  const dv = Math.abs(v - CITY.at[1]) - CITY.half[1];
  const ou = Math.max(du, 0);
  const ov = Math.max(dv, 0);
  return Math.hypot(ou, ov) + Math.min(Math.max(du, dv), 0);
}

/** Places nothing should be planted on: [u, v, radius]. */
export const KEEP_CLEAR = [
  [CAMP[0] + 4, CAMP[1] + 6, 22],
  [LEHI_HOUSE[0], LEHI_HOUSE[1], 30],
  [ROCK[0], ROCK[1], 16],
  [GATE[0] - 18, 0, 26],
];

/** Whether a tree, bush or stone at (u, v) would stand somewhere the story needs open: the city and the places. */
export function keepClear(u, v, margin = 0) {
  if (cityDistance(u, v) < 14 + margin) return true;
  for (const [cu, cv, r] of LAND === 'plain' ? PLAIN.keep : KEEP_CLEAR) if (Math.hypot(u - cu, v - cv) < r + margin) return true;
  return false;
}

/**
 * The plain of Babylon, for the journeys told there. The city keeps the same place (CITY), its gate in the west
 * wall; the Euphrates runs past it on its right hand (+v), and the plain of Dura lies before the gate.
 */
export const PLAIN = {
  /** The river: its middle (see riverMiddle), its half-width, and the level of its water, metres. */
  river: { v: 135, half: 36, level: -1.25 },
  /** Canals that water the fields, each a line of (u, v) points; how wide they are to either side of it. */
  canals: [
    [[-760, -210], [760, -210]],
    [[-150, 112], [-150, -210]],
  ],
  canalHalf: 2.2,
  /** The road out of the gate, a little raised above the plain, to where the image of gold is set up. */
  road: [[GATE[0] + 4, 0], [GATE[0] - 60, 0], [150, 0]],
  /** How far either side of the road's middle is trodden bare, metres. */
  roadHalf: 6,
  /** The plain of Dura (Daniel 3:1): the open ground before the gate, its middle and how far it reaches. */
  dura: [170, 0, 62],
  /** The level the plain of Dura, the road and the city are made to, metres: a little above the plain round them. */
  level: 0.75,
  /** On it: the image of gold, which looks towards the city (+u). */
  image: [128, 0],
  /** The king's seat: a low dais, its middle and half-sizes and how high it is; he sits facing +v. */
  seat: { at: [180, -40], half: [5, 3.5], rise: 0.6 },
  /** The burning fiery furnace: a kiln of brick, its middle and half-sizes; its door is on its -v face. */
  kiln: { at: [166, 44], half: [8, 7] },
  /** Places nothing should be planted on: [u, v, radius]. */
  keep: [
    [170, 0, 80],
    [GATE[0] - 30, 0, 26],
  ],
};

/** The middle of the river, metres to the right of the valley's line at u: it bends a little, slowly. */
export function riverMiddle(u) {
  return PLAIN.river.v + 20 * Math.sin(u / 600 + 0.4) + 7 * Math.sin(u / 230 + 1.3);
}

/**
 * The rock the brothers hide in (3:27): big boulders round a hollow, open on the side towards the city.
 * [du, dv, size, tall] from ROCK.
 */
export const ROCK_STONES = [
  [-6.5, 2.5, 4.6, 1.15],
  [-4.2, -4.8, 3.9, 1.0],
  [1.5, -7.0, 4.2, 0.95],
  [-3.0, 7.5, 3.6, 1.1],
  [3.5, 7.0, 3.0, 0.9],
  [-9.5, -1.0, 3.2, 0.85],
  [6.0, -10.5, 2.4, 0.8],
];
