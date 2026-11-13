// A walk through one summer valley, in first person. There is nothing to do here but walk and look: this file is
// the walker, the camera and the page. The grass comes from src/lib; the land, the sky, the clouds and the far
// country from the files beside this one. On Patch the page is a block's demo, and talks to the block's page
// through lib/patch-block.js.
import { patchBlock } from 'patch-block';
import { Animator } from '../figure/animator.js';
import { Follow } from '../figure/camera.js';
import { holdArms } from '../figure/hold.js';
import { Input } from '../figure/input.js';
import { Player as Walker } from '../figure/player.js';
import RAPIER from '../figure/rapier/rapier.mjs';
import * as THREE from 'three';
import { bakeGround, createField, createFrame, loadGroundTextures } from '../lib/index.js';
import { createFluff, createStones } from './dressing.js';
import { createFarWoods } from './farwoods.js';
import { createFloor, FLOOR, paintFloor } from './floor.js';
import { createHorizon } from './horizon.js';
import { createSky, createSkyParts, SUNSET } from './sky.js';
import { createSounds } from './sounds.js';
import { createStrokes } from './strokes.js';
import { createTrees } from './trees.js';
import { createRiver } from './water.js';
import { CLOTHES, createWanderer } from './wanderer.js';
import { addCityColliders, createCity, createProps, TURN as CITY_TURN } from '../game/city.js';
import { createDirector } from '../game/director.js';
import { createGuidance } from '../game/guidance.js';
import { createMusic } from '../game/music.js';
import { createNarration } from '../game/narration.js';
import { createTown, TOWN_CLOTHES, TOWNSFOLK } from '../game/town.js';
import { cloneMan, createCast } from '../game/npc.js';
import { createNames } from '../game/names.js';
import { GAME, keeper, STORIES, storyById, WORKS } from '../game/stories.js';
import { createUI } from '../game/ui.js';
import { createTouch, wantsTouch } from '../game/touch.js';
import { loadMan } from '../figure/man.js';
import { fromValley, heightAt, HERO, LAND, paint, setLand, START, tarnDistance } from './world.js';
import { CITY, IN_CITY, PLAIN } from '../game/places.js';

const params = new URLSearchParams(location.search);
// the journey this page plays (?story=id): the first, if none is asked for
const journey = storyById(params.get('story'));
// the land it is told in: the hill country round Jerusalem, unless it brings its own (Babylon's plain). Chosen before
// anything reads the ground, here and in the worker that bakes it.
setLand(journey.land ?? 'hills');
const { people: PEOPLE, clothes: STORY_CLOTHES } = journey;
// how long each part of getting ready took, ms: for tests
const timings = {};
let lap = performance.now();
const mark = (name) => {
  const now = performance.now();
  timings[name] = Math.round(now - lap);
  lap = now;
};
const stepped = params.has('step'); // a test drives the clock: nothing moves until it says
const $ = (id) => document.getElementById(id);

let loaded = false;
let shown = true;
const block = patchBlock({
  onVisible(visible) {
    shown = visible;
    if (loaded) run();
  },
});
/** Says how far along the loading is, and gives the browser a turn so the word gets out and the page stays alive. */
const stage = async (value, label) => {
  block.progress(value, label);
  $('loading').textContent = label;
  await new Promise((done) => setTimeout(done));
};
/**
 * One of the slow sums done on another thread (see bake.worker.js), so the page stays alive and the graphics card
 * can be given its own work meanwhile. Where a worker can't be had, `here` does it on this one.
 */
const offThread = (message, here) =>
  new Promise((done) => {
    let worker = null;
    let settled = false;
    const fallback = () => {
      if (settled) return;
      settled = true;
      worker?.terminate();
      Promise.resolve(here()).then(done);
    };
    try {
      worker = new Worker(new URL('./bake.worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = (e) => {
        if (settled) return;
        settled = true;
        worker.terminate();
        done(e.data);
      };
      worker.onerror = fallback;
      worker.postMessage(message);
    } catch {
      fallback();
    }
  });
// (medium unless asked: high is for a strong graphics card; Patch's own setting is honoured where it is given)
// a phone or a tablet: played by touch (game/touch.js), and painted more lightly unless the address says otherwise
const touch = wantsTouch(params);
const quality = params.get('quality') ?? window.patch?.quality ?? (touch ? 'low' : 'medium');
const EXTENT = 1280;
const GROUND = { extent: EXTENT, extentRes: EXTENT, centre: [0, 0] };
const FLOOR_SIZE = quality === 'low' ? 1024 : 1536;
const hour0 = params.has('hour') ? Number(params.get('hour')) : 15.5;
const groundJob = offThread({ job: 'ground', land: LAND, ...GROUND }, () => bakeGround({ heightAt, paint, ...GROUND }));
const floorJob = offThread({ job: 'floor', land: LAND, size: FLOOR_SIZE }, () => ({ pixels: paintFloor(FLOOR_SIZE) }));
await stage(0.04, 'Painting the sky');
// Sound is made ready now, while the land is being made: opening the PC's audio can hold a page's thread for a
// second or more, and here nothing is waiting on it. It only starts playing on the first click.
const sounds = createSounds();
// the story's music, made in code and played through them
const music = createMusic(sounds);
const soundsReady = params.has('nosound') ? null : sounds.load();

const canvas = $('view');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: stepped });
} catch {
  $('loading').textContent = 'Needs WebGL 2';
  throw new Error('no WebGL 2');
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, params.has('dpr') ? Number(params.get('dpr')) : 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.12, 40000);
camera.rotation.order = 'YXZ';
// Listened for from the start, not once loaded: the page may go fullscreen while the valley is still being made.
// The frame's targets follow the renderer's size on their own, each time it draws.
function fitView() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', fitView);

