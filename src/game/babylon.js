// Babylon, for the journeys told there (Daniel 3): the same land and the same walls as the first journey's city,
// built of another stuff and holding other things. A city of baked brick, its gate faced with blue; within, the
// king's house with a court before it where he sits in judgement, and the burning fiery furnace; without, on the
// plain, the image of gold "whose height was threescore cubits, and the breadth thereof six cubits" (3:1): about
// 27 metres by 2.7.
//
// It is a `look` for createCity (city.js), made with the same boxes, so what is seen is also what is walked against.
import { CITY } from './places.js';
import { footing, ground, house, PART, ROOF } from './city.js';

// baked brick, ochre and brown; the blue of glazed brick; gold; brick blackened by fire
const BRICK = [0.68, 0.49, 0.33];
const BLUE = [0.14, 0.28, 0.62];
const GOLD = [1.0, 0.76, 0.28];
const SOOT = [0.4, 0.29, 0.22];
const PLASTERS = [
  [0.74, 0.58, 0.4],
  [0.66, 0.5, 0.34],
  [0.8, 0.66, 0.47],
  [0.62, 0.45, 0.31],
  [0.72, 0.55, 0.37],
  [0.68, 0.56, 0.42],
];

/** Where its things are. Within the walls in metres from the city's middle (cu, cv); the image in (u, v). */
export const IN_BABYLON = {
  /** The image of gold, on the plain before the gate, south of the road; it looks north, to the road. */
  image: [205, -36],
  /** The king's house. [cu0, cv0, cu1, cv1] */
  palace: [38, 16, 58, 46],
  /** The court before it, with a gateway onto the street at cu = 22, from cv 28 to 34. */
  court: [22, 18, 38, 44],
  courtGate: [22, 31],
  /** Where the king sits: his seat against the wall of his house, and where he stands before it. */
  seat: [37.2, 31],
  king: [35.4, 31],
  /** The furnace, on the main street, and its mouth (on its north face, onto the street). */
  furnace: [40, -22, 52, -10],
  mouth: [46, -10],
  /** How thick its walls are. */
  furnaceWall: 1.2,
};

/** The gate's towers and lintel faced with blue brick, banded with gold. */
function gate(b, { cu, cv, hu, gw, W }) {
  const face = (plane, at, width, y0, y1) => {
    const base = ground(plane, at);
    b.patch('w', plane, at, width, base + y0, base + y1, base, PART.PLASTER, BLUE, 0.81);
    b.patch('w', plane, at, width, base + y1, base + y1 + 0.4, base, PART.GOLD, GOLD, 0.82);
    b.patch('w', plane, at, width, base + y0 - 0.4, base + y0, base, PART.GOLD, GOLD, 0.83);
  };
  // (the towers either side of the gate are 8 m square, about (-hu + 1, ±(gw + 4.2)))
  for (const side of [-1, 1]) face(cu - hu - 3, cv + side * (gw + 4.2), 6.4, 1.6, W + 2.4);
  face(cu - hu - 1, cv, gw * 2 - 0.4, 6.4, W + 2.8);
}

