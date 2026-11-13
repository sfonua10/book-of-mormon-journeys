// Babylon, for the journeys told there (Daniel 3, and Daniel 6), on its own river plain (world.js, the 'plain' land). It is a
// `look` for createCity (city.js), made with the same boxes, so what is seen is also what is walked against.
//
// What is known of it about 600 BC, and so what is built (the README says what is a guess):
//   - a city of brick: sun-dried brick plastered with mud for houses, baked brick laid in bitumen for walls, its
//     colour the buff of the brick; glazed brick only on its great works
//   - its walls set close with towers, and their tops stepped (as the walls are drawn now; none has survived to
//     show it)
//   - the Ishtar Gate: towers faced with blue glaze, rows of bulls and of dragons walking on it, never mixed in one
//     row; the Processional Way through it, paved with slabs of pale limestone edged with red stone, between walls
//     of blue glaze with lions walking along them towards the gate
//   - the king's house, its front glazed with yellow columns and palmettes on blue, and a frieze of lions
//   - the temple tower in stages, its shrine at the top faced with blue
//   - houses round their own courts, flat-roofed, their walls blind to the street
// On the plain of Dura before the gate, as Daniel 3 tells it: the image of gold, "whose height was threescore cubits,
// and the breadth thereof six cubits" (3:1), 27.4 m by 2.74 m; the king's seat; and the burning fiery furnace, a
// kiln of brick with a door in its side (3:26) and an opening at its top.
import { PLAIN } from './places.js';
import { footing, ground, house, MOTIF, PART, ROOF, WOOD } from './city.js';

// baked brick; the mud plaster of houses; gold; brick blackened by fire; the limestone of the road and its red edge
const BRICK = [0.72, 0.58, 0.42];
const GOLD = [1.0, 0.76, 0.28];
const SOOT = [0.3, 0.22, 0.17];
const LIME = [0.86, 0.82, 0.72];
const RED = [0.6, 0.34, 0.28];
const PURPLE = [0.27, 0.05, 0.14];
const WHITE = [1, 1, 1];
const PLASTERS = [
  [0.74, 0.62, 0.46],
  [0.68, 0.56, 0.41],
  [0.79, 0.67, 0.5],
  [0.64, 0.52, 0.38],
  [0.71, 0.59, 0.43],
  [0.76, 0.66, 0.52],
];

/**
 * Where its things are. On the plain in (u, v), as places.js has them; within the walls in metres from the city's
 * middle (cu, cv).
 */
export const IN_BABYLON = {
  /** The image of gold; it looks towards the city (+u). */
  image: PLAIN.image,
  /** The king's seat, on its dais; and where he stands before it, facing +v. */
  seat: PLAIN.seat.at,
  king: [PLAIN.seat.at[0], PLAIN.seat.at[1] + 1.4],
  /** The furnace: its middle, and its door (its mouth) on its -v face. */
  kiln: PLAIN.kiln.at,
  mouth: [PLAIN.kiln.at[0], PLAIN.kiln.at[1] - PLAIN.kiln.half[1]],
  /** How thick the furnace's walls are, and how high. */
  furnaceWall: 1.4,
  furnaceTall: 8.5,
  /** Within the walls: the king's house [cu0, cv0, cu1, cv1], fronting the street that runs from the gate. */
  palace: [26, 8, 60, 44],
  /** The temple tower and the stair up it, [cu0, cv0, cu1, cv1]; its base is 40 m square, its stair on its west. */
  tower: [6, -47, 61, -5],
  /** The gate: how far its towers stand out before the wall (-u) and into the city (+u), how wide, how tall. */
  gate: { out: 5, into: 7, wide: 10, tall: 16 },
  /** The walls of the Processional Way outside the gate: from u, to the gate's face; how far from the road's middle. */
  lionWalls: { from: 212, at: 10, thick: 2, tall: 7 },
};

const brick = (seed, base, extra = {}) => ({ part: PART.BRICK, colour: BRICK, seed, base, roofPart: PART.BRICK, roofColour: BRICK, ...extra });
/** A face of glazed brick: on side `side` of a box whose face lies at `plane`, from `a` to `c` along it (v for a
 * west or east face, u for a south or north one). */
const glaze = (b, side, plane, a, c, yLo, yHi, base, motif) => b.patch(side, plane, (a + c) / 2, Math.abs(c - a), yLo, yHi, base, PART.GLAZE, WHITE, motif + 0.37);

/** Stepped battlements along the top of a run of wall, from (u0, v0) to (u1, v1) (one of them the same), at `top`. */
function stepped(b, u0, v0, u1, v1, top, base, alongU) {
  const len = alongU ? Math.abs(u1 - u0) : Math.abs(v1 - v0);
  const n = Math.max(1, Math.floor(len / 2.4));
  for (let i = 0; i < n; i++) {
    const s = (alongU ? Math.min(u0, u1) : Math.min(v0, v1)) + (i + 0.5) * (len / n);
    for (const [w, y0, y1] of [[0.6, 0, 0.6], [0.32, 0.6, 1.25]]) {
      if (alongU) b.box(s - w, s + w, v0 - 0.45, v0 + 0.45, top + y0, top + y1, brick(0.3, base, { solid: false }));
      else b.box(u0 - 0.45, u0 + 0.45, s - w, s + w, top + y0, top + y1, brick(0.3, base, { solid: false }));
    }
  }
}

