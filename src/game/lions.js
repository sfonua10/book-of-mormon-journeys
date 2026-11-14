// The lions of the den (Daniel 6). Each is made in code, of a few solid parts on pivots (a body, a head with its jaw,
// four legs, a tail), and painted as the people are: flat colour in two tones with an inked line round every part
// (the frame's last pass draws the line, round whatever writes one of the small alphas: wanderer.js).
//
// They are moved by the story, not by physics. A lion prowls a round of points, its legs swinging with how far it has
// walked, its head turning to whoever is in the den with it, its mouth opening and shutting; or it is made calm
// (calm): it stops, shuts its mouth and lies down, its forelegs out before it. In the dark their eyes shine; where
// light falls on them (the light the story brings: the field's lamp, guidance.js) they are seen, and their eyes
// are only eyes.
//
// Nothing here says what a lion does to anyone: "My God hath sent his angel, and hath shut the lions' mouths, that
// they have not hurt me" (6:22). They walk, they look, they lie down.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { COMMON } from '../lib/index.js';

const vertex = /* glsl */ `
${COMMON}
in vec3 aColor;
in float aKind;   // 0 the body, 1 an eye, 2 mane and tuft, 3 nose and the inside of the mouth, 4 the pale of the muzzle and teeth, 5 a leg, 6 the head
out vec3 vWorld;
out vec3 vN;
out vec3 vColor;
out float vKind;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vColor = aColor;
  vKind = aKind;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const fragment = /* glsl */ `