/** Within the walls: the king's house and its court, and the furnace. */
function inside(b, random, { S, cu, cv }) {
  // the king's house: tall, of pale brick, its door on the court flanked with blue
  {
    const [u0, v0, u1, v1] = IN_BABYLON.palace;
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const base = footing(a, c, d, e);
    house(b, random, a, c, d, e, 11, { colour: [0.86, 0.74, 0.56], windows: 'sn', door: null, seed: 0.91 });
    // a band of blue under the parapet, on the side of the court
    b.patch('w', a, cv + 31, v1 - v0 - 1, base + 9.4, base + 10.6, base, PART.PLASTER, BLUE, 0.9);
    b.patch('w', a, cv + 31, v1 - v0 - 1, base + 10.6, base + 10.9, base, PART.GOLD, GOLD, 0.9);
  }
  // the court: a wall of brick round it, a gateway on the street with blue posts
  {
    const [u0, v0, u1, v1] = IN_BABYLON.court;
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const cb = footing(a, c, d, e);
    const wall = { part: PART.STONE, colour: BRICK, seed: 0.92, base: cb, roofPart: PART.STONE, roofColour: BRICK };
    const g0 = cv + IN_BABYLON.courtGate[1] - 3;
    const g1 = cv + IN_BABYLON.courtGate[1] + 3;
    b.box(a, a + 0.8, d, g0, cb - 1.6, cb + 4.2, wall);
    b.box(a, a + 0.8, g1, e, cb - 1.6, cb + 4.2, wall);
    b.box(a, c, d, d + 0.8, cb - 1.6, cb + 4.2, wall);
    b.box(a, c, e - 0.8, e, cb - 1.6, cb + 4.2, wall);
    for (const [p0, p1] of [[g0 - 1, g0], [g1, g1 + 1]]) {
      b.box(a - 0.5, a + 1.3, p0, p1, cb - 1.6, cb + 5.6, { colour: BLUE, seed: 0.93, base: cb, roofPart: PART.GOLD, roofColour: GOLD });
    }
    // the king's seat against the wall of his house: a high back of blue and gold, a step before it, and a cloth
    // of purple laid from it towards the gate
    const [su, sv] = [cu + IN_BABYLON.seat[0], cv + IN_BABYLON.seat[1]];
    const sb = ground(su, sv);
    b.box(su - 0.2, su + 0.7, sv - 2.4, sv + 2.4, sb - 0.4, sb + 4.6, { colour: BLUE, seed: 0.94, base: sb, roofPart: PART.GOLD, roofColour: GOLD });
    for (const side of [-1, 1]) {
      b.box(su - 0.45, su + 0.7, sv + side * 2.4 - 0.35, sv + side * 2.4 + 0.35, sb - 0.4, sb + 5.4, { part: PART.GOLD, colour: GOLD, seed: 0.95, base: sb, roofPart: PART.GOLD, roofColour: GOLD });
    }
    b.box(su - 1.1, su - 0.2, sv - 0.8, sv + 0.8, sb - 0.4, sb + 0.55, { part: PART.GOLD, colour: GOLD, seed: 0.96, base: sb, roofPart: PART.CLOTH, roofColour: [0.5, 0.16, 0.46] });
    const cloth = [0.46, 0.15, 0.42];
    const [k0, k1] = [su - 11, su - 1.1];
    b.quad(
      [[k0, ground(k0, sv - 1) + 0.04, sv - 1], [k0, ground(k0, sv + 1) + 0.04, sv + 1], [k1, ground(k1, sv + 1) + 0.04, sv + 1], [k1, ground(k1, sv - 1) + 0.04, sv - 1]],
      [0, 1, 0],
      PART.CLOTH,
      cloth,
      [[k0, -1], [k0, 1], [k1, 1], [k1, -1]],
      0.97,
    );
  }
  // The burning fiery furnace: a great kiln of brick blackened by its fire, with one mouth, on the street. Its walls
  // within and its floor burn (they are drawn as flame); what else burns in it is the story's to show (daniel.js).
  {
    const [u0, v0, u1, v1] = IN_BABYLON.furnace;
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const base = footing(a, c, d, e);
    const brick = { part: PART.STONE, colour: SOOT, seed: 0.95, base, roofPart: PART.STONE, roofColour: SOOT };
    const T2 = IN_BABYLON.furnaceWall;
    const top = base + 7.5;
    const mouth = cu + IN_BABYLON.mouth[0];
    const hw = 1.9;
    const tall = 3.8;
    b.box(a, c, d, d + T2, base - 1.6, top, brick);
    b.box(a, a + T2, d + T2, e - T2, base - 1.6, top, brick);
    b.box(c - T2, c, d + T2, e - T2, base - 1.6, top, brick);
    b.box(a, mouth - hw, e - T2, e, base - 1.6, top, brick);
    b.box(mouth + hw, c, e - T2, e, base - 1.6, top, brick);
    b.box(mouth - hw, mouth + hw, e - T2, e, base + tall, top, brick);
    // its roof, and the dark under it
    b.box(a + T2, c - T2, d + T2, e - T2, top - 0.6, top, { ...brick, roofPart: PART.ROOF, roofColour: ROOF });
    b.quad([[a + T2, top - 0.6, d + T2], [c - T2, top - 0.6, d + T2], [c - T2, top - 0.6, e - T2], [a + T2, top - 0.6, e - T2]], [0, -1, 0], PART.DARK, SOOT, [[a, 0], [c, 0], [c, 6], [a, 6]], 0.95);
    // the arch of the mouth, scorched; a step of stone before it
    b.patch('n', e, mouth, hw * 2 + 1.2, base + tall, base + tall + 0.7, base, PART.DARK, SOOT, 0.95);
    b.box(mouth - hw - 0.6, mouth + hw + 0.6, e, e + 0.7, base - 0.6, ground(mouth, e + 0.35) + 0.06, { ...brick, solid: false });
    // the fire: every wall within, in strips that flicker each in its own time, and the floor in squares
    const [i0, i1, j0, j1] = [a + T2, c - T2, d + T2, e - T2];
    const n = 7;
    const wu = (i1 - i0) / n;
    const wv = (j1 - j0) / n;
    for (let k = 0; k < n; k++) {
      const hi = base + 4.2 + random() * 1.6;
      b.patch('n', j0, i0 + (k + 0.5) * wu, wu, base - 0.2, hi, base, PART.LAMP, BRICK, random());
      b.patch('e', i0, j0 + (k + 0.5) * wv, wv, base - 0.2, base + 4.2 + random() * 1.6, base, PART.LAMP, BRICK, random());
      b.patch('w', i1, j0 + (k + 0.5) * wv, wv, base - 0.2, base + 4.2 + random() * 1.6, base, PART.LAMP, BRICK, random());
    }
    const m = 5;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        const [p0, p1, q0, q1] = [i0 + (i / m) * (i1 - i0), i0 + ((i + 1) / m) * (i1 - i0), j0 + (j / m) * (j1 - j0), j0 + ((j + 1) / m) * (j1 - j0)];
        const y = (u, v) => ground(u, v) + 0.05;
        b.quad([[p0, y(p0, q0), q0], [p0, y(p0, q1), q1], [p1, y(p1, q1), q1], [p1, y(p1, q0), q0]], [0, 1, 0], PART.LAMP, BRICK, [[p0, q0], [p0, q1], [p1, q1], [p1, q0]], random());
      }
    }
  }
}

