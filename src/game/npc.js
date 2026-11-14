// The others in the story: Laman, Lemuel and Sam, Laban, his servants, Zoram, the angel. Each is Patch's starter man,
// cloned from one download and dressed in his own colours (wanderer.js), moved by the story rather than by physics:
// he stands, turns to face someone, walks or runs a line of points, or keeps up with Nephi. His clips are played
// straight from a mixer (idle, walk, jog), at the rate that matches how fast he is really going.
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { createWanderer } from '../valley/wanderer.js';
import { holdArms } from '../figure/hold.js';
import { createHalo } from './halo.js';

/**
 * A fresh copy of a loaded man (man.js), with his own skeleton, sharing the clips.
 *
 * Each of his parts is given the ball that holds the whole of him, so that one who is out of view is not drawn: a
 * man's limbs are moved by his bones, and without it nothing could tell where he is but by drawing him. It is 2.2 m
 * about the middle of him as he stands, which holds him standing, running, lying, fallen down to worship, his arms
 * out: it goes where he goes and turns as he turns.
 */
export function cloneMan(src) {
  const object = cloneSkinned(src.object);
  const meshes = [];
  const bones = {};
  object.updateMatrixWorld(true);
  const toPart = new THREE.Matrix4();
  object.traverse((o) => {
    if (o.isSkinnedMesh) {
      // (in the part's own space, which is where it is asked for)
      toPart.copy(o.matrixWorld).invert().multiply(object.matrixWorld);
      o.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.95, 0).applyMatrix4(toPart), 2.2 * toPart.getMaxScaleOnAxis());
      o.frustumCulled = true;
      meshes.push(o);
    }
    if (o.isBone) bones[o.name] = o;
  });
  return { ...src, object, meshes, bones };
}

const angleWrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Falling down to worship: the body sinks to its knees and bends forward to the ground. Every bone is turned about
// the one line across the body (from his left to his right), so the turns can be worked out from how the bones lie
// before any is turned: a turn about that line leaves the line where it was.
const across = new THREE.Vector3();
const local = new THREE.Vector3();
const parentTurn = new THREE.Quaternion();
const turn = new THREE.Quaternion();
// [bone, degrees]: more than 0 leans what stands up forward (and swings what hangs down back)
const BOW = [
  ['thigh_l', -80], ['thigh_r', -80],
  ['calf_l', 165], ['calf_r', 165],
  ['spine_01', 36], ['spine_02', 32], ['spine_03', 28], ['neck_01', 10],
  ['upperarm_l', -150], ['upperarm_r', -150],
];
/** How far the body sinks (metres) when it is on its knees. */
const KNEEL = 0.8;
// Kneeling to pray (Daniel 6:10: "he kneeled upon his knees"): upright on both knees, the shins laid back along the
// ground, the back a little bent and the head bowed. The hands are put together before him by whoever asks for it
// (`holds`, hold.js).
export const PRAY = [
  ['calf_l', 96], ['calf_r', 96],
  ['spine_01', 5], ['spine_02', 5], ['spine_03', 4],
  ['neck_01', 12], ['Head', 14],
];
/** How far the body sinks when it kneels so. */
export const PRAY_SINK = 0.46;
/**
 * Turns bones about the line across a figure (`table`: [bone, degrees], as BOW), `k` of the way (0 to 1), and
 * sinks the whole of him `sink` metres times k. `object` is the figure, standing at `yaw`; his bones are as his
 * clips have left them this frame.
 */
export function poseAcross(bones, object, yaw, table, sink, k) {
  across.set(Math.cos(yaw), 0, -Math.sin(yaw));
  object.position.y -= sink * k;
  for (const [name, degrees] of table) {
    const bone = bones[name];
    if (!bone?.parent) continue;
    bone.parent.getWorldQuaternion(parentTurn);
    local.copy(across).applyQuaternion(parentTurn.invert());
    bone.quaternion.premultiply(turn.setFromAxisAngle(local, (degrees * Math.PI * k) / 180));
  }
}
const bowDown = (npc, k) => poseAcross(npc.man.bones, npc.man.object, npc.yaw, BOW, KNEEL, k);

/**
 * @param field the meadow (its uniforms light them)
 * @param base a loaded man, never dressed: each one is a clone of it
 * @param world { heightAt(x, z), air(x, y, z, out), scene }
 */
