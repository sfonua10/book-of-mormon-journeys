// Playing by touch, on a phone or a tablet: a thumb on the left of the screen is a stick to walk by (it appears
// where the thumb comes down), a finger dragged on the right looks round, a tap goes on from a card or acts, and a
// button at the lower right runs. It writes into the same Input the keyboard and the gamepad do (input.touch).

const CSS = /* css */ `
body.touch, body.touch canvas { touch-action: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
body.touch #start { display: none !important; }
#t-stick, #t-run, #t-turn { position: fixed; z-index: 6; pointer-events: none; }
#t-stick {
  left: 0; top: 0; width: 124px; height: 124px; margin: -62px 0 0 -62px; border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5); background: rgba(0, 0, 0, 0.16); opacity: 0; transition: opacity 0.2s;
}
#t-stick.on { opacity: 1; }
#t-stick i {
  position: absolute; left: 50%; top: 50%; width: 54px; height: 54px; margin: -27px 0 0 -27px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.6); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
#t-run {
  right: calc(22px + env(safe-area-inset-right)); bottom: calc(22px + env(safe-area-inset-bottom)); width: 68px; height: 68px;
  border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.6); background: rgba(0, 0, 0, 0.22); color: #fff;
  font: 14px/1 Georgia, 'Times New Roman', serif; letter-spacing: 0.08em; pointer-events: auto; padding: 0;
  touch-action: none; -webkit-user-select: none; user-select: none;
}
#t-run.on { background: rgba(227, 189, 109, 0.85); border-color: #fff; color: #1c140b; }
body.menu #t-run, body:not(.ready) #t-run { display: none; }
/* (while a card is up he stands, and the card may lie over the button) */
#g-card.on ~ #t-run { opacity: 0; pointer-events: none; }
#t-turn {
  left: 50%; top: calc(10px + env(safe-area-inset-top)); transform: translateX(-50%); padding: 6px 14px; border-radius: 4px;
  background: rgba(24, 18, 12, 0.74); color: #f4ead6; font-size: 13px; letter-spacing: 0.05em; white-space: nowrap;
  display: none; z-index: 11;
}
@media (orientation: portrait) { #t-turn { display: block; } }
/* a card can be longer than a phone held sideways is tall: it scrolls, and a tap on it goes on */
body.touch #g-card { max-height: calc(100vh - 24px); max-height: calc(100dvh - 24px); overflow-y: auto; }
body.touch #g-card.on { pointer-events: auto; }
/* (no answer is lit beforehand: there is no key to take the lit one with) */
body.touch #g-card .answer, body.touch #g-card .answer.at { padding: 12px 14px; opacity: 1; border-color: var(--line); background: rgba(244, 234, 214, 0.06); }
body.touch #g-prompt {
  pointer-events: none; padding: 10px 18px; border-radius: 999px; background: rgba(24, 18, 12, 0.74);
  border: 1px solid rgba(227, 189, 109, 0.6);
}
body.touch #g-prompt.on { pointer-events: auto; }
/* (the line of scripture, low on the screen, keeps clear of the thumb that walks and of the button that runs) */
@media (orientation: landscape) { body.touch #g-low { width: min(680px, calc(100vw - 280px)); } }
body.touch #g-objective { left: calc(12px + env(safe-area-inset-left)); }
@media (max-height: 500px) {
  body.touch #g-card { bottom: 12px; padding: 12px 18px 8px; }
  body.touch #g-card .text { font-size: 15px; line-height: 1.45; }
  body.touch #g-card .answers { gap: 6px; margin-top: 8px; }
  body.touch #g-card .answer { font-size: 15px; padding: 8px 12px; }
  body.touch #g-card .ref, body.touch #g-card .hint { margin-top: 5px; }
  body.touch #g-objective { top: 10px; padding: 7px 14px 8px 12px; max-width: min(340px, 60vw); }
  body.touch #g-objective .label { display: none; }
  body.touch #g-objective .text { font-size: 15px; }
  body.touch #g-objective ul { font-size: 13px; margin-top: 6px; padding-top: 6px; gap: 2px; }
  body.touch #g-low { bottom: 12px; gap: 8px; }
  body.touch #g-prompt { font-size: 16px; }
  body.touch #g-toast { font-size: 15px; line-height: 1.4; padding: 7px 14px 6px; }
}
`;