const groundTextures = loadGroundTextures(renderer, './textures/');
// The sky's clouds and mountains need nothing from the land and are the graphics card's work, most of the wait on
// a fast PC: begun now, they are painted while the land is still being worked out.
const skyParts = createSkyParts(renderer, {
  cloudSize: quality === 'low' ? 512 : quality === 'medium' ? 1024 : 2048,
  cloudSteps: quality === 'low' ? 150 : 240,
  liveClouds: quality !== 'low',
  backdropWidth: quality === 'high' ? 12288 : 4096,
  land: LAND,
});
const skyReady = (async () => {
  const from = performance.now();
  const lapse = (name) => {
    timings[name] = Math.round(performance.now() - from);
  };
  await skyParts.clouds.compile();
  await skyParts.backdrop.compile();
  lapse('skyShadersAt');
  skyParts.backdrop.paint();
  await gpuDone();
  lapse('mountainsAt');
  skyParts.light(hour0);
  await gpuDone();
  lapse('cloudsAt');
})();
mark('skyBegun');
await stage(0.12, 'Laying out the valley');
const baked = await groundJob;
mark('groundWait');
const field = createField({
  heightAt,
  paint,
  ...GROUND,
  // (the part that remembers your footsteps lies along the path down)
  size: 256,
  baked,
  textures: await groundTextures,
  density: quality === 'low' ? 0.45 : quality === 'medium' ? 0.7 : 1,
  // (dry hill grass: shorter than a summer meadow's)
  height: 0.34,
  seed: 3,
});
scene.add(field.group);
// (the land's own colours: the hill country's, or the river plain's)
field.uniforms.uLand.value = LAND === 'plain' ? 1 : 0;
// (the man is the biggest thing to fetch: asked for now, he arrives while the rest is made. Nephi and everyone else
// in the story are copies of him, each dressed in his own colours.)
const manComing = loadMan({ base: './figure/' });
// (he is dressed as the journey has him: Nephi, unless it brings clothes for its own `player`)
const wandererComing = manComing.then((man) => createWanderer(field, null, STORY_CLOTHES.player ?? {}, { man: cloneMan(man) }));
const physicsComing = RAPIER.init();
mark('field');
field.uniforms.tFloor.value = createFloor(renderer, FLOOR_SIZE, (await floorJob).pixels);
mark('floorPaint');
field.uniforms.uFloor.value.set(HERO[0], HERO[1], FLOOR.u0, FLOOR.v0);
field.uniforms.uFloorInv.value = 1 / FLOOR.size;
field.uniforms.tStrokes.value = createStrokes(renderer);
mark('strokes');
{
  // the ground's slope, for the light on the meadow: taken over a few metres, so it is the lie of the land and
  // not every bump in it (a hummock lit on its own is a blotch)
  const RES = 512;
  const data = new Uint8Array(RES * RES * 2);
  const step = EXTENT / RES;
  const byte = (slope) => Math.round(255 * Math.min(1, Math.max(0, 0.5 + slope * 2)));
  for (let j = 0, k = 0; j < RES; j++) {
    const z = -EXTENT / 2 + (j + 0.5) * step;
    for (let i = 0; i < RES; i++) {
      const x = -EXTENT / 2 + (i + 0.5) * step;
      data[k++] = byte((field.heightAt(x + 24, z) - field.heightAt(x - 24, z)) / 48);
      data[k++] = byte((field.heightAt(x, z + 24) - field.heightAt(x, z - 24)) / 48);
    }
  }
  const slope = new THREE.DataTexture(data, RES, RES, THREE.RGFormat, THREE.UnsignedByteType);
  slope.minFilter = slope.magFilter = THREE.LinearFilter;
  slope.unpackAlignment = 1;
  slope.needsUpdate = true;
  field.uniforms.tSlope.value = slope;
  // (on the level plain the far ground is painted as from a little height, or its brushwork would lie in streaks)
  field.uniforms.uHeroEye.value.set(START[0], field.heightAt(START[0], START[1]) + (LAND === 'plain' ? 45 : 1.68), START[1]);
}
mark('floor');
await stage(0.3, 'Building the village');
const frame = createFrame(renderer, field, { samples: quality === 'low' ? 0 : 4, bloom: 0.1 });
mark('frame');
const sky = createSky(renderer, field, { parts: skyParts });
mark('sky');
const trees = createTrees(field, { cards: quality === 'low' ? 0.6 : quality === 'medium' ? 0.8 : 1 });
mark('trees');
const farWoods = createFarWoods(field);
mark('farWoods');
// (the city as this journey has it: Jerusalem, unless it brings its own look)
const city = createCity(field, journey.look);
mark('city');
const horizon = createHorizon(field, EXTENT / 2);
scene.add(sky.mesh, horizon, trees.group, farWoods.group, city.mesh);
// the river plain's river and canals
if (LAND === 'plain') scene.add(createRiver(field, sky, PLAIN.river.level, EXTENT));
// the finish: the frame laid in as brush marks. ?paint=0 for none; P turns it on and off.
frame.paint = params.has('paint') ? Number(params.get('paint')) : quality === 'low' ? 0 : quality === 'medium' ? 2 : 3;
const paintWas = frame.paint || 3;
mark('build');
await stage(0.45, 'Planting trees');
const stones = createStones(field);
scene.add(stones.group);
if (quality !== 'low' && params.get('seeds') !== '0') scene.add(createFluff(field, quality === 'medium' ? 200 : 320));
// time passes: the afternoon you start in is sunset twenty minutes later. ?drift=0 holds the hour; T and 1 to 4
// pick a time of day and hold it there, 0 lets it pass again, and , and . nudge it.
// (in the story the hour is the story's: it does not pass by itself)
let drift = params.has('drift') ? Number(params.get('drift')) : 0;
const TIMES = [
  { hour: 12.5, name: 'Noon' },
  { hour: 15.5, name: 'Afternoon' },
  { hour: 19, name: 'Golden hour' },
  { hour: 20.3, name: 'Sunset' },
];
const DRIFT = (SUNSET - 15.5) / (20 * 60);
let castAt = 0;
let clock = 0;

