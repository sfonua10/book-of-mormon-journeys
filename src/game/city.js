// Jerusalem, and the other buildings of the story: the city walls with their towers and gate, its flat-roofed houses
// in blocks between streets, Laban's house with its court, his treasury; outside, Lehi's house in the land of their
// inheritance and the brothers' tents. Painted like the valley's village (village.js): each face in the light or in
// shade with a clean turn between, brush dabs on the plaster, stone in courses on the walls. At night the windows
// that have a lamp behind them glow.
//
// Everything is laid out in the valley's own frame (u down it, v across, see world.js) and turned into the world at
// the end; the same boxes make the walls you see and the colliders you walk against.
import * as THREE from 'three';
import { COMMON } from '../lib/index.js';
import { fromValley, heightAt, HERO } from '../valley/world.js';
import { CAMP, CITY, IN_CITY, LEHI_HOUSE } from './places.js';

const [DX, DZ] = HERO;
/** The turn about +y that takes the valley's frame (u along x, v along z) to the world's. */
export const TURN = -Math.atan2(DZ, DX);

/** Ground height at (u, v). */
const ground = (u, v) => heightAt(...fromValley(u, v));

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// What each face is: the shader paints them differently.
const PART = { PLASTER: 0, ROOF: 1, DARK: 2, WOOD: 3, STONE: 4, CLOTH: 5, GOLD: 6, WINDOW: 7 };

const PLASTERS = [
  [0.86, 0.8, 0.68],
  [0.8, 0.73, 0.6],
  [0.9, 0.85, 0.74],
  [0.78, 0.69, 0.55],
  [0.84, 0.76, 0.62],
  [0.74, 0.7, 0.62],
];
// (Jerusalem stone: pale gold)
const STONE = [0.84, 0.74, 0.56];
const ROOF = [0.66, 0.58, 0.46];
const WOOD = [0.36, 0.24, 0.15];

const vertex = /* glsl */ `
${COMMON}
in vec3 aColor;
in vec4 aInfo;   // part, along the face (m), up the face from the ground (m), the building's own number
out vec3 vWorld;
out vec3 vNormal;
out vec3 vColor;
out vec4 vInfo;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vColor = aColor;
  vInfo = aInfo;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const fragment = /* glsl */ `
