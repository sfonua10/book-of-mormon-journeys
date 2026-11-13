// What is drawn over the painting: the scripture cards, a line saying what to do, the prompt to act, the fades
// between scenes, each act's title, and the screens: the journeys to choose from, and a journey's end. Plain DOM, styled here, in the valley's serif.

const CSS = /* css */ `
:root {
  --ink: #f4ead6;
  --gold: #e3bd6d;
  --panel: rgba(24, 18, 12, 0.74);
  --line: rgba(227, 189, 109, 0.35);
}
.g-layer { position: fixed; pointer-events: none; z-index: 5; }
#g-fade { inset: 0; background: #000; opacity: 0; transition: opacity 1s ease; z-index: 8; }
#g-still {
  inset: 0; opacity: 0; transition: opacity 0.6s;
  background: radial-gradient(ellipse at 50% 55%, transparent 52%, rgba(255, 196, 110, 0.18) 78%, rgba(255, 180, 90, 0.34) 100%);
}
#g-card {
  left: 50%; bottom: max(7vh, 44px); transform: translate(-50%, 12px); width: min(760px, calc(100vw - 32px)); box-sizing: border-box;
  padding: 22px 28px 16px; background: var(--panel); border: 1px solid var(--line); border-radius: 6px;
  color: var(--ink); opacity: 0; transition: opacity 0.35s, transform 0.35s; z-index: 9;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
}
#g-card.on { opacity: 1; transform: translate(-50%, 0); }
#g-card .text { font-size: 19px; line-height: 1.55; }
#g-card.thought .text { font-style: italic; font-size: 18px; color: #efe4cc; }
#g-card .ref { margin-top: 10px; text-align: right; color: var(--gold); font-size: 14px; letter-spacing: 0.08em; font-variant: small-caps; }
#g-card .hint { margin-top: 8px; text-align: center; font-size: 12px; letter-spacing: 0.1em; opacity: 0.55; }
#g-card .answers { margin-top: 14px; display: grid; gap: 8px; }
#g-card .answer {
  padding: 9px 14px; border: 1px solid var(--line); border-radius: 4px; font-size: 17px; line-height: 1.4; opacity: 0.72;
  pointer-events: auto; cursor: pointer; transition: opacity 0.15s, background 0.15s, border-color 0.15s;
}
#g-card .answer.at { opacity: 1; border-color: var(--gold); background: rgba(227, 189, 109, 0.14); }
#g-card .answer b { color: var(--gold); font-weight: normal; margin-right: 10px; }
#g-card .who { color: var(--gold); font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 7px; }
#g-objective {
  left: 20px; top: 20px; width: max-content; max-width: min(460px, calc(100vw - 40px)); box-sizing: border-box;
  padding: 11px 20px 13px 16px; background: var(--panel); border: 1px solid var(--line); border-left: 4px solid var(--gold);
  border-radius: 6px; color: #fff; box-shadow: 0 6px 26px rgba(0, 0, 0, 0.32); transform-origin: left top;
  opacity: 0; transform: translateX(-12px); transition: opacity 0.5s, transform 0.5s;
}
#g-objective.on { opacity: 1; transform: none; }
#g-objective .label { color: var(--gold); font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; margin-bottom: 4px; }
#g-objective .text { font-size: 20px; line-height: 1.35; letter-spacing: 0.01em; }
#g-objective ul { list-style: none; margin: 10px 0 1px; padding: 9px 0 0; border-top: 1px solid var(--line); display: grid; gap: 5px; font-size: 17px; }
#g-objective li { display: flex; align-items: baseline; gap: 10px; }
#g-objective li::before { content: '◇'; color: var(--gold); width: 1em; text-align: center; }
#g-objective li.done { color: rgba(244, 234, 214, 0.62); }
#g-objective li.done::before { content: '✓'; }
/* a new thing to do draws the eye once: the panel swells and glows, and settles */
#g-objective.new { animation: g-new 1.8s ease-out; }
@keyframes g-new {
  0% { transform: scale(1.1); background: rgba(104, 76, 28, 0.92); box-shadow: 0 0 0 0 rgba(227, 189, 109, 0.85), 0 6px 26px rgba(0, 0, 0, 0.32); }
  35% { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(227, 189, 109, 0), 0 6px 26px rgba(0, 0, 0, 0.32); }
  100% { transform: none; }
}
@media (prefers-reduced-motion: reduce) { #g-objective.new { animation: none; } }
/* Low on the screen, where the cards are: the prompt to act, and under it the verse that is read while the walk
   goes on. Each takes room only while it is shown, so the prompt sits just above whatever is under it. (What to do
   is at the top left, and the scripture's words at the bottom: the two are never in the one place.) */
#g-low {
  left: 50%; bottom: max(7vh, 44px); transform: translateX(-50%); width: min(680px, calc(100vw - 32px));
  display: flex; flex-direction: column; align-items: center; gap: 14px;
}
#g-low > .g-layer { position: static; }
#g-prompt {
  display: none; padding: 7px 18px 8px; border-radius: 999px; background: rgba(24, 18, 12, 0.62); color: #fff; font-size: 18px;
  letter-spacing: 0.05em; white-space: nowrap;
}
#g-prompt.on { display: block; animation: g-in 0.25s ease-out; }
@keyframes g-in { from { opacity: 0; } }
#g-prompt kbd {
  display: inline-block; min-width: 1.4em; padding: 1px 7px; margin-right: 10px; border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 4px; font: inherit; font-size: 15px; background: rgba(0, 0, 0, 0.25);
}
/* The way-marker: a gold diamond with a dark heart (so that it shows against gold, sky and sand alike), a ring that
   widens from it, and how far it is. Off the picture it lies at the edge, with an arrow to where the place is. */
#g-marker { left: 0; top: 0; opacity: 0; transition: opacity 0.4s; }
#g-marker.on { opacity: 1; }
#g-marker .d, #g-marker .ring { position: absolute; left: -13px; top: -13px; width: 22px; height: 22px; transform: rotate(45deg); border: 2px solid var(--gold); }
#g-marker .d { background: rgba(24, 18, 12, 0.88); box-shadow: 0 0 0 1.5px rgba(24, 18, 12, 0.75), 0 0 16px rgba(255, 210, 120, 0.85); }
#g-marker .d::after { content: ''; position: absolute; inset: 6px; background: var(--gold); }
#g-marker .ring { animation: g-ring 1.8s ease-out infinite; }
@keyframes g-ring {
  from { transform: rotate(45deg) scale(1); opacity: 0.9; }
  to { transform: rotate(45deg) scale(2.5); opacity: 0; }
}
#g-marker .a {
  display: none; position: absolute; left: -8px; top: -8px; width: 0; height: 0; border: 8px solid transparent; border-left-color: var(--gold);
  transform: rotate(var(--turn, 0rad)) translateX(30px); filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.9));
}
#g-marker.edge .a { display: block; }
#g-marker .m {
  position: absolute; left: 0; top: 26px; transform: translateX(-50%); padding: 2px 10px 3px; border-radius: 999px; white-space: nowrap;
  background: rgba(24, 18, 12, 0.8); color: #fff; font-size: 13px; letter-spacing: 0.06em;
}
#g-marker .m:empty { display: none; }
/* a new thing to do: the marker swells once, as the panel that says it does */
#g-marker.new .d { animation: g-ping 1.8s ease-out; }
@keyframes g-ping {
  0% { transform: rotate(45deg) scale(2.2); }
  100% { transform: rotate(45deg) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  #g-marker .ring { animation: none; opacity: 0; }
  #g-marker.new .d { animation: none; }
}
#g-toast {
  display: none; box-sizing: border-box; max-width: 100%; padding: 10px 20px 9px; border-radius: 6px; background: rgba(24, 18, 12, 0.6);
  text-align: center; color: #fff; font-size: 18px; line-height: 1.5; text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
  opacity: 0; transition: opacity 0.6s;
}
#g-toast.up { display: block; }
#g-toast.on { opacity: 1; }
#g-toast .ref { display: block; margin-top: 3px; color: var(--gold); font-size: 13px; font-variant: small-caps; letter-spacing: 0.08em; }
#g-chapter {
  inset: 0; display: grid; place-content: center; text-align: center; color: #fff; opacity: 0; transition: opacity 1.4s; z-index: 9;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.7);
}
#g-chapter.on { opacity: 1; }
#g-chapter .act { font-size: 14px; letter-spacing: 0.4em; text-transform: uppercase; color: var(--gold); }
#g-chapter .name { font-size: clamp(30px, 5vw, 54px); margin: 10px 0 8px; letter-spacing: 0.02em; }
#g-chapter .sub { font-size: 16px; letter-spacing: 0.12em; opacity: 0.85; }
.g-screen {
  inset: 0; display: none; place-items: center; text-align: center; color: var(--ink); pointer-events: auto; z-index: 10;
  background: radial-gradient(ellipse at 50% 40%, rgba(20, 14, 8, 0.35), rgba(12, 8, 4, 0.8));
}
.g-screen.on { display: grid; }
.g-screen .box { width: min(640px, calc(100vw - 32px)); }
.g-screen h1 { font-weight: normal; font-size: clamp(32px, 6vw, 58px); margin: 0 0 6px; letter-spacing: 0.01em; color: #fff; }
.g-screen .sub { color: var(--gold); letter-spacing: 0.3em; text-transform: uppercase; font-size: 13px; }
.g-screen p { font-size: 17px; line-height: 1.6; opacity: 0.92; }
.g-screen .keys { font-size: 13px; opacity: 0.7; letter-spacing: 0.06em; margin-top: 22px; }
.g-screen button {
  font: inherit; font-size: 17px; letter-spacing: 0.06em; color: #1c140b; background: var(--gold); border: 0; border-radius: 4px;
  padding: 11px 26px; margin: 18px 6px 0; cursor: pointer;
}
.g-screen button.plain { background: transparent; color: var(--ink); border: 1px solid var(--line); }
.g-screen button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.g-screen a { color: var(--gold); }
.g-screen blockquote { margin: 18px auto; font-style: italic; font-size: 18px; line-height: 1.55; }
.g-screen blockquote cite { display: block; font-style: normal; margin-top: 6px; color: var(--gold); font-size: 14px; font-variant: small-caps; }
.g-screen { overflow-y: auto; }
.g-screen .box { padding: 24px 0; }
/* the list of journeys: plain, over the painting dimmed right down, so that the rows are what is looked at */
#g-title { background: rgba(14, 10, 6, 0.88); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
#g-title h1 { font-size: 14px; letter-spacing: 0.34em; text-transform: uppercase; color: var(--gold); margin: 0; }
.g-screen .journeys { list-style: none; margin: 26px 0 0; padding: 0; display: grid; gap: 10px; text-align: left; }
.g-screen .journeys li {
  display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px 20px; padding: 18px 22px;
  border: 1px solid var(--line); border-radius: 6px; transition: border-color 0.15s, background 0.15s;
}
.g-screen .journeys li.open { cursor: pointer; background: rgba(244, 234, 214, 0.05); }
.g-screen .journeys li.open:hover { border-color: var(--gold); background: rgba(227, 189, 109, 0.1); }
.g-screen .journeys .no { color: var(--gold); font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; }
.g-screen .journeys .done { letter-spacing: 0.1em; color: var(--ink); }
.g-screen .journeys h2 { font-weight: normal; font-size: 26px; margin: 4px 0 2px; color: #fff; }
.g-screen .journeys .about { font-size: 15px; line-height: 1.5; opacity: 0.75; }
.g-screen .journeys .go { display: grid; justify-items: center; gap: 8px; }
.g-screen .journeys button { margin: 0; white-space: nowrap; }
.g-screen .journeys .go button + button { border: 0; padding: 2px 6px; font-size: 14px; opacity: 0.75; text-decoration: underline; }
.g-screen .journeys .soon { border-style: dashed; opacity: 0.5; }
.g-screen .ask { margin: 14px 0 0; font-style: italic; opacity: 0.75; }
.g-screen .shelf { margin: 16px 0 -10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.g-screen .shelf span { font-size: 20px; color: #fff; }
.g-screen .shelf button { margin: 0; border: 0; padding: 6px 2px; font-size: 15px; opacity: 0.8; }
@media (max-width: 600px) {
  .g-screen .journeys li { grid-template-columns: 1fr; }
  .g-screen .journeys .go { justify-items: start; grid-auto-flow: column; justify-content: start; align-items: center; }
}
.g-screen .next { font-size: 15px; opacity: 0.75; }
@media (max-width: 600px) {
  #g-card .text { font-size: 17px; }
  #g-card { padding: 16px 18px 12px; }
  #g-objective { left: 12px; top: 12px; max-width: calc(100vw - 24px); }
  #g-objective .text { font-size: 17px; }
  #g-objective ul { font-size: 15px; }
}
`;