export function createCast(field, base, world) {
  const group = new THREE.Group();
  const people = new Map();
  // Where Nephi has walked, a point a metre or so apart, newest last: those who follow him keep to it, so they come
  // through the gate and along the streets as he did, not through the walls.
  const trail = [];
  // (how many points it has ever had: a follower keeps to the part of it laid since he set out)
  let laid = 0;
  // the light round one who shines (the angel): set an npc's `aura` above 0 and it is drawn about him
  const halo = world.scene ? createHalo(world.scene, { color: [1.5, 1.42, 1.2], width: 2.8, height: 3.9, back: 0.6, rays: 1 }) : null;
  let time = 0;
  // where Nephi is, and how far from him (metres) anyone is still drawn
  const eye = [0, 0];
  const FAR = 150;

  async function add(name, clothes, { beard = false, scale = 1 } = {}) {
    const man = cloneMan(base);
    const w = await createWanderer(field, null, clothes, { man, beard });
    w.group.visible = false;
    group.add(w.group);
    const mixer = new THREE.AnimationMixer(man.object);
    const act = {};
    for (const clip of ['Idle', 'Walk', 'Jog', 'Run', 'Idle_LookAround']) {
      if (!man.clips[clip]) continue;
      act[clip] = mixer.clipAction(man.clips[clip]);
      act[clip].play();
      act[clip].setEffectiveWeight(0);
    }
    act.Idle.setEffectiveWeight(1);
    man.object.scale.setScalar(scale);
    const npc = {
      name,
      w,
      man,
      mixer,
      act,
      x: 0,
      z: 0,
      yaw: 0,
      speed: 0,
      // what he is doing: 'stand', 'walk' (a line of points), 'follow' (someone), 'lie'
      mode: 'stand',
      path: [],
      pace: 1.45,
      faceTo: null,
      followTarget: null,
      followGap: 3,
      arrive: null,
      weights: { Idle: 1, Walk: 0, Jog: 0, Run: 0 },
      get visible() {
        return w.group.visible;
      },
      show(on = true) {
        w.group.visible = on;
        return npc;
      },
      /** Stands him at (x, z) facing yaw (0 looks along +z). */
      place(x, z, yaw = npc.yaw) {
        Object.assign(npc, { x, z, yaw, speed: 0, mode: 'stand', path: [], followTarget: null, faceTo: null, maxSpeed: undefined, rest: 0, keen: false });
        w.group.visible = true;
        if (npc.lying) npc.lie(false);
        settle(npc, 0, true);
        return npc;
      },
      /** Turns him to face a point (or stop facing anything with null). */
      face(x, z) {
        npc.faceTo = x == null ? null : [x, z];
        return npc;
      },
      /** Walks him through the points [[x, z], ...] at `pace` m/s; resolves when he is at the last. */
      walk(points, pace = 1.45) {
        npc.path = points.map(([x, z]) => [x, z]);
        npc.pace = pace;
        npc.mode = 'walk';
        npc.followTarget = null;
        return new Promise((done) => {
          npc.arrive = done;
        });
      },
      /**
       * Keeps him near someone ({ x, z } read each frame), `gap` metres off, walking or running to keep up. He keeps
       * to the trail laid from now on; with `whole`, to all of it (the way Nephi came out of a house, say, before
       * he was followed).
       */
      follow(target, gap = 3, side = 0, { whole = false } = {}) {
        npc.mode = 'follow';
        npc.followTarget = target;
        npc.followGap = gap;
        npc.followSide = side;
        npc.followFrom = whole ? 0 : laid;
        npc.path = [];
        return npc;
      },
      stop() {
        npc.mode = 'stand';
        npc.path = [];
        npc.followTarget = null;
        npc.arrive?.();
        npc.arrive = null;
        return npc;
      },
      /** Lays him on the ground (Laban, fallen in the street), or stands him up again. */
      lie(on = true) {
        npc.lying = on;
        npc.mode = on ? 'lie' : 'stand';
        w.cloakMesh.visible = !on && w.outfit.cloak;
        return npc;
      },
    };
    people.set(name, npc);
    return npc;
  }

  const target = new THREE.Vector3();
  /** Moves one of them on by dt and sets his pose. */
  function settle(npc, dt, snap = false) {
    let want = 0;
    if (npc.mode === 'walk' && npc.path.length) {
      const [tx, tz] = npc.path[0];
      const dx = tx - npc.x;
      const dz = tz - npc.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.35) {
        npc.path.shift();
        if (!npc.path.length) {
          npc.mode = 'stand';
          npc.arrive?.();
          npc.arrive = null;
        }
      } else {
        want = npc.pace;
        npc.yaw += angleWrap(Math.atan2(dx, dz) - npc.yaw) * Math.min(1, dt * 8);
      }
    } else if (npc.mode === 'follow' && npc.followTarget) {
      const t = npc.followTarget;
      // a place on Nephi's trail, his gap behind him; near him, a place beside him
      let gx = t.x + Math.cos(t.yaw ?? 0) * npc.followSide;
      let gz = t.z - Math.sin(t.yaw ?? 0) * npc.followSide;
      const far = Math.hypot(t.x - npc.x, t.z - npc.z);
      if (far > npc.followGap + 2 && trail.length > 1) {
        // The point of the trail nearest him, and then on along it towards Nephi. Only the trail laid since he set
        // out after him: not where Nephi wandered before that. And where the trail comes back close by him (Nephi
        // went round something and returned), he takes the later part of it and does not go round as well.
        const first = Math.max(0, trail.length - (laid - (npc.followFrom ?? 0)) - 1);
        let best = Infinity;
        let at = first;
        for (let i = first; i < trail.length; i++) {
          const d = Math.hypot(trail[i][0] - npc.x, trail[i][1] - npc.z);
          if (d < best) {
            best = d;
            at = i;
          }
        }
        for (let i = trail.length - 1; i > at; i--) {
          if (Math.hypot(trail[i][0] - npc.x, trail[i][1] - npc.z) < Math.max(4, best + 1.5)) {
            at = i;
            break;
          }
        }
        if (best < 14) {
          const next = trail[Math.min(trail.length - 1, at + 4)];
          [gx, gz] = next;
        }
      }
      const dx = gx - npc.x;
      const dz = gz - npc.z;
      if (far > npc.followGap && Math.hypot(dx, dz) > 0.3) {
        // the further behind, the faster: walking, then jogging, then running to catch up
        // (one who is `keen`, a pursuer, does not ease off as he closes)
        want = npc.keen ? (npc.maxSpeed ?? 6.5) : Math.min(npc.maxSpeed ?? 6.5, 1.3 + (far - npc.followGap) * 1.4);
        const turn = angleWrap(Math.atan2(dx, dz) - npc.yaw);
        // (he slows to turn, and does not run rings round a place he has overshot)
        want *= Math.max(0.2, Math.cos(Math.min(Math.PI / 2, Math.abs(turn))));
        npc.yaw += turn * Math.min(1, dt * 7);
      } else npc.faceTo = [t.x, t.z];
    }
    // (one who rests a while where he has come to: `rest` seconds, and then whoever waits on him is told)
    if (npc.rest > 0 && npc.mode === 'stand') {
      npc.rest -= dt;
      if (npc.rest <= 0) {
        npc.arrive?.();
        npc.arrive = null;
      }
    }
    if (want === 0 && npc.faceTo && npc.mode !== 'lie') {
      const a = Math.atan2(npc.faceTo[0] - npc.x, npc.faceTo[1] - npc.z);
      npc.yaw += angleWrap(a - npc.yaw) * Math.min(1, dt * 4);
    }
    npc.speed += (want - npc.speed) * (snap ? 1 : Math.min(1, dt * 6));
    npc.x += Math.sin(npc.yaw) * npc.speed * dt;
    npc.z += Math.cos(npc.yaw) * npc.speed * dt;
    const o = npc.man.object;
    const y = world.heightAt(npc.x, npc.z);
    npc.t = (npc.t ?? 0) + dt;
    if (npc.lying) {
      // on his back across the street, his head to one side
      o.position.set(npc.x, y + 0.12, npc.z);
      o.rotation.set(-Math.PI / 2, 0, npc.yaw, 'YXZ');
    } else {
      // (one who stands in the air, `lift` metres up, rising and settling a little)
      o.position.set(npc.x, y + (npc.lift ? npc.lift + 0.05 * Math.sin(npc.t * 1.1) : 0), npc.z);
      o.rotation.set(0, npc.yaw, 0);
    }
    // the clips: idle below walking pace, walk to about 2 m/s, jog, then run
    // One far off cannot be seen for his smallness. He goes on his way (those who wait on him are still told when he
    // comes), but he is not drawn, and his limbs and his cloak are not worked out: on a phone that is most of the
    // people of the city, most of the time.
    const far = Math.hypot(npc.x - eye[0], npc.z - eye[1]) > FAR;
    if (far !== !!npc.far) {
      npc.far = far;
      if (far) {
        npc.unseen = npc.w.group.children.filter((child) => child.visible);
        for (const child of npc.unseen) child.visible = false;
      } else {
        for (const child of npc.unseen ?? []) child.visible = true;
        npc.unseen = null;
      }
    }
    if (far) return;
    // One who has fallen down and lies still is as he was the frame before: nothing of him is worked out again
    // (a crowd near at hand is much of a frame's work on a phone).
    if (npc.bow === 1 && npc.bowK > 0.996 && npc.speed < 0.05 && !snap && !npc.lying && !npc.holds) {
      o.position.y -= KNEEL * npc.bowK;
      return;
    }
    const s = npc.speed;
    const W = npc.weights;
    const goal = s < 0.25 ? { Idle: 1, Walk: 0, Jog: 0, Run: 0 } : s < 2.2 ? { Idle: 0, Walk: 1, Jog: 0, Run: 0 } : s < 4.2 ? { Idle: 0, Walk: 0, Jog: 1, Run: 0 } : { Idle: 0, Walk: 0, Jog: 0, Run: 1 };
    for (const k of Object.keys(W)) {
      W[k] += (goal[k] - W[k]) * (snap ? 1 : Math.min(1, dt * 6));
      npc.act[k]?.setEffectiveWeight(W[k]);
    }
    // each moving clip at the rate that matches his real speed
    for (const k of ['Walk', 'Jog', 'Run']) {
      const m = npc.man.motion[k];
      if (m?.speed && npc.act[k]) npc.act[k].setEffectiveTimeScale(Math.max(0.3, s / m.speed));
    }
    if (npc.lying) for (const k of Object.keys(W)) npc.act[k]?.setEffectiveTimeScale(k === 'Idle' ? 0.15 : 1);
    npc.mixer.update(dt);
    if (npc.lying && npc.stirs) {
      // one who lies drunk: now and then an arm stirs and falls back, and his head rolls
      const b = npc.man.bones;
      const k = Math.max(0, Math.sin(npc.t * 0.42)) ** 8;
      b.lowerarm_r.rotateX(0.7 * k);
      b.upperarm_r.rotateZ(-0.2 * k);
      b.Head.rotateY(0.3 * Math.sin(npc.t * 0.21));
    }
    if (npc.open) {
      // arms a little out from the sides, the forearms forward, the hands open (the angel)
      const b = npc.man.bones;
      b.upperarm_l.rotateZ(npc.open);
      b.upperarm_r.rotateZ(-npc.open);
      b.lowerarm_l.rotateX(npc.open * 1.1);
      b.lowerarm_r.rotateX(npc.open * 1.1);
    }
    // one who has fallen down to worship (`bow`, 0 to 1): on his knees, bent to the ground, his hands before him
    npc.bowK = (npc.bowK ?? 0) + ((npc.bow ?? 0) - (npc.bowK ?? 0)) * (snap ? 1 : Math.min(1, dt * 2.6));
    if (npc.bowK > 0.01) bowDown(npc, npc.bowK);
    // one who kneels to pray (`kneel`, 0 to 1): upright on his knees
    npc.kneelK = (npc.kneelK ?? 0) + ((npc.kneel ?? 0) - (npc.kneelK ?? 0)) * (snap ? 1 : Math.min(1, dt * 2.6));
    if (npc.kneelK > 0.01) poseAcross(npc.man.bones, o, npc.yaw, PRAY, PRAY_SINK, npc.kneelK);
    o.updateMatrixWorld(true);
    // one who carries something has both hands to it
    npc.held = npc.holds ?? npc.held;
    npc.holdK = Math.min(1, Math.max(0, (npc.holdK ?? 0) + (npc.holds ? 1 : -1) * (snap ? 1 : dt * 4)));
    if (npc.holdK > 0 && npc.held && !npc.lying) holdArms(npc.man.bones, o, npc.yaw, npc.held, npc.holdK);
    // (the cloth of a cloak is worked out only for those who wear one)
    if (!npc.lying && npc.w.outfit.cloak) npc.w.update(Math.max(dt, 1e-3), world.air, world.heightAt);
    // a staff stands upright on the ground where his right hand is, leaning a little out from him
    if (npc.w.staff.visible) {
      npc.man.bones.hand_r.getWorldPosition(target);
      npc.w.staff.position.set(target.x, y + (npc.lift ?? 0), target.z);
      npc.w.staff.rotation.set(0, 0, 0);
    }
  }

  return {
    group,
    people,
    add,
    get(name) {
      return people.get(name);
    },
    /** Hides everyone. */
    clear() {
      for (const npc of people.values()) {
        npc.stop();
        npc.show(false);
        npc.aura = 0;
        npc.stirs = false;
      }
    },
    /** Records where Nephi is; a jump of more than a few metres (a new scene) starts the trail again. */
    track(x, z) {
      eye[0] = x;
      eye[1] = z;
      const last = trail[trail.length - 1];
      if (last && Math.hypot(x - last[0], z - last[1]) > 6) trail.length = 0;
      if (!last || trail.length === 0 || Math.hypot(x - last[0], z - last[1]) > 1) {
        trail.push([x, z]);
        laid++;
      }
      if (trail.length > 400) trail.shift();
    },
    update(dt) {
      time += dt;
      let shining = null;
      for (const npc of people.values()) {
        if (!npc.w.group.visible) continue;
        settle(npc, dt);
        if (npc.aura > 0) shining = npc;
      }
      if (halo) {
        halo.update(time);
        const o = shining?.man.object;
        if (o) halo.set(o.position.x, o.position.y + 1.05, o.position.z, shining.aura * (0.92 + 0.08 * Math.sin(time * 1.4)));
        else halo.set(0, 0, 0, 0);
      }
    },
  };
}