${COMMON}
uniform float uNight;     // 0 by day, 1 at night: lamps in the windows
layout(location = 0) out vec4 outC;
in vec3 vWorld;
in vec3 vNormal;
in vec3 vColor;
in vec4 vInfo;
void main() {
  vec3 N = normalize(vNormal);
  float part = vInfo.x;
  float run = vInfo.y;
  float up = vInfo.z;
  float seed = vInfo.w;
  float px = max(fwidth(run), fwidth(up));
  // in the light or out of it, with a clean turn between
  float lit = smoothstep(0.02, 0.12, dot(N, uSunDir)) * smoothstep(0.4, 0.8, cloudAt(vWorld.xz));
  float dabs = texture(tStrokes, vec2(run, up) / 6.0 + seed * 3.7).r - 0.5;
  float wash = texture(tNoise, vec2(run * 0.09 + seed * 5.0, up * 0.13)).r - 0.5;
  vec3 paint = vColor;
  vec3 glow = vec3(0.0);
  float alpha = 1.0;
  if (part < 0.5) {
    // plaster gone uneven: a darker, stained foot, damp climbing, patches where it has been mended
    paint *= 1.0 + dabs * 0.16 + wash * 0.18;
    paint *= mix(vec3(0.74, 0.7, 0.64), vec3(1.0), smoothstep(-0.2, 0.9, up));
    float patchy = texture(tNoise, vec2(run * 0.23 + seed, up * 0.31)).g;
    paint *= 1.0 - 0.08 * smoothstep(0.58, 0.68, patchy);
  } else if (part < 1.5) {
    // a flat roof of beaten earth and plaster
    paint *= 0.95 + dabs * 0.2 + wash * 0.2;
  } else if (part < 2.5) {
    paint = vec3(0.05, 0.045, 0.045);
  } else if (part < 3.5) {
    // planks, up and down, with iron studs on the gates
    float plank = fract(run * 2.6);
    paint *= (0.82 + 0.3 * hash12(vec2(floor(run * 2.6), seed))) * (1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.08, plank)) * (1.0 - smoothstep(0.03, 0.1, px)));
    paint *= 1.0 + dabs * 0.2;
  } else if (part < 4.5) {
    // dressed stone in courses, each block a touch its own tone, the joints drawn as a painter would: thin and dark
    float rows = up / 0.72;
    float course = floor(rows);
    float len = 1.25 + 0.6 * hash12(vec2(course, seed * 7.0));
    float block = floor(run / len + hash12(vec2(course, seed)) );
    float tone = hash12(vec2(block, course) + seed * 13.0);
    float fine = 1.0 - smoothstep(0.08, 0.2, px);
    paint *= mix(1.0, 0.86 + 0.26 * tone, fine);
    float jy = 1.0 - smoothstep(0.0, 0.05, min(fract(rows), 1.0 - fract(rows)) * 0.72);
    float jx = 1.0 - smoothstep(0.0, 0.05, min(fract(run / len), 1.0 - fract(run / len)) * len);
    paint *= 1.0 - 0.32 * max(jy, jx) * fine;
    paint *= 1.0 + dabs * 0.14 + wash * 0.14;
    paint *= mix(0.78, 1.0, smoothstep(-0.2, 1.2, up));
  } else if (part < 5.5) {
    // goat-hair tent cloth: dark, in long woven strips
    float strip = step(0.5, fract(run * 0.55 + 0.25));
    paint *= mix(0.78, 1.08, strip) * (1.0 + dabs * 0.18);
  } else if (part < 6.5) {
    // gold and silver: they catch whatever light there is
    float shine = pow(max(dot(reflect(-normalize(uCamPos - vWorld), N), uSunDir), 0.0), 8.0);
    paint *= 1.0 + dabs * 0.3;
    glow = vColor * (0.25 + 1.5 * shine) * (uSunColor * 0.3 + 0.2);
  } else {
    // a window: dark by day; at night most have a lamp behind them
    paint = vec3(0.05, 0.045, 0.05);
    float on = step(0.32, hash12(vec2(seed * 31.0, floor(run * 0.5) + floor(up))));
    float flick = 0.86 + 0.14 * sin(uTime * (3.0 + 4.0 * seed) + run * 7.0) * sin(uTime * 1.7 + seed * 40.0);
    glow = vec3(2.4, 1.25, 0.45) * on * flick * uNight;
    alpha = 0.4;
  }
  vec3 sun = uSunColor * 0.42 + uSkyColor * 0.3;
  // (the shade on a wall in these hills is warm: light thrown up off the pale ground and the walls across the street)
  vec3 sky = mix(uSkyColor, vec3(dot(uSkyColor, vec3(0.333))), 0.7) * vec3(1.0, 0.94, 0.86) + vec3(0.16, 0.12, 0.07) * (1.0 - 0.9 * uNight);
  // (a roof looks at the sky: it is lit by more of it)
  if (part > 0.5 && part < 1.5) sky *= 1.25;
  // the ground at a wall's foot is in its own shade
  float foot = mix(0.72, 1.0, smoothstep(0.0, 1.2, up));
  vec3 col = paint * mix(sky, sun, lit) * (part < 1.5 || part > 3.5 ? foot : 1.0) + glow;
  outC = vec4(applyFog(col, vWorld), alpha);
}
`;

/** Collects the faces of buildings in the valley's frame, and the boxes that block the walk. */
function builder() {
  const pos = [];
  const nor = [];
  const col = [];
  const info = [];
  const solids = [];
  const vtx = (p, n, part, colour, along, up, seed) => {
    pos.push(p[0], p[1], p[2]);
    nor.push(n[0], n[1], n[2]);
    col.push(colour[0], colour[1], colour[2]);
    info.push(part, along, up, seed);
  };
  /** A quad: four corners [u, y, v] in order round it, its normal, and for each corner [along, up]. */
  const quad = (c, n, part, colour, t, seed) => {
    for (const i of [0, 1, 2, 0, 2, 3]) vtx(c[i], n, part, colour, t[i][0], t[i][1], seed);
  };
  const tri = (c, n, part, colour, t, seed) => {
    for (let i = 0; i < 3; i++) vtx(c[i], n, part, colour, t[i][0], t[i][1], seed);
  };
  const b = {
    solids,
    quad,
    tri,
    /**
     * A box from (u0, v0) to (u1, v1), from y0 up to y1; `base` is the ground it stands on, which faces measure their
     * height from. Its four walls, and a top unless `top` is false.
     */
    box(u0, u1, v0, v1, y0, y1, { part = PART.PLASTER, colour = PLASTERS[0], seed = 0, base = y0, top = true, roofPart = PART.ROOF, roofColour = ROOF, solid = true } = {}) {
      const h0 = y0 - base;
      const h1 = y1 - base;
      // west (-u), east (+u), south (-v), north (+v): along runs left to right as you face the wall
      quad([[u0, y0, v1], [u0, y0, v0], [u0, y1, v0], [u0, y1, v1]], [-1, 0, 0], part, colour, [[v1, h0], [v0, h0], [v0, h1], [v1, h1]].map(([a, h]) => [-a, h]), seed);
      quad([[u1, y0, v0], [u1, y0, v1], [u1, y1, v1], [u1, y1, v0]], [1, 0, 0], part, colour, [[v0, h0], [v1, h0], [v1, h1], [v0, h1]], seed);
      quad([[u0, y0, v0], [u1, y0, v0], [u1, y1, v0], [u0, y1, v0]], [0, 0, -1], part, colour, [[u0, h0], [u1, h0], [u1, h1], [u0, h1]], seed);
      quad([[u1, y0, v1], [u0, y0, v1], [u0, y1, v1], [u1, y1, v1]], [0, 0, 1], part, colour, [[-u1, h0], [-u0, h0], [-u0, h1], [-u1, h1]], seed);
      if (top) quad([[u0, y1, v0], [u0, y1, v1], [u1, y1, v1], [u1, y1, v0]], [0, 1, 0], roofPart, roofColour, [[u0, v0], [u0, v1], [u1, v1], [u1, v0]], seed);
      if (solid) solids.push([u0, u1, v0, v1, y0, y1]);
    },
    /** A flat thing on a face: a window or a door. side: 'w', 'e', 's', 'n'; at: along the face's own axis (u or v). */
    patch(side, plane, at, width, yLo, yHi, base, part, colour, seed) {
      const o = 0.05;
      const a = at - width / 2;
      const c = at + width / 2;
      const h0 = yLo - base;
      const h1 = yHi - base;
      if (side === 'w') quad([[plane - o, yLo, c], [plane - o, yLo, a], [plane - o, yHi, a], [plane - o, yHi, c]], [-1, 0, 0], part, colour, [[-c, h0], [-a, h0], [-a, h1], [-c, h1]], seed);
      if (side === 'e') quad([[plane + o, yLo, a], [plane + o, yLo, c], [plane + o, yHi, c], [plane + o, yHi, a]], [1, 0, 0], part, colour, [[a, h0], [c, h0], [c, h1], [a, h1]], seed);
      if (side === 's') quad([[a, yLo, plane - o], [c, yLo, plane - o], [c, yHi, plane - o], [a, yHi, plane - o]], [0, 0, -1], part, colour, [[a, h0], [c, h0], [c, h1], [a, h1]], seed);
      if (side === 'n') quad([[c, yLo, plane + o], [a, yLo, plane + o], [a, yHi, plane + o], [c, yHi, plane + o]], [0, 0, 1], part, colour, [[-c, h0], [-a, h0], [-a, h1], [-c, h1]], seed);
    },
    build() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
      g.setAttribute('aInfo', new THREE.Float32BufferAttribute(info, 4));
      g.applyMatrix4(new THREE.Matrix4().makeRotationY(TURN));
      g.computeBoundingSphere();
      return g;
    },
  };
  return b;
}

/** The lowest ground under a footprint, so nothing stands on air. */
function footing(u0, u1, v0, v1) {
  let lo = Infinity;
  for (const [u, v] of [[u0, v0], [u1, v0], [u0, v1], [u1, v1], [(u0 + u1) / 2, (v0 + v1) / 2]]) lo = Math.min(lo, ground(u, v));
  return lo;
}

/**
 * A house with a flat roof and a low parapet. `door`: which side the door is on ('w', 'e', 's', 'n') and where along
 * it, or null. Windows go high on the faces listed in `windows`, a few to each.
 */
function house(b, random, u0, u1, v0, v1, h, { colour, door = null, windows = 'wesn', seed = random() } = {}) {
  const base = footing(u0, u1, v0, v1);
  const top = base + h;
  b.box(u0, u1, v0, v1, base - 1.6, top + 0.55, { colour, seed, base, top: false });
  // the roof sits a parapet's height below the top of the walls
  b.quad([[u0, top, v0], [u0, top, v1], [u1, top, v1], [u1, top, v0]], [0, 1, 0], PART.ROOF, ROOF, [[u0, v0], [u0, v1], [u1, v1], [u1, v0]], seed);
  // the parapet's top edge
  for (const [a0, a1, c0, c1] of [[u0, u1, v0, v0 + 0.3], [u0, u1, v1 - 0.3, v1], [u0, u0 + 0.3, v0, v1], [u1 - 0.3, u1, v0, v1]]) {
    b.quad([[a0, top + 0.55, c0], [a0, top + 0.55, c1], [a1, top + 0.55, c1], [a1, top + 0.55, c0]], [0, 1, 0], PART.PLASTER, colour, [[a0, h], [a0, h], [a1, h], [a1, h]], seed);
  }
  const storeys = h > 5.4 ? [2.0, 4.6] : [2.1];
  for (const side of windows) {
    const alongU = side === 's' || side === 'n';
    const lo = alongU ? u0 : v0;
    const hi = alongU ? u1 : v1;
    const plane = side === 'w' ? u0 : side === 'e' ? u1 : side === 's' ? v0 : v1;
    const n = Math.max(1, Math.floor((hi - lo) / 3.2));
    for (const y of storeys) {
      for (let i = 0; i < n; i++) {
        if (random() < 0.35) continue;
        const at = lo + ((i + 0.5) / n) * (hi - lo) + (random() - 0.5) * 0.6;
        if (door && door[0] === side && Math.abs(at - door[1]) < 1.4 && y < 3) continue;
        b.patch(side, plane, at, 0.6, base + y, base + y + 0.85, base, PART.WINDOW, PLASTERS[0], seed);
      }
    }
  }
  if (door) {
    const [side, at] = door;
    const plane = side === 'w' ? u0 : side === 'e' ? u1 : side === 's' ? v0 : v1;
    b.patch(side, plane, at, 1.5, base - 0.1, base + 2.35, base, PART.DARK, PLASTERS[0], seed);
    b.patch(side, plane + (side === 'w' || side === 's' ? -0.02 : 0.02), at, 1.2, base - 0.1, base + 2.15, base, PART.WOOD, WOOD, seed);
  }
  return base;
}

/** Splits a block into lots no more than `max` across, at random. */
function lots(random, u0, u1, v0, v1, max, out = []) {
  const du = u1 - u0;
  const dv = v1 - v0;
  if (du <= max && dv <= max) {
    out.push([u0, u1, v0, v1]);
    return out;
  }
  const t = 0.36 + 0.28 * random();
  if (du > dv) {
    const m = u0 + du * t;
    lots(random, u0, m, v0, v1, max, out);
    lots(random, m, u1, v0, v1, max, out);
  } else {
    const m = v0 + dv * t;
    lots(random, u0, u1, v0, m, max, out);
    lots(random, u0, u1, m, v1, max, out);
  }
  return out;
}

const overlaps = (a, b, gap = 0) => a[0] < b[1] + gap && a[1] > b[0] - gap && a[2] < b[3] + gap && a[3] > b[2] - gap;

/** The city: walls, towers, the gate, and its houses. All in the valley's frame (u, v), absolute. */
function buildCity(b, random) {
  const [cu, cv] = CITY.at;
  const [hu, hv] = CITY.half;
  const T = CITY.thick;
  const W = CITY.wall;
  const S = (u0, u1, v0, v1) => [cu + u0, cu + u1, cv + v0, cv + v1];
  const wallBox = (u0, u1, v0, v1, height = W, seed = random()) => {
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const base = footing(a, c, d, e);
    b.box(a, c, d, e, base - 2, base + height, { part: 4, colour: STONE, seed, base, roofPart: PART.STONE, roofColour: STONE });
    // battlements along the top: a merlon every two and a half metres on the outer edge
    return base;
  };
  const merlons = (u0, u1, v0, v1, top, outer) => {
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const alongU = c - a > e - d;
    const len = alongU ? c - a : e - d;
    const n = Math.floor(len / 2.4);
    for (let i = 0; i < n; i++) {
      const s = (alongU ? a : d) + (i + 0.5) * (len / n);
      if (alongU) {
        const vv = outer === 's' ? d : e - 0.9;
        b.box(s - 0.6, s + 0.6, vv, vv + 0.9, top, top + 1.1, { part: 4, colour: STONE, seed: 0.3, base: top - W, roofPart: PART.STONE, roofColour: STONE, solid: false });
      } else {
        const uu = outer === 'w' ? a : c - 0.9;
        b.box(uu, uu + 0.9, s - 0.6, s + 0.6, top, top + 1.1, { part: 4, colour: STONE, seed: 0.3, base: top - W, roofPart: PART.STONE, roofColour: STONE, solid: false });
      }
    }
  };
  // the four walls; the west one has the gate in it, 6 m wide
  const gw = 3;
  const wb = wallBox(-hu, -hu + T, -hv, -gw);
  merlons(-hu, -hu + T, -hv, -gw, wb + W, 'w');
  const wb2 = wallBox(-hu, -hu + T, gw, hv);
  merlons(-hu, -hu + T, gw, hv, wb2 + W, 'w');
  for (const [u0, u1, v0, v1, outer] of [[hu - T, hu, -hv, hv, 'e'], [-hu, hu, -hv, -hv + T, 's'], [-hu, hu, hv - T, hv, 'n']]) {
    const base = wallBox(u0, u1, v0, v1);
    merlons(u0, u1, v0, v1, base + W, outer);
  }
  // towers: at the corners, along the long sides, and either side of the gate
  const tower = (u, v, s = 8, h = W + 4) => {
    const base = wallBox(u - s / 2, u + s / 2, v - s / 2, v + s / 2, h);
    merlons(u - s / 2, u + s / 2, v - s / 2, v - s / 2 + 0.9, base + h, 's');
    merlons(u - s / 2, u + s / 2, v + s / 2 - 0.9, v + s / 2, base + h, 'n');
    merlons(u - s / 2, u - s / 2 + 0.9, v - s / 2, v + s / 2, base + h, 'w');
    merlons(u + s / 2 - 0.9, u + s / 2, v - s / 2, v + s / 2, base + h, 'e');
  };
  for (const [u, v] of [[-hu, -hv], [hu, -hv], [-hu, hv], [hu, hv], [0, -hv], [0, hv], [hu, 0], [-hu + 1, -gw - 4.2], [-hu + 1, gw + 4.2]]) tower(u, v);
  // over the gate, a lintel of stone, and its two great doors standing open against the passage
  {
    const [a, c, d, e] = S(-hu - 1, -hu + T + 1, -gw, gw);
    const base = footing(a, c, d, e);
    b.box(a, c, d, e, base + 5.6, base + W + 4, { part: 4, colour: STONE, seed: 0.7, base, roofPart: PART.STONE, roofColour: STONE });
    b.quad([[a, base + 5.6, d], [a, base + 5.6, e], [c, base + 5.6, e], [c, base + 5.6, d]], [0, -1, 0], PART.DARK, STONE, [[0, 5.6], [0, 5.6], [0, 5.6], [0, 5.6]], 0.7);
    const [g0, g1] = [cu - hu + T, cu - hu + T + 2.9];
    b.box(g0, g1, cv - gw, cv - gw + 0.22, base - 0.2, base + 5.5, { part: PART.WOOD, colour: WOOD, seed: 0.2, base, solid: false });
    b.box(g0, g1, cv + gw - 0.22, cv + gw, base - 0.2, base + 5.5, { part: PART.WOOD, colour: WOOD, seed: 0.4, base, solid: false });
  }

  // ---- inside: streets and blocks of houses ----
  const inner = [-hu + T + 4, hu - T - 4, -hv + T + 4, hv - T - 4];
  const main = [-3.5, 3.5];
  const cross = [[-30, -24], [16, 23]];
  const special = [IN_CITY.laban, IN_CITY.court, IN_CITY.treasury].map(([a, d, c, e]) => [a, c, d, e]);
  // a little square inside the gate
  const square = [inner[0] - 1, -46, -13, 13];
  const blocksU = [[inner[0], cross[0][0]], [cross[0][1], cross[1][0]], [cross[1][1], inner[1]]];
  const blocksV = [[inner[2], main[0]], [main[1], inner[3]]];
  for (const [bu0, bu1] of blocksU) {
    for (const [bv0, bv1] of blocksV) {
      for (const lot of lots(random, bu0, bu1, bv0, bv1, 11)) {
        if (special.some((s) => overlaps(lot, s, 1.2)) || overlaps(lot, square)) continue;
        // an alley now and then, and a yard: not every lot is built on to its edges
        const gap = () => (random() < 0.3 ? 0.9 : 0.15);
        const l = [lot[0] + gap(), lot[1] - gap(), lot[2] + gap(), lot[3] - gap()];
        if (l[1] - l[0] < 3.5 || l[3] - l[2] < 3.5) continue;
        // the door on whichever side faces a street
        const sides = [];
        if (Math.abs(lot[0] - bu0) < 0.01) sides.push(['w', (l[2] + l[3]) / 2]);
        if (Math.abs(lot[1] - bu1) < 0.01) sides.push(['e', (l[2] + l[3]) / 2]);
        if (Math.abs(lot[2] - bv0) < 0.01) sides.push(['s', (l[0] + l[1]) / 2]);
        if (Math.abs(lot[3] - bv1) < 0.01) sides.push(['n', (l[0] + l[1]) / 2]);
        const door = sides.length ? sides[Math.floor(random() * sides.length)] : null;
        const h = 3.6 + random() * (random() < 0.3 ? 4.2 : 2.2);
        const [a, c, d, e] = S(...l);
        house(b, random, a, c, d, e, h, { colour: PLASTERS[Math.floor(random() * PLASTERS.length)], door: door && [door[0], door[0] === 'w' || door[0] === 'e' ? cv + door[1] : cu + door[1]], windows: sides.map((s) => s[0]).join('') });
      }
    }
  }
  // Laban's house: big, two storeys and more, of dressed stone below and plaster above, with a walled court
  {
    const [u0, v0, u1, v1] = IN_CITY.laban;
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const base = footing(a, c, d, e);
    house(b, random, a, c, d, e, 9.5, { colour: [0.92, 0.87, 0.76], windows: 'wsn', door: ['w', cv + 31], seed: 0.91 });
    const [cu0, cv0, cu1, cv1] = IN_CITY.court;
    const [ca, cc, cd, ce] = S(cu0, cu1, cv0, cv1);
    const cb = footing(ca, cc, cd, ce);
    // the court's wall, with a gateway on the street at cv 28 to 33
    b.box(ca, ca + 0.6, cd, cv + 28, cb - 1.6, cb + 3.4, { colour: PLASTERS[2], seed: 0.92, base: cb });
    b.box(ca, ca + 0.6, cv + 33, ce, cb - 1.6, cb + 3.4, { colour: PLASTERS[2], seed: 0.92, base: cb });
    b.box(ca, cc, cd, cd + 0.6, cb - 1.6, cb + 3.4, { colour: PLASTERS[2], seed: 0.92, base: cb });
    b.box(ca, cc, ce - 0.6, ce, cb - 1.6, cb + 3.4, { colour: PLASTERS[2], seed: 0.92, base: cb });
    b.box(ca - 0.4, ca + 1, cv + 27.4, cv + 28, cb - 1.6, cb + 4.2, { part: PART.STONE, colour: STONE, seed: 0.93, base: cb });
    b.box(ca - 0.4, ca + 1, cv + 33, cv + 33.6, cb - 1.6, cb + 4.2, { part: PART.STONE, colour: STONE, seed: 0.93, base: cb });
  }
  // the treasury: a strong storehouse of dressed stone, with one door, on the main street
  {
    const [u0, v0, u1, v1] = IN_CITY.treasury;
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const base = footing(a, c, d, e);
    b.box(a, c, d, e, base - 1.6, base + 6.5, { part: PART.STONE, colour: [0.84, 0.78, 0.66], seed: 0.95, base });
    const door = cu + IN_CITY.treasuryDoor[0];
    b.patch('n', e, door, 2.2, base - 0.1, base + 3.1, base, PART.DARK, STONE, 0.95);
    b.patch('n', e + 0.02, door, 1.8, base - 0.1, base + 2.8, base, PART.WOOD, [0.3, 0.2, 0.13], 0.96);
    // two lamps either side of the door
    b.patch('n', e, door - 2.0, 0.35, base + 2.4, base + 2.9, base, PART.WINDOW, STONE, 0.12);
    b.patch('n', e, door + 2.0, 0.35, base + 2.4, base + 2.9, base, PART.WINDOW, STONE, 0.14);
  }
}

/** Lehi's house in the land of their inheritance, with a walled court before it where his riches are kept. */
function buildLehiHouse(b, random) {
  const [hu, hv] = LEHI_HOUSE;
  // the house along the back (south side, -v) of the court; the court opens to the path on its north side
  house(b, random, hu - 8, hu + 8, hv - 12, hv - 4, 5.8, { colour: [0.88, 0.82, 0.7], door: ['n', hu], windows: 'nwe', seed: 0.5 });
  const cb = footing(hu - 9, hu + 9, hv - 4, hv + 10);
  const wall = { colour: [0.84, 0.78, 0.66], seed: 0.51, base: cb };
  b.box(hu - 9, hu - 8.4, hv - 4, hv + 10, cb - 1.6, cb + 2.4, wall);
  b.box(hu + 8.4, hu + 9, hv - 4, hv + 10, cb - 1.6, cb + 2.4, wall);
  b.box(hu - 9, hu - 2, hv + 9.4, hv + 10, cb - 1.6, cb + 2.4, wall);
  b.box(hu + 2, hu + 9, hv + 9.4, hv + 10, cb - 1.6, cb + 2.4, wall);
  // a storeroom against the east wall of the court
  house(b, random, hu + 4, hu + 8.4, hv - 4, hv + 1, 3.2, { colour: [0.8, 0.73, 0.6], door: ['w', hv - 1.5], windows: '', seed: 0.52 });
}

/** A goat-hair tent: a long low ridge on poles, open at its front. */
function tent(b, u, v, len, wide, tall, turn) {
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  const at = (x, y, z) => [u + x * c - z * s, y, v + x * s + z * c];
  const base = ground(u, v);
  const y0 = base - 0.3;
  const y1 = base + tall;
  const hw = wide / 2;
  const hl = len / 2;
  const cloth = [0.22, 0.17, 0.13];
  // two sloping sides
  for (const side of [-1, 1]) {
    const n = [-side * tall * s, hw, side * tall * c];
    const k = Math.hypot(...n);
    const nn = n.map((x) => x / k);
    b.quad([at(-hl, y0, side * hw), at(hl, y0, side * hw), at(hl, y1, 0), at(-hl, y1, 0)], nn, PART.CLOTH, cloth, [[-hl, 0], [hl, 0], [hl, tall], [-hl, tall]], 0.6 + side * 0.1);
  }
  // the back closed, the front open and dark inside
  b.tri([at(-hl, y0, -hw), at(-hl, y0, hw), at(-hl, y1, 0)], [-c, 0, -s], PART.CLOTH, cloth, [[-hw, 0], [hw, 0], [0, tall]], 0.65);
  b.tri([at(hl - 0.3, y0, -hw + 0.3), at(hl - 0.3, y0, hw - 0.3), at(hl - 0.3, y1 - 0.2, 0)], [c, 0, s], PART.DARK, cloth, [[-hw, 0], [hw, 0], [0, tall]], 0.65);
  b.solids.push([u - Math.max(hl, hw), u + Math.max(hl, hw), v - Math.max(hl, hw) * 0.7, v + Math.max(hl, hw) * 0.7, y0, y1]);
}

function buildCamp(b) {
  const [u, v] = CAMP;
  tent(b, u - 9, v + 14, 5.5, 4.2, 2.3, 0.4);
  tent(b, u + 4, v + 19, 4.6, 3.6, 2.0, -0.2);
  tent(b, u - 16, v + 4, 4.8, 3.8, 2.1, 1.1);
}

/**
 * Builds every building of the story. Returns the mesh, its material's uniforms (uNight), and the boxes that block
 * the walk, each as { at: [x, y, z], half: [hx, hy, hz] } turned by TURN about y.
 */
export function createCity(field) {
  const random = mulberry(1007);
  const b = builder();
  buildCity(b, random);
  buildLehiHouse(b, random);
  buildCamp(b);
  const uniforms = { ...field.uniforms, uNight: { value: 0 } };
  const material = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: vertex, fragmentShader: fragment, uniforms, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(b.build(), material);
  mesh.frustumCulled = false;
  const solids = b.solids.map(([u0, u1, v0, v1, y0, y1]) => {
    const [x, z] = fromValley((u0 + u1) / 2, (v0 + v1) / 2);
    return { at: [x, (y0 + y1) / 2, z], half: [(u1 - u0) / 2, (y1 - y0) / 2, (v1 - v0) / 2] };
  });
  return { mesh, uniforms, solids };
}

/** Adds a collider for each of the city's solids to a Rapier world. */
export function addCityColliders(RAPIER, physics, solids) {
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), TURN);
  for (const { at, half } of solids) {
    physics.createCollider(
      RAPIER.ColliderDesc.cuboid(half[0], half[1], half[2])
        .setTranslation(at[0], at[1], at[2])
        .setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }),
    );
  }
}