/** A road of limestone slabs from (u0, v0) to (u1, v1), with a band of red stone along each side `edge` wide. */
function paving(b, u0, u1, v0, v1, edge = 0) {
  // (laid in pieces a few metres square, each corner on the ground, so it lies on the land however it lies)
  const lay = (a, c, d, e, colour, seed) => {
    const y = (p, q) => ground(p, q) + 0.05;
    for (let u = a; u < c - 0.01; u += 3) {
      const n = Math.min(c, u + 3);
      for (let v = d; v < e - 0.01; v += 2.5) {
        const w = Math.min(e, v + 2.5);
        b.quad([[u, y(u, v), v], [u, y(u, w), w], [n, y(n, w), w], [n, y(n, v), v]], [0, 1, 0], PART.PAVE, colour, [[u, v], [u, w], [n, w], [n, v]], seed);
      }
    }
  };
  lay(u0, u1, v0 + edge, v1 - edge, LIME, 0.21);
  if (edge > 0) {
    lay(u0, u1, v0, v0 + edge, RED, 0.43);
    lay(u0, u1, v1 - edge, v1, RED, 0.47);
  }
}

/**
 * The Ishtar Gate: two towers either side of the gateway standing out before the wall and back into the city, and
 * the block over the gateway between them, its opening arched; all faced with blue glaze, bulls and dragons walking
 * on it towards the gateway, with stepped battlements. Then the Processional Way out from it between its walls of
 * lions, and in through it and up the street.
 */
function gate(b, { cu, cv, hu, gw }) {
  const G = IN_BABYLON.gate;
  const u0 = cu - hu - G.out;
  const u1 = cu - hu + G.into;
  const base = footing(u0, u1, cv - gw - G.wide, cv + gw + G.wide);
  const top = base + G.tall;
  // (the rosettes run in a band a metre high, on the metre, as their pattern is laid)
  const band = base + G.tall - 2;
  for (const side of [-1, 1]) {
    const [d, e] = side < 0 ? [cv - gw - G.wide, cv - gw] : [cv + gw, cv + gw + G.wide];
    b.box(u0, u1, d, e, base - 1.6, top, brick(0.61 + side * 0.01, base));
    // (they walk towards the gateway: on the front, on the faces of the passage, on the back)
    const toward = side > 0 ? MOTIF.GATE : MOTIF.GATE_BACK;
    glaze(b, 'w', u0, d, e, base + 0.3, band, base, toward);
    glaze(b, 'e', u1, d, e, base + 0.3, band, base, side > 0 ? MOTIF.GATE_BACK : MOTIF.GATE);
    if (side < 0) glaze(b, 'n', e, u0, u1, base + 0.3, band, base, MOTIF.GATE_BACK);
    else glaze(b, 's', d, u0, u1, base + 0.3, band, base, MOTIF.GATE);
    for (const [plane, s] of [[u0, 'w'], [u1, 'e']]) {
      glaze(b, s, plane, d, e, band, band + 1, base, MOTIF.ROSETTES);
      glaze(b, s, plane, d, e, band + 1, top - 0.1, base, MOTIF.PLAIN);
    }
    stepped(b, u0 + 0.45, d, u0 + 0.45, e, top, base, false);
    stepped(b, u1 - 0.45, d, u1 - 0.45, e, top, base, false);
  }
  // the block over the gateway, from the top of the arch up; the arch drawn dark into its faces, ringed with gold
  const spring = base + 5.6;
  b.box(u0, u1, cv - gw, cv + gw, spring, top, brick(0.64, base));
  b.quad([[u0, spring, cv - gw], [u1, spring, cv - gw], [u1, spring, cv + gw], [u0, spring, cv + gw]], [0, -1, 0], PART.DARK, BRICK, [[0, 0], [1, 0], [1, 1], [0, 1]], 0.64);
  for (const [plane, s, sign] of [[u0, 'w', -1], [u1, 'e', 1]]) {
    glaze(b, s, plane, cv - gw, cv + gw, spring, band, base, MOTIF.PLAIN);
    glaze(b, s, plane, cv - gw, cv + gw, band, band + 1, base, MOTIF.ROSETTES);
    glaze(b, s, plane, cv - gw, cv + gw, band + 1, top - 0.1, base, MOTIF.PLAIN);
    // the arch: a half round of dark over the gateway, ringed with gold, a little proud of the glaze
    const x = plane + sign * 0.08;
    const n = 14;
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI;
      const a1 = ((k + 1) / n) * Math.PI;
      const pt = (a, r) => [x, spring + Math.sin(a) * r, cv + Math.cos(a) * r];
      b.tri([pt(a0, 0), pt(a0, gw - 0.3), pt(a1, gw - 0.3)], [sign, 0, 0], PART.DARK, BRICK, [[0, 0], [0, 1], [1, 1]], 0.65);
      b.quad([pt(a0, gw - 0.3), pt(a0, gw), pt(a1, gw), pt(a1, gw - 0.3)], [sign, 0, 0], PART.GOLD, GOLD, [[0, 0], [0, 1], [1, 1], [1, 0]], 0.66);
    }
  }
  stepped(b, u0 + 0.45, cv - gw, u0 + 0.45, cv + gw, top, base, false);
  stepped(b, u1 - 0.45, cv - gw, u1 - 0.45, cv + gw, top, base, false);

  // the walls of the Processional Way, outside the gate, lions walking along them towards it
  const L = IN_BABYLON.lionWalls;
  for (const side of [-1, 1]) {
    const inner = cv + side * L.at;
    const outer = cv + side * (L.at + L.thick);
    const [d, e] = side < 0 ? [outer, inner] : [inner, outer];
    const wb = footing(L.from, u0, d, e);
    b.box(L.from, u0, d, e, wb - 1.6, wb + L.tall, brick(0.7 + side * 0.01, wb));
    const face = side > 0 ? 's' : 'n';
    glaze(b, face, inner, L.from, u0, wb + 0.25, wb + 3.6, wb, side > 0 ? MOTIF.LIONS : MOTIF.LIONS_BACK);
    glaze(b, face, inner, L.from, u0, wb + 3.6, wb + 4.0, wb, MOTIF.PLAIN);
    glaze(b, face, inner, L.from, u0, wb + 4.0, wb + 5.0, wb, MOTIF.ROSETTES);
    glaze(b, face, inner, L.from, u0, wb + 5.0, wb + L.tall - 0.1, wb, MOTIF.PLAIN);
    stepped(b, L.from, inner + side * 0.45, u0, inner + side * 0.45, wb + L.tall, wb, true);
  }
  // the road: between the lion walls, through the gateway, the little square inside it, and up the street
  paving(b, L.from, u0, cv - L.at, cv + L.at, 1.4);
  paving(b, u0, u1, cv - gw, cv + gw, 0.6);
  paving(b, u1, cu - 46, cv - 13, cv + 13, 1.2);
  paving(b, cu - 46, cu + 22, cv - 3.5, cv + 3.5, 0.8);
}

