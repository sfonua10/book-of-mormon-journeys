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
import { GLAZE_CELLS, glazeTexture } from './glaze.js';

/** (a city with no glazed brick reads none) */
const NO_GLAZE = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
NO_GLAZE.needsUpdate = true;

const [DX, DZ] = HERO;
/** The turn about +y that takes the valley's frame (u along x, v along z) to the world's. */
export const TURN = -Math.atan2(DZ, DX);

/** Ground height at (u, v). */
export const ground = (u, v) => heightAt(...fromValley(u, v));

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
export const PART = { PLASTER: 0, ROOF: 1, DARK: 2, WOOD: 3, STONE: 4, CLOTH: 5, GOLD: 6, WINDOW: 7, LAMP: 8, BRICK: 9, GLAZE: 10, PAVE: 11 };

/**
 * What a glazed face shows (PART.GLAZE), given as its `seed`: the whole number is the figure, the fraction the
 * face's own tone. The figures are drawn in glaze.js.
 */
export const MOTIF = { GATE: 0, LIONS: 1, LIONS_BACK: 2, ROSETTES: 3, PALMETTES: 4, PLAIN: 5, GATE_BACK: 6 };

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
export const ROOF = [0.66, 0.58, 0.46];
export const WOOD = [0.36, 0.24, 0.15];

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
uniform vec4 uRoomLamp;   // a lamp burning in a room (the treasury): where it is, and how far its light reaches
uniform vec4 uRoom;       // that room: the valley's line (x, z) and the room's half-sizes along and across it
uniform float uRoomShade; // how much of the day's light the room's roof keeps off what is in it (0: none)
uniform sampler2D tGlaze; // the figures on glazed brick (glaze.js): five across
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
    // (on the river plain the image is a great mass of gold: burnished, holding the sky above and the dusty land
    // below, and a hard bright point where it takes the sun)
    vec3 R = reflect(-normalize(uCamPos - vWorld), N);
    float sharp = pow(max(dot(R, uSunDir), 0.0), 36.0);
    vec3 held = mix(vec3(0.42, 0.33, 0.2), uSkyColor * 1.5, smoothstep(-0.25, 0.5, R.y));
    glow = mix(glow, vColor * (held * 0.25 + uSunColor * (0.03 + 1.6 * sharp)), uLand);
    paint *= mix(1.0, 0.45, uLand);
  } else if (part < 7.5) {
    // a window: dark by day; at night most have a lamp behind them
    paint = vec3(0.05, 0.045, 0.05);
    float on = step(0.32, hash12(vec2(seed * 31.0, floor(run * 0.5) + floor(up))));
    float flick = 0.86 + 0.14 * sin(uTime * (3.0 + 4.0 * seed) + run * 7.0) * sin(uTime * 1.7 + seed * 40.0);
    glow = vec3(2.4, 1.25, 0.45) * on * flick * uNight;
    alpha = 0.4;
  } else if (part < 8.5) {
    // the flame of a lamp, always burning
    paint = vec3(0.3, 0.16, 0.06);
    glow = vec3(2.6, 1.4, 0.5) * (0.86 + 0.14 * sin(uTime * (5.0 + 4.0 * seed)) * sin(uTime * 2.3 + seed * 40.0));
    alpha = 0.4;
  } else if (part < 9.5) {
    // baked brick, in courses a hand high and a foot long, laid in bitumen: each brick a little its own colour
    float fine = 1.0 - smoothstep(0.03, 0.09, px);
    float rows = up / 0.3;
    float course = floor(rows);
    float brick = floor(run / 0.62 + 0.5 * mod(course, 2.0));
    paint *= mix(1.0, 0.88 + 0.22 * hash12(vec2(brick, course) + seed * 17.0), fine);
    float jy = 1.0 - smoothstep(0.0, 0.035, min(fract(rows), 1.0 - fract(rows)) * 0.3);
    float bx = fract(run / 0.62 + 0.5 * mod(course, 2.0));
    float jx = 1.0 - smoothstep(0.0, 0.035, min(bx, 1.0 - bx) * 0.62);
    paint *= 1.0 - 0.3 * max(jy, jx) * fine;
    paint *= 1.0 + dabs * 0.16 + wash * 0.18;
    paint *= mix(0.8, 1.0, smoothstep(-0.2, 1.2, up));
  } else if (part < 10.5) {
    // Glazed brick: deep blue, glossy, in courses, with its figures in rows. seed's whole number says which figures
    // (MOTIF): the gate's bulls and dragons, a row of each in turn; lions, walking one way or the other; rosettes;
    // palmette columns; or none.
    float motif = floor(seed + 0.001);
    float fine = 1.0 - smoothstep(0.03, 0.09, px);
    vec3 blue = vec3(0.05, 0.15, 0.4) * (0.92 + 0.16 * hash12(vec2(floor(run / 0.62 + 0.5 * mod(floor(up / 0.3), 2.0)), floor(up / 0.3)) + 3.0) * fine + 0.1 * wash);
    // each figure's width and height, how high a row is, and where the first row begins, metres: the gate's
    // animals in rows up its whole face; lions and palmettes in one row along the foot; rosettes everywhere
    // (the gate's animals, walking one way or the other: GATE and GATE_BACK)
    bool gate = motif < 0.5 || motif > 5.5;
    vec4 M = gate ? vec4(2.4, 2.4, 2.75, 0.6) : motif < 2.5 ? vec4(2.6, 2.4, 1000.0, 0.7) : motif < 3.5 ? vec4(1.0, 1.0, 1.0, 0.0) : vec4(2.8, 6.2, 1000.0, 3.3);
    float y = (up - M.w) / M.z;
    float row = floor(y);
    vec2 q = vec2(fract(run / M.x), fract(y) * M.z / M.y);
    float cell = gate ? mod(row, 2.0) : motif < 2.5 ? 2.0 : motif < 3.5 ? 3.0 : 4.0;
    if ((motif > 1.5 && motif < 2.5) || motif > 5.5) q.x = 1.0 - q.x;
    vec2 uv = vec2((cell + clamp(q.x, 0.002, 0.998)) / ${GLAZE_CELLS.toFixed(1)}, clamp(q.y, 0.0, 1.0));
    // (read with the slope of the unbroken coordinates, so the edges between figures are not a seam)
    vec2 slope = vec2(run / M.x / ${GLAZE_CELLS.toFixed(1)}, (up - M.w) / M.y);
    vec4 f = ((motif > 4.5 && !gate) || y < 0.0 || q.y > 1.0) ? vec4(0.0) : textureGrad(tGlaze, uv, dFdx(slope), dFdy(slope));
    float there = smoothstep(0.35, 0.65, f.r);
    float tone = f.g / max(f.r, 0.05);
    float second = f.b / max(f.r, 0.05);
    // the colours of the figures: bulls yellow with blue-green hair, dragons white with yellow, lions white or
    // yellow with yellow or red manes, rosettes white with yellow hearts, columns yellow with pale blue capitals
    vec3 body = cell < 0.5 ? vec3(0.86, 0.62, 0.22) : cell < 1.5 ? vec3(0.9, 0.86, 0.74) : cell < 2.5 ? mix(vec3(0.9, 0.87, 0.76), vec3(0.88, 0.68, 0.26), step(0.5, hash12(vec2(floor(run / M.x), row) + seed))) : cell < 3.5 ? vec3(0.92, 0.9, 0.82) : vec3(0.88, 0.7, 0.28);
    vec3 other = cell < 0.5 ? vec3(0.2, 0.5, 0.55) : cell < 1.5 ? vec3(0.86, 0.64, 0.22) : cell < 2.5 ? vec3(0.82, 0.5, 0.16) : cell < 3.5 ? vec3(0.9, 0.7, 0.22) : vec3(0.52, 0.76, 0.86);
    vec3 fig = mix(body, other, smoothstep(0.4, 0.6, second)) * mix(0.55, 1.08, clamp(tone, 0.0, 1.0));
    paint = mix(blue, fig, there * mix(0.6, 1.0, fine));
    // (a glaze catches the sun)
    float shine = pow(max(dot(reflect(-normalize(uCamPos - vWorld), N), uSunDir), 0.0), 24.0);
    glow = paint * shine * uSunColor * 0.35;
  } else {
    // paving: slabs of pale limestone a little over a metre square, each its own tone, the joints thin and dark
    float fine = 1.0 - smoothstep(0.03, 0.1, px);
    vec2 slab = floor(vec2(run, up) / 1.05);
    vec2 inSlab = fract(vec2(run, up) / 1.05);
    paint *= mix(1.0, 0.86 + 0.24 * hash12(slab + seed * 11.0), fine);
    float j = 1.0 - smoothstep(0.0, 0.03, min(min(inSlab.x, 1.0 - inSlab.x), min(inSlab.y, 1.0 - inSlab.y)) * 1.05);
    paint *= 1.0 - 0.35 * j * fine;
    paint *= 1.0 + dabs * 0.12 + wash * 0.16;
  }
  vec3 sun = uSunColor * 0.42 + uSkyColor * 0.3;
  // (the shade on a wall in these hills is warm: light thrown up off the pale ground and the walls across the street)
  vec3 sky = mix(uSkyColor, vec3(dot(uSkyColor, vec3(0.333))), 0.7) * vec3(1.0, 0.94, 0.86) + vec3(0.16, 0.12, 0.07) * (1.0 - 0.9 * uNight);
  // (a roof looks at the sky: it is lit by more of it)
  if (part > 0.5 && part < 1.5) sky *= 1.25;
  // the ground at a wall's foot is in its own shade
  float foot = mix(0.72, 1.0, smoothstep(0.0, 1.2, up));
  vec3 col = paint * mix(sky, sun, lit) * (part < 1.5 || (part > 3.5 && part < 10.5) ? foot : 1.0);
  // what the room's lamp falls on: the faces turned to it, less with distance
  vec3 toLamp = uRoomLamp.xyz - vWorld;
  float reach = 1.0 - smoothstep(0.25, 1.0, length(toLamp) / max(uRoomLamp.w, 0.001));
  // (and only within the room's own walls: a lamp does not shine through stone)
  vec2 off = vec2(dot(-toLamp.xz, uRoom.xy), dot(-toLamp.xz, vec2(-uRoom.y, uRoom.x)));
  float within = step(abs(off.x), uRoom.z) * step(abs(off.y), uRoom.w);
  // (under a roof by day it is dimmer than out of doors)
  col *= 1.0 - uRoomShade * within * step(vWorld.y, uRoomLamp.y + 2.45);
  col += glow;
  col += paint * vec3(1.15, 0.66, 0.3) * reach * within * smoothstep(0.0, 0.35, dot(N, normalize(toLamp)));
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
    /**
     * A thing turned round an upright line through (u, v), as on a wheel: its outline as [radius, height above y0]
     * pairs from the bottom up, `sides` faces round. `deep` squeezes it along u (a body is broader than it is deep).
     */
    turned(u, v, y0, outline, sides, part, colour, seed, deep = 1) {
      for (let i = 0; i + 1 < outline.length; i++) {
        const [r0, h0] = outline[i];
        const [r1, h1] = outline[i + 1];
        const len = Math.hypot(r1 - r0, h1 - h0) || 1;
        const out = (h1 - h0) / len;
        const rise = -(r1 - r0) / len;
        const at = (r, h, a) => [u + Math.cos(a) * r * deep, y0 + h, v + Math.sin(a) * r];
        for (let k = 0; k < sides; k++) {
          const a0 = (k / sides) * Math.PI * 2;
          const a1 = ((k + 1) / sides) * Math.PI * 2;
          const am = (a0 + a1) / 2;
          const n = [Math.cos(am) * out, rise, Math.sin(am) * out];
          quad([at(r0, h0, a0), at(r1, h1, a0), at(r1, h1, a1), at(r0, h0, a1)], n, part, colour, [[a0 * r0, h0], [a0 * r1, h1], [a1 * r1, h1], [a1 * r0, h0]], seed);
        }
      }
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
export function footing(u0, u1, v0, v1) {
  let lo = Infinity;
  for (const [u, v] of [[u0, v0], [u1, v0], [u0, v1], [u1, v1], [(u0 + u1) / 2, (v0 + v1) / 2]]) lo = Math.min(lo, ground(u, v));
  return lo;
}

/**
 * A house with a flat roof and a low parapet. `door`: which side the door is on ('w', 'e', 's', 'n') and where along
 * it, or null. Windows go high on the faces listed in `windows`, a few to each.
 */
export function house(b, random, u0, u1, v0, v1, h, { colour, door = null, windows = 'wesn', seed = random() } = {}) {
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

/**
 * The city: walls, towers, the gate, and its houses. All in the valley's frame (u, v), absolute. Its `look` says
 * what it is built of (the stone of its walls, the plasters of its houses) and builds what is its own: the great
 * house and the storehouse within (`inside`), and anything on the gate (`gate`).
 */
function buildCity(b, random, look) {
  const STONE = look.stone;
  const PLASTERS = look.plasters;
  const [cu, cv] = CITY.at;
  const [hu, hv] = CITY.half;
  const T = CITY.thick;
  const W = CITY.wall;
  const S = (u0, u1, v0, v1) => [cu + u0, cu + u1, cv + v0, cv + v1];
  // (what its walls are built of: Jerusalem's dressed stone, unless the look says otherwise)
  const WALL = look.wallPart ?? PART.STONE;
  const wallBox = (u0, u1, v0, v1, height = W, seed = random()) => {
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const base = footing(a, c, d, e);
    b.box(a, c, d, e, base - 2, base + height, { part: WALL, colour: STONE, seed, base, roofPart: WALL, roofColour: STONE });
    // battlements along the top: a merlon every two and a half metres on the outer edge
    return base;
  };
  const merlons = (u0, u1, v0, v1, top, outer) => {
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const alongU = c - a > e - d;
    const len = alongU ? c - a : e - d;
    const n = Math.floor(len / 2.4);
    // (stepped, as Babylon's are drawn: a broad step, and a narrower one on it)
    const steps = look.stepped ? [[0.6, 0, 0.6], [0.32, 0.6, 1.25]] : [[0.6, 0, 1.1]];
    for (let i = 0; i < n; i++) {
      const s = (alongU ? a : d) + (i + 0.5) * (len / n);
      for (const [w, y0, y1] of steps) {
        if (alongU) {
          const vv = outer === 's' ? d : e - 0.9;
          b.box(s - w, s + w, vv, vv + 0.9, top + y0, top + y1, { part: WALL, colour: STONE, seed: 0.3, base: top - W, roofPart: WALL, roofColour: STONE, solid: false });
        } else {
          const uu = outer === 'w' ? a : c - 0.9;
          b.box(uu, uu + 0.9, s - w, s + w, top + y0, top + y1, { part: WALL, colour: STONE, seed: 0.3, base: top - W, roofPart: WALL, roofColour: STONE, solid: false });
        }
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
  // (a wall with towers close along it, smaller ones between the great ones, as Babylon's has)
  if (look.towerEvery) {
    const every = look.towerEvery;
    const great = [[-hu, -hv], [hu, -hv], [-hu, hv], [hu, hv], [0, -hv], [0, hv], [hu, 0], [-hu + 1, -gw - 4.2], [-hu + 1, gw + 4.2]];
    const free = (u, v) => great.every(([gu, gv]) => Math.hypot(u - gu, v - gv) > every * 0.7);
    for (let u = -hu + every; u < hu - every * 0.5; u += every) for (const v of [-hv, hv]) if (free(u, v)) tower(u, v, 5, W + 2.2);
    for (let v = -hv + every; v < hv - every * 0.5; v += every) for (const u of [-hu, hu]) if (free(u, v) && (u > 0 || Math.abs(v) > gw + 10)) tower(u, v, 5, W + 2.2);
  }
  // over the gate, a lintel of stone, and its two great doors standing open against the passage
  {
    const [a, c, d, e] = S(-hu - 1, -hu + T + 1, -gw, gw);
    const base = footing(a, c, d, e);
    b.box(a, c, d, e, base + 5.6, base + W + 4, { part: WALL, colour: STONE, seed: 0.7, base, roofPart: WALL, roofColour: STONE });
    b.quad([[a, base + 5.6, d], [a, base + 5.6, e], [c, base + 5.6, e], [c, base + 5.6, d]], [0, -1, 0], PART.DARK, STONE, [[0, 5.6], [0, 5.6], [0, 5.6], [0, 5.6]], 0.7);
    const [g0, g1] = [cu - hu + T, cu - hu + T + 2.9];
    b.box(g0, g1, cv - gw, cv - gw + 0.22, base - 0.2, base + 5.5, { part: PART.WOOD, colour: WOOD, seed: 0.2, base, solid: false });
    b.box(g0, g1, cv + gw - 0.22, cv + gw, base - 0.2, base + 5.5, { part: PART.WOOD, colour: WOOD, seed: 0.4, base, solid: false });
    look.gate?.(b, { S, cu, cv, hu, hv, gw, T, W, base });
  }

  // ---- inside: streets and blocks of houses ----
  const inner = [-hu + T + 4, hu - T - 4, -hv + T + 4, hv - T - 4];
  const main = [-3.5, 3.5];
  const cross = [[-30, -24], [16, 23]];
  // (the ground kept for the city's own great buildings, [cu0, cv0, cu1, cv1]: Laban's and his treasury, unless the
  // look keeps other ground)
  const special = (look.reserve ?? [IN_CITY.laban, IN_CITY.court, IN_CITY.treasury]).map(([a, d, c, e]) => [a, c, d, e]);
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
        // (in Babylon a house looks in on its own court: no window on the street)
        house(b, random, a, c, d, e, h, { colour: PLASTERS[Math.floor(random() * PLASTERS.length)], door: door && [door[0], door[0] === 'w' || door[0] === 'e' ? cv + door[1] : cu + door[1]], windows: look.windows === false ? '' : sides.map((s) => s[0]).join('') });
      }
    }
  }
  look.inside(b, random, { S, cu, cv, hu, hv, gw, T, W });
}

/** What is Jerusalem's own within its walls: Laban's house with its court, and his treasury. */
function labanAndTreasury(b, random, { S, cu, cv }) {
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
  // The treasury: a strong storehouse of dressed stone on the main street, with one door, and a room inside it that
  // can be walked into (4:20): its walls, a roof over them, chests and jars along the walls, a table at the back
  // where the plates are kept, and a lamp to either side.
  {
    const [u0, v0, u1, v1] = IN_CITY.treasury;
    const [a, c, d, e] = S(u0, u1, v0, v1);
    const base = footing(a, c, d, e);
    const stone = { part: PART.STONE, colour: [0.84, 0.78, 0.66], seed: 0.95, base, roofPart: PART.STONE, roofColour: [0.84, 0.78, 0.66] };
    const T2 = 0.9;
    const top = base + 6.5;
    const door = cu + IN_CITY.treasuryDoor[0];
    const hw = 1.1;
    b.box(a, c, d, d + T2, base - 1.6, top, stone);
    b.box(a, a + T2, d + T2, e - T2, base - 1.6, top, stone);
    b.box(c - T2, c, d + T2, e - T2, base - 1.6, top, stone);
    b.box(a, door - hw, e - T2, e, base - 1.6, top, stone);
    b.box(door + hw, c, e - T2, e, base - 1.6, top, stone);
    b.box(door - hw, door + hw, e - T2, e, base + 3.0, top, stone);
    // the roof, and under it the ceiling's beams
    b.box(a + T2, c - T2, d + T2, e - T2, top - 0.5, top, { ...stone, roofPart: PART.ROOF, roofColour: ROOF });
    b.quad([[a + T2, top - 0.5, d + T2], [c - T2, top - 0.5, d + T2], [c - T2, top - 0.5, e - T2], [a + T2, top - 0.5, e - T2]], [0, -1, 0], PART.WOOD, [0.3, 0.22, 0.15], [[a, 0], [c, 0], [c, 6], [a, 6]], 0.95);
    // two lamps on the street, either side of the door
    b.patch('n', e, door - 2.0, 0.35, base + 2.4, base + 2.9, base, PART.WINDOW, STONE, 0.12);
    b.patch('n', e, door + 2.0, 0.35, base + 2.4, base + 2.9, base, PART.WINDOW, STONE, 0.14);
    // inside: a stone table at the back, facing the door
    const back = d + T2;
    b.box(door - 0.9, door + 0.9, back + 0.5, back + 1.4, base - 0.5, ground(door, back + 0.95) + IN_CITY.tableTop, { ...stone, seed: 0.97 });
    // a lamp in a niche to either side of the table
    for (const side of [-1, 1]) {
      b.patch('n', back, door + side * 2.6, 0.5, base + 1.9, base + 2.5, base, PART.DARK, STONE, 0.97);
      b.patch('n', back + 0.02, door + side * 2.6, 0.22, base + 1.95, base + 2.3, base, PART.LAMP, STONE, 0.3 + side * 0.1);
    }
    // chests along the side walls, some open on what they hold; tall jars in the corners
    const GOLD = [1.0, 0.76, 0.28];
    const SILVER = [0.86, 0.88, 0.92];
    const chest = (u, v, w, dp, h, lid) => b.box(u - w / 2, u + w / 2, v - dp / 2, v + dp / 2, base - 0.4, ground(u, v) + h, { part: PART.WOOD, colour: WOOD, seed: random(), base, solid: false, roofPart: lid ? PART.GOLD : PART.WOOD, roofColour: lid ?? WOOD });
    for (const [side, wall] of [[1, a + T2], [-1, c - T2]]) {
      for (let i = 0; i < 5; i++) {
        const v = back + 1.6 + i * 2.5 + random() * 0.5;
        chest(wall + side * 0.75, v, 1.0, 1.5 + random() * 0.4, 0.5 + random() * 0.5, [GOLD, null, SILVER, null, GOLD][Math.floor(random() * 5)]);
      }
      const jar = (u, v, r, h) => b.box(u - r, u + r, v - r, v + r, base - 0.4, ground(u, v) + h, { colour: [0.62, 0.4, 0.26], seed: random(), base, solid: false, roofPart: PART.DARK });
      jar(wall + side * 0.7, e - T2 - 0.8, 0.34, 1.1);
      jar(wall + side * 1.6, e - T2 - 0.7, 0.27, 0.85);
    }
  }
}

/** Lehi's house, in (u, v) from LEHI_HOUSE: its footprint, how thick its walls are, how tall, and its doorway. */
const LEHI = { u: [-8, 8], v: [-12, -4], wall: 0.6, tall: 5.8, doorHalf: 1.1, doorTall: 2.7 };

/**
 * Lehi's house in the land of their inheritance, with a walled court before it. The house is one long room that can
 * be walked into by its door: it is there that his riches are kept (3:22), "his gold, and his silver, and his
 * precious things" (2:4).
 */
function buildLehiHouse(b, random) {
  const [hu, hv] = LEHI_HOUSE;
  // the house along the back (south side, -v) of the court; the court opens to the path on its north side
  const [u0, u1, v0, v1] = [hu + LEHI.u[0], hu + LEHI.u[1], hv + LEHI.v[0], hv + LEHI.v[1]];
  const T = LEHI.wall;
  const hw = LEHI.doorHalf;
  const base = footing(u0, u1, v0, v1);
  const top = base + LEHI.tall;
  const colour = [0.88, 0.82, 0.7];
  const seed = 0.5;
  const plaster = { colour, seed, base, roofPart: PART.PLASTER, roofColour: colour };
  const wood = { part: PART.WOOD, colour: WOOD, seed: 0.53, base, solid: false, roofPart: PART.WOOD, roofColour: WOOD };
  const [y0, y1] = [base - 1.6, top + 0.55];
  // its four walls, the north one in two with the doorway between and the wall over it
  b.box(u0, u1, v0, v0 + T, y0, y1, plaster);
  b.box(u0, u0 + T, v0 + T, v1 - T, y0, y1, plaster);
  b.box(u1 - T, u1, v0 + T, v1 - T, y0, y1, plaster);
  b.box(u0, hu - hw, v1 - T, v1, y0, y1, plaster);
  b.box(hu + hw, u1, v1 - T, v1, y0, y1, plaster);
  const over = base + LEHI.doorTall;
  b.box(hu - hw, hu + hw, v1 - T, v1, over, y1, plaster);
  b.quad([[hu - hw, over, v1 - T], [hu + hw, over, v1 - T], [hu + hw, over, v1], [hu - hw, over, v1]], [0, -1, 0], PART.WOOD, WOOD, [[0, 0], [2.2, 0], [2.2, T], [0, T]], 0.53);
  // the roof, a parapet's height below the top of the walls, and under it the ceiling's beams
  b.box(u0 + T, u1 - T, v0 + T, v1 - T, top - 0.4, top, { ...plaster, roofPart: PART.ROOF, roofColour: ROOF });
  b.quad([[u0 + T, top - 0.4, v0 + T], [u1 - T, top - 0.4, v0 + T], [u1 - T, top - 0.4, v1 - T], [u0 + T, top - 0.4, v1 - T]], [0, -1, 0], PART.WOOD, [0.34, 0.25, 0.17], [[u0, 0], [u1, 0], [u1, 6], [u0, 6]], seed);
  // a floor of beaten earth
  const f = base + 0.03;
  b.quad([[u0 + T, f, v0 + T], [u0 + T, f, v1 - T], [u1 - T, f, v1 - T], [u1 - T, f, v0 + T]], [0, 1, 0], PART.ROOF, [0.62, 0.53, 0.41], [[u0, v0], [u0, v1], [u1, v1], [u1, v0]], 0.54);
  // the doorway: posts and a beam of wood round it, a stone at its foot, and its two leaves standing open
  b.box(hu - hw - 0.3, hu + hw + 0.3, v1, v1 + 0.12, over, over + 0.34, wood);
  for (const side of [-1, 1]) {
    const edge = hu + side * hw;
    b.box(Math.min(edge, edge + side * 0.2), Math.max(edge, edge + side * 0.2), v1, v1 + 0.1, base - 0.2, over, wood);
    b.box(Math.min(edge + side * 0.22, edge + side * 0.32), Math.max(edge + side * 0.22, edge + side * 0.32), v1 + 0.1, v1 + 0.1 + hw, base - 0.1, over - 0.08, { ...wood, seed: 0.55 + side * 0.02 });
  }
  b.box(hu - hw - 0.35, hu + hw + 0.35, v1 - T, v1 + 0.55, base - 0.4, base + 0.07, { part: PART.STONE, colour: STONE, seed: 0.56, base, solid: false, roofPart: PART.STONE, roofColour: STONE });
  // windows, small and high: seen from without and from within
  const opening = (side, plane, inner, at) => {
    b.patch(side, plane, at, 0.6, base + 3.5, base + 4.35, base, PART.WINDOW, PLASTERS[0], seed);
    b.patch({ n: 's', w: 'e', e: 'w' }[side], inner, at, 0.6, base + 3.5, base + 4.35, base, PART.WINDOW, PLASTERS[0], seed);
  };
  for (const du of [-5.6, -3.0, 3.0, 5.6]) opening('n', v1, v1 - T, hu + du);
  for (const dv of [-2.2, 0.2]) {
    opening('w', u0, u0 + T, hv - 8 + dv);
    opening('e', u1, u1 - T, hv - 8 + dv);
  }
  // within: a lamp in a niche to either side at the back, a low table between them, mats to sleep on, jars
  const back = v0 + T;
  for (const side of [-1, 1]) {
    b.patch('n', back, hu + side * 2.6, 0.5, base + 1.7, base + 2.3, base, PART.DARK, STONE, 0.57);
    b.patch('n', back + 0.02, hu + side * 2.6, 0.22, base + 1.75, base + 2.1, base, PART.LAMP, STONE, 0.3 + side * 0.1);
  }
  b.box(hu - 1.2, hu + 1.2, back + 0.15, back + 0.95, base - 0.3, base + LEHI_TABLE, { ...wood, solid: true, seed: 0.58 });
  for (const [du, dv, turn] of [[-6.2, -6.4, 0], [-4.0, -6.2, 1]]) {
    const [lu, lv] = turn ? [1.9, 0.8] : [0.8, 1.9];
    b.box(hu + du - lu / 2, hu + du + lu / 2, hv + dv - lv / 2, hv + dv + lv / 2, base, base + 0.1, { part: PART.CLOTH, colour: [0.5, 0.3, 0.2], seed: 0.59 + turn * 0.02, base, solid: false, roofPart: PART.CLOTH, roofColour: [0.56, 0.34, 0.22] });
  }
  const jar = (u, v, r, h) => b.box(u - r, u + r, v - r, v + r, base - 0.2, base + h, { colour: [0.62, 0.4, 0.26], seed: random(), base, solid: false, roofPart: PART.DARK });
  jar(u1 - T - 0.6, v1 - T - 0.6, 0.32, 1.05);
  jar(u1 - T - 1.4, v1 - T - 0.5, 0.25, 0.8);
  jar(u0 + T + 0.55, back + 0.6, 0.3, 0.95);

  const cb = footing(hu - 9, hu + 9, hv - 4, hv + 10);
  const wall = { colour: [0.84, 0.78, 0.66], seed: 0.51, base: cb };
  b.box(hu - 9, hu - 8.4, hv - 4, hv + 10, cb - 1.6, cb + 2.4, wall);
  b.box(hu + 8.4, hu + 9, hv - 4, hv + 10, cb - 1.6, cb + 2.4, wall);
  b.box(hu - 9, hu - 2, hv + 9.4, hv + 10, cb - 1.6, cb + 2.4, wall);
  b.box(hu + 2, hu + 9, hv + 9.4, hv + 10, cb - 1.6, cb + 2.4, wall);
  // a storeroom against the east wall of the court
  house(b, random, hu + 4, hu + 8.4, hv - 4, hv + 1, 3.2, { colour: [0.8, 0.73, 0.6], door: ['w', hv - 1.5], windows: '', seed: 0.52 });
}
/** How high the top of the table in Lehi's house is. */
export const LEHI_TABLE = 0.55;

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
 * Jerusalem as the first journey has it: pale gold stone, Laban's house and treasury within, and outside the walls
 * Lehi's house and the brothers' tents. Its rooms: the treasury (by night) and Lehi's house (by day, where the roof
 * keeps the sun off).
 */
export const JERUSALEM = {
  name: 'jerusalem',
  stone: STONE,
  plasters: PLASTERS,
  inside: labanAndTreasury,
  outside(b, random) {
    buildLehiHouse(b, random);
    buildCamp(b);
  },
  rooms: {
    treasury: (() => {
      const [u0, v0, u1, v1] = IN_CITY.treasury;
      return { u: CITY.at[0] + (u0 + u1) / 2, v: CITY.at[1] + (v0 + v1) / 2, half: [(u1 - u0) / 2 - 0.85, (v1 - v0) / 2 - 0.85], up: 3.2, reach: 16, shade: 0 };
    })(),
    lehi: {
      u: LEHI_HOUSE[0] + (LEHI.u[0] + LEHI.u[1]) / 2,
      v: LEHI_HOUSE[1] + (LEHI.v[0] + LEHI.v[1]) / 2,
      half: [(LEHI.u[1] - LEHI.u[0]) / 2 - LEHI.wall + 0.05, (LEHI.v[1] - LEHI.v[0]) / 2 - LEHI.wall + 0.05],
      up: 3.0,
      reach: 9,
      shade: 0.6,
    },
  },
  room: 'treasury',
};

/**
 * Builds every building of the story, as its `look` has them (Jerusalem's, unless another is given). Returns the mesh, its material's uniforms (uNight), and the boxes that block
 * the walk, each as { at: [x, y, z], half: [hx, hy, hz] } turned by TURN about y.
 */
export function createCity(field, look = JERUSALEM) {
  const random = mulberry(1007);
  const b = builder();
  buildCity(b, random, look);
  look.outside(b, random);
  const uniforms = { ...field.uniforms, uNight: { value: 0 }, uRoomLamp: { value: new THREE.Vector4(0, 0, 0, 0) }, uRoom: { value: new THREE.Vector4(1, 0, 0, 0) }, uRoomShade: { value: 0 }, tGlaze: { value: look.glaze ? glazeTexture() : NO_GLAZE } };
  const material = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: vertex, fragmentShader: fragment, uniforms, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(b.build(), material);
  mesh.frustumCulled = false;
  const solids = b.solids.map(([u0, u1, v0, v1, y0, y1]) => {
    const [x, z] = fromValley((u0 + u1) / 2, (v0 + v1) / 2);
    return { at: [x, (y0 + y1) / 2, z], half: [(u1 - u0) / 2, (y1 - y0) / 2, (v1 - v0) / 2] };
  });
  // The rooms that can be walked into, each with its lamp. One is lit at a time: the one the story is at.
  const rooms = look.rooms;
  /** Lights one of the rooms. */
  const light = (name) => {
    const r = rooms[name];
    const [x, z] = fromValley(r.u, r.v);
    uniforms.uRoomLamp.value.set(x, heightAt(x, z) + r.up, z, r.reach);
    // (the room itself, within its walls)
    uniforms.uRoom.value.set(DX, DZ, r.half[0], r.half[1]);
    uniforms.uRoomShade.value = r.shade;
  };
  light(look.room);
  return { mesh, uniforms, solids, light, look };
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

/** The riches and the plates: small things made the city's way, each its own mesh, put where the story wants them. */
export function createProps(city, heightAt) {
  const GOLD = [1.0, 0.76, 0.28];
  const SILVER = [0.86, 0.88, 0.92];
  const BRASS = [0.92, 0.66, 0.3];
  const make = (fill) => {
    const b = builder();
    fill(b);
    const mesh = new THREE.Mesh(b.build(), city.mesh.material);
    mesh.frustumCulled = false;
    mesh.visible = false;
    return mesh;
  };
  /** A thing turned on a wheel (a jar, a cup): its outline as [radius, height] pairs, lying on its side. */
  const turned = (outline, colour, seed) => {
    const g = new THREE.LatheGeometry(outline.map(([r, y]) => new THREE.Vector2(r, y)), 14);
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    const info = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      col.set(colour, i * 3);
      info.set([PART.PLASTER, g.attributes.uv.getX(i) * 1.2, g.attributes.position.getY(i), seed], i * 4);
    }
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aInfo', new THREE.BufferAttribute(info, 4));
    // tipped over, its mouth a little down, resting on its widest part
    const wide = Math.max(...outline.map(([r]) => r));
    g.rotateZ(Math.PI / 2 + 0.12);
    g.translate(0, wide, 0);
    const mesh = new THREE.Mesh(g, city.mesh.material);
    mesh.frustumCulled = false;
    mesh.visible = false;
    return mesh;
  };
  const CLAY = [0.66, 0.4, 0.25];
  const kinds = {
    // a wine jar, fallen over and empty, and the cup that was drunk from (4:7)
    jar: turned([[0, 0], [0.07, 0], [0.15, 0.1], [0.19, 0.25], [0.17, 0.4], [0.09, 0.5], [0.065, 0.58], [0.095, 0.63]], CLAY, 0.71),
    cup: turned([[0, 0], [0.035, 0], [0.05, 0.05], [0.058, 0.09]], [0.74, 0.5, 0.32], 0.72),
    // the treasury's door: two leaves of thick planks, shut
    door: make((b) => {
      b.box(-1.1, 1.1, -0.09, 0.09, -0.3, 3.0, { part: PART.WOOD, colour: [0.3, 0.2, 0.13], seed: 0.96, solid: false, roofPart: PART.WOOD, roofColour: [0.3, 0.2, 0.13] });
    }),
    // a chest of gold, its lid off and the gold heaped in it
    gold: make((b) => {
      b.box(-0.45, 0.45, -0.3, 0.3, 0, 0.5, { part: PART.WOOD, colour: WOOD, seed: 0.3, solid: false, roofPart: PART.GOLD, roofColour: GOLD });
      b.box(-0.36, 0.36, -0.22, 0.22, 0.5, 0.62, { part: PART.GOLD, colour: GOLD, seed: 0.31, solid: false, roofPart: PART.GOLD, roofColour: GOLD });
    }),
    // silver vessels on a low stand
    silver: make((b) => {
      b.box(-0.55, 0.55, -0.35, 0.35, 0, 0.35, { part: PART.WOOD, colour: WOOD, seed: 0.4, solid: false });
      for (const [u, v, h] of [[-0.3, -0.1, 0.42], [0.05, 0.12, 0.3], [0.32, -0.12, 0.36]]) {
        b.box(u - 0.11, u + 0.11, v - 0.11, v + 0.11, 0.35, 0.35 + h, { part: PART.GOLD, colour: SILVER, seed: 0.41, solid: false, roofPart: PART.GOLD, roofColour: SILVER });
      }
    }),
    // fine cloth, folded, and a small box of gold on it
    precious: make((b) => {
      b.box(-0.5, 0.5, -0.35, 0.35, 0, 0.22, { part: PART.CLOTH, colour: [0.55, 0.16, 0.36], seed: 0.5, solid: false, roofPart: PART.CLOTH, roofColour: [0.62, 0.2, 0.4] });
      b.box(-0.45, 0.4, -0.3, 0.3, 0.22, 0.36, { part: PART.CLOTH, colour: [0.2, 0.32, 0.6], seed: 0.51, solid: false, roofPart: PART.CLOTH, roofColour: [0.24, 0.36, 0.64] });
      b.box(-0.15, 0.15, -0.12, 0.12, 0.36, 0.52, { part: PART.GOLD, colour: GOLD, seed: 0.52, solid: false, roofPart: PART.GOLD, roofColour: GOLD });
    }),
    // the plates of brass: a thick stack of thin leaves, bound
    plates: make((b) => {
      b.box(-0.17, 0.17, -0.12, 0.12, 0, 0.12, { part: PART.GOLD, colour: BRASS, seed: 0.6, solid: false, roofPart: PART.GOLD, roofColour: BRASS });
      for (const u of [-0.1, 0.1]) b.box(u - 0.015, u + 0.015, -0.125, 0.125, -0.005, 0.125, { part: PART.WOOD, colour: [0.3, 0.2, 0.12], seed: 0.61, solid: false });
    }),
  };
  const group = new THREE.Group();
  for (const m of Object.values(kinds)) group.add(m);
  const carried = new Map();
  /** Whoever carries it lets go of it. */
  const release = (name) => {
    const had = carried.get(name);
    if (had) had.npc.holds = null;
    carried.delete(name);
  };
  return {
    group,
    /** Sets a thing down at (x, z), on the ground or `up` metres above it, turned `turn` about. */
    show(name, [x, z], { up = 0, turn = 0 } = {}) {
      release(name);
      const m = kinds[name];
      m.position.set(x, heightAt(x, z) + up, z);
      m.rotation.set(0, turn, 0);
      m.scale.setScalar(1);
      m.visible = true;
    },
    hide(name) {
      release(name);
      kinds[name].visible = false;
    },
    /**
     * Someone carries it before him in both hands (null to stop): `out` metres before him, `up` metres from the
     * ground, drawn at `size` of itself (a chest in a man's arms is a small one); `wide` is half its width as he
     * holds it, where his hands go. While he has it, his `holds` says so, and his arms are put to it (hold.js).
     */
    carry(name, npc, { out = 0.3, up = 1.0, size = 1, wide = 0.15 } = {}) {
      release(name);
      if (!npc) return;
      carried.set(name, { npc, out, up });
      npc.holds = { out, up, wide };
      kinds[name].scale.setScalar(size);
      kinds[name].visible = true;
    },
    /** Whether someone has it in his arms. */
    carrying: (name) => carried.has(name),
    reset() {
      for (const name of [...carried.keys()]) release(name);
      for (const m of Object.values(kinds)) m.visible = false;
    },
    update() {
      for (const [name, { npc, out, up }] of carried) {
        const m = kinds[name];
        m.visible = npc.visible;
        m.position.set(npc.x + Math.sin(npc.yaw) * out, heightAt(npc.x, npc.z) + up, npc.z + Math.cos(npc.yaw) * out);
        // (props are built turned into the valley's frame: undo that, then face the way he does)
        m.rotation.set(0, npc.yaw - Math.PI / 2 - TURN, 0);
      }
    },
  };
}
