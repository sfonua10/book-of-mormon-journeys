// The others in the story: Laman, Lemuel and Sam, Laban, his servants, Zoram, the angel. Each is Patch's starter man,
// cloned from one download and dressed in his own colours (wanderer.js), moved by the story rather than by physics:
// he stands, turns to face someone, walks or runs a line of points, or keeps up with Nephi. His clips are played
// straight from a mixer (idle, walk, jog), at the rate that matches how fast he is really going.
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { createWanderer } from '../valley/wanderer.js';

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
 * @param world { heightAt(x, z), air(x, y, z, out) }
 */
export function createCast(field, base, world) {
  const group = new THREE.Group();
  const people = new Map();
  // Where Nephi has walked, a point a metre or so apart, newest last: those who follow him keep to it, so they come
  // through the gate and along the streets as he did, not through the walls.
  const trail = [];

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
        Object.assign(npc, { x, z, yaw, speed: 0, mode: 'stand', path: [], followTarget: null, faceTo: null, maxSpeed: undefined });
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
      /** Keeps him near someone ({ x, z } read each frame), `gap` metres off, walking or running to keep up. */
      follow(target, gap = 3, side = 0) {
        npc.mode = 'follow';
        npc.followTarget = target;
        npc.followGap = gap;
        npc.followSide = side;
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
        // the point of the trail nearest him, and then on along it towards Nephi
        let best = Infinity;
        let at = 0;
        for (let i = 0; i < trail.length; i++) {
          const d = Math.hypot(trail[i][0] - npc.x, trail[i][1] - npc.z);
          if (d < best) {
            best = d;
            at = i;
          }
        }
        if (best < 14) {
          const next = trail[Math.min(trail.length - 1, at + 3)];
          [gx, gz] = next;
        }
      }
      const dx = gx - npc.x;
      const dz = gz - npc.z;
      if (far > npc.followGap && Math.hypot(dx, dz) > 0.3) {
        // the further behind, the faster: walking, then jogging, then running to catch up
        want = Math.min(npc.maxSpeed ?? 6.5, 1.3 + (far - npc.followGap) * 1.4);
        npc.yaw += angleWrap(Math.atan2(dx, dz) - npc.yaw) * Math.min(1, dt * 7);
      } else npc.faceTo = [t.x, t.z];
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
    if (npc.lying) {
      // on his back across the street, his head to one side
      o.position.set(npc.x, y + 0.12, npc.z);
      o.rotation.set(-Math.PI / 2, 0, npc.yaw, 'YXZ');
    } else {
      // (one who stands in the air, `lift` metres up, rising and settling a little)
      npc.t = (npc.t ?? 0) + dt;
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
    if (npc.open) {
      // arms a little out from the sides, the forearms forward, the hands open (the angel)
      const b = npc.man.bones;
      b.upperarm_l.rotateZ(npc.open);
      b.upperarm_r.rotateZ(-npc.open);
      b.lowerarm_l.rotateX(npc.open * 1.1);
      b.lowerarm_r.rotateX(npc.open * 1.1);
    }
    o.updateMatrixWorld(true);
    if (!npc.lying) npc.w.update(Math.max(dt, 1e-3), world.air, world.heightAt);
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
      }
    },
    /** Records where Nephi is; a jump of more than a few metres (a new scene) starts the trail again. */
    track(x, z) {
      const last = trail[trail.length - 1];
      if (last && Math.hypot(x - last[0], z - last[1]) > 6) trail.length = 0;
      if (!last || trail.length === 0 || Math.hypot(x - last[0], z - last[1]) > 1) trail.push([x, z]);
      if (trail.length > 400) trail.shift();
    },
    update(dt) {
      for (const npc of people.values()) if (npc.w.group.visible) settle(npc, dt);
    },
  };
}
