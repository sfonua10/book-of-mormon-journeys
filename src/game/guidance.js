// "And I was led by the Spirit, not knowing beforehand the things which I should do." (1 Nephi 4:6)
// In the night act there is no marker and no line saying where to go. When Nephi stands still, a soft light gathers
// in the air a little way along the way he should go, lighting the ground under it, and the edges of the picture
// warm; walking on quietly it stays faint, and running it is lost. So is it by a wrong turning: off the way there
// is no light at all while he walks, and only when he stands still does it come back to him. If he is a long while
// getting nowhere he is reminded to stand still and look. A soft tone gathers and fades with the light (music.js),
// so the leading can be listened for as well as looked for. The ground's light is the field's one carried light
// (field.setLamp), coloured gold-white instead of fire; the light in the air is a halo.
import { createHalo } from './halo.js';

/** The point `ahead` metres further along a line of points than the point on it nearest (x, z). */
export function pointAhead(route, x, z, ahead) {
  let best = Infinity;
  let at = 0;
  let along = 0;
  let nx = x;
  let nz = z;
  const lengths = [];
  let total = 0;
  for (let i = 0; i + 1 < route.length; i++) {
    const [ax, az] = route[i];
    const [bx, bz] = route[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.hypot(dx, dz);
    const t = Math.min(1, Math.max(0, ((x - ax) * dx + (z - az) * dz) / (len * len || 1)));
    const d = Math.hypot(x - ax - dx * t, z - az - dz * t);
    if (d < best) {
      best = d;
      at = total + t * len;
      nx = ax + dx * t;
      nz = az + dz * t;
    }
    lengths.push(len);
    total += len;
  }
  along = Math.min(total, at + ahead);
  for (let i = 0; i < lengths.length; i++) {
    if (along <= lengths[i] || i === lengths.length - 1) {
      const t = lengths[i] ? Math.min(1, along / lengths[i]) : 0;
      const [ax, az] = route[i];
      const [bx, bz] = route[i + 1];
      return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, off: best, end: at + ahead >= total, at, nx, nz };
    }
    along -= lengths[i];
  }
  const [lx, lz] = route[route.length - 1];
  return { x: lx, z: lz, off: best, end: true, at, nx, nz };
}

export function createGuidance(g, ui) {
  let route = null;
  let still = 0;
  let light = 0;
  let px = 0;
  let pz = 0;
  /** A light the story sets itself (the angel's): { x, z, strength } or null. */
  let shine = null;
  // the light in the air, and how he is getting on: the furthest along the way he has come, and how long since
  const orb = g.scene ? createHalo(g.scene, { color: [1.7, 1.5, 1.05], width: 1.5, height: 1.5, rays: 0.4 }) : null;
  let furthest = 0;
  let stuck = 0;
  let sinceHint = Infinity;
  let hints = true;
  return {
    shine(x, z, strength) {
      shine = x == null ? null : { x, z, strength };
    },
    /**
     * Starts leading along a line of points [[x, z], ...]; null to stop. `hint: false` where he is not to be told to
     * stand and look (he is not lost: he waits).
     */
    lead(points, { hint = true } = {}) {
      hints = hint;
      route = points;
      still = 0;
      furthest = 0;
      stuck = 0;
      sinceHint = Infinity;
    },
    get active() {
      return !!route;
    },
    /** How strong the leading is now, 0 to 1. */
    get light() {
      return light;
    },
    /** Where the light is now, for the autopilot. */
    get point() {
      return route ? { x: px, z: pz } : null;
    },
    update(dt) {
      if (!route) {
        light = Math.max(0, light - dt * 1.5);
      } else {
        const speed = Math.hypot(g.player.vx, g.player.vz);
        // stillness gathers it; a quiet walk keeps a little of it; running loses it
        if (speed < 0.35) still += dt;
        else if (speed < 2.2) still = Math.max(0.5, still - dt * 0.4);
        else still = Math.max(0, still - dt * 3);
        const p = pointAhead(route, g.player.x, g.player.z, 11);
        // (the little that a quiet walk keeps is kept only on the way: a street's width to either side of it)
        const kept = speed < 2.2 && p.off < 5.5 ? 0.3 : 0;
        const want = Math.min(1, Math.max(kept, (still - 0.5) / 1.6));
        light += (want - light) * Math.min(1, dt * 2.2);
        if (p.off > 7) {
          // away from the way: the light comes back towards him, between him and the nearest of it
          const k = Math.min(1, 8 / p.off);
          p.x = g.player.x + (p.nx - g.player.x) * k;
          p.z = g.player.z + (p.nz - g.player.z) * k;
        }
        // a long while getting no further along: a word to stand and look
        if (p.at > furthest + 2) {
          furthest = p.at;
          stuck = 0;
        } else stuck += dt;
        sinceHint += dt;
        if (hints && stuck > 25 && sinceHint > 45 && !g.frozen) {
          sinceHint = 0;
          ui.toast('Stand still a moment, and look around you for the light.', '', 7);
        }
        // (the light drifts to its new place rather than jumping)
        const k = Math.min(1, dt * 1.6);
        px += (p.x - px) * (Math.hypot(p.x - px, p.z - pz) > 30 ? 1 : k);
        pz += (p.z - pz) * (Math.hypot(p.x - px, p.z - pz) > 30 ? 1 : k);
      }
      const pulse = 0.9 + 0.1 * Math.sin(g.clock() * 1.3);
      orb?.update(g.clock());
      g.music?.spirit(shine ? 0 : light);
      if (shine) {
        orb?.set(0, 0, 0, 0);
        g.field.setLamp(shine.x, g.heightAt(shine.x, shine.z) + 1.4, shine.z, shine.strength);
        g.field.uniforms.uFireColor.value.setRGB(1.6, 1.5, 1.2);
        return;
      }
      g.field.setLamp(px, g.heightAt(px, pz) + 0.9, pz, light * 7 * pulse);
      // (hovering about the height of his heart, rising and settling a little)
      orb?.set(px, g.heightAt(px, pz) + 1.25 + 0.08 * Math.sin(g.clock() * 0.9), pz, light * 1.1 * pulse);
      if (light > 0.001) g.field.uniforms.uFireColor.value.setRGB(1.55, 1.32, 0.92);
      ui.still(light * 0.85);
    },
  };
}