// the story's parts, made once everything else is ready (see the end of this file)
let director = null;
/** What Nephi last held ({ out, up, wide }), and how far his arms are into holding it, 0 to 1. */
let carryPose = null;
let carryK = 0;
/** The treasury's door: where it is, and the collider that shuts it. */
let treasuryDoor = null;
let guidance = null;
/** A fixed view the story asks for ({ position, target }), or null for the eye behind Nephi. */
let cinematic = null;

// ---- the walker ----------------------------------------------------------------------------------------------
const EYE = 1.68;
const REACH = EXTENT / 2 - 110; // metres from the middle you can walk
const WALK = 4.2;
const RUN = 6.3;
const player = {
  x: START[0],
  z: START[1],
  y: 0,
  vy: 0,
  vx: 0,
  vz: 0,
  yaw: Math.atan2(-HERO[0], -HERO[1]),
  pitch: 0.04,
  onGround: true,
  walked: 0,
  stride: 0,
  foot: 1,
  bob: 0,
  dip: 0,
};
player.y = field.heightAt(player.x, player.z);
const keys = new Set();

function updatePlayer(dt) {
  const fx = -Math.sin(player.yaw);
  const fz = -Math.cos(player.yaw);
  const rx = -fz;
  const rz = fx;
  let mx = 0;
  let mz = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) mz += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) mz -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
  const len = Math.hypot(mx, mz) || 1;
  const speed = Math.min(walker?.cap || Infinity, keys.has('ShiftLeft') || keys.has('ShiftRight') ? RUN : WALK);
  const wantX = ((fx * mz + rx * mx) / len) * speed;
  const wantZ = ((fz * mz + rz * mx) / len) * speed;
  const grip = player.onGround ? 9 : 2;
  player.vx += (wantX - player.vx) * Math.min(1, dt * grip);
  player.vz += (wantZ - player.vz) * Math.min(1, dt * grip);
  const fromX = player.x;
  const fromZ = player.z;
  player.x += player.vx * dt;
  player.z += player.vz * dt;
  // the tarn's edge is as far as you go: no wading
  if (tarnDistance(player.x, player.z) < 0.88 && tarnDistance(player.x, player.z) < tarnDistance(fromX, fromZ)) {
    player.x = fromX;
    player.z = fromZ;
    player.vx *= 0.5;
    player.vz *= 0.5;
  }
  // nor through a tree
  for (const [sx, sz, gap] of stones.solid) {
    const dx = player.x - sx;
    const dz = player.z - sz;
    const d = Math.hypot(dx, dz);
    if (d < gap && d > 1e-4) {
      player.x = sx + (dx / d) * gap;
      player.z = sz + (dz / d) * gap;
    }
  }
  for (const [tx, tz, kind, scale] of trees.trees) {
    if (kind > 3) break;
    const gap = (kind === 0 ? 1.25 : 0.6) * scale;
    const dx = player.x - tx;
    const dz = player.z - tz;
    const d = Math.hypot(dx, dz);
    if (d < gap && d > 1e-4) {
      player.x = tx + (dx / d) * gap;
      player.z = tz + (dz / d) * gap;
    }
  }
  // the valley goes on, but the walk doesn't: the ground turns you back gently at its edge
  const r = Math.hypot(player.x, player.z);
  if (r > REACH) {
    player.x *= REACH / r;
    player.z *= REACH / r;
  }
  const ground = field.heightAt(player.x, player.z);
  if (player.onGround) {
    player.y = ground;
    if (keys.has('Space')) {
      player.vy = 4.4;
      player.onGround = false;
    }
  } else {
    player.vy -= 12.5 * dt;
    player.y += player.vy * dt;
    if (player.y <= ground) {
      field.bend(player.x, player.z, 0.55, 0, 0, Math.min(1, -player.vy / 5));
      sounds.step(0.7);
      player.dip = Math.min(0.1, -player.vy * 0.016);
      player.y = ground;
      player.vy = 0;
      player.onGround = true;
    }
  }
  tread(dt, true);
}

/** What walking does to the meadow and, for a walker with no feet to be seen, what it sounds like. */
function tread(dt, heard) {
  const pace = Math.hypot(player.vx, player.vz);
  const moved = pace * dt;
  if (player.onGround && moved > 0) {
    player.walked += moved;
    player.stride += moved;
    // each foot presses the grass down the way it's going
    if (player.stride > 0.16 && pace > 0.05) {
      player.stride = 0;
      const side = player.foot * 0.12;
      field.bend(player.x - (player.vz / pace) * side, player.z + (player.vx / pace) * side, 0.27, player.vx, player.vz, 0.8);
    }
    // about a step a metre, soft
    if (player.walked > (pace > 5 ? 1.2 : 0.95)) {
      player.walked = 0;
      player.foot = -player.foot;
      if (heard) sounds.step(pace > 5 ? 0.42 : 0.28);
    }
    player.bob += moved * (Math.PI / 0.95);
  }
  player.dip *= Math.exp(-dt * 9);
  field.setPusher(0, player.x, player.y + 0.2, player.z, 0.17);
}