/** Within the walls: the king's house, its front glazed; and the temple tower. */
function inside(b, random, { S, cu, cv }) {
  // the king's house: tall and blind, its door on the street; its front glazed, lions walking along its foot,
  // yellow columns with palmettes above them, a band of rosettes under the parapet
  {
    const [u0, v0, u1, v1] = IN_BABYLON.palace;
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const base = house(b, random, a, c, d, e, 12, { colour: [0.82, 0.72, 0.56], windows: '', door: null, seed: 0.91 });
    const door = (a + c) / 2;
    const dw = 2.2;
    for (const [p, q] of [[a + 0.6, door - dw], [door + dw, c - 0.6]]) {
      glaze(b, 's', d, p, q, base + 0.2, base + 3.3, base, MOTIF.LIONS);
      glaze(b, 's', d, p, q, base + 3.3, base + 9.6, base, MOTIF.PALMETTES);
    }
    glaze(b, 's', d, a + 0.6, c - 0.6, base + 9.6, base + 10, base, MOTIF.PLAIN);
    glaze(b, 's', d, a + 0.6, c - 0.6, base + 10, base + 11, base, MOTIF.ROSETTES);
    glaze(b, 's', d, door - dw, door + dw, base + 6.4, base + 9.6, base, MOTIF.PLAIN);
    b.patch('s', d, door, dw * 2, base - 0.1, base + 6.4, base, PART.DARK, BRICK, 0.92);
    b.box(door - dw - 0.5, door + dw + 0.5, d - 0.4, d, base + 6.4, base + 6.9, { part: PART.GOLD, colour: GOLD, seed: 0.93, base, solid: false, roofPart: PART.GOLD, roofColour: GOLD });
  }
  // The temple tower: stages of brick, each smaller than the one under it, with a stair up its west face to the
  // first; the shrine at its top faced with blue glaze and banded with gold. (Its real base was some 91 m square,
  // and how high it rose is not known: this one is smaller, to stand within these walls.)
  {
    const [cu0, cv0, cu1, cv1] = IN_BABYLON.tower;
    const mu = cu + (cu0 + 14 + cu1) / 2;
    const mv = cv + (cv0 + cv1) / 2;
    const base = footing(mu - 20, mu + 20, mv - 20, mv + 20);
    let y = base;
    const stages = [[20, 9], [16.5, 7], [13.5, 6], [11, 5], [8.6, 4.5], [6.6, 4]];
    stages.forEach(([h, tall], i) => {
      b.box(mu - h, mu + h, mv - h, mv + h, y - (i ? 0.2 : 1.6), y + tall, brick(0.8 + i * 0.02, base));
      // (pilasters of brick standing out a little along each face, as such towers had)
      for (let k = -2; k <= 2; k++) {
        const at = (k / 2.5) * h;
        for (const [p0, p1, q0, q1] of [[mu - h - 0.3, mu - h, mv + at - 0.7, mv + at + 0.7], [mu + h, mu + h + 0.3, mv + at - 0.7, mv + at + 0.7], [mu + at - 0.7, mu + at + 0.7, mv - h - 0.3, mv - h], [mu + at - 0.7, mu + at + 0.7, mv + h, mv + h + 0.3]]) {
          b.box(p0, p1, q0, q1, y, y + tall - 0.4, brick(0.85, base, { solid: false }));
        }
      }
      y += tall;
    });
    // the shrine
    const s = 4.6;
    const sb = y;
    b.box(mu - s, mu + s, mv - s, mv + s, sb - 0.2, sb + 5, { part: PART.GLAZE, colour: WHITE, seed: MOTIF.PLAIN + 0.37, base: sb, roofPart: PART.GOLD, roofColour: GOLD });
    b.box(mu - s - 0.2, mu + s + 0.2, mv - s - 0.2, mv + s + 0.2, sb + 4.2, sb + 4.8, { part: PART.GOLD, colour: GOLD, seed: 0.88, base: sb, solid: false, roofPart: PART.GOLD, roofColour: GOLD });
    b.patch('w', mu - s, mv, 1.6, sb, sb + 3, sb, PART.DARK, BRICK, 0.89);
    stepped(b, mu - s + 0.45, mv - s, mu - s + 0.45, mv + s, sb + 5, sb, false);
    stepped(b, mu + s - 0.45, mv - s, mu + s - 0.45, mv + s, sb + 5, sb, false);
    // the stair, up the west face to the top of the first stage
    const [s0, s1] = [mu - 20 - 14, mu - 20];
    const [w0, w1] = [mv - 3, mv + 3];
    const rise = base + stages[0][1];
    const g0 = ground(s0, mv) + 0.05;
    b.quad([[s0, g0, w0], [s0, g0, w1], [s1, rise, w1], [s1, rise, w0]], [-0.54, 0.84, 0], PART.PAVE, LIME, [[0, w0], [0, w1], [16.6, w1], [16.6, w0]], 0.9);
    for (const v of [w0 - 0.6, w1]) {
      b.quad([[s0, g0 - 0.6, v], [s1, rise - 0.6, v], [s1, rise + 0.8, v], [s0, g0 + 0.8, v]], [0, 0, v < mv ? -1 : 1], PART.BRICK, BRICK, [[s0, 0], [s1, 9], [s1, 10.4], [s0, 1.4]], 0.91);
      b.quad([[s0, g0 - 0.6, v + 0.6], [s1, rise - 0.6, v + 0.6], [s1, rise + 0.8, v + 0.6], [s0, g0 + 0.8, v + 0.6]], [0, 0, v < mv ? 1 : -1], PART.BRICK, BRICK, [[s0, 0], [s1, 9], [s1, 10.4], [s0, 1.4]], 0.91);
      b.quad([[s0, g0 + 0.8, v], [s1, rise + 0.8, v], [s1, rise + 0.8, v + 0.6], [s0, g0 + 0.8, v + 0.6]], [-0.54, 0.84, 0], PART.BRICK, BRICK, [[s0, v], [s1, v], [s1, v + 0.6], [s0, v + 0.6]], 0.91);
    }
  }
}