/**
 * The image of gold on the plain: a figure standing, crowned, on a base of brick. Sixty cubits by six (3:1): 27.4 m
 * from the ground to its top, 2.74 m across. Nothing is said of what it was an image of; it is given a figure's
 * outline and no face.
 */
function image(b) {
  const [iu, iv] = IN_BABYLON.image;
  const base = footing(iu - 3.2, iu + 3.2, iv - 3.2, iv + 3.2);
  b.box(iu - 3.2, iu + 3.2, iv - 3.2, iv + 3.2, base - 2, base + 1.2, { part: PART.STONE, colour: BRICK, seed: 0.84, base, roofPart: PART.STONE, roofColour: BRICK });
  b.box(iu - 2.4, iu + 2.4, iv - 2.4, iv + 2.4, base + 1.2, base + 2.0, { colour: BLUE, seed: 0.85, base, roofPart: PART.STONE, roofColour: BRICK });
  // from the foot up: each part [half its breadth (along u), half its depth (along v), from, to] in metres
  const parts = [
    [1.37, 1.15, 2.0, 2.9],
    [1.15, 0.85, 2.9, 13.0],
    [1.37, 0.95, 13.0, 20.0],
    [0.55, 0.5, 20.0, 21.0],
    [0.95, 0.85, 21.0, 24.4],
    [1.12, 1.0, 24.4, 25.6],
    [0.6, 0.55, 25.6, 27.4],
  ];
  parts.forEach(([hu, hv, y0, y1], i) => {
    b.box(iu - hu, iu + hu, iv - hv, iv + hv, base + y0, base + y1, { part: PART.GOLD, colour: GOLD, seed: 0.86 + i * 0.01, base, roofPart: PART.GOLD, roofColour: GOLD, solid: i === 0 });
  });
}

/** Babylon, for createCity. Its one lit room is the furnace: the light of the fire on its own walls. */
export const BABYLON = {
  name: 'babylon',
  stone: BRICK,
  plasters: PLASTERS,
  gate,
  inside,
  outside: image,
  rooms: {
    furnace: (() => {
      const [u0, v0, u1, v1] = IN_BABYLON.furnace;
      const T2 = IN_BABYLON.furnaceWall;
      return { u: CITY.at[0] + (u0 + u1) / 2, v: CITY.at[1] + (v0 + v1) / 2, half: [(u1 - u0) / 2 - T2 + 0.05, (v1 - v0) / 2 - T2 + 0.05], up: 2.4, reach: 15, shade: 0.5 };
    })(),
  },
  room: 'furnace',
};
