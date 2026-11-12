// Runs the story. Each beat of story.js is an async script that waits on the world: for a card to be read, for
// Nephi to reach a place, for him to act on something, for a few seconds to pass. The waits are checked once a
// frame from the game's loop, so the story and the painting keep the same clock (and a test can step both).
//
// The beat reached is kept in the browser, so a family can stop and come back to the same act.
// With ?auto the director plays itself: it walks Nephi to each place, reads each card and acts, for tests.

const SAVE = 'nephi-plates:beat';
const load = () => {
  try {
    return localStorage.getItem(SAVE);
  } catch {
    return null;
  }
};
const save = (id) => {
  try {
    if (id) localStorage.setItem(SAVE, id);
    else localStorage.removeItem(SAVE);
  } catch {
    // (no storage: the story just starts from the beginning next time)
  }
};

/**
 * @param beats [{ id, act, label, setup(g), run(c, g) }] in order
 * @param ui createUI()
 * @param g the game: player, standAt, setHour, cast, ... (see main.js)
 * @param options.auto play itself
 */
export function createDirector(beats, ui, g, { auto = false, autoRead = 0.15 } = {}) {
  let time = 0;
  const waits = [];
  let pressed = false;
  /** The key last pressed, for a card that asks for a choice; taken up by whoever reads it. */
  let key = null;
  let current = null;
  /** Where the story wants Nephi to go: { x, z, r } or null. The autopilot walks there. */
  let goal = null;
  let interactable = null;
  let frozen = 0;
  let ended = false;

  const confirmKeys = new Set(['KeyE', 'Enter', 'Space', 'NumpadEnter']);
  addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (confirmKeys.has(e.code)) pressed = true;
    key = e.code;
  });
  g.canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && document.pointerLockElement === g.canvas) pressed = true;
  });

  const until = (test) =>
    new Promise((done) => {
      waits.push({ test, done });
    });
  const near = (x, z, r) => Math.hypot(g.player.x - x, g.player.z - z) < r;

  /** What a beat's script can do. */
  const c = {
    get time() {
      return time;
    },
    wait: (seconds) => {
      const t = time + seconds;
      return until(() => time >= t);
    },
    until,
    /** A card, read before the story goes on. Nephi stands still while it is up. */
    async card(text, ref = '', options = {}) {
      frozen++;
      pressed = false;
      ui.card.show({ text, ref, ...options });
      const shown = time;
      await until(() => time - shown > (auto ? autoRead : 0.45) && (pressed || auto));
      pressed = false;
      ui.card.hide();
      frozen--;
      await c.wait(0.25);
    },
    /** A verse or a run of them, from scripture.js, as a card. */
    async verse(first, last = first, options = {}) {
      await c.card(g.verses(first, last), g.reference(first, last), options);
    },
    thought: (text, options = {}) => c.card(text, '', { kind: 'thought', ...options }),
    toast: (text, ref, seconds) => ui.toast(text, ref, seconds),
    /** The line saying what to do (null to take it away), and under it a list of [{ label, done }] if there is one. */
    objective: (text, list) => ui.objective(text, list),
    /**
     * Waits for Nephi to come within r of (x, z). `via` is the way there, a few points (through the gate, along the
     * streets): the marker shows the next of them, and the autopilot walks them. `mark: false` for no marker.
     * `unless` is asked each frame: when it says so the wait is given up. Resolves true if he got there.
     */
    async reach(x, z, r = 4, { via = [], mark = true, unless = null } = {}) {
      const stops = [...via.map(([px, pz]) => ({ x: px, z: pz, r: 3.5 })), { x, z, r }];
      let k = 0;
      let there = false;
      await until(() => {
        // (skip on to the furthest stop he is already near)
        for (let j = stops.length - 1; j > k; j--) if (near(stops[j].x, stops[j].z, stops[j].r)) k = j;
        while (k < stops.length - 1 && near(stops[k].x, stops[k].z, stops[k].r)) k++;
        goal = { ...stops[k], mark };
        there = near(x, z, r);
        return there || !!unless?.();
      });
      goal = null;
      return there;
    },
    /**
     * Waits for Nephi to act (E) within r of (x, z), showing the prompt while he is near. `unless` is asked each
     * frame: when it says so the wait is given up. Resolves true if he acted.
     */
    async act(x, z, r, label, { mark = true, unless = null } = {}) {
      goal = { x, z, r: r * 0.7, mark };
      interactable = { x, z, r, label };
      pressed = false;
      let acted = false;
      await until(() => {
        const close = near(x, z, r) && !frozen;
        ui.prompt(close ? label : null);
        if (close && (pressed || auto)) return (acted = true);
        if (!close) pressed = false;
        return !!unless?.();
      });
      pressed = false;
      ui.prompt(null);
      interactable = null;
      goal = null;
      return acted;
    },
    /** A prompt for something he can do wherever he stands (null to take it away); `pressed` says if he has. */
    prompt: (label) => ui.prompt(label),
    get pressed() {
      return pressed && !frozen;
    },
    /**
     * A card that asks, with a few answers under it: W and S (or the arrows) go between them, E takes one; or 1, 2.
     * Resolves with the number of the answer taken. The autopilot takes `auto`.
     */
    async choice(text, answers, { auto: autoPick = 0, who = '' } = {}) {
      frozen++;
      pressed = false;
      key = null;
      let at = 0;
      let picked = -1;
      const show = () => ui.card.show({ text, who, kind: 'thought', answers, at, hint: 'W and S to choose · E to answer', onPick: (i) => (picked = i) });
      show();
      const shown = time;
      await until(() => {
        const k = key;
        key = null;
        if (auto) return time - shown > autoRead && ((at = autoPick), true);
        if (picked >= 0) return ((at = picked), true);
        if (time - shown < 0.45) return false;
        const digit = /^(Digit|Numpad)([1-9])$/.exec(k ?? '');
        if (digit && Number(digit[2]) <= answers.length) return ((at = Number(digit[2]) - 1), true);
        const step = k === 'KeyS' || k === 'ArrowDown' ? 1 : k === 'KeyW' || k === 'ArrowUp' ? -1 : 0;
        if (step) {
          at = (at + step + answers.length) % answers.length;
          show();
        }
        // (a click takes the answer that is lit, as E does)
        return pressed;
      });
      pressed = false;
      ui.card.hide();
      frozen--;
      await c.wait(0.25);
      return at;
    },
    /** To black (1) or back (0), over some seconds, and waits for it. */
    async fade(to, seconds = 1) {
      ui.fade(to, seconds);
      await c.wait(seconds + 0.05);
    },
    async chapter(act, name, sub, seconds = 3.2) {
      ui.chapter(act, name, sub);
      await c.wait(seconds);
      ui.chapter(null);
      await c.wait(1);
    },
    /** Holds Nephi still (for a scene that plays out in front of him) while the promise runs. */
    async hold(promise) {
      frozen++;
      try {
        return await promise;
      } finally {
        frozen--;
      }
    },
    freeze(on) {
      frozen += on ? 1 : -1;
    },
    /** Where the autopilot should walk while nothing is waited on (the Spirit's leading, in act three). */
    lead(point) {
      goal = point;
    },
  };

  async function play(from) {
    const start = Math.max(0, beats.findIndex((b) => b.id === from));
    for (let i = start; i < beats.length; i++) {
      current = beats[i];
      // the first beat sets the world up; so does each that opens a new scene, after the dark between them
      if (i === start || current.scene) current.setup?.(g);
      // (a beat that does not open its own scene from the dark is shown at once)
      if (i === start && !current.scene) ui.fade(0, 1);
      save(current.id);
      g.log(`beat ${current.id}`);
      await current.run(c, g);
    }
    ended = true;
    save(null);
    g.log('the end');
  }

  return {
    c,
    get beat() {
      return current?.id ?? null;
    },
    get ended() {
      return ended;
    },
    get frozen() {
      return frozen > 0;
    },
    get goal() {
      return goal;
    },
    get interactable() {
      return interactable;
    },
    auto,
    /** The beat a family could come back to, with its act's name, or null. */
    saved() {
      const id = load();
      const beat = beats.find((b) => b.id === id);
      return beat ? { id, label: beat.label } : null;
    },
    forget() {
      save(null);
    },
    play,
    update(dt) {
      time += dt;
      // (a wait that is met may start another, which is checked next frame)
      for (let i = waits.length - 1; i >= 0; i--) {
        if (waits[i].test()) {
          const { done } = waits[i];
          waits.splice(i, 1);
          done();
        }
      }
      pressed = false;
      key = null;
    },
  };
}