/** True where the game should be played by touch: a phone or a tablet (or ?touch, to try it with a mouse). */
export function wantsTouch(params) {
  if (params.has('touch')) return params.get('touch') !== '0';
  return navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches;
}

/**
 * @param o.canvas the game's canvas
 * @param o.input the Input (figure/input.js)
 * @param o.ui createUI()
 * @param o.press what the act button does (as E)
 * @param o.tap what a tap anywhere does (goes on from a card)
 * @param o.wake called on a touch: the browser lets sound start only then
 * @param o.mouse take the mouse's presses too, as fingers (?touch on a PC)
 */
export function createTouch({ canvas, input, ui, press, tap, wake, mouse = false }) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  document.body.classList.add('touch');
  const add = (tag, id, html = '') => {
    const e = document.createElement(tag);
    e.id = id;
    e.innerHTML = html;
    document.body.append(e);
    return e;
  };
  const stickEl = add('div', 't-stick', '<i></i>');
  const knob = stickEl.firstChild;
  const run = add('button', 't-run', 'Run');
  run.setAttribute('aria-pressed', 'false');
  add('div', 't-turn', 'Turn your phone sideways for a wider view');

  const state = { move: { x: 0, y: 0 }, look: { x: 0, y: 0 }, sprint: false };
  input.touch = state;
  input.lockable = false;

  const REACH = 52; // how far the thumb goes from where it came down for the whole of the stick, in px
  const LOOK = 0.0052; // radians a px
  let stick = null; // { id, x, y }
  let look = null; // { id, x, y }
  const downs = new Map(); // id -> { x, y, t, far }

  const setStick = (dx, dy) => {
    const d = Math.hypot(dx, dy) || 1;
    const m = Math.min(1, d / REACH);
    const ux = dx / d;
    const uy = dy / d;
    knob.style.transform = `translate(${(ux * m * REACH).toFixed(1)}px, ${(uy * m * REACH).toFixed(1)}px)`;
    // (a little dead in the middle, so a resting thumb does not creep)
    const live = m < 0.12 ? 0 : (m - 0.12) / 0.88;
    state.move.x = ux * live;
    state.move.y = -uy * live;
  };
  const dropStick = () => {
    stick = null;
    state.move.x = state.move.y = 0;
    knob.style.transform = '';
    stickEl.classList.remove('on');
  };

  const ours = (e) => mouse || e.pointerType !== 'mouse';
  canvas.addEventListener('pointerdown', (e) => {
    if (!ours(e)) return;
    canvas.setPointerCapture?.(e.pointerId);
    downs.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now(), far: 0 });
    if (!stick && e.clientX < window.innerWidth * 0.45) {
      stick = { id: e.pointerId, x: e.clientX, y: e.clientY };
      stickEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      stickEl.classList.add('on');
    } else if (!look) look = { id: e.pointerId, x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointermove', (e) => {
    const d = downs.get(e.pointerId);
    if (!d) return;
    d.far = Math.max(d.far, Math.hypot(e.clientX - d.x, e.clientY - d.y));
    if (stick?.id === e.pointerId) setStick(e.clientX - stick.x, e.clientY - stick.y);
    else if (look?.id === e.pointerId) {
      state.look.x += (e.clientX - look.x) * LOOK;
      state.look.y += (e.clientY - look.y) * LOOK;
      look.x = e.clientX;
      look.y = e.clientY;
    }
  });
  const up = (e) => {
    const d = downs.get(e.pointerId);
    if (!d) return;
    downs.delete(e.pointerId);
    if (stick?.id === e.pointerId) dropStick();
    if (look?.id === e.pointerId) look = null;
    wake?.();
    if (e.type === 'pointerup' && d.far < 12 && performance.now() - d.t < 350) tap();
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  // (no mouse events made up from the touch, which would ask for the mouse to be locked; and no scrolling or zooming)
  canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  addEventListener('blur', () => {
    downs.clear();
    look = null;
    dropStick();
  });

  run.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    state.sprint = !state.sprint;
    run.classList.toggle('on', state.sprint);
    run.setAttribute('aria-pressed', String(state.sprint));
    wake?.();
  });
  for (const el of ui.tapTargets.card) {
    el.addEventListener('click', (e) => {
      wake?.();
      if (!e.target.closest('.answer')) tap();
    });
  }
  for (const el of ui.tapTargets.act) {
    el.addEventListener('click', () => {
      wake?.();
      press();
    });
  }
  return state;
}