// ---- the wanderer: the same walk, seen from behind him --------------------------------------------------------
await physicsComing;
const physics = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
{
  // the ground under him: the meadow's own heights a metre apart, as far as the walk goes, with the trees and the
  // big stones standing on it
  const half = REACH + 40;
  const cells = 2 * half;
  const heights = new Float32Array((cells + 1) * (cells + 1));
  for (let col = 0; col <= cells; col++) {
    for (let row = 0; row <= cells; row++) heights[row + col * (cells + 1)] = field.heightAt(-half + col, -half + row);
  }
  physics.createCollider(RAPIER.ColliderDesc.heightfield(cells, cells, heights, { x: 2 * half, y: 1, z: 2 * half }));
  for (const [sx, sz, gap] of stones.solid) physics.createCollider(RAPIER.ColliderDesc.cylinder(1, gap * 0.75).setTranslation(sx, field.heightAt(sx, sz), sz));
  for (const [tx, tz, kind, scale] of trees.trees) {
    if (kind > 3) break;
    physics.createCollider(RAPIER.ColliderDesc.cylinder(4, (kind === 0 ? 0.85 : 0.4) * scale).setTranslation(tx, field.heightAt(tx, tz) + 3, tz));
  }
  // the city's walls and houses, the house in the land of inheritance, the tents
  addCityColliders(RAPIER, physics, city.solids);
  // the treasury's door, shut until the keeper of the keys opens it (4:20): in Jerusalem, where there is one
  if (city.look.name === 'jerusalem') {
    const [x, z] = fromValley(CITY.at[0] + IN_CITY.treasuryDoor[0], CITY.at[1] + IN_CITY.treasury[3] - 0.45);
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), CITY_TURN);
    treasuryDoor = { at: [x, z], collider: physics.createCollider(RAPIER.ColliderDesc.cuboid(1.1, 2, 0.4).setTranslation(x, field.heightAt(x, z) + 1.6, z).setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })) };
  }
}
const wanderer = await wandererComing;
scene.add(wanderer.group);
// everyone else in the story
const cast = createCast(field, await manComing, { heightAt: (x, z) => field.heightAt(x, z), air: (x, y, z, out) => air(x, y, z, out), scene });
await Promise.all(PEOPLE.map(([name, dress, beard, scale]) => cast.add(name, STORY_CLOTHES[dress], { beard, scale })));
// and the people of the city, by day
await Promise.all(TOWNSFOLK.map(([name, dress, beard]) => cast.add(name, TOWN_CLOTHES[dress], { beard })));
scene.add(cast.group);
const props = createProps(city, (x, z) => field.heightAt(x, z));
scene.add(props.group);
const animator = new Animator(wanderer.man);
const walker = new Walker({ RAPIER, world: physics, man: wanderer.man, animator, spawn: new THREE.Vector3(player.x, player.y, player.z), yaw: player.yaw + Math.PI });
const follow = new Follow(camera);
// the names of those the text names, small, over their heads (names.js); ?names=0 for none
const names = createNames((from, dir, max) => walker.castRay(from, dir, max));
if (params.get('names') !== '0') {
  for (const [who, name] of Object.entries(journey.names ?? {})) {
    const npc = cast.get(who);
    if (who === 'you') names.add(name, wanderer.man.object, () => wanderer.group.visible, () => wanderer.outfit.head);
    else if (npc) names.add(name, npc.man.object, () => npc.visible && !npc.far, () => npc.w.outfit.head, () => !!npc.lying);
  }
}
const input = new Input(canvas, { pads: !stepped && !params.has('nopad') });
physics.step();
// V goes between the two walks; ?view=first begins in your own eyes
let third = params.get('view') !== 'first';
const UP = new THREE.Vector3(0, 1, 0);
const local = new THREE.Vector3();
const gaze = new THREE.Vector3();
const held = new THREE.Vector3();
const footUp = { l: false, r: false };
let sinceStep = 0;

/** Stands him at a place, facing a way (his yaw: 0 looks along +z), still. */
function standAt(x, z, yaw) {
  const y = field.heightAt(x, z);
  walker.body.setTranslation({ x, y: y + walker.t.radius + walker.halfHeight() + 0.05, z }, true);
  physics.propagateModifiedBodyPositionsToColliders();
  walker.feet.set(x, y, z);
  walker.prevFeet.copy(walker.feet);
  walker.visualY = y;
  walker.vel.set(0, 0, 0);
  walker.speed = 0;
  walker.mode = 'move';
  walker.grounded = true;
  walker.yaw = walker.lastYaw = yaw;
  animator.lock = null;
  animator.lockOff = null;
  animator.enter(animator.locoState({ strafe: false }), 0.05);
}

/** Third person or first. Either way you are where you were, looking where you looked. */
function setThird(on) {
  third = on;
  wanderer.group.visible = on;
  camera.fov = on ? 52 : 68;
  camera.updateProjectionMatrix();
  if (on) {
    standAt(player.x, player.z, player.yaw + Math.PI);
    follow.yaw = player.yaw + Math.PI;
    follow.pitch = Math.min(0.5, Math.max(-0.3, 0.02 - player.pitch));
    follow.pivot.set(0, 0, 0);
    follow.distance = follow.want;
  } else {
    player.vx = player.vz = 0;
    field.uniforms.uWalker.value.w = 0;
  }
}

/** The wind where the cloak is: the valley's, in gusts. */
function air(x, y, z, out) {
  const cx = Math.cos(wind.angle);
  const cz = Math.sin(wind.angle);
  const along = x * cx + z * cz;
  const gust = 0.5 + 0.5 * Math.sin((along - clock * 5) / 9) * Math.sin(clock * 0.37 + z / 23);
  const speed = wind.speed * (0.25 + 0.75 * gust * gust);
  return out.set(cx * speed, 0.2 * Math.sin(clock * 2.3 + x) * gust, cz * speed);
}

