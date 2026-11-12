// What is drawn over the painting: the scripture cards, a line saying what to do, the prompt to act, the fades
// between scenes, each act's title, and the title and end screens. Plain DOM, styled here, in the valley's serif.

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
  left: 50%; bottom: 7vh; transform: translate(-50%, 12px); width: min(760px, calc(100vw - 32px)); box-sizing: border-box;
  padding: 22px 28px 16px; background: var(--panel); border: 1px solid var(--line); border-radius: 6px;
  color: var(--ink); opacity: 0; transition: opacity 0.35s, transform 0.35s; z-index: 7;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
}
#g-card.on { opacity: 1; transform: translate(-50%, 0); }
#g-card .text { font-size: 19px; line-height: 1.55; }
#g-card.thought .text { font-style: italic; font-size: 18px; color: #efe4cc; }
#g-card .ref { margin-top: 10px; text-align: right; color: var(--gold); font-size: 14px; letter-spacing: 0.08em; font-variant: small-caps; }
#g-card .hint { margin-top: 8px; text-align: center; font-size: 12px; letter-spacing: 0.1em; opacity: 0.55; }
#g-card .who { color: var(--gold); font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
#g-objective {
  left: 24px; top: 22px; max-width: min(420px, calc(100vw - 48px)); color: #fff; font-size: 16px; letter-spacing: 0.03em;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6); opacity: 0; transition: opacity 0.5s;
}
#g-objective.on { opacity: 1; }
#g-objective::before { content: '◆'; color: var(--gold); margin-right: 9px; font-size: 12px; vertical-align: 2px; }
#g-prompt {
  left: 50%; bottom: 16vh; transform: translateX(-50%); color: #fff; font-size: 18px; letter-spacing: 0.05em;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.7); opacity: 0; transition: opacity 0.25s; white-space: nowrap;
}
#g-prompt.on { opacity: 1; }
#g-prompt kbd {
  display: inline-block; min-width: 1.4em; padding: 1px 7px; margin-right: 10px; border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 4px; font: inherit; font-size: 15px; background: rgba(0, 0, 0, 0.25);
}
#g-marker { left: 0; top: 0; opacity: 0; transition: opacity 0.4s; }
#g-marker.on { opacity: 1; }
#g-marker .d {
  position: absolute; left: -7px; top: -7px; width: 12px; height: 12px; transform: rotate(45deg);
  border: 2px solid var(--gold); background: rgba(227, 189, 109, 0.25); box-shadow: 0 0 10px rgba(255, 210, 120, 0.7);
}
#g-marker .m {
  position: absolute; left: -40px; width: 80px; top: 12px; text-align: center; color: #fff; font-size: 12px;
  letter-spacing: 0.06em; text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
}
#g-toast {
  left: 50%; top: 9vh; transform: translateX(-50%); width: min(640px, calc(100vw - 32px)); text-align: center; color: #fff;
  font-size: 17px; line-height: 1.5; text-shadow: 0 1px 10px rgba(0, 0, 0, 0.8); opacity: 0; transition: opacity 0.6s;
}
#g-toast.on { opacity: 1; }
#g-toast .ref { display: block; margin-top: 4px; color: var(--gold); font-size: 13px; font-variant: small-caps; letter-spacing: 0.08em; }
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
@media (max-width: 600px) { #g-card .text { font-size: 17px; } #g-card { padding: 16px 18px 12px; } }
`;

const el = (tag, id, cls = '') => {
  const e = document.createElement(tag);
  if (id) e.id = id;
  e.className = `g-layer ${cls}`.trim();
  document.body.append(e);
  return e;
};

export function createUI() {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  const still = el('div', 'g-still');
  const fade = el('div', 'g-fade');
  const objective = el('div', 'g-objective');
  const prompt = el('div', 'g-prompt');
  const toast = el('div', 'g-toast');
  const marker = el('div', 'g-marker');
  marker.innerHTML = '<div class="d"></div><div class="m"></div>';
  const markerText = marker.querySelector('.m');
  const card = el('div', 'g-card');
  const chapter = el('div', 'g-chapter');
  const title = el('div', 'g-title', 'g-screen');
  const end = el('div', 'g-end', 'g-screen');
  let toastTimer = 0;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  return {
    card: {
      /** Shows a card: scripture with its reference, or a thought (italic, no reference). */
      show({ text, ref = '', who = '', kind = ref ? 'scripture' : 'thought', hint = 'E or click to continue' }) {
        card.className = `g-layer on ${kind}`;
        card.innerHTML = `${who ? `<div class="who">${esc(who)}</div>` : ''}<div class="text">${esc(text)}</div>${ref ? `<div class="ref">${esc(ref)}</div>` : ''}<div class="hint">${esc(hint)}</div>`;
      },
      hide() {
        card.classList.remove('on');
      },
    },
    objective(text) {
      if (text) objective.textContent = text;
      objective.classList.toggle('on', !!text);
    },
    prompt(label) {
      if (label) prompt.innerHTML = `<kbd>E</kbd>${esc(label)}`;
      prompt.classList.toggle('on', !!label);
    },
    /** The way-marker: where on the screen, and how far in metres; null to hide it. */
    marker(x, y, metres) {
      if (x == null) return void marker.classList.remove('on');
      marker.classList.add('on');
      marker.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
      markerText.textContent = metres > 12 ? `${Math.round(metres)} m` : '';
    },
    /** A line of scripture at the top, gone after a while: for what happens while you are moving. */
    toast(text, ref = '', seconds = 7) {
      toast.innerHTML = `${esc(text)}${ref ? `<span class="ref">${esc(ref)}</span>` : ''}`;
      toast.classList.add('on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('on'), seconds * 1000);
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
    /** The title screen. Resolves with 'begin' or 'continue' when a button is pressed. */
    title({ resume = null } = {}) {
      title.innerHTML = `<div class="box">
        <div class="sub">A journey through 1 Nephi 3–4</div>
        <h1>I Will Go and Do</h1>
        <p>Nephi and his brothers return to Jerusalem for the plates of brass. Walk where they walked, read what they said, and see how the Lord prepared a way.</p>
        <div>${resume ? `<button data-go="continue">Continue · ${esc(resume)}</button><button data-go="begin" class="plain">Start over</button>` : `<button data-go="begin">Begin</button>`}</div>
        <div class="keys">W A S D to walk · Shift to run · Mouse to look · E to act · Esc to pause</div>
      </div>`;
      title.classList.add('on');
      return new Promise((done) => {
        for (const b of title.querySelectorAll('button')) {
          b.addEventListener('click', () => {
            title.classList.remove('on');
            done(b.dataset.go);
          });
        }
        title.querySelector('button')?.focus();
      });
    },
    hideTitle() {
      title.classList.remove('on');
    },
    /** The end: what was read, where to read more, something to talk about. */
    end({ onAgain }) {
      end.innerHTML = `<div class="box">
        <div class="sub">The end of the journey</div>
        <h1>The Lord Prepared a Way</h1>
        <blockquote>“I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.”<cite>1 Nephi 3:7</cite></blockquote>
        <p>To talk about together: Nephi and his brothers tried three times. What did Nephi know about the Lord that helped him keep going? When has the Lord prepared a way for you?</p>
        <p>Read the whole account in <a href="https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/3?lang=eng" target="_blank" rel="noopener">1 Nephi 3</a>, <a href="https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/4?lang=eng" target="_blank" rel="noopener">1 Nephi 4</a> and <a href="https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/5?lang=eng" target="_blank" rel="noopener">1 Nephi 5</a>.</p>
        <button data-go="again" class="plain">Play again</button>
      </div>`;
      end.classList.add('on');
      end.querySelector('button').addEventListener('click', () => {
        end.classList.remove('on');
        onAgain();
      });
    },
  };
}