/**
 * The image of gold on the plain (3:1): a robed figure on a tall base, all of gold, 27.4 m from the foot of the base
 * to the top of its head, 2.74 m across at its broadest. The verse gives its height and breadth and nothing of what
 * it was the image of: it is given a man's robed shape, a tall cap and no face. It stands on a footing of brick,
 * looking towards the city.
 */
function image(b) {
  const [iu, iv] = IN_BABYLON.image;
  const base = footing(iu - 4.5, iu + 4.5, iv - 4.5, iv + 4.5);
  const gold = (seed) => ({ part: PART.GOLD, colour: GOLD, seed, base, roofPart: PART.GOLD, roofColour: GOLD });
  // the footing: two steps of brick, a course of blue glaze round the upper
  b.box(iu - 4.5, iu + 4.5, iv - 4.5, iv + 4.5, base - 1.5, base + 0.5, brick(0.84, base));
  b.box(iu - 3.3, iu + 3.3, iv - 3.3, iv + 3.3, base + 0.5, base + 1.2, { ...brick(0.85, base), roofPart: PART.STONE, roofColour: [0.7, 0.62, 0.5] });
  for (const [s, plane, a, c] of [['w', iu - 3.3, iv - 3.3, iv + 3.3], ['e', iu + 3.3, iv - 3.3, iv + 3.3], ['s', iv - 3.3, iu - 3.3, iu + 3.3], ['n', iv + 3.3, iu - 3.3, iu + 3.3]]) glaze(b, s, plane, a, c, base + 0.55, base + 1.15, base, MOTIF.PLAIN);
  // the base, 6 cubits broad at its foot and its head, a little narrower between
  const y0 = base + 1.2;
  b.box(iu - 1.37, iu + 1.37, iv - 1.37, iv + 1.37, y0, y0 + 1.6, gold(0.86));
  b.box(iu - 1.15, iu + 1.15, iv - 1.15, iv + 1.15, y0 + 1.6, y0 + 13.6, { ...gold(0.87), solid: false });
  b.box(iu - 1.25, iu + 1.25, iv - 1.25, iv + 1.25, y0 + 13.6, y0 + 14.2, { ...gold(0.88), solid: false });
  b.box(iu - 1.37, iu + 1.37, iv - 1.37, iv + 1.37, y0 + 14.2, y0 + 15.2, { ...gold(0.89), solid: false });
  // the figure, 11 m from its hem to the top of its cap: a long robe, the arms bent, the hands together before it
  const f = y0 + 15.2;
  b.turned(iu, iv, f, [[1.1, 0], [1.06, 0.5], [0.98, 3.4], [0.94, 5.8], [1.0, 7.0], [1.12, 7.7], [1.0, 8.15], [0.42, 8.45], [0.3, 8.6]], 16, PART.GOLD, GOLD, 0.9, 0.62);
  b.turned(iu, iv, f + 8.5, [[0.3, 0], [0.48, 0.25], [0.55, 0.75], [0.5, 1.2], [0.36, 1.4]], 12, PART.GOLD, GOLD, 0.91, 0.95);
  b.turned(iu, iv, f + 9.75, [[0.5, 0], [0.56, 0.35], [0.5, 0.95], [0.26, 1.18], [0, 1.25]], 12, PART.GOLD, GOLD, 0.92, 0.95);
  b.turned(iu, iv, f + 0.05, [[1.14, 0], [1.14, 0.35]], 16, PART.GOLD, [0.88, 0.62, 0.22], 0.93, 0.62);
  for (const side of [-1, 1]) {
    // upper arm, hanging; forearm, forward; and between the two forearms the hands, clasped
    b.box(iu - 0.34, iu + 0.34, iv + side * 0.98 - 0.25, iv + side * 0.98 + 0.25, f + 5.0, f + 7.85, { ...gold(0.94), solid: false });
    b.box(iu - 0.2, iu + 0.95, iv + side * 0.62 - 0.3, iv + side * 0.62 + 0.3, f + 4.9, f + 5.55, { ...gold(0.95), solid: false });
  }
  b.box(iu + 0.6, iu + 1.15, iv - 0.42, iv + 0.42, f + 4.75, f + 5.7, { ...gold(0.96), solid: false });
}

/**
 * The king's seat: a dais (the land is raised under it, world.js), faced with brick and spread with purple; on it
 * the seat, high-backed, of gold and blue; over it a canopy of purple on posts of gold.
 */