/** Where the autopilot (?auto) last made progress towards its goal, and when. */
const autoTrack = { key: '', d: Infinity, since: 0 };
function updateWanderer(dt) {
  const inp = input.read(dt);
  if (director?.frozen) {
    // while a card is up he stands; the eye can still look round
    inp.move = { x: 0, y: 0 };
    inp.jump = false;
  } else if (director?.auto) steer(inp, dt);
  held.copy(walker.feet);
  const bodyWas = walker.body.translation();
  walker.update(dt, inp, follow.yaw);
  // the tarn's edge and the end of the walk are as far as he goes
  const f = walker.feet;
  if ((tarnDistance(f.x, f.z) < 0.88 && tarnDistance(f.x, f.z) < tarnDistance(held.x, held.z)) || (Math.hypot(f.x, f.z) > REACH && Math.hypot(f.x, f.z) > Math.hypot(held.x, held.z))) {
    walker.body.setTranslation(bodyWas, true);
    physics.propagateModifiedBodyPositionsToColliders();
    walker.feet.copy(held);
    walker.speed *= 0.5;
  }
  const at = walker.visualRoot(dt);
  const man = wanderer.man.object;
  man.position.copy(at);
  man.rotation.set(0, walker.yaw, 0);
  man.updateMatrixWorld(true);
  const onGround = walker.grounded && walker.mode !== 'jump' && walker.mode !== 'air';
  local.copy(walker.vel).applyAxisAngle(UP, -walker.yaw);
  animator.update(dt, { speed: walker.mode === 'move' ? walker.speed : Math.hypot(local.x, local.z), moveAngle: walker.moveAngle, grounded: walker.grounded });
  animator.relaxHands(walker.speed);
  animator.uprightTrunk(dt, walker.speed, onGround ? 1 : 0.3);
  const looking = walker.mode === 'move' || walker.mode === 'idleExtra' ? Math.min(1, Math.max(0, 1 - (walker.speed - 1.5) / 2)) : 0;
  animator.lookToward(dt, camera.getWorldDirection(gaze), looking);
  animator.armClearance(dt);
  // what Nephi carries, he carries in both hands (g.player.holds, set by props.carry)
  {
    const holds = director ? g.player.holds : null;
    carryPose = holds ?? carryPose;
    carryK = Math.min(1, Math.max(0, carryK + (holds ? 1 : -1) * dt * 4));
    if (carryK > 0 && carryPose) {
      animator.object.updateMatrixWorld(true);
      holdArms(animator.bones, animator.object, walker.yaw, carryPose, carryK);
    }
  }
  if (walker.mode === 'move' && !walker.strafe) animator.leanInto(dt, walker.turnRate, walker.speed, walker.accelF);
  else animator.leanInto(dt, 0, 0, 0);
  animator.placeFeet(dt, (x, z, from) => walker.ground(x, z, from, 1.4), at.y, onGround ? 1 : 0);
  man.updateMatrixWorld(true);
  // a step is heard when a foot of his comes down, and at no other time: louder the faster he goes
  // (a foot has landed when its ankle, having swung clear of the ground, is back down by it)
  sinceStep += dt;
  for (const side of ['l', 'r']) {
    const lift = animator.bones[`foot_${side}`].getWorldPosition(gaze).y - at.y;
    if (lift > 0.2) footUp[side] = true;
    else if (lift < 0.125 && footUp[side]) {
      footUp[side] = false;
      if (onGround && walker.speed > 0.5 && sinceStep > 0.15) {
        sounds.step(walker.speed > 6 ? 0.42 : walker.speed > 3 ? 0.32 : 0.22);
        sinceStep = 0;
      }
    }
  }
  wanderer.update(dt, air, field.heightAt);

  // the valley knows the walker by where he stands: the grass under him, the sounds round him
  const landed = onGround && !player.onGround;
  Object.assign(player, { x: at.x, y: at.y, z: at.z, vx: walker.vel.x, vz: walker.vel.z, onGround });
  if (landed) {
    field.bend(player.x, player.z, 0.55, 0, 0, 0.7);
    sounds.step(0.7);
  }
  tread(dt, false);
  // his shadow: longer as the sun comes down
  const flat = Math.hypot(sky.sunDir.x, sky.sunDir.z);
  field.uniforms.uWalker.value.set(at.x, at.z, 0.72, Math.min(9, (1.75 * flat) / Math.max(0.05, sky.sunDir.y)));

  if (!window.__tg?.view) {
    follow.free = cinematic;
    // (the eye comes in when a wall is in the way, as it does for a trunk)
    follow.update(dt, at, inp.look, inp.zoom, (from, dir, max) => walker.castRay(from, dir, max), (x, z) => field.heightAt(x, z) + 0.5);
    camera.updateMatrixWorld();
    // (should you step into your own eyes, you look the way the camera did)
    player.yaw = follow.yaw - Math.PI;
    player.pitch = -follow.pitch;
  }
}

/** The way-marker over where the story wants Nephi to go (never in the night act, where there is none). */
const marked = new THREE.Vector3();
/** Where on the page it is shown ([x, y]), or null: the names over the people give way to it. */
let markedAt = null;
function showMarker() {
  markedAt = null;
  // (nothing until the story has begun: the warm-up frames come before the page's parts are made)
  if (!director) return;
  const goal = director.goal;
  if (!goal?.mark || director.frozen) return void ui.marker(null);
  // (over the heads of any who stand there)
  marked.set(goal.x, field.heightAt(goal.x, goal.z) + 3, goal.z).project(camera);
  const w = window.innerWidth;
  const h = window.innerHeight;
  const metres = Math.hypot(goal.x - player.x, goal.z - player.z);
  const x = (marked.x * 0.5 + 0.5) * w;
  const y = (-marked.y * 0.5 + 0.5) * h;
  // behind the eye: at the side it lies, half way up, with an arrow that way round
  if (marked.z > 1) {
    const left = w - x < w / 2;
    return void ui.marker(left ? 50 : w - 50, h / 2, metres, left ? Math.PI : 0);
  }
  // off the picture: at its edge (and clear of the words low on the screen), with an arrow to where it is
  const cx = Math.min(w - 50, Math.max(50, x));
  const cy = Math.min(h - Math.max(150, h * 0.3), Math.max(70, y));
  ui.marker(cx, cy, metres, cx === x && cy === y ? null : Math.atan2(y - cy, x - cx));
  markedAt = [cx, cy];
}

