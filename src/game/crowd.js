// The multitude on the plain of Dura (Daniel 3:2–7): "the princes, the governors, and the captains, the judges, the
// treasurers, the counsellors, the sheriffs, and all the rulers of the provinces", and with them "all the people, the
// nations, and the languages". The ten nearest are the cast's own figures (npc.js); about them stand a few hundred
// more, painted as a background artist paints a crowd: each a card that turns to face the eye, a figure in a long
// robe seen from behind, and when the music sounds, the same figure fallen down on its face. One draw for them all.
//
// The cards write the small alphas the figures do (wanderer.js), so the frame's last pass inks a line round each of
// them and round its head, as it does round the cast.
import * as THREE from 'three';
import { COMMON } from '../lib/index.js';

const W = 128;
const H = 256;

/**
 * The figures, white on black, four across: standing in a cap, standing in a turban, and the same two fallen down.
 * Red is where the figure is; green how light it is painted there; blue what it is: none for the robe, half for
 * what is on the head, full for hair, hands and feet.
 */
function figures() {
  const canvas = document.createElement('canvas');
  canvas.width = W * 4;
  canvas.height = H;
  const g = canvas.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, canvas.width, canvas.height);
  const paint = (tone, what = 0) => `rgb(255,${Math.round(tone)},${what})`;
  const ellipse = (x, y, rx, ry, fill) => {
    g.fillStyle = fill;
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
  };
  const poly = (pts, fill) => {
    g.fillStyle = fill;
    g.beginPath();
    g.moveTo(...pts[0]);
    for (const p of pts.slice(1)) g.lineTo(...p);
    g.closePath();
    g.fill();
  };
  for (let k = 0; k < 2; k++) {
    // ---- standing, seen from behind ----
    g.save();
    g.translate(k * W, 0);
    // the robe to the feet, widening a little; the mantle over one shoulder, a tone deeper
    poly([[44, 74], [84, 74], [92, 120], [98, 238], [30, 238], [36, 120]], paint(215));
    poly([[44, 74], [72, 74], [60, 236], [30, 236], [36, 120]], paint(170));
    // the fringe at the hem
    for (let x = 32; x < 97; x += 4) poly([[x, 236], [x + 2.4, 236], [x + 2.4, 243], [x, 243]], paint(235));
    // feet, the hair falling to the shoulders, the head
    ellipse(52, 246, 9, 5, paint(120, 255));
    ellipse(76, 246, 9, 5, paint(120, 255));
    poly([[48, 54], [80, 54], [84, 84], [44, 84]], paint(110, 255));
    ellipse(64, 50, 16, 18, paint(120, 255));
    // on the head: a round cap, or cloth wound into a turban
    if (k === 0) ellipse(64, 38, 17, 13, paint(220, 128));
    else {
      ellipse(64, 40, 21, 14, paint(220, 128));
      for (let i = 0; i < 3; i++) poly([[45, 36 + i * 6], [83, 32 + i * 6], [83, 34 + i * 6], [45, 38 + i * 6]], paint(175, 128));
    }
    // the arms, at the sides
    poly([[38, 82], [46, 80], [42, 150], [34, 150]], paint(185));
    poly([[82, 80], [90, 82], [94, 150], [86, 150]], paint(185));
    g.restore();
    // ---- fallen down on the face: from behind, the back of a robe bowed to the ground, the soles of the feet ----
    g.save();
    g.translate((2 + k) * W, 0);
    ellipse(64, 222, 46, 30, paint(205));
    ellipse(52, 220, 22, 24, paint(170));
    poly([[20, 222], [108, 222], [104, 246], [24, 246]], paint(205));
    for (let x = 26; x < 103; x += 4) poly([[x, 244], [x + 2.4, 244], [x + 2.4, 250], [x, 250]], paint(235));
    ellipse(48, 248, 8, 5, paint(120, 255));
    ellipse(80, 248, 8, 5, paint(120, 255));
    // (the top of the head, bowed beyond the back, and what is on it)
    ellipse(64, 196, k === 0 ? 13 : 17, 9, paint(215, 128));
    g.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  return texture;
}

