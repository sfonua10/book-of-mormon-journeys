// The others in the story: Laman, Lemuel and Sam, Laban, his servants, Zoram, the angel. Each is Patch's starter man,
// cloned from one download and dressed in his own colours (wanderer.js), moved by the story rather than by physics:
// he stands, turns to face someone, walks or runs a line of points, or keeps up with Nephi. His clips are played
// straight from a mixer (idle, walk, jog), at the rate that matches how fast he is really going.
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { createWanderer } from '../valley/wanderer.js';
import { holdArms } from '../figure/hold.js';
import { createHalo } from './halo.js';

/** A fresh copy of a loaded man (man.js), with his own skeleton, sharing the clips. */
export function cloneMan(src) {
  const object = cloneSkinned(src.object);
  const meshes = [];
  const bones = {};
  object.traverse((o) => {
    if (o.isSkinnedMesh) {
      o.frustumCulled = false;
      meshes.push(o);
    }
    if (o.isBone) bones[o.name] = o;
  });
  return { ...src, object, meshes, bones };
}

const angleWrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

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
    o.updateMatrixWorld(true);
    // one who carries something has both hands to it
    npc.held = npc.holds ?? npc.held;
    npc.holdK = Math.min(1, Math.max(0, (npc.holdK ?? 0) + (npc.holds ? 1 : -1) * (snap ? 1 : dt * 4)));
    if (npc.holdK > 0 && npc.held && !npc.lying) holdArms(npc.man.bones, o, npc.yaw, npc.held, npc.holdK);
    // (the cloth of a cloak is worked out only for those who wear one)
    if (!npc.lying && npc.w.outfit.cloak) npc.w.update(Math.max(dt, 1e-3), world.air, world.heightAt);
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