/** The autopilot: walks him towards the story's goal, and lifts him over anything he is stuck on. */
function steer(inp, dt) {
  const goal = director.goal;
  if (!goal) return;
  const dx = goal.x - player.x;
  const dz = goal.z - player.z;
  const d = Math.hypot(dx, dz);
  if (d < (goal.r ?? 1) * 0.6) return;
  const c = follow.yaw;
  inp.move = { x: (dx * -Math.cos(c) + dz * Math.sin(c)) / d, y: (dx * Math.sin(c) + dz * Math.cos(c)) / d };
  inp.sprint = d > 14;
  // (a new goal, or the next stop on the way, starts the count again)
  const key = `${goal.x.toFixed(1)},${goal.z.toFixed(1)}`;
  if (key !== autoTrack.key) Object.assign(autoTrack, { key, d: Infinity, since: 0 });
  if (d < autoTrack.d - 0.5) Object.assign(autoTrack, { d, since: 0 });
  else autoTrack.since += dt;
  if (autoTrack.since > 3) {
    const step = Math.min(d, 8);
    const [u, v] = [player.x * 0.6 + player.z * 0.8, -player.x * 0.8 + player.z * 0.6];
    g.log(`autopilot stuck at (u ${u.toFixed(0)}, v ${v.toFixed(0)}) ${d.toFixed(1)} m from its goal: lifted ${step.toFixed(1)} m on`);
    g.standAt(player.x + (dx / d) * step, player.z + (dz / d) * step, Math.atan2(dx, dz));
    Object.assign(autoTrack, { d: Infinity, since: 0 });
  }
}

function placeCamera() {
  // a test or a film can take the camera off the walker: __tg.view = { x, y, z, yaw, pitch }, y above the ground
  const view = window.__tg?.view;
  if (view) {
    camera.position.set(view.x, field.heightAt(view.x, view.z) + (view.y ?? EYE), view.z);
    camera.rotation.set(view.pitch ?? 0, view.yaw ?? 0, 0);
    if (view.fov && view.fov !== camera.fov) {
      camera.fov = view.fov;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
    return;
  }
  if (third) return;
  const pace = Math.min(1, Math.hypot(player.vx, player.vz) / RUN);
  const bob = player.onGround ? Math.sin(player.bob) * 0.022 * pace : 0;
  camera.position.set(player.x, player.y + EYE + bob - player.dip, player.z);
  camera.rotation.set(player.pitch, player.yaw, 0);
  camera.updateMatrixWorld();
}

// ---- the page ------------------------------------------------------------------------------------------------
const wind = { angle: Math.atan2(HERO[1], HERO[0]) + 0.9, speed: 4.5 };

function setHour(hour) {
  sky.setHour(Math.max(12, hour));
  trees.cast(sky.sunDir);
  castAt = sky.hour;
  city.uniforms.uNight.value = sky.night;
}
let noteTimer = 0;
/** A word or two at the top of the screen, gone in a moment. */
function note(text) {
  const el = $('note');
  el.textContent = text;
  el.classList.add('on');
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => el.classList.remove('on'), 1400);
}
/** Goes to one of the times of day and holds it there. */
function pickTime(index) {
  const time = TIMES[(index + TIMES.length) % TIMES.length];
  drift = 0;
  setHour(time.hour);
  note(time.name);
}
function setWind(speed) {
  wind.speed = Math.min(12, Math.max(0, speed));
  field.setWind(wind.angle, wind.speed);
}

canvas.addEventListener('click', () => {
  sounds.start();
  if (touch) return;
  if (document.pointerLockElement !== canvas) canvas.requestPointerLock()?.catch?.(() => {});
});
document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  document.body.classList.toggle('playing', locked);
  if (locked) sounds.start();
  else keys.clear();
});
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  player.yaw -= e.movementX * 0.0021;
  player.pitch = Math.min(1.45, Math.max(-1.45, player.pitch - e.movementY * 0.0021));
});
document.addEventListener('keydown', (e) => {
  keys.add(e.code);
  // (after the last of them, round to the first again)
  // (the story keeps the hour and the eye; P still takes the paint finish off and on)
  if (e.code === 'KeyP') frame.paint = frame.paint ? 0 : paintWas;
  if (e.code === 'Space') e.preventDefault();
});
document.addEventListener('keyup', (e) => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());

/** Resolves once the GPU has done everything asked of it so far, without holding the page up while it does. */
function gpuDone() {
  const gl = renderer.getContext();
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();
  return new Promise((done) => {
    const check = () => {
      const state = gl.clientWaitSync(sync, 0, 0);
      if (state === gl.TIMEOUT_EXPIRED) return void setTimeout(check, 2);
      gl.deleteSync(sync);
      done();
    };
    check();
  });
}