const el = (tag, id, cls = '') => {
  const e = document.createElement(tag);
  if (id) e.id = id;
  e.className = `g-layer ${cls}`.trim();
  document.body.append(e);
  return e;
};

export function createUI({ touch = false } = {}) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  const still = el('div', 'g-still');
  const fade = el('div', 'g-fade');
  const objective = el('div', 'g-objective');
  objective.setAttribute('role', 'status');
  // (the prompt and the line of scripture are stacked low on the screen, the prompt above)
  const low = el('div', 'g-low');
  const prompt = el('div', 'g-prompt');
  const toast = el('div', 'g-toast');
  low.append(prompt, toast);
  const marker = el('div', 'g-marker');
  marker.innerHTML = '<div class="ring"></div><div class="d"></div><div class="a"></div><div class="m"></div>';
  const markerText = marker.querySelector('.m');
  const card = el('div', 'g-card');
  const chapter = el('div', 'g-chapter');
  const title = el('div', 'g-title', 'g-screen');
  const end = el('div', 'g-end', 'g-screen');
  let toastTimer = 0;
  let toastGone = 0;
  let objectiveText = null;
  /** A new thing to do has been said, and the marker has not yet been shown for it; and until when it says "Go here". */
  let markerNew = false;
  let goHereUntil = 0;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  /** Takes the line of scripture away: fading (and then giving up its room), or at once. */
  const hideToast = (atOnce) => {
    clearTimeout(toastTimer);
    clearTimeout(toastGone);
    toast.classList.remove('on');
    if (atOnce) toast.classList.remove('up');
    else toastGone = setTimeout(() => toast.classList.remove('up'), 600);
  };

  return {
    touch,
    /** What the touch controls listen to: a tap on a card goes on from it, a tap on the prompt acts. */
    tapTargets: { card: [card], act: [prompt] },
    card: {
      /**
       * Shows a card: scripture with its reference, or a thought (italic, no reference). With `answers` it asks: they
       * are listed under it, the one at `at` lit, and `onPick(i)` is told if one is clicked.
       */
      show({ text, ref = '', who = '', kind = ref ? 'scripture' : 'thought', hint = touch ? 'Tap to continue' : 'E or click to continue', answers = null, at = 0, onPick = null }) {
        // (a card lies where the line of scripture does: the line goes)
        hideToast(true);
        card.className = `g-layer on ${kind}`;
        const list = answers ? `<div class="answers">${answers.map((a, i) => `<div class="answer${i === at ? ' at' : ''}" data-i="${i}"><b>${i + 1}</b>${esc(a)}</div>`).join('')}</div>` : '';
        card.innerHTML = `${who ? `<div class="who">${esc(who)}</div>` : ''}<div class="text">${esc(text)}</div>${list}${ref ? `<div class="ref">${esc(ref)}</div>` : ''}<div class="hint">${esc(hint)}</div>`;
        for (const a of card.querySelectorAll('.answer')) a.addEventListener('click', () => onPick?.(Number(a.dataset.i)));
      },
      hide() {
        card.classList.remove('on');
      },
    },
    /**
     * What to do now, in a panel at the top left: a line, and under it a list of [{ label, done }] if the thing has
     * parts. Null takes it away. A new line draws the eye once; a list that only changes does not.
     */
    objective(text, list = null) {
      if (text) {
        const items = list ? `<ul>${list.map((i) => `<li class="${i.done ? 'done' : ''}">${esc(i.label)}</li>`).join('')}</ul>` : '';
        objective.innerHTML = `<div class="label">What to do</div><div class="text">${esc(text)}</div>${items}`;
        if (text !== objectiveText) {
          objective.classList.remove('new');
          // (reading its width starts the animation again from the beginning)
          void objective.offsetWidth;
          objective.classList.add('new');
          markerNew = true;
        }
      }
      objectiveText = text || null;
      objective.classList.toggle('on', !!text);
    },
    prompt(label) {
      if (label) prompt.innerHTML = `<kbd>${touch ? 'Tap' : 'E'}</kbd>${esc(label)}`;
      prompt.classList.toggle('on', !!label);
    },
    /**
     * The way-marker: where on the screen, and how far in metres; null to hide it. `turn` is given when the place is
     * off the picture and the marker lies at its edge: the angle on the screen (0 to the right, a quarter turn down)
     * to where the place is, shown as an arrow. For a few seconds after a new thing to do is said it reads "Go here".
     */
    marker(x, y, metres, turn = null) {
      if (x == null) return void marker.classList.remove('on');
      if (markerNew) {
        markerNew = false;
        goHereUntil = performance.now() + 6000;
        marker.classList.remove('new');
        void marker.offsetWidth;
        marker.classList.add('new');
      }
      marker.classList.add('on');
      marker.classList.toggle('edge', turn != null);
      if (turn != null) marker.style.setProperty('--turn', `${turn.toFixed(2)}rad`);
      marker.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
      const far = metres > 12 ? `${Math.round(metres)} m` : '';
      const text = performance.now() < goHereUntil ? `Go here${far ? ` · ${far}` : ''}` : far;
      if (markerText.textContent !== text) markerText.textContent = text;
    },
    /**
     * A line of scripture low on the screen, gone after a while: for what happens while you are moving. With no
     * text, the one that is up is taken away at once.
     */
    toast(text, ref = '', seconds = 7) {
      if (!text) return void hideToast(true);
      clearTimeout(toastTimer);
      clearTimeout(toastGone);
      toast.innerHTML = `${esc(text)}${ref ? `<span class="ref">${esc(ref)}</span>` : ''}`;
      if (!toast.classList.contains('up')) {
        toast.classList.add('up');
        // (reading its width lets it fade in from where it was not)
        void toast.offsetWidth;
      }
      toast.classList.add('on');
      toastTimer = setTimeout(() => hideToast(false), seconds * 1000);
    },
    fade(to, seconds = 1) {
      fade.style.transition = `opacity ${seconds}s ease`;
      fade.style.opacity = String(to);
    },
    still(amount) {
      still.style.opacity = String(amount);
    },
    chapter(act, name, sub) {
      if (!act) return void chapter.classList.remove('on');
      chapter.innerHTML = `<div class="act">${esc(act)}</div><div class="name">${esc(name)}</div><div class="sub">${esc(sub)}</div>`;
      chapter.classList.add('on');
    },
    /**
     * The first screen, in two steps: the books of scripture (`works`, [{ id, name }]) to choose from, then the
     * journeys of the one chosen. `at` is a book's id to begin at its journeys. `list` is [{ id, number, title, ref, blurb,
     * released, done, resume }]: one that is released can be begun (or gone on with, from the act `resume` names);
     * one that is not is only told of. Resolves with { id, go: 'begin' | 'continue' } when a button is pressed.
     */
    stories({ name, works, list, at = null }) {
      const item = (s) => {
        const no = `Journey ${esc(s.number)}`;
        if (!s.released) {
          return `<li class="soon">
            <div class="what">
              <div class="no">${no} · Coming next week</div>
              <h2>${s.title ? esc(s.title) : 'A new journey'}</h2>
              ${s.ref ? `<div class="about">${esc(s.ref)}</div>` : ''}
            </div>
          </li>`;
        }
        const go = s.resume
          ? `<button data-id="${esc(s.id)}" data-go="continue">Continue · ${esc(s.resume)}</button><button data-id="${esc(s.id)}" data-go="begin" class="plain">Start over</button>`
          : `<button data-id="${esc(s.id)}" data-go="begin"${s.done ? ' class="plain"' : ''}>${s.done ? 'Play again' : 'Begin'}</button>`;
        return `<li class="open">
          <div class="what">
            <div class="no">${no} · ${esc(s.ref)}${s.done ? ' · <span class="done">✓ Finished</span>' : ''}</div>
            <h2>${esc(s.title)}</h2>
            <div class="about">${esc(s.blurb)}</div>
          </div>
          <div class="go">${go}</div>
        </li>`;
      };
      // a book of scripture: how many journeys it has, and where they are told from
      const book = (w) => {
        const ready = list.filter((s) => s.work === w.id && s.released);
        const count = ready.length === 1 ? '1 journey' : `${ready.length} journeys`;
        return `<li class="open">
          <div class="what">
            <div class="no">${count}</div>
            <h2>${esc(w.name)}</h2>
            <div class="about">${ready.map((s) => esc(s.ref)).join(' · ')}</div>
          </div>
          <div class="go"><button data-work="${esc(w.id)}">Open</button></div>
        </li>`;
      };
      // (only the books that have a journey to play are listed)
      const shelf = works.filter((w) => list.some((s) => s.work === w.id && s.released));
      title.classList.add('on');
      return new Promise((done) => {
        /** Shows the books (work: null), or the journeys of one of them. */
        const show = (work) => {
          const of = shelf.find((w) => w.id === work);
          title.innerHTML = of
            ? `<div class="box">
                <h1>${esc(name)}</h1>
                <div class="shelf"><button data-work="" class="plain">‹ All books</button><span>${esc(of.name)}</span></div>
                <ul class="journeys">${list.filter((s) => s.work === of.id).map(item).join('')}</ul>
              </div>`
            : `<div class="box">
                <h1>${esc(name)}</h1>
                <p class="ask">Choose a book of scripture</p>
                <ul class="journeys">${shelf.map(book).join('')}</ul>
              </div>`;
          for (const b of title.querySelectorAll('button')) {
            b.addEventListener('click', () => {
              if (b.dataset.work !== undefined) return show(b.dataset.work || null);
              title.classList.remove('on');
              done({ id: b.dataset.id, go: b.dataset.go });
            });
          }
          // (a whole row can be pressed, for its first button)
          for (const li of title.querySelectorAll('li.open')) {
            li.addEventListener('click', (e) => {
              if (!e.target.closest('button')) li.querySelector('button').click();
            });
          }
          title.querySelector('li button')?.focus();
        };
        show(at);
      });
    },
    hideTitle() {
      title.classList.remove('on');
    },
    /**
     * The end of a journey: what was read, where to read more, something to talk about. `copy` is the story's own
     * (stories.js, end): { heading, quote, cite, talk, links: [[name, url]] }.
     */
    end({ copy, onAgain, onBack }) {
      const links = copy.links.map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(name)}</a>`);
      const listed = links.length > 1 ? `${links.slice(0, -1).join(', ')} and ${links.at(-1)}` : links.join('');
      end.innerHTML = `<div class="box">
        <div class="sub">The end of the journey</div>
        <h1>${esc(copy.heading)}</h1>
        <blockquote>${esc(copy.quote)}<cite>${esc(copy.cite)}</cite></blockquote>
        <p>To talk about together: ${esc(copy.talk)}</p>
        ${listed ? `<p>Read the whole account in ${listed}.</p>` : ''}
        <p class="next">The next journey arrives next week.</p>
        <button data-go="back">Back to journeys</button><button data-go="again" class="plain">Play again</button>
      </div>`;
      end.classList.add('on');
      for (const b of end.querySelectorAll('button')) {
        b.addEventListener('click', () => {
          end.classList.remove('on');
          (b.dataset.go === 'back' ? onBack : onAgain)();
        });
      }
      end.querySelector('button').focus();
    },
  };
}
