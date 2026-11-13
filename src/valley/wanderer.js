// The wanderer in the valley: Patch's starter man under a wide straw hat and a long blue cloak. The land is painted
// like a film's backgrounds, and he is drawn the way a film draws the people who walk in front of them: flat colour
// in two tones, light and shade, with a clean turn between them and an inked line round every part. The colour is
// here; the line is drawn by the frame's last pass (src/lib/frame.js), round whatever writes one of the small
// alphas below, which also tells the paint finish to leave him as he is.
import * as THREE from 'three';
import { Cloak } from '../figure/cloak.js';
import { loadMan } from '../figure/man.js';
import { COMMON } from '../lib/index.js';

const fragment = /* glsl */ `
${COMMON}
uniform vec3 uLit;
uniform vec3 uShade;
uniform vec3 uLit2;
uniform vec3 uShade2;
uniform float uSplit;
uniform vec2 uInk;
uniform float uInside;
in vec3 vWorld;
in vec3 vN;
in vec3 vBind;
in float vFold;
in vec2 vCloth;
uniform vec3 uTrim;
uniform float uGlow;   // 0, or towards 1 for one who shines (the angel)
// What he wears over the figure's own shirt and trousers, painted on by where each point was in the pose he was made
// in (arms out to the sides, facing +z, his left towards +x).
uniform float uPart;   // 0 a part as it is; 1 the shirt and trousers, 2 his bare skin, 3 his shoes
uniform vec4 uCut;     // bare (0; 1 one shoulder and both arms; 2 to the waist), the hem's height (0: a long robe), how high the sandals' laces go (0: none), the belt (0; 1 wide and banded; 2 narrow)
uniform float uCuffs;  // 0; 1 leather guards on the forearms; 2 gold at the wrist and the upper arm; 3 a band at the wrist
uniform float uEdge;   // a hanging cloth's hem: 0 a band of trim; 1 raw and uneven; 2 a border of scales; 3 fur; 4 fringed
uniform vec2 uRobe;    // long sleeves to the wrist (0 or 1), an open V at the neck (0 or 1)
uniform float uArmour; // 0; 1 a coat of bronze scales over the body, from the belt to the shoulders
uniform vec3 uPal[12]; // [in the light, in the shade] of: skin, the belt, the belt's bands, leather, gold, the robe
layout(location = 0) out vec4 outC;
// (each of those paints its own line number, so where it meets another there is an inked edge, as a garment has)
const float PAL_INK[6] = float[6](0.21, 0.12, 0.12, 0.12, 0.06, 0.18);

// laces crossing and crossing again up the shin
float laced(vec3 p) {
  vec2 c = vec2(sign(p.x) * 0.1, -0.035);
  float a = atan(p.z - c.y, p.x - c.x) / 6.2832;
  float s1 = fract(p.y * 8.0 + a * 2.0);
  float s2 = fract(p.y * 8.0 - a * 2.0);
  return step(min(min(s1, 1.0 - s1), min(s2, 1.0 - s2)), 0.07);
}
// which of uPal's paints is here, or -1 for the part's own
int worn(vec3 p) {
  float ax = abs(p.x);
  if (uPart > 0.5 && uPart < 1.5) {
    int r = -1;
    if (uCut.x > 1.5 && p.y > 1.0) r = 0;
    else if (uCut.x > 0.5) {
      // both arms bare, and the right shoulder: the tunic's top runs from under the right arm up over the left shoulder
      if (ax > 0.235 && p.y > 1.33) r = 0;
      else if (p.y > 1.34 + clamp((p.x + 0.17) / 0.3, 0.0, 1.0) * 0.34) r = 0;
    }
    if (uRobe.y > 0.5 && p.z > 0.02 && p.y > 1.33 + ax * 1.6) r = 0;
    if (uCut.y > 0.0 && p.y < uCut.y) r = p.y < uCut.z && laced(p) > 0.5 ? 3 : 0;
    if (uCut.w > 1.5 && p.y > 0.975 && p.y < 1.035) r = 1;
    if (uCut.w > 0.5 && uCut.w < 1.5 && p.y > 0.955 && p.y < 1.165) r = abs(p.y - 1.02) < 0.011 || abs(p.y - 1.1) < 0.011 ? 2 : 1;
    return r;
  }
  if (uPart > 1.5 && uPart < 2.5) {
    if (p.y > 1.3 && p.y < 1.65 && ax > 0.3) {
      if (uRobe.x > 0.5 && ax < 0.75) return 5;
      if (uCuffs > 0.5 && uCuffs < 1.5 && ax > 0.56 && ax < 0.765) return 3;
      if (uCuffs > 1.5 && uCuffs < 2.5 && ((ax > 0.37 && ax < 0.41) || (ax > 0.715 && ax < 0.765))) return 4;
      if (uCuffs > 2.5 && ax > 0.715 && ax < 0.765) return 3;
    }
    if (p.y < uCut.z && laced(p) > 0.5) return 3;
    return -1;
  }
  if (uPart > 2.5 && uCut.z > 0.0) {
    // sandals: a sole, and straps over the bare foot
    if (p.y < 0.03) return -1;
    return laced(p) > 0.5 || abs(p.y - 0.135) < 0.016 || (p.z > 0.06 && abs(p.z - 0.1) < 0.014) ? 3 : 0;
  }
  return -1;
}
void main() {
  vec3 N = normalize(vN);
  // (which side is seen is asked of the normal, not of the triangle: the hat and the cloth are wound as they come)
  bool back = dot(N, uCamPos - vWorld) < 0.0;
  if (back) N = -N;
  bool lower = vBind.y < uSplit;
  // in the light or out of it, and nothing between: a figure in a film is two tones
  // (the shade of trees and clouds, but not his own shadow on the ground, which he stands in the middle of)
  float open = smoothstep(0.35, 0.6, openAt(vWorld.xz));
  float lit = smoothstep(0.0, 0.035, dot(N, uSunDir) + 0.06) * open;
  // the inside of a cloak is always in its own shade
  if (back && uInside > 0.5) lit = 0.0;
  // The folds of hanging cloth, as they are drawn: a few wedges of deeper colour rising from the hem, and the
  // bottom of whatever fold the wind or his walking has really put in it.
  float deep = 0.0;
  if (uInside > 0.5) {
    float across = vCloth.x * 5.0 + 0.2 * sin(vCloth.x * 23.0);
    float wedge = abs(fract(across) - 0.5);
    float rise = smoothstep(0.28, 1.0, vCloth.y);
    deep = (1.0 - smoothstep(0.13 * rise, 0.13 * rise + 0.012, wedge)) * step(0.3, vCloth.y);
    deep = max(deep, smoothstep(0.011, 0.014, back ? -vFold : vFold));
  }
  vec3 litPaint = lower ? uLit2 : uLit;
  vec3 shadePaint = lower ? uShade2 : uShade;
  float ink = lower ? uInk.y : uInk.x;
  int r = worn(vBind);
  if (r >= 0) {
    litPaint = uPal[r * 2];
    shadePaint = uPal[r * 2 + 1];
    ink = PAL_INK[r];
  }
  if (uArmour > 0.5 && r < 0 && uPart > 0.5 && uPart < 1.5 && vBind.y > 1.0 && vBind.y < 1.53 && abs(vBind.x) < 0.235) {
    // a coat of scales: small leaves of bronze sewn in rows, each row lapping the one under it
    vec2 q = vec2(atan(vBind.x, vBind.z) / 6.2832 * 30.0, (vBind.y - 1.0) * 24.0);
    q.x += 0.5 * floor(q.y);
    float d = length(fract(q) - vec2(0.5, 0.95));
    // (drawn only as near as a painter would draw them: further off it is one bronze)
    float fine = 1.0 - smoothstep(0.25, 0.7, fwidth(q.y));
    float rim = smoothstep(0.4, 0.46, d) * (1.0 - smoothstep(0.56, 0.62, d)) * fine;
    litPaint = mix(uPal[8] * vec3(0.88, 0.72, 0.52), uPal[8] * vec3(0.42, 0.34, 0.28), rim);
    shadePaint = mix(uPal[9] * vec3(0.9, 0.82, 0.76), uPal[9] * vec3(0.5, 0.44, 0.44), rim);
    ink = 0.06;
  }
  if (uInside > 0.5) {
    if (uEdge < 0.5) {
      // a band of another colour along the hem
      if (!back && vCloth.y > 0.935) {
        litPaint = uTrim;
        shadePaint = uTrim * vec3(0.66, 0.6, 0.7);
      }
    } else if (uEdge < 1.5 || uEdge > 2.5) {
      // a raw edge, or fur: torn unevenly, the fur more deeply
      float fur = step(2.5, uEdge);
      float x = vCloth.x * mix(38.0, 96.0, fur);
      float tear = mix(0.07, 0.17, fur) * (0.55 + 0.45 * sin(x * 1.7) * sin(x * 0.63 + 1.3));
      if (vCloth.y > 1.0 - tear) discard;
    } else if (uEdge > 3.5) {
      // a fringe: a band of trim, and below it threads hanging loose (as Babylon's robes are carved)
      if (vCloth.y > 0.955) {
        float thread = fract(vCloth.x * 150.0);
        if (thread > 0.6) discard;
        litPaint = uTrim;
        shadePaint = uTrim * vec3(0.62, 0.56, 0.66);
      } else if (!back && vCloth.y > 0.9) {
        litPaint = uTrim * 0.92;
        shadePaint = uTrim * vec3(0.6, 0.55, 0.64);
      }
    } else if (vCloth.y > 0.82) {
      // a border of small scales, row on row
      vec2 q = vec2(vCloth.x * 70.0, (vCloth.y - 0.82) / 0.18 * 3.0);
      q.x += 0.5 * floor(q.y);
      float d = length(fract(q) - vec2(0.5, 0.05));
      float rim = smoothstep(0.4, 0.46, d) * (1.0 - smoothstep(0.56, 0.62, d));
      litPaint = mix(uTrim, uTrim * vec3(0.45, 0.4, 0.35), rim);
      shadePaint = litPaint * vec3(0.62, 0.56, 0.66);
    }
  }
  vec3 sun = uSunColor * 0.42 + uSkyColor * 0.3;
  // (the shade's light is nearly without colour: a shade colour is mixed as it should look, as cel paint is)
  float grey = dot(uSkyColor, vec3(0.333));
  vec3 sky = mix(uSkyColor, vec3(grey), 0.8) * 1.15 + 0.2;
  // three tones in all: in the light, in the shade, and the deep of a fold
  vec3 col = mix(shadePaint * sky, litPaint * sun, lit * (1.0 - deep));
  col = mix(col, shadePaint * sky * vec3(0.64, 0.64, 0.8), deep * (1.0 - lit));
  // (the light is in his robe; his face and hands keep their own colour, a little lit)
  bool skin = r == 0 || (r < 0 && uPart > 1.5 && uPart < 2.5);
  col = mix(col, vec3(1.9, 1.85, 1.7) * (0.85 + 0.15 * lit), uGlow * (skin ? 0.3 : 1.0));
  outC = vec4(applyFog(col, vWorld), ink);
}
`;