function seat(b) {
  const { at: [su, sv], half: [hu, hv], rise } = PLAIN.seat;
  const base = PLAIN.level;
  const top = base + rise;
  b.box(su - hu - 0.15, su + hu + 0.15, sv - hv - 0.15, sv + hv + 0.15, base - 0.6, top, brick(0.5, base, { top: false }));
  b.quad([[su - hu, top + 0.03, sv - hv], [su - hu, top + 0.03, sv + hv], [su + hu, top + 0.03, sv + hv], [su + hu, top + 0.03, sv - hv]], [0, 1, 0], PART.CLOTH, PURPLE, [[su - hu, sv - hv], [su - hu, sv + hv], [su + hu, sv + hv], [su + hu, sv - hv]], 0.51);
  // a step before it
  b.box(su - 2.4, su + 2.4, sv + hv + 0.15, sv + hv + 1.0, base - 0.3, base + rise / 2, brick(0.52, base, { solid: false }));
  // the seat, at the back of the dais, facing +v
  const back = sv - hv + 0.5;
  b.box(su - 0.85, su + 0.85, back, back + 1.1, top, top + 0.55, { part: PART.GOLD, colour: GOLD, seed: 0.53, base: top, roofPart: PART.CLOTH, roofColour: PURPLE });
  b.box(su - 0.95, su + 0.95, back - 0.3, back, top, top + 3.2, { part: PART.GLAZE, colour: WHITE, seed: MOTIF.PLAIN + 0.37, base: top, roofPart: PART.GOLD, roofColour: GOLD });
  for (const side of [-1, 1]) b.box(su + side * 0.95 - 0.12, su + side * 0.95 + 0.12, back - 0.3, back + 1.1, top, top + 1.0, { part: PART.GOLD, colour: GOLD, seed: 0.54, base: top, roofPart: PART.GOLD, roofColour: GOLD });
  // the canopy
  const [c0, c1, d0, d1] = [su - 3.6, su + 3.6, sv - hv + 0.1, sv + 1.2];
  const ch = top + 4.4;
  for (const [u, v] of [[c0, d0], [c1, d0], [c0, d1], [c1, d1]]) b.box(u - 0.11, u + 0.11, v - 0.11, v + 0.11, top - 0.1, ch, { part: PART.GOLD, colour: GOLD, seed: 0.55, base: top, solid: false });
  b.quad([[c0 - 0.3, ch, d0 - 0.3], [c0 - 0.3, ch + 0.5, (d0 + d1) / 2], [c1 + 0.3, ch + 0.5, (d0 + d1) / 2], [c1 + 0.3, ch, d0 - 0.3]], [0, 1, -0.6], PART.CLOTH, PURPLE, [[c0, 0], [c0, 1], [c1, 1], [c1, 0]], 0.56);
  b.quad([[c0 - 0.3, ch + 0.5, (d0 + d1) / 2], [c0 - 0.3, ch, d1 + 0.3], [c1 + 0.3, ch, d1 + 0.3], [c1 + 0.3, ch + 0.5, (d0 + d1) / 2]], [0, 1, 0.6], PART.CLOTH, PURPLE, [[c0, 1], [c0, 2], [c1, 2], [c1, 1]], 0.57);
  // its hem, hanging a little all round, gold
  for (const [p0, q0, p1, q1, n] of [[c0 - 0.3, d0 - 0.3, c1 + 0.3, d0 - 0.3, [0, 0, -1]], [c0 - 0.3, d1 + 0.3, c1 + 0.3, d1 + 0.3, [0, 0, 1]]]) {
    b.quad([[p0, ch - 0.45, q0], [p1, ch - 0.45, q1], [p1, ch, q1], [p0, ch, q0]], n, PART.GOLD, GOLD, [[0, 0], [1, 0], [1, 1], [0, 1]], 0.58);
  }
}

/**
 * The burning fiery furnace: a great kiln of brick on the plain, blackened by its fire, open at its top, with a door
 * in its side towards the king's seat (3:26: "came near to the mouth of the burning fiery furnace"), and a ramp of
 * earth and brick up its back to the top, by which it is fed. Its walls within and its floor burn (they are drawn as
 * flame); what else burns in it is the story's to show (daniel.js).
 */
