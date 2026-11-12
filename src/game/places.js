// Where everything in 1 Nephi 3–4 happens, in one place so the land, the city and the story agree.
// Positions are (u, v): metres down the valley from the camp and metres to the right of that line, as world.js has
// them. fromValley turns them into world (x, z).

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
  for (const [cu, cv, r] of KEEP_CLEAR) if (Math.hypot(u - cu, v - cv) < r + margin) return true;
  return false;
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