${COMMON}
uniform float uDim;    // how much of the hour's light the den's roof keeps off them (0: none)
uniform float uEyes;   // how brightly their eyes shine where no light is
layout(location = 0) out vec4 outC;
in vec3 vWorld;
in vec3 vN;
in vec3 vColor;
in float vKind;
void main() {
  vec3 N = normalize(vN);
  // (which side is seen is asked of the normal, as the people's parts ask it)
  if (dot(N, uCamPos - vWorld) < 0.0) N = -N;
  // in the light or out of it, and nothing between
  float open = smoothstep(0.35, 0.6, openAt(vWorld.xz));
  float lit = smoothstep(0.0, 0.035, dot(N, uSunDir) + 0.06) * open;
  vec3 sun = uSunColor * 0.42 + uSkyColor * 0.3;
  float grey = dot(uSkyColor, vec3(0.333));
  vec3 sky = mix(uSkyColor, vec3(grey), 0.8) * 1.15 + 0.2;
  vec3 shade = vColor * vec3(0.6, 0.55, 0.62);
  vec3 col = mix(shade * sky, vColor * sun, lit) * (1.0 - uDim);
  // the light that is brought into the den: on the side of them that is turned to it, two tones of it as well
  float lamp = lampAt(vWorld);
  float toward = smoothstep(-0.05, 0.05, dot(N, normalize(uLamp.xyz - vWorld)));
  col += mix(shade, vColor, toward) * uFireColor * min(lamp, 1.6) * 0.5;
  if (vKind > 0.5 && vKind < 1.5) col = mix(col, vec3(3.0, 2.3, 0.7), uEyes * (1.0 - clamp(lamp * 1.6, 0.0, 1.0)));
  // (each kind of part writes its own small number, so that where a leg crosses the body, or the head the mane,
  // there is a line between them)
  float ink = vKind > 5.5 ? 0.12 : vKind > 4.5 ? 0.18 : vKind > 3.5 ? 0.21 : vKind > 2.5 ? 0.03 : vKind > 1.5 ? 0.09 : vKind > 0.5 ? 0.06 : 0.15;
  outC = vec4(applyFog(col, vWorld), ink);
}
`;

const HIDE = [0.7, 0.5, 0.25];
const PALE = [0.86, 0.74, 0.54];
const MANE = [0.36, 0.21, 0.1];
const DARK = [0.2, 0.12, 0.1];
const EYE = [0.95, 0.72, 0.22];
const MOUTH = [0.42, 0.1, 0.1];
const TOOTH = [0.96, 0.94, 0.86];

/** A piece of a part: a shape, put where it goes, in one paint. */
function piece(geometry, colour, kind, { at = [0, 0, 0], scale = [1, 1, 1], turn = [0, 0, 0] } = {}) {
  const g = geometry.index ? geometry : geometry.toNonIndexed();
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...at), new THREE.Quaternion().setFromEuler(new THREE.Euler(...turn)), new THREE.Vector3(...scale)));
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  const kinds = new Float32Array(n).fill(kind);
  for (let i = 0; i < n; i++) col.set(colour, i * 3);
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aKind', new THREE.BufferAttribute(kinds, 1));
  g.deleteAttribute('uv');
  return g;
}
const ball = (r, colour, kind, where) => piece(new THREE.SphereGeometry(r, 14, 10), colour, kind, where);
const limb = (top, bottom, length, colour, kind, where) => piece(new THREE.CylinderGeometry(top, bottom, length, 10, 1), colour, kind, where);
const part = (...pieces) => {
  const g = mergeGeometries(pieces);
  g.computeBoundingSphere();
  return g;
};

/** The shapes of a lion's parts, each about its own pivot, facing +z. Made once; every lion is drawn from them. */
function shapes() {
  // the body: turned round the line of its back, deep in the chest and lighter in the loin, narrower than it is deep
  const trunk = new THREE.LatheGeometry(
    [[0, -0.86], [0.14, -0.84], [0.25, -0.7], [0.29, -0.4], [0.285, 0.0], [0.33, 0.35], [0.34, 0.55], [0.27, 0.74], [0.14, 0.84], [0, 0.86]].map(([r, y]) => new THREE.Vector2(r, y)),
    14,
  );
  const body = part(
    piece(trunk, HIDE, 0, { turn: [Math.PI / 2, 0, 0], scale: [0.8, 1, 1] }),
    ball(0.2, HIDE, 0, { at: [0.17, -0.04, -0.5], scale: [0.7, 1, 1.1] }),
    ball(0.2, HIDE, 0, { at: [-0.17, -0.04, -0.5], scale: [0.7, 1, 1.1] }),
    ball(0.19, HIDE, 0, { at: [0.17, -0.02, 0.45], scale: [0.7, 1, 1] }),
    ball(0.19, HIDE, 0, { at: [-0.17, -0.02, 0.45], scale: [0.7, 1, 1] }),
  );
  // the head, about where the neck meets the body: neck, skull, muzzle, nose, ears, eyes, the roof of the mouth and
  // its two long teeth; and for a lion with a mane, the mane round it and down the chest
  const face = () => [
    ball(0.2, HIDE, 6, { at: [0, 0.0, 0.02], scale: [0.95, 1.1, 1.2] }),
    ball(0.195, HIDE, 6, { at: [0, 0.07, 0.17], scale: [1.02, 0.9, 1.1] }),
    // (a long broad muzzle, the nose broad and flat at its end; small round ears set wide and back)
    ball(0.13, PALE, 4, { at: [0, 0.015, 0.37], scale: [1.02, 0.76, 1.32] }),
    ball(0.045, DARK, 3, { at: [0, 0.065, 0.535], scale: [1.45, 0.8, 0.8] }),
    ball(0.055, HIDE, 6, { at: [0.17, 0.2, 0.05], scale: [1, 1, 0.45] }),
    ball(0.055, HIDE, 6, { at: [-0.17, 0.2, 0.05], scale: [1, 1, 0.45] }),
    ball(0.027, EYE, 1, { at: [0.088, 0.135, 0.33] }),
    ball(0.027, EYE, 1, { at: [-0.088, 0.135, 0.33] }),
    ball(0.09, MOUTH, 3, { at: [0, -0.04, 0.36], scale: [0.9, 0.3, 1.1] }),
    piece(new THREE.ConeGeometry(0.017, 0.06, 6), TOOTH, 4, { at: [0.052, -0.075, 0.45], turn: [Math.PI, 0, 0] }),
    piece(new THREE.ConeGeometry(0.017, 0.06, 6), TOOTH, 4, { at: [-0.052, -0.075, 0.45], turn: [Math.PI, 0, 0] }),
  ];
  const head = part(...face());
  const maned = part(...face(), ball(0.36, MANE, 2, { at: [0, 0.06, 0.0], scale: [1.05, 1.18, 0.82] }), ball(0.27, MANE, 2, { at: [0, -0.24, 0.06], scale: [0.95, 1.3, 0.85] }), ball(0.3, MANE, 2, { at: [0, 0.1, -0.22], scale: [0.9, 0.95, 1.0] }));
  // the lower jaw, about its hinge: the chin, and two teeth
  const jaw = part(
    ball(0.105, PALE, 4, { at: [0, -0.03, 0.13], scale: [0.95, 0.45, 1.2] }),
    piece(new THREE.ConeGeometry(0.014, 0.045, 6), TOOTH, 4, { at: [0.045, 0.03, 0.21] }),
    piece(new THREE.ConeGeometry(0.014, 0.045, 6), TOOTH, 4, { at: [-0.045, 0.03, 0.21] }),
  );
  // a leg, about the shoulder or the hip: one length of it, and the paw
  const leg = (thick) => part(limb(thick, 0.075, 0.62, HIDE, 5, { at: [0, -0.31, 0] }), ball(0.1, HIDE, 5, { at: [0, -0.64, 0.04], scale: [1, 0.5, 1.35] }));
  // the tail, in two lengths; the second ends in its tuft
  const tail = part(limb(0.03, 0.036, 0.5, HIDE, 0, { at: [0, 0.25, 0] }));
  const tip = part(limb(0.024, 0.03, 0.4, HIDE, 0, { at: [0, 0.2, 0] }), ball(0.06, MANE, 2, { at: [0, 0.43, 0], scale: [1, 1.5, 1] }));
  return { body, head, maned, jaw, foreleg: leg(0.1), hindleg: leg(0.12), tail, tip };
}

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const ease = (from, to, dt, rate) => from + (to - from) * Math.min(1, dt * rate);
/** How high the middle of a lion's body is as it stands, and as it lies. */
const STAND = 0.75;
const LIE = 0.3;
/** How far a prowling lion keeps from him, going round him (a little under the 2.7 m at which one lies down for him). */
const CLEAR = 2.6;

/**
 * @param scene where they are
 * @param field the meadow: its uniforms are the light they stand in
 * @param heightAt the ground's height at (x, z)
 * @param options.count how many (6)
 */
export function createLions(scene, field, heightAt, { count = 6 } = {}) {
  const uniforms = { ...field.uniforms, uDim: { value: 0 }, uEyes: { value: 0 } };
  const material = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: vertex, fragmentShader: fragment, uniforms, side: THREE.DoubleSide });
  const S = shapes();
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);
  const mesh = (geometry) => new THREE.Mesh(geometry, material);
  const at = (o, x, y, z) => {
    o.position.set(x, y, z);
    return o;
  };

  const lions = Array.from({ length: count }, (_, i) => {
    // (two in three are lionesses: no mane, a little smaller)
    const maned = i % 3 === 0;
    const root = new THREE.Group();
    const body = mesh(S.body);
    const head = at(mesh(maned ? S.maned : S.head), 0, 0.2, 0.74);
    const jaw = at(mesh(S.jaw), 0, -0.02, 0.24);
    head.add(jaw);
    const legs = [[0.19, 0.47, S.foreleg], [-0.19, 0.47, S.foreleg], [0.19, -0.5, S.hindleg], [-0.19, -0.5, S.hindleg]].map(([x, z, shape]) => at(mesh(shape), x, -0.06, z));
    const tail = at(mesh(S.tail), 0, 0.08, -0.84);
    const tip = at(mesh(S.tip), 0, 0.5, 0);
    tail.add(tip);
    body.add(head, ...legs, tail);
    root.add(body);
    root.scale.setScalar(maned ? 1.08 : 0.94 + (i % 2) * 0.05);
    group.add(root);
    return {
      root, body, head, jaw, legs, tail, tip,
      x: 0, z: 0, yaw: 0, speed: 0,
      /** The round it walks, [[x, z], ...], and which point of it comes next; how fast it goes, m/s. */
      path: [], next: 0, pace: 0.9,
      /** Made calm: it stops, shuts its mouth and lies down. `down`: how far it has, 0 to 1. */
      calm: false, down: 0,
      mouth: 0, stride: i * 1.7, t: i * 2.3, look: 0,
    };
  });

  /** Whether all their mouths may open (they do, and shut, each in its own time), or all are shut. */
  let mouths = true;

  return {
    count,
    /** Stands one at (x, z) facing yaw (0 looks along +z), on its feet, walking nowhere. */
    place(i, x, z, yaw = 0) {
      Object.assign(lions[i], { x, z, yaw, speed: 0, path: [], next: 0, calm: false, down: 0, look: 0 });
    },
    /** Sets one walking a round of points, over and over, at `pace` m/s. */
    prowl(i, points, pace = 0.9) {
      Object.assign(lions[i], { path: points.map(([x, z]) => [x, z]), next: 0, pace });
    },
    /** Makes one calm (it lies down where it is, its mouth shut), or lets it up again. `now`: at once, lying. */
    calm(i, on = true, now = false) {
      lions[i].calm = on;
      if (now) Object.assign(lions[i], { down: on ? 1 : 0, speed: 0, mouth: 0 });
    },
    /** All their mouths: free to open, or shut. */
    mouths(open) {
      mouths = open;
    },
    /** How much of the hour's light is kept off them (under the den's roof), 0 to 1. */
    dim(amount) {
      uniforms.uDim.value = amount;
    },
    /** How brightly their eyes shine in the dark, 0 to 1. */
    eyes(amount) {
      uniforms.uEyes.value = amount;
    },
    show(on = true) {
      group.visible = on;
    },
    /** Where one is, and whether it lies calm: { x, z, calm, down }. */
    at: (i) => lions[i],
    /**
     * Moves them on by dt. `eye`: { x, z } of the one they look at and keep from walking into. `seen`: { x, z } of
     * the camera, if it is not his own eyes: they keep out from between it and him, so as not to stand in the view.
     */
    update(dt, eye, seen = null) {
      if (!group.visible) return;
      for (const l of lions) {
        l.t += dt;
        const toEye = eye ? Math.hypot(eye.x - l.x, eye.z - l.z) : Infinity;
        // the nearest point to it on the line from him to the camera, and how far off that is
        let view = null;
        if (eye && seen) {
          const [sx, sz] = [seen.x - eye.x, seen.z - eye.z];
          const long = sx * sx + sz * sz;
          const s = long > 0.01 ? THREE.MathUtils.clamp(((l.x - eye.x) * sx + (l.z - eye.z) * sz) / long, 0, 1) : 0;
          view = { x: eye.x + sx * s, z: eye.z + sz * s };
          view.off = Math.hypot(view.x - l.x, view.z - l.z);
        }
        // where it is going: on round its path, unless it is calm, or has no path, or he stands in its way
        let want = 0;
        if (!l.calm && l.path.length) {
          const [tx, tz] = l.path[l.next];
          const dx = tx - l.x;
          const dz = tz - l.z;
          // (a point reached goes by; so does one he stands on, or it would go round and round him to reach it)
          if (Math.hypot(dx, dz) < 0.6 || (eye && Math.hypot(tx - eye.x, tz - eye.z) < CLEAR)) l.next = (l.next + 1) % l.path.length;
          // the way to it, bent round him, and round the line from him to the camera, so as not to stand in the view:
          // the nearer it comes to either, the more it bends away from it, to the side it is already on
          let aim = Math.atan2(dx, dz);
          const round = (ox, oz, r) => {
            const d = Math.hypot(ox - l.x, oz - l.z);
            if (d < 0.05 || d > r + 1.5) return;
            const side = wrap(Math.atan2(ox - l.x, oz - l.z) - aim);
            if (Math.abs(side) > 1.4) return;
            aim -= (side < 0 ? -1 : 1) * (1.4 - Math.abs(side)) * Math.min(1, (r + 1.5 - d) / 1.5);
          };
          if (eye) round(eye.x, eye.z, CLEAR);
          if (view) round(view.x, view.z, 1.3);
          const turn = wrap(aim - l.yaw);
          l.yaw += Math.sign(turn) * Math.min(Math.abs(turn), dt * 1.6);
          want = l.pace * Math.max(0.25, Math.cos(Math.min(Math.PI / 2, Math.abs(turn))));
          // (it does not walk into him: if it comes too near all the same, it stops short, and looks)
          if (eye && toEye < CLEAR - 0.6 && Math.cos(Math.atan2(eye.x - l.x, eye.z - l.z) - l.yaw) > 0.2) want = 0;
          // (nor through another lion: it waits for one that is in its way, if that one came first)
          for (const other of lions) {
            if (other === l) break;
            const od = Math.hypot(other.x - l.x, other.z - l.z);
            if (od < 2.1 && Math.cos(Math.atan2(other.x - l.x, other.z - l.z) - l.yaw) > 0.3) want *= other.calm ? 0.5 : 0.1;
          }
        }
        l.speed = ease(l.speed, want, dt, 2.5);
        l.x += Math.sin(l.yaw) * l.speed * dt;
        l.z += Math.cos(l.yaw) * l.speed * dt;
        l.stride += l.speed * dt * 2.9;
        // lying down, once it has stopped; up again more quickly
        l.down = ease(l.down, l.calm && l.speed < 0.15 ? 1 : 0, dt, l.calm ? 1.6 : 3);
        const k = l.down * l.down * (3 - 2 * l.down);
        const swing = Math.min(1, l.speed / 0.7) * (1 - k);
        l.root.position.set(l.x, heightAt(l.x, l.z), l.z);
        l.root.rotation.y = l.yaw;
        l.body.position.y = STAND + (LIE - STAND) * k + Math.abs(Math.sin(l.stride)) * 0.016 * swing;
        // the legs: each pair in turn as it walks; laid out before it and drawn up under it as it lies
        const phases = [0, Math.PI, Math.PI * 1.5, Math.PI * 0.5];
        l.legs.forEach((leg, n) => {
          leg.rotation.x = Math.sin(l.stride + phases[n]) * 0.44 * swing + (n < 2 ? -1.42 : -1.36) * k;
          leg.rotation.z = (n % 2 ? -1 : 1) * (n < 2 ? 0.04 : 0.1) * k;
          // (a hind leg is folded under it as it lies: drawn as a shorter one, close along its side)
          leg.scale.y = 1 - (n < 2 ? 0.12 : 0.42) * k;
        });
        // the head: towards him, as far as a neck turns; a little lower when it lies
        const bearing = eye && toEye < 14 ? THREE.MathUtils.clamp(wrap(Math.atan2(eye.x - l.x, eye.z - l.z) - l.yaw), -1.1, 1.1) : 0.25 * Math.sin(l.t * 0.4);
        l.look = ease(l.look, bearing, dt, 2.2);
        l.head.rotation.set(-0.12 + 0.2 * k + 0.03 * Math.sin(l.t * 0.7), l.look, 0, 'YXZ');
        // the mouth: opening and shutting in its own time, wider when he is near; shut, when it is calm or all are
        const snarl = Math.max(0, Math.sin(l.t * 0.8 + l.stride * 0.05)) ** 2;
        const open = mouths && !l.calm ? (0.25 + 0.75 * snarl) * (toEye < 5 ? 1 : 0.55) : 0;
        l.mouth = ease(l.mouth, open, dt, l.calm ? 5 : 2.5);
        l.jaw.rotation.x = l.mouth * 0.6;
        // the tail: swaying behind it; laid round to its side when it lies
        l.tail.rotation.set(-2.05 - 0.35 * k, 0, 0.32 * Math.sin(l.t * 1.3) * (1 - 0.6 * k) + 0.5 * k);
        l.tip.rotation.set(0.5 + 0.2 * Math.sin(l.t * 1.3 + 1), 0, 0.3 * Math.sin(l.t * 1.3 + 0.6) + 0.5 * k);
      }
    },
  };
}