function kiln(b, random) {
  const { at: [ku, kv], half: [hu, hv] } = PLAIN.kiln;
  const [a, c, d, e] = [ku - hu, ku + hu, kv - hv, kv + hv];
  const base = footing(a, c, d, e);
  const T2 = IN_BABYLON.furnaceWall;
  const top = base + IN_BABYLON.furnaceTall;
  const wall = brick(0.95, base, { colour: SOOT, roofColour: SOOT });
  const mouth = ku;
  const hw = 1.8;
  const tall = 4.2;
  // the walls, the front one in two with the door between and the wall over it; above the height of the door they
  // step in, so that it stands broad at its foot and narrower above, as a kiln is built
  const step = base + 5;
  const k = 0.7;
  b.box(a, c, e - T2, e, base - 1.6, step, wall);
  b.box(a, a + T2, d + T2, e - T2, base - 1.6, step, wall);
  b.box(c - T2, c, d + T2, e - T2, base - 1.6, step, wall);
  b.box(a, mouth - hw, d, d + T2, base - 1.6, step, wall);
  b.box(mouth + hw, c, d, d + T2, base - 1.6, step, wall);
  b.box(mouth - hw, mouth + hw, d, d + T2, base + tall, step, wall);
  b.box(a + k, c - k, e - T2, e - k, step, top, wall);
  b.box(a + k, a + T2, d + T2, e - T2, step, top, wall);
  b.box(c - T2, c - k, d + T2, e - T2, step, top, wall);
  b.box(a + k, c - k, d + k, d + T2, step, top, wall);
  b.quad([[mouth - hw, base + tall, d], [mouth + hw, base + tall, d], [mouth + hw, base + tall, d + T2], [mouth - hw, base + tall, d + T2]], [0, -1, 0], PART.DARK, SOOT, [[0, 0], [1, 0], [1, 1], [0, 1]], 0.95);
  // its rim, a little wider than its walls; the door's arch, scorched; a step of stone before it
  for (const [p0, p1, q0, q1] of [[a + k - 0.3, c - k + 0.3, d + k - 0.3, d + T2], [a + k - 0.3, c - k + 0.3, e - T2, e - k + 0.3], [a + k - 0.3, a + T2, d + k, e - k], [c - T2, c - k + 0.3, d + k, e - k]]) {
    b.box(p0, p1, q0, q1, top, top + 0.5, { ...wall, solid: false });
  }
  // (the fire's smoke has blackened the brick over the door, a little)
  b.patch('s', d, mouth, hw * 2 + 0.6, base + tall, base + tall + 0.35, base, PART.DARK, SOOT, 0.95);
  b.box(mouth - hw - 0.6, mouth + hw + 0.6, d - 0.8, d, base - 0.6, ground(mouth, d - 0.4) + 0.08, { ...wall, colour: [0.6, 0.55, 0.46], solid: false });
  // the ramp up its back
  const [r0, r1] = [ku - 2.8, ku + 2.8];
  const foot = e + 18;
  const g0 = ground(ku, foot) + 0.05;
  b.quad([[r0, top, e], [r1, top, e], [r1, g0, foot], [r0, g0, foot]], [0, 0.9, 0.44], PART.BRICK, [0.62, 0.5, 0.38], [[r0, 0], [r1, 0], [r1, 20], [r0, 20]], 0.96);
  for (const [u, n] of [[r0, -1], [r1, 1]]) b.tri([[u, base - 0.4, e], [u, top, e], [u, g0 - 0.4, foot]], [n, 0, 0], PART.BRICK, [0.62, 0.5, 0.38], [[e, 0], [e, 8.5], [foot, 0]], 0.97);
  // the fire: every wall within, in strips that flicker each in its own time, and the floor in squares
  const [i0, i1, j0, j1] = [a + T2, c - T2, d + T2, e - T2];
  const n = 7;
  const wu = (i1 - i0) / n;
  const wv = (j1 - j0) / n;
  for (let k = 0; k < n; k++) {
    b.patch('s', j1, i0 + (k + 0.5) * wu, wu, base - 0.2, base + 4.6 + random() * 2, base, PART.LAMP, BRICK, random());
    if (Math.abs(i0 + (k + 0.5) * wu - mouth) > hw + 0.6) b.patch('n', j0, i0 + (k + 0.5) * wu, wu, base - 0.2, base + 3.6 + random() * 1.6, base, PART.LAMP, BRICK, random());
    b.patch('e', i0, j0 + (k + 0.5) * wv, wv, base - 0.2, base + 4.6 + random() * 2, base, PART.LAMP, BRICK, random());
    b.patch('w', i1, j0 + (k + 0.5) * wv, wv, base - 0.2, base + 4.6 + random() * 2, base, PART.LAMP, BRICK, random());
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

/**
 * Where the things of Daniel 6 are, on the plain before the gate, in (u, v). Nothing is told of where Daniel's house
 * stood, or the den, or where the king sat: they are put where the image and the furnace of Daniel 3 stood, a
 * lifetime before, and the king's seat is where it was.
 */
export const IN_DARIUS = {
  /**
   * Daniel's house: one room, its windows in the wall towards the going down of the sun (+u, as the sun goes in this
   * land: sky.js), its door in its -v wall. u and v: its footprint; how thick its walls are; how high its ceiling;
   * the door (where along u, half its width, its height); the windows (where along v, half their width, the height
   * of their sills and of their heads).
   */
  house: { u: [131, 141], v: [-7, 7], wall: 0.6, tall: 3.6, door: { at: 134.4, half: 0.85, tall: 2.3 }, windows: [-3.6, 0, 3.6], windowHalf: 0.8, sill: 0.85, lintel: 2.45 },
  /**
   * The den of lions: walled with brick and roofed, with a mouth in the middle of its roof that a stone is laid
   * upon (6:17). Its middle; its half-sizes; how thick its walls are; how high its roof is within, and how thick;
   * how wide its mouth is.
   */
  den: { at: PLAIN.kiln.at, half: [11, 9], wall: 1.4, tall: 4.8, slab: 0.8, mouth: 3.2 },
};

/**
 * The den of lions (Daniel 6:16–17, 6:23–24): "cast him into the den", "the mouth of the den", "take Daniel up out
 * of the den", "the bottom of the den". So it is made a place gone down into from above: four thick walls of brick
 * and a roof over them, with one opening in the roof, its mouth, and a ramp up its side to the roof. Within there is
 * nothing but its floor of trodden earth. What such a den was is not known (the README says so); kings of Assyria
 * and Babylon did keep lions.
 */
function den(b) {
  const { at: [mu, mv], half: [hu, hv], wall: T, tall, slab, mouth } = IN_DARIUS.den;
  const [a, c, d, e] = [mu - hu, mu + hu, mv - hv, mv + hv];
  const base = footing(a, c, d, e);
  const top = base + tall;
  const roof = top + slab;
  const DARK = [0.5, 0.41, 0.32];
  const wall = brick(0.94, base, { colour: DARK, roofColour: [0.62, 0.52, 0.4] });
  b.box(a, c, d, d + T, base - 1.6, roof, wall);
  b.box(a, c, e - T, e, base - 1.6, roof, wall);
  b.box(a, a + T, d + T, e - T, base - 1.6, roof, wall);
  b.box(c - T, c, d + T, e - T, base - 1.6, roof, wall);
  // the roof: four slabs round the mouth, each with its underside (which is the den's ceiling)
  const m = mouth / 2;
  for (const [p0, p1, q0, q1] of [[a + T, c - T, d + T, mv - m], [a + T, c - T, mv + m, e - T], [a + T, mu - m, mv - m, mv + m], [mu + m, c - T, mv - m, mv + m]]) {
    b.box(p0, p1, q0, q1, top, roof, wall);
    b.quad([[p0, top, q0], [p1, top, q0], [p1, top, q1], [p0, top, q1]], [0, -1, 0], PART.BRICK, [0.36, 0.3, 0.25], [[p0, q0], [p1, q0], [p1, q1], [p0, q1]], 0.94);
  }
  // its floor, of trodden earth: laid over the ground, so that it is as dark as the den is (the ground itself is
  // lit by the open sky, roof or no roof)
  const f = base + 0.04;
  b.quad([[a + T, f, d + T], [a + T, f, e - T], [c - T, f, e - T], [c - T, f, d + T]], [0, 1, 0], PART.ROOF, [0.5, 0.42, 0.33], [[a, d], [a, e], [c, e], [c, d]], 0.92);
  // a low kerb of stone at the roof's edge, all round
  for (const [p0, p1, q0, q1] of [[a, c, d, d + 0.5], [a, c, e - 0.5, e], [a, a + 0.5, d + 0.5, e - 0.5], [c - 0.5, c, d + 0.5, e - 0.5]]) {
    b.box(p0, p1, q0, q1, roof, roof + 0.4, { part: PART.STONE, colour: [0.7, 0.64, 0.54], seed: 0.93, base: roof, solid: false, roofPart: PART.STONE, roofColour: [0.7, 0.64, 0.54] });
  }
  // the ramp up to the roof, on the side towards the king's seat (-v), by which one is brought to its mouth
  const [r0, r1] = [mu - 2.6, mu + 2.6];
  const foot = d - 12;
  const g0 = ground(mu, foot) + 0.05;
  b.quad([[r0, roof, d], [r0, g0, foot], [r1, g0, foot], [r1, roof, d]], [0, 0.9, -0.44], PART.BRICK, [0.62, 0.5, 0.38], [[r0, 0], [r0, 13.3], [r1, 13.3], [r1, 0]], 0.96);
  for (const [u, n] of [[r0, -1], [r1, 1]]) b.tri([[u, base - 0.4, d], [u, roof, d], [u, g0 - 0.4, foot]], [n, 0, 0], PART.BRICK, [0.62, 0.5, 0.38], [[d, 0], [d, 5.6], [foot, 0]], 0.97);
}

/**
 * Daniel's house (6:10): "he went into his house; and his windows being open in his chamber toward Jerusalem".
 * One room that can be walked into by its door, with three windows in one wall that are truly open (the wall is
 * built in pieces round them), their shutters standing back; within, a mat before the middle window, a low table
 * with a lamp on it, jars, and a mat to sleep on.
 */
function chamber(b, random) {
  const { u: [u0, u1], v: [v0, v1], wall: T, tall, door, windows, windowHalf: wh, sill, lintel } = IN_DARIUS.house;
  const base = footing(u0, u1, v0, v1);
  const top = base + tall;
  const colour = PLASTERS[2];
  const seed = 0.42;
  const plaster = { colour, seed, base, roofPart: PART.PLASTER, roofColour: colour };
  const wood = { part: PART.WOOD, colour: WOOD, seed: 0.44, base, solid: false, roofPart: PART.WOOD, roofColour: WOOD };
  const [y0, y1] = [base - 1.6, top + 0.95];
  // the wall away from the windows (-u), and the +v wall, whole
  b.box(u0, u0 + T, v0, v1, y0, y1, plaster);
  b.box(u0 + T, u1, v1 - T, v1, y0, y1, plaster);
  // the -v wall, in two with the doorway between and the wall over it
  const over = base + door.tall;
  b.box(u0 + T, door.at - door.half, v0, v0 + T, y0, y1, plaster);
  b.box(door.at + door.half, u1, v0, v0 + T, y0, y1, plaster);
  b.box(door.at - door.half, door.at + door.half, v0, v0 + T, over, y1, plaster);
  b.quad([[door.at - door.half, over, v0], [door.at + door.half, over, v0], [door.at + door.half, over, v0 + T], [door.at - door.half, over, v0 + T]], [0, -1, 0], PART.WOOD, WOOD, [[0, 0], [1.7, 0], [1.7, T], [0, T]], 0.44);
  // (its door, of planks, standing open against the wall outside; a stone at its foot)
  b.box(door.at + door.half + 0.05, door.at + door.half + 0.13, v0 - door.half * 2, v0, base - 0.1, over - 0.06, wood);
  b.box(door.at - door.half - 0.3, door.at + door.half + 0.3, v0 - 0.5, v0 + T, base - 0.4, base + 0.06, { part: PART.STONE, colour: [0.7, 0.64, 0.54], seed: 0.45, base, solid: false, roofPart: PART.STONE, roofColour: [0.7, 0.64, 0.54] });
  // the wall of the windows (+u): piers, and at each window the wall under its sill and over its head
  let from = v0 + T;
  for (const w of windows) {
    b.box(u1 - T, u1, from, w - wh, y0, y1, plaster);
    b.box(u1 - T, u1, w - wh, w + wh, y0, base + sill, { ...plaster, roofPart: PART.WOOD, roofColour: WOOD });
    b.box(u1 - T, u1, w - wh, w + wh, base + lintel, y1, plaster);
    b.quad([[u1 - T, base + lintel, w - wh], [u1 - T, base + lintel, w + wh], [u1, base + lintel, w + wh], [u1, base + lintel, w - wh]], [0, -1, 0], PART.WOOD, WOOD, [[0, 0], [1.6, 0], [1.6, T], [0, T]], 0.44);
    // (its two shutters, of wood, standing open against the wall outside)
    for (const side of [-1, 1]) {
      const s0 = w + side * wh;
      b.box(u1 + 0.03, u1 + 0.1, Math.min(s0, s0 + side * wh), Math.max(s0, s0 + side * wh), base + sill, base + lintel, { ...wood, seed: 0.46 + side * 0.01 });
    }
    from = w + wh;
  }
  b.box(u1 - T, u1, from, v1 - T, y0, y1, plaster);
  // the roof, a parapet's height below the top of the walls; under it the ceiling's beams; a floor of beaten earth
  b.box(u0 + T, u1 - T, v0 + T, v1 - T, top, top + 0.4, { ...plaster, roofPart: PART.ROOF, roofColour: ROOF });
  b.quad([[u0 + T, top, v0 + T], [u1 - T, top, v0 + T], [u1 - T, top, v1 - T], [u0 + T, top, v1 - T]], [0, -1, 0], PART.WOOD, [0.34, 0.25, 0.17], [[u0, 0], [u1, 0], [u1, 6], [u0, 6]], seed);
  const f = base + 0.03;
  b.quad([[u0 + T, f, v0 + T], [u0 + T, f, v1 - T], [u1 - T, f, v1 - T], [u1 - T, f, v0 + T]], [0, 1, 0], PART.ROOF, [0.6, 0.5, 0.38], [[u0, v0], [u0, v1], [u1, v1], [u1, v0]], 0.47);
  // within: the mat he kneels on, before the middle window; a mat to sleep on; a low table with a lamp; jars
  const cloth = (p0, p1, q0, q1, lit, s) => b.box(p0, p1, q0, q1, base, base + 0.08, { part: PART.CLOTH, colour: lit.map((x) => x * 0.86), seed: s, base, solid: false, roofPart: PART.CLOTH, roofColour: lit });
  cloth(u1 - T - 2.6, u1 - T - 0.9, windows[1] - 0.6, windows[1] + 0.6, [0.6, 0.26, 0.2], 0.48);
  cloth(u0 + T + 0.3, u0 + T + 1.2, v1 - T - 2.6, v1 - T - 0.5, [0.46, 0.4, 0.3], 0.49);
  const [tu, tv] = [u0 + T + 0.7, v0 + T + 3.2];
  b.box(tu - 0.4, tu + 0.4, tv - 0.6, tv + 0.6, base - 0.2, base + 0.45, { ...wood, seed: 0.5 });
  b.box(tu - 0.07, tu + 0.07, tv - 0.07, tv + 0.07, base + 0.45, base + 0.56, { colour: [0.62, 0.4, 0.26], seed: 0.51, base, solid: false, roofPart: PART.LAMP, roofColour: [0.62, 0.4, 0.26] });
  const jar = (u, v, r, h) => b.box(u - r, u + r, v - r, v + r, base - 0.2, base + h, { colour: [0.62, 0.4, 0.26], seed: random(), base, solid: false, roofPart: PART.DARK });
  jar(u0 + T + 0.5, v0 + T + 0.5, 0.3, 0.95);
  jar(u0 + T + 1.25, v0 + T + 0.45, 0.24, 0.75);
  jar(u0 + T + 0.5, v1 - T - 0.45, 0.27, 0.85);
}

/** Babylon, for createCity. Its one lit room is the furnace: the light of the fire on its own walls. */
export const BABYLON = {
  name: 'babylon',
  stone: BRICK,
  plasters: PLASTERS,
  wallPart: PART.BRICK,
  stepped: true,
  towerEvery: 17,
  windows: false,
  glaze: true,
  reserve: [IN_BABYLON.palace, IN_BABYLON.tower],
  gate,
  inside,
  outside(b, random) {
    image(b);
    seat(b);
    kiln(b, random);
  },
  rooms: {
    furnace: (() => {
      const { at: [ku, kv], half: [hu, hv] } = PLAIN.kiln;
      const T2 = IN_BABYLON.furnaceWall;
      return { u: ku, v: kv, half: [hu - T2 + 0.05, hv - T2 + 0.05], up: 2.4, reach: 15, shade: 0 };
    })(),
  },
  room: 'furnace',
};

/**
 * Babylon as Daniel 6 has it, in the days of Darius: the same city, gate and king's seat, and on the plain, where the
 * image and the furnace stood, Daniel's house and the den of lions. Its rooms: his chamber (shaded by its roof; the
 * story brings light into it) and the den (as dark as the hour is).
 */
export const BABYLON_DARIUS = {
  ...BABYLON,
  outside(b, random) {
    seat(b);
    den(b);
    chamber(b, random);
  },
  rooms: {
    chamber: (() => {
      const { u: [u0, u1], v: [v0, v1], wall: T } = IN_DARIUS.house;
      return { u: (u0 + u1) / 2, v: (v0 + v1) / 2, half: [(u1 - u0) / 2 - T + 0.05, (v1 - v0) / 2 - T + 0.05], up: 1.3, reach: 0, shade: 0.5 };
    })(),
    den: (() => {
      const { at: [mu, mv], half: [hu, hv], wall: T } = IN_DARIUS.den;
      return { u: mu, v: mv, half: [hu - T + 0.05, hv - T + 0.05], up: 2.4, reach: 0, shade: 0.9 };
    })(),
  },
  room: 'chamber',
};
