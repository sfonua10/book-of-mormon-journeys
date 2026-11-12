// "And I was led by the Spirit, not knowing beforehand the things which I should do." (1 Nephi 4:6)
// In the night act there is no marker and no line saying where to go. When Nephi stands still, a soft light gathers
// on the ground a little way along the way he should go, and the edges of the picture warm; walking on quietly it
// stays faint, and running it is lost. It is the field's one carried light (field.setLamp), coloured gold-white
// instead of fire.

/** The point `ahead` metres further along a line of points than the point on it nearest (x, z). */
export function pointAhead(route, x, z, ahead) {
  let best = Infinity;
  let at = 0;
  let along = 0;
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
      return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, off: best, end: at + ahead >= total };
    }
    along -= lengths[i];
  }
  const [lx, lz] = route[route.length - 1];
  return { x: lx, z: lz, off: best, end: true };
}

export function createGuidance(g, ui) {
  let route = null;
  let still = 0;
  let light = 0;
  let px = 0;
  let pz = 0;
  return {
    /** Starts leading along a line of points [[x, z], ...]; null to stop. */
    lead(points) {
      route = points;
      still = 0;
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
        const want = Math.min(1, Math.max(speed < 2.2 ? 0.18 : 0, (still - 0.5) / 1.6));
        light += (want - light) * Math.min(1, dt * 2.2);
        const p = pointAhead(route, g.player.x, g.player.z, 7.5);
        // (the light drifts to its new place rather than jumping)
        const k = Math.min(1, dt * 1.6);
        px += (p.x - px) * (Math.hypot(p.x - px, p.z - pz) > 30 ? 1 : k);
        pz += (p.z - pz) * (Math.hypot(p.x - px, p.z - pz) > 30 ? 1 : k);
      }
      const pulse = 0.9 + 0.1 * Math.sin(g.clock() * 1.3);
      g.field.setLamp(px, g.heightAt(px, pz) + 0.9, pz, light * 7 * pulse);
      if (light > 0.001) g.field.uniforms.uFireColor.value.setRGB(1.55, 1.32, 0.92);
      ui.still(light * 0.85);
    },
  };
}