// ---- the loop ------------------------------------------------------------------------------------------------
function tick(dt) {
  if (third) updateWanderer(dt);
  else {
    input.read(dt);
    updatePlayer(dt);
  }
  cast.track(player.x, player.z);
  cast.update(dt);
  props.update();
  placeCamera();
  field.update(dt, camera);
  director?.update(dt);
  guidance?.update(dt);
  music.update(dt);
  showMarker();
  // (no names before the story has begun, nor behind the screen at its end)
  names.update(camera, window.innerWidth, window.innerHeight, !!director && !director.ended, markedAt);
  farWoods.update(dt, wind.speed);
  frame.update(dt, camera);
  clock += dt;
  if (drift > 0 && sky.hour < SUNSET && !window.__tg?.view) {
    sky.setHour(Math.min(SUNSET, sky.hour + dt * drift * DRIFT), true);
    if (Math.abs(sky.hour - castAt) > 0.04) {
      trees.cast(sky.sunDir);
      castAt = sky.hour;
    }
  }
  // what you hear depends on where you stand: leaves under a tree, water by the tarn, crickets as the light goes
  let tree = 0;
  for (const [tx, tz, kind, scale] of trees.trees) {
    if (kind > 3) break;
    const reach = (kind === 0 ? 11.5 : 5.6) * scale;
    const d = Math.hypot(player.x - tx, player.z - tz);
    tree = Math.max(tree, 1 - Math.min(1, Math.max(0, (d - reach * 0.8) / (reach * 2.2))));
  }
  const tarn = 1 - Math.min(1, Math.max(0, (tarnDistance(player.x, player.z) - 1) / 1.6));
  const gust = 0.5 + 0.5 * Math.sin(clock * 0.23) * Math.sin(clock * 0.37 + 1);
  sounds.update(dt, { wind: wind.speed, gust, tree, tarn, dusk: Math.min(1, Math.max(0, (sky.hour - 18.8) / 1.4)) * (1 - 0.4 * sky.night) });
  sky.update(dt, camera);
  frame.exposure = sky.exposure;
  // (only what can be seen of the trees and of the far land is drawn: the camera is by now where this frame is
  // drawn from)
  trees.cull(camera, canvas.height);
  horizon.cull(camera);
  frame.render(scene, camera);
}

mark('land');
await stage(0.5, 'Painting the mountains');
await skyReady;
mark('skyWait');
await stage(0.64, 'Painting the clouds');
setHour(hour0);
setWind(params.has('wind') ? Number(params.get('wind')) : 4.5);
setThird(third);
if (third) updateWanderer(1 / 60);
placeCamera();
field.update(0, camera);
sky.update(0, camera);
await gpuDone();
mark('clouds');
await stage(0.78, 'Mixing paint');
await Promise.all([frame.compile(scene, camera), soundsReady]);
mark('sceneShaders');
await stage(0.9, 'Warming up');
// real frames, each waited for, so the first the walker sees isn't the one that compiles: a full turn of the
// clouds' strips, a few steps taken and the grass trodden
{
  const [x0, z0] = [player.x, player.z];
  keys.add('KeyW');
  input.keys.add('KeyW');
  for (let i = 0; i < 44; i++) {
    tick(1 / 30);
    await gpuDone();
    if (i % 11 === 10) await stage(0.9 + 0.08 * (i / 44), 'Warming up');
  }
  keys.clear();
  input.keys.clear();
  Object.assign(player, { x: x0, z: z0, vx: 0, vz: 0, walked: 0, stride: 0, bob: 0, yaw: Math.atan2(-HERO[0], -HERO[1]), pitch: 0.04 });
  if (third) setThird(true);
  field.reset();
  clock = 0;
  setHour(params.has('hour') ? Number(params.get('hour')) : 15.5);
  tick(1 / 60);
  await gpuDone();
}
mark('warm');

// ---- the story -----------------------------------------------------------------------------------------------
const ui = createUI({ touch });
const narration = createNarration(sounds, { note, book: journey.scripture.book });
// (the list of recordings is asked for once the sounds are ready, since they are played through them)
Promise.resolve(soundsReady).then(() => narration.load());
if (touch) createTouch({ canvas, input, ui, press: () => director?.press(), tap: () => director?.tap(), wake: () => sounds.start(), mouse: params.has('touch') });
/** What the story can reach of the game. Places are given in (u, v) with P, or in metres from the city's middle with C. */
const g = {
  canvas,
  scene,
  ui,
  cast,
  props,
  field,
  sounds,
  music,
  /** Whether the page was opened with ?name (a test asking for something). */
  flag: (name) => params.has(name),
  // (the journey's own book: stories.js)
  verses: journey.scripture.verses,
  reference: journey.scripture.reference,
  P: (u, v) => fromValley(u, v),
  C: (cu, cv) => fromValley(CITY.at[0] + cu, CITY.at[1] + cv),
  auto: params.has('auto'),
  heightAt: (x, z) => field.heightAt(x, z),
  clock: () => clock,
  player: {
    get x() {
      return player.x;
    },
    get z() {
      return player.z;
    },
    get vx() {
      return player.vx;
    },
    get vz() {
      return player.vz;
    },
    get yaw() {
      return walker.yaw;
    },
    // (he can carry things as the others do: props.carry)
    visible: true,
  },
  log: (message) => console.log(`[game] ${message}`),
  /** The scripture read aloud, where there are recordings of it (narration.js). */
  narration,
  setHour,
  /** Puts Nephi at (x, z) facing yaw, with the eye behind him. */
  standAt(x, z, yaw) {
    standAt(x, z, yaw);
    Object.assign(player, { x, z, y: field.heightAt(x, z), vx: 0, vz: 0 });
    follow.yaw = yaw;
    follow.pitch = 0.12;
    follow.pivot.set(0, 0, 0);
    follow.distance = follow.want;
  },
  /** What he carries weighs on him: he goes no faster than `cap` m/s (null: nothing weighs on him). */
  burden(cap) {
    walker.cap = cap;
  },
  /** Opens or shuts the treasury's door. */
  door(open) {
    // (a city with no treasury has no door to it)
    if (!treasuryDoor) return;
    treasuryDoor.collider.setEnabled(!open);
    if (open) props.hide('door');
    else props.show('door', treasuryDoor.at);
  },
  /** Lights the room the story is at: 'treasury' or 'lehi' (city.js). */
  room(name) {
    city.light(name);
  },
  /** His own clothes, or another's of the story by name (Laban's, 4:19). */
  dress(who) {
    wanderer.dress(STORY_CLOTHES[who] ?? STORY_CLOTHES.player ?? CLOTHES);
  },
  /** A fixed view: from [x, z, metres above the ground] to [x, z, metres above]; null to give the eye back. */
  view(v) {
    // (when the shot ends, the eye behind Nephi takes up the way it looked)
    if (!v && cinematic) follow.yaw = Math.atan2(cinematic.target.x - cinematic.position.x, cinematic.target.z - cinematic.position.z);
    cinematic = v && {
      position: new THREE.Vector3(v.from[0], field.heightAt(v.from[0], v.from[1]) + v.from[2], v.from[1]),
      target: new THREE.Vector3(v.to[0], field.heightAt(v.to[0], v.to[1]) + v.to[2], v.to[1]),
    };
  },
  /**
   * Over Nephi's shoulder at a point [x, z]: the first of a few places for the eye (behind him, to either side,
   * higher) from which both he and it can be seen, with no wall in the way.
   */
  shoulder([tx, tz], { back = 3.4, side = 1.1, up = 2.1, look = 1.3 } = {}) {
    const d = Math.hypot(tx - player.x, tz - player.z) || 1;
    const fx = (tx - player.x) / d;
    const fz = (tz - player.z) / d;
    const target = new THREE.Vector3(tx, field.heightAt(tx, tz) + look, tz);
    const head = new THREE.Vector3(player.x, player.y + 1.5, player.z);
    const clear = (from, to) => {
      const dir = to.clone().sub(from);
      const far = dir.length();
      const hit = walker.castRay(from, dir.normalize(), far);
      return hit == null || hit > far - 0.4;
    };
    const tries = [[back, side, up], [back, -side, up], [back * 0.7, side * 1.6, up], [back * 0.7, -side * 1.6, up], [back * 0.55, side * 0.6, up + 1.4], [back * 0.4, -side * 0.5, up + 2.2], [-0.5, side * 3, up], [-0.5, -side * 3, up], [0, side * 2, up + 3]];
    for (const [b, s, u] of tries) {
      const x = player.x - fx * b + fz * s;
      const z = player.z - fz * b - fx * s;
      const from = new THREE.Vector3(x, field.heightAt(x, z) + u, z);
      if (clear(from, head) && clear(from, target)) {
        cinematic = { position: from, target };
        return;
      }
    }
    // (nowhere clear: leave the eye as it is)
  },
  get guidance() {
    return guidance;
  },
  /** The journey's end: its own words, and the ways on from there (the page is loaded afresh for either). */
  end() {
    ui.end({ copy: journey.end, onAgain: () => openJourney(journey.id, 'begin'), onBack: () => openJourney(null) });
  },
  /** Whether the story holds Nephi still (a card is up). */
  get frozen() {
    return !!director?.frozen;
  },
};
// (the people of the city, as the journey has them: Jerusalem's, unless it brings its own)
g.town = journey.town ? journey.town(g) : createTown(g);
guidance = createGuidance(g, ui);
director = createDirector(journey.beats(g), ui, g, { keep: keeper(journey), auto: g.auto, autoRead: params.has('autoread') ? Number(params.get('autoread')) : 0.15 });