const vertex = /* glsl */ `
${COMMON}
in vec3 aAt;     // where it stands: x, the ground's height, z
in vec4 aLook;   // which figure (0: cap, 1: turban), when it falls (seconds after the music), its colours, its size
uniform float uSince;  // seconds since they began to fall down; less than 0 while they stand
out vec2 vUv;
out vec3 vWorld;
out float vTint;
void main() {
  // (it turns to face the eye about its upright line)
  vec2 toEye = uCamPos.xz - aAt.xz;
  vec2 side = normalize(vec2(toEye.y, -toEye.x));
  float fallen = step(aLook.y, uSince);
  float w = 0.92 * aLook.w;
  float h = 1.84 * aLook.w;
  vec3 p = aAt + vec3(side.x, 0.0, side.y) * position.x * w * 0.5 + vec3(0.0, position.y * h, 0.0);
  vWorld = p;
  vUv = vec2((aLook.x + 2.0 * fallen + position.x * 0.5 + 0.5) / 4.0, position.y);
  vTint = aLook.z;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
`;

const fragment = /* glsl */ `
${COMMON}
layout(location = 0) out vec4 outC;
uniform sampler2D tFigures;
in vec2 vUv;
in vec3 vWorld;
in float vTint;
// the colours of the people's robes: undyed wool, linen, madder red, woad blue, a green, ochre, a brown-purple
const vec3 ROBES[7] = vec3[7](vec3(0.78, 0.72, 0.6), vec3(0.86, 0.84, 0.78), vec3(0.62, 0.24, 0.18), vec3(0.24, 0.32, 0.52), vec3(0.32, 0.42, 0.3), vec3(0.72, 0.56, 0.28), vec3(0.42, 0.24, 0.3));
const vec3 HEADS[4] = vec3[4](vec3(0.88, 0.84, 0.74), vec3(0.74, 0.62, 0.44), vec3(0.6, 0.26, 0.2), vec3(0.3, 0.36, 0.52));
void main() {
  vec4 f = texture(tFigures, vUv);
  if (f.r < 0.5) discard;
  float tone = f.g / max(f.r, 0.05);
  float what = f.b / max(f.r, 0.05);
  int r = int(floor(fract(vTint * 7.31) * 6.999));
  int hd = int(floor(fract(vTint * 3.17) * 3.999));
  vec3 robe = ROBES[r];
  vec3 col = what > 0.75 ? vec3(0.17, 0.11, 0.08) : what > 0.25 ? HEADS[hd] : robe;
  col *= mix(0.55, 1.08, tone);
  // in the light, as the cast are (two tones: the card is seen in the sun)
  float open = smoothstep(0.35, 0.6, openAt(vWorld.xz));
  vec3 sun = uSunColor * 0.42 + uSkyColor * 0.3;
  vec3 sky = mix(uSkyColor, vec3(dot(uSkyColor, vec3(0.333))), 0.8) * 1.15 + 0.2;
  col *= mix(sky, sun, 0.35 + 0.65 * open);
  outC = vec4(applyFog(col, vWorld), what > 0.25 && what < 0.75 ? 0.09 : 0.15);
}
`;

/**
 * @param scene where they stand
 * @param field the meadow: its uniforms are the light they stand in
 * @param heightAt the ground's height at (x, z)
 */
export function createCrowd(scene, field, heightAt) {
  const MAX = 420;
  const quad = new THREE.InstancedBufferGeometry();
  quad.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0], 3));
  quad.setIndex([0, 1, 2, 0, 2, 3]);
  const at = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
  const look = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 4), 4);
  quad.setAttribute('aAt', at);
  quad.setAttribute('aLook', look);
  quad.instanceCount = 0;
  const uniforms = { ...field.uniforms, tFigures: { value: figures() }, uSince: { value: -1 } };
  const material = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: vertex, fragmentShader: fragment, uniforms, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(quad, material);
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);
  let fell = null;
  return {
    mesh,
    /**
     * Stands them where they are to stand: [[x, z], ...]. Each is given his own look, size and moment to fall,
     * from `seed`, so the same place gives the same crowd.
     */
    place(points, seed = 1) {
      const n = Math.min(MAX, points.length);
      let s = seed;
      const random = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
      for (let i = 0; i < n; i++) {
        const [x, z] = points[i];
        at.setXYZ(i, x, heightAt(x, z), z);
        // (they fall in waves, front to back and not all at the one moment)
        look.setXYZW(i, random() < 0.5 ? 0 : 1, 0.2 + random() * 1.4 + i * 0.004, random(), 0.92 + random() * 0.16);
      }
      at.needsUpdate = true;
      look.needsUpdate = true;
      quad.instanceCount = n;
      mesh.visible = n > 0;
    },
    show(on = true) {
      mesh.visible = on && quad.instanceCount > 0;
    },
    /** All fall down, beginning at `now` (seconds, on any clock that update is given); or (null) all stand. */
    fall(now) {
      fell = now;
      uniforms.uSince.value = now == null ? -1 : 0;
    },
    update(now) {
      uniforms.uSince.value = fell == null ? -1 : now - fell;
    },
  };
}