const skinnedVertex = /* glsl */ `
#include <common>
#include <skinning_pars_vertex>
out vec3 vWorld;
out vec3 vN;
out vec3 vBind;
out float vFold;
out vec2 vCloth;
void main() {
  vFold = 0.0;
  vCloth = vec2(0.0);
  #include <beginnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  vec4 w = modelMatrix * vec4(transformed, 1.0);
  vWorld = w.xyz;
  vN = normalize(mat3(modelMatrix) * objectNormal);
  vBind = position;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const plainVertex = /* glsl */ `
in float aFold;
out vec3 vWorld;
out vec3 vN;
out vec3 vBind;
out float vFold;
out vec2 vCloth;
void main() {
  vFold = aFold;
  vCloth = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vBind = vec3(0.0, 10.0, 0.0);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

// How he is dressed, beyond the colours:
//   head: 'cloth' (a head cloth falling to the neck), 'band' (a thin band round the brow) or 'none'; in Babylon,
//     'cap' (a round cap of felt), 'turban' (cloth wound round the head), 'crown' (the king's: tall, rounded at the
//     top, its ribbons hanging behind) or 'helmet' (pointed, of bronze)
//   hair: 'long' for hair to the shoulders, gathered behind
//   beard: 'long' for a long beard, squared at its end (with `beard` given to createWanderer)
//   cloak: a mantle of cloth over the shoulders and back
//   hem: where his tunic or robe ends (its skirt hangs from the belt; below it his legs are bare); 0: the figure's
//     own shirt and trousers, painted
//   edge: the tunic's hem: 0 plain, 1 raw and uneven, 2 a border of scales, 3 fur, 4 fringed
//   bare: 0; 1 one shoulder and both arms bare; 2 bare to the waist
//   belt: 0; 1 a wide belt with bands across it; 2 a narrow one
//   cuffs: 0; 1 leather guards on the forearms; 2 gold bands at the wrist and the upper arm; 3 a band at the wrist
//   lace: how high sandals' laces go up the shin (0: shoes as they are)
//   sleeves: long wide sleeves, to the wrist and open there
//   neck: 'v' for an open V at the neck
//   blade: a blade in its sheath at the belt, this long (0: none; about 0.2 a dagger, 0.75 a sword)
//   armour: a coat of bronze scales over the body (the gold's paint, deepened)
//   staff: a staff as tall as he is, in his right hand (npc.js keeps it upright there)
/** A long robe and a mantle, a head cloth: Laban, his servants, Zoram, the angel. */
export const ROBE = { head: 'cloth', cloak: true, hem: 0.13, edge: 0, bare: 0, belt: 0, cuffs: 0, lace: 0, blade: 0, sleeves: false, neck: '', armour: false, hair: '', beard: '' };

// What he wears: [in the light, in the shade], as paint. The shade is a colour of its own, cooler and deeper, not
// the light one made darker.
// (Nephi's, by default: a rough tan tunic of hide over one shoulder, his arms and the other shoulder bare; a wide
// dark belt with lighter bands across it; a red band round his brow; leather guards on his forearms; sandals laced up
// the shin.)
export const CLOTHES = {
  CLOAK: [[0.16, 0.3, 0.56], [0.08, 0.13, 0.38]],
  HAT: [[0.92, 0.88, 0.78], [0.56, 0.54, 0.62]],
  SHIRT: [[0.78, 0.6, 0.36], [0.5, 0.34, 0.24]],
  TROUSERS: [[0.76, 0.58, 0.35], [0.49, 0.33, 0.24]],
  SKIRT: [[0.78, 0.6, 0.36], [0.5, 0.34, 0.24]],
  TRIM: [[0.95, 0.78, 0.4], [0.62, 0.5, 0.42]],
  SKIN: [[0.9, 0.6, 0.42], [0.57, 0.32, 0.27]],
  BOOTS: [[0.36, 0.22, 0.12], [0.18, 0.11, 0.09]],
  HAIR: [[0.14, 0.09, 0.06], [0.07, 0.05, 0.05]],
  BEARD: [[0.14, 0.09, 0.06], [0.07, 0.05, 0.05]],
  EYES: [[0.08, 0.06, 0.06], [0.06, 0.05, 0.06]],
  HEADBAND: [[0.74, 0.14, 0.1], [0.4, 0.07, 0.09]],
  BELT: [[0.32, 0.19, 0.11], [0.16, 0.1, 0.09]],
  BELT2: [[0.6, 0.42, 0.25], [0.33, 0.22, 0.18]],
  LEATHER: [[0.46, 0.29, 0.16], [0.24, 0.14, 0.11]],
  GOLD: [[1.0, 0.78, 0.3], [0.62, 0.42, 0.18]],
  OUTFIT: { head: 'band', cloak: false, hem: 0.6, edge: 1, bare: 1, belt: 1, cuffs: 1, lace: 0.42, blade: 0 },
};
// the paints the outfit lays over his skin and clothes, in uPal's order
const OVER = ['SKIN', 'BELT', 'BELT2', 'LEATHER', 'GOLD', 'SHIRT'];

// The alpha each part writes: its number for the line. Two parts with different numbers get a line between them;
// all of them are below anything else in the valley, so the line is only ever round him.
// (A tunic's skirt has the trousers' number, so a thigh swinging through it in a stride draws no line.)
const INK = {
  CLOAK: 0.03, HAT: 0.06, HAIR: 0.09, BOOTS: 0.12, TROUSERS: 0.15, SHIRT: 0.18, SKIN: 0.21, EYES: 0.09, BEARD: 0.09,
  SKIRT: 0.15, HEADBAND: 0.03, BELT: 0.12, BELT2: 0.06, LEATHER: 0.12, GOLD: 0.06,
};

/** The skirt of a tunic or a robe, from under the belt to `hem`: an open cone a little wider than the hips. */
function skirtShape(hem) {
  const cols = 33;
  const rows = 7;
  const top = 0.965;
  const position = new Float32Array(cols * rows * 3);
  const uv = new Float32Array(cols * rows * 2);
  for (let j = 0; j < rows; j++) {
    const t = j / (rows - 1);
    const y = top + (hem - top) * t;
    // (the longer it is, the wider it falls: a robe to the ankles flares more than a tunic to the knee)
    const rx = 0.2 + 0.17 * (top - hem) * t;
    const rz = 0.157 + 0.15 * (top - hem) * t;
    const cz = 0.028 - 0.016 * t;
    for (let i = 0; i < cols; i++) {
      const a = (i / (cols - 1)) * Math.PI * 2;
      position.set([Math.sin(a) * rx, y, cz + Math.cos(a) * rz], (i + j * cols) * 3);
      uv.set([i / (cols - 1), t], (i + j * cols) * 2);
    }
  }
  const index = [];
  for (let j = 0; j + 1 < rows; j++) {
    for (let i = 0; i + 1 < cols; i++) {
      const k = i + j * cols;
      index.push(k, k + cols, k + 1, k + 1, k + cols, k + cols + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.setAttribute('aFold', new THREE.BufferAttribute(new Float32Array(cols * rows), 1));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * @param field the valley's meadow: its uniforms are the light he stands in
 * @param onProgress 0 to 1 as his files arrive
 * @param clothes any of CLOTHES, to dress him otherwise
 */
export async function createWanderer(field, onProgress, clothes = {}, { man: given = null, beard = false } = {}) {
  let palette = { ...CLOTHES, ...clothes };
  const glow = { value: 0 };
  // what the outfit is, shared by all his parts
  const cut = { value: new THREE.Vector4() };
  const cuffs = { value: 0 };
  const robe = { value: new THREE.Vector2() };
  const armour = { value: 0 };
  const over = { value: Array.from({ length: OVER.length * 2 }, () => new THREE.Color()) };
  const painted = [];
  const paint = (upper, { skinned = false, lower = upper, split = -10, inside = 0, part = 0, edge = 0 } = {}) => {
    const material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
      uniforms: {
        ...field.uniforms,
        uLit: { value: new THREE.Color(...palette[upper][0]) },
        uShade: { value: new THREE.Color(...palette[upper][1]) },
        uLit2: { value: new THREE.Color(...palette[lower][0]) },
        uShade2: { value: new THREE.Color(...palette[lower][1]) },
        uSplit: { value: split },
        uInk: { value: new THREE.Vector2(INK[upper], INK[lower]) },
        uInside: { value: inside },
        uTrim: { value: new THREE.Color(...palette.TRIM[0]) },
        uGlow: glow,
        uPart: { value: part },
        uCut: cut,
        uCuffs: cuffs,
        uEdge: { value: edge },
        uPal: over,
        uRobe: robe,
        uArmour: armour,
      },
      vertexShader: skinned ? skinnedVertex : plainVertex,
      fragmentShader: fragment,
    });
    painted.push({ material, upper, lower });
    return material;
  };

  const man = given ?? (await loadMan({ base: './figure/', onProgress }));
  for (const mesh of man.meshes) {
    const name = `${mesh.name} ${mesh.material?.name ?? ''}`;
    if (/eyebrow|eyelash/.test(name)) {
      mesh.visible = false;
      continue;
    }
    mesh.material = /casualsuit/.test(name)
      ? paint('SHIRT', { skinned: true, lower: 'TROUSERS', split: 0.98, part: 1 })
      : /shoes/.test(name)
        ? paint('BOOTS', { skinned: true, part: 3 })
        : /short01/.test(name)
          ? paint('HAIR', { skinned: true })
          : /high-poly/.test(name)
            ? paint('EYES', { skinned: true })
            : paint('SKIN', { skinned: true, part: 2 });
    // (a part that knows the ball it is held in, as a copy of the man does (npc.js), is not drawn out of view)
    if (!mesh.boundingSphere) mesh.frustumCulled = false;
  }

  // What he wears on his head, set on while he still stands in the pose he was made in. (`hat` is where his head
  // is; the cloak keeps under it.)
  man.object.updateMatrixWorld(true);
  const hat = new THREE.Group();
  // a head cloth: close over the crown, falling to the neck behind
  const profile = [[0, 0.135], [0.05, 0.13], [0.092, 0.105], [0.112, 0.06], [0.118, 0.01], [0.12, -0.04]].map(([r, y]) => new THREE.Vector2(r, y));
  const cloth = new THREE.Mesh(new THREE.LatheGeometry(profile, 24), paint('HAT'));
  const fall = [[0.122, -0.01], [0.128, -0.07], [0.135, -0.14], [0.15, -0.2]].map(([r, y]) => new THREE.Vector2(r, y));
  cloth.add(new THREE.Mesh(new THREE.LatheGeometry(fall, 14, Math.PI * 0.42, Math.PI * 1.16), cloth.material));
  hat.add(cloth);
  // a band round the brow, tied behind, its ends hanging
  const band = new THREE.Group();
  const bandPaint = paint('HEADBAND');
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.024, 28, 1, true), bandPaint);
  ring.scale.set(0.088, 1, 0.117);
  band.add(ring);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), bandPaint);
  knot.position.set(0, 0, -0.118);
  band.add(knot);
  for (const side of [-1, 1]) {
    const end = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.085, 0.006), bandPaint);
    end.position.set(side * 0.014, -0.04, -0.125);
    end.rotation.set(0.18, 0, side * 0.2);
    band.add(end);
  }
  band.position.set(0, -0.03, 0.01);
  band.rotation.x = 0.06;
  hat.add(band);
  let beardMesh = null;
  if (beard) {
    // a full beard: a rounded mass under the jaw, the hair's colour
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), paint('BEARD'));
    b.scale.set(1.05, 1.2, 0.8);
    b.position.set(0, -0.2, 0.075);
    hat.add(b);
    beardMesh = b;
  }
  // Babylon's: a round cap; cloth wound into a turban; the king's tall crown, its two ribbons hanging behind; a
  // pointed helmet; hair to the shoulders, gathered behind
  const lathe = (pts, sides = 22) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), sides);
  const cap = new THREE.Mesh(lathe([[0, 0.15], [0.06, 0.145], [0.098, 0.12], [0.116, 0.075], [0.122, 0.025], [0.124, 0.005]]), paint('HAT'));
  hat.add(cap);
  const turban = new THREE.Mesh(lathe([[0, 0.165], [0.07, 0.16], [0.112, 0.14], [0.135, 0.105], [0.142, 0.065], [0.138, 0.03], [0.126, 0.0]]), paint('HAT'));
  hat.add(turban);
  const crown = new THREE.Group();
  const crownPaint = paint('HAT');
  crown.add(new THREE.Mesh(lathe([[0.123, -0.005], [0.126, 0.06], [0.12, 0.17], [0.108, 0.27], [0.088, 0.33], [0.05, 0.36], [0, 0.365]]), crownPaint));
  const crownBand = new THREE.Mesh(new THREE.CylinderGeometry(0.127, 0.128, 0.03, 26, 1, true), paint('HEADBAND'));
  crownBand.position.y = 0.035;
  crown.add(crownBand);
  for (const side of [-1, 1]) {
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.26, 0.008).translate(0, -0.13, 0), crownBand.material);
    ribbon.position.set(side * 0.028, 0.04, -0.125);
    ribbon.rotation.set(0.22, 0, side * 0.08);
    crown.add(ribbon);
  }
  hat.add(crown);
  const helmet = new THREE.Mesh(lathe([[0.128, -0.01], [0.13, 0.04], [0.108, 0.13], [0.07, 0.21], [0.025, 0.27], [0, 0.285]]), paint('GOLD'));
  hat.add(helmet);
  const longHair = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), paint('HAIR'));
  longHair.scale.set(1.12, 1.5, 0.62);
  longHair.position.set(0, -0.095, -0.075);
  hat.add(longHair);
  hat.position.set(0, 1.805, -0.012);
  hat.rotation.x = -0.1;
  man.object.add(hat);
  hat.updateMatrixWorld(true);
  man.bones.Head.attach(hat);

  // What hangs from his hips: the skirt of a short tunic, and a dagger at the belt.
  const hips = new THREE.Group();
  const skirt = new THREE.Mesh(skirtShape(0.6), paint('SKIRT', { inside: 1 }));
  let skirtHem = 0.6;
  hips.add(skirt);
  const dagger = new THREE.Group();
  // (a sheath a unit long, stretched to the blade's length)
  const sheath = new THREE.Mesh(new THREE.BoxGeometry(0.034, 1, 0.022).translate(0, -0.5, 0), paint('LEATHER'));
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.075, 8), paint('BELT'));
  grip.position.y = 0.04;
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), paint('GOLD'));
  pommel.position.y = 0.085;
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.02), pommel.material);
  dagger.add(sheath, grip, pommel, guard);
  hips.add(dagger);
  man.object.add(hips);
  hips.updateMatrixWorld(true);
  man.bones.pelvis.attach(hips);

  // wide sleeves, opening from the elbow to the wrist (made along the arm as it was made, held out level)
  const sleevePaint = paint('SHIRT', { inside: 1 });
  const sleeves = [];
  for (const side of [1, -1]) {
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.058, 0.3, 18, 3, true), sleevePaint);
    sleeve.rotation.z = -side * Math.PI / 2;
    sleeve.position.set(side * 0.57, 1.49, -0.07);
    man.object.add(sleeve);
    sleeve.updateMatrixWorld(true);
    man.bones[side > 0 ? 'lowerarm_l' : 'lowerarm_r'].attach(sleeve);
    sleeves.push(sleeve);
  }

  // the cloak: cloth, moved by his walking and the valley's wind
  const cloak = new Cloak(man.bones);
  cloak.hat = hat;
  const { cols, rows } = cloak;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(cloak.p, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal', new THREE.BufferAttribute(cloak.normals, 3).setUsage(THREE.DynamicDrawUsage));
  const index = [];
  for (let j = 0; j + 1 < rows; j++) {
    for (let i = 0; i + 1 < cols; i++) {
      const k = i + j * cols;
      index.push(k, k + cols, k + 1, k + 1, k + cols, k + cols + 1);
    }
  }
  geometry.setIndex(index);
  // (where on the cloth: 0 to 1 round it, 0 at the collar to 1 at the hem)
  const where = new Float32Array(cols * rows * 2);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) where.set([i / (cols - 1), j / (rows - 1)], (i + j * cols) * 2);
  geometry.setAttribute('uv', new THREE.BufferAttribute(where, 2));
  // how deep in a fold each point of the cloth is: what a painter would shade
  const folds = new Float32Array(cols * rows);
  geometry.setAttribute('aFold', new THREE.BufferAttribute(folds, 1).setUsage(THREE.DynamicDrawUsage));
  const cloakMesh = new THREE.Mesh(geometry, paint('CLOAK', { inside: 1 }));
  // (the cloth's points are where the world has them, and move: the ball that holds them is kept with them, in
  // update, so the cloak too is not drawn out of view)
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2);

  const group = new THREE.Group();
  group.add(man.object, cloakMesh);
  // a staff, with a knob at its head: not on his bones but stood upright where his hand is, each frame
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.021, 2.05, 8).translate(0, 1.025, 0), paint('BELT'));
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), paint('GOLD'));
  knob.position.y = 2.06;
  staff.add(knob);
  staff.visible = false;
  group.add(staff);

  /** Sets every paint from the palette, and what he wears from its OUTFIT. */
  function wear() {
    for (const { material, upper, lower } of painted) {
      const u = material.uniforms;
      u.uLit.value.setRGB(...palette[upper][0]);
      u.uShade.value.setRGB(...palette[upper][1]);
      u.uLit2.value.setRGB(...palette[lower][0]);
      u.uShade2.value.setRGB(...palette[lower][1]);
      u.uTrim.value.setRGB(...palette.TRIM[0]);
    }
    OVER.forEach((key, i) => {
      over.value[i * 2].setRGB(...palette[key][0]);
      over.value[i * 2 + 1].setRGB(...palette[key][1]);
    });
    const o = { ...ROBE, ...palette.OUTFIT };
    cut.value.set(o.bare, o.hem, o.lace, o.belt);
    cuffs.value = o.cuffs;
    robe.value.set(o.sleeves ? 1 : 0, o.neck === 'v' ? 1 : 0);
    armour.value = o.armour ? 1 : 0;
    for (const sleeve of sleeves) sleeve.visible = !!o.sleeves;
    cloth.visible = o.head === 'cloth';
    band.visible = o.head === 'band';
    cap.visible = o.head === 'cap';
    turban.visible = o.head === 'turban';
    crown.visible = o.head === 'crown';
    helmet.visible = o.head === 'helmet';
    longHair.visible = o.hair === 'long';
    if (beardMesh) {
      // (a long beard: deeper, squared off, lying on the chest)
      const long = o.beard === 'long';
      beardMesh.scale.set(long ? 1.12 : 1.05, long ? 2.1 : 1.2, long ? 0.78 : 0.8);
      beardMesh.position.set(0, long ? -0.255 : -0.2, long ? 0.07 : 0.075);
    }
    // (a cloak just put on was not worked out while it was not worn: it is hung afresh, and let fall into its folds
    // before it is next seen, in update)
    if (o.cloak && !outfit?.cloak) {
      cloak.started = false;
      unsettled = outfit === null ? 0 : 30;
    }
    cloakMesh.visible = o.cloak;
    skirt.visible = o.hem > 0;
    skirt.material.uniforms.uEdge.value = o.edge;
    if (o.hem > 0 && o.hem !== skirtHem) {
      skirt.geometry.dispose();
      skirt.geometry = skirtShape(o.hem);
      skirtHem = o.hem;
    }
    staff.visible = !!o.staff;
    dagger.visible = o.blade > 0;
    if (o.blade > 0) {
      sheath.scale.y = o.blade;
      // a dagger rides at the front of the hip; a sword hangs at the side, along the leg
      const sword = o.blade > 0.4;
      dagger.position.set(sword ? 0.215 : 0.17, 0.985, sword ? 0.02 : 0.125);
      dagger.rotation.set(sword ? 0.42 : 0.12, sword ? -1.5 : -0.5, sword ? 0.14 : 0.35);
    }
    outfit = o;
  }
  let outfit = null;
  let unsettled = 0;
  wear();

  return {
    man,
    hat,
    cloak,
    cloakMesh,
    group,
    /** The staff, if he carries one (OUTFIT.staff): whoever moves him stands it in his hand. */
    staff,
    /** How much he shines: 0 for a man, towards 1 for an angel. */
    glow,
    /** What he wears now (ROBE's fields). */
    get outfit() {
      return outfit;
    },
    /** Puts other clothes on him (any of CLOTHES' parts, OUTFIT among them). */
    dress(clothes) {
      palette = { ...palette, ...clothes };
      wear();
    },
    /** After he has moved: the cloth. `air(x, y, z, out)` is the wind there, `ground(x, z)` the land's height. */
    update(dt, air, ground) {
      // (no cloak, no cloth to work out: it is a good part of a frame's sums)
      if (!outfit.cloak) return;
      // a second and a half of hanging, over its first five frames (clothes are changed while the picture is dark)
      for (let i = 0; i < 6 && unsettled > 0; i++, unsettled--) cloak.update(0.05, air, ground);
      cloak.update(dt, air, ground);
      // the ball that holds the cloth: 2 m about the middle of its collar (it is 1.2 m long)
      const mid = ((cols - 1) >> 1) * 3;
      geometry.boundingSphere.center.set(cloak.p[mid], cloak.p[mid + 1], cloak.p[mid + 2]);
      // a fold's bottom is where the cloth to either side stands out from it, the way its outside faces
      const { p, normals } = cloak;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = (i + j * cols) * 3;
          const l = (Math.max(i - 1, 0) + j * cols) * 3;
          const r = (Math.min(i + 1, cols - 1) + j * cols) * 3;
          folds[i + j * cols] = (p[l] + p[r] - 2 * p[k]) * normals[k] + (p[l + 1] + p[r + 1] - 2 * p[k + 1]) * normals[k + 1] + (p[l + 2] + p[r + 2] - 2 * p[k + 2]) * normals[k + 2];
        }
      }
      geometry.attributes.aFold.needsUpdate = true;
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.normal.needsUpdate = true;
    },
  };
}