// for tests and filming: everything the page is made of, and a clock to drive by hand
window.__tg = { sounds, walker, follow, input, wanderer, animator, setThird, standAt, pickTime, timings, view: null, wind, THREE, renderer, scene, camera, field, frame, sky, trees, farWoods, stones, player, keys, tick, setHour, setWind, fromValley, director, cast, props, city, g, ready: true };

// ---- the loop's switch ----------------------------------------------------------------------------------------
let last = 0;
let running = false;
/** Draws while the page says the demo can be seen, and not at all while it can't. */
function run() {
  const want = shown && !stepped;
  if (want === running) return;
  running = want;
  last = performance.now();
  renderer.setAnimationLoop(
    want
      ? (now) => {
          const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
          last = now;
          tick(dt);
        }
      : null,
  );
}

fitView();
loaded = true;
run();
$('loading').remove();
document.body.classList.add('ready');
block.ready();
// for the measuring tools
window.__block = { ready: true, block, timings };

/** Loads the page afresh for a journey (`go`: 'begin' or 'continue'), or with none, for the list of them. */
function openJourney(id, go) {
  const to = new URL(location.href);
  for (const name of ['story', 'go', 'beat', 'auto']) to.searchParams.delete(name);
  if (id) {
    to.searchParams.set('story', id);
    to.searchParams.set('go', go);
  }
  location.assign(to);
}

// the story begins: straight away for a test (?auto), a chosen beat (?beat=a2) or a journey chosen on the page before
// this one (?go=begin); else from the list of journeys
{
  const chosen = params.get('beat');
  const go = params.get('go');
  ui.fade(1, 0);
  if (g.auto || chosen) director.play(chosen ?? journey.first);
  else {
    let pick = go === 'begin' || go === 'continue' ? { id: journey.id, go } : null;
    if (pick) {
      // (so that loading the page again shows the list, not this journey from its beginning)
      const bare = new URL(location.href);
      bare.searchParams.delete('go');
      history.replaceState(null, '', bare);
    } else {
      ui.fade(0, 0);
      document.body.classList.add('menu');
      pick = await ui.stories({
        name: GAME.name,
        works: WORKS,
        // (asked for by name, as on coming back from a journey: its book's journeys are shown)
        at: params.has('story') ? { work: journey.work, book: journey.book } : null,
        list: STORIES.map((s) => {
          const kept = s.released ? keeper(s) : null;
          // (this page's journey is asked of its director, which knows its beats: a place it has no beat for is none)
          const place = s === journey ? director.saved() : kept?.place;
          return { ...s, done: !!kept?.done, resume: place ? (place.label ?? 'where you left off') : null };
        }),
      });
      // another journey than the one this page has made ready: load the page for it
      if (pick.id !== journey.id) openJourney(pick.id, pick.go);
      document.body.classList.remove('menu');
      ui.fade(1, 0.6);
      if (!touch) canvas.requestPointerLock?.()?.catch?.(() => {});
    }
    if (pick.id === journey.id) {
      sounds.start();
      const saved = director.saved();
      director.play(pick.go === 'continue' && saved ? saved.id : journey.first);
    }
  }
}
