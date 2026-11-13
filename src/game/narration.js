// The scripture read aloud. Each card that quotes scripture may have a recording of it, made ahead of time
// (tools/narrate.mjs) and kept beside the game in ./audio/narration/, named for its reference ("1 Nephi 4:11–12"
// is 1-nephi-4-11-12.mp3). manifest.json there lists the ones there are, so none is asked for that isn't. A
// recording is fetched when its card comes up, and plays through the valley's sounds (sounds.js): where they
// have no sound, nothing is read. A button at the top right, or M, turns the reading off and on.

const CSS = /* css */ `
#n-voice {
  position: fixed; z-index: 7; right: calc(14px + env(safe-area-inset-right)); top: calc(14px + env(safe-area-inset-top));
  padding: 7px 12px; border-radius: 999px; border: 1px solid rgba(227, 189, 109, 0.5); background: rgba(24, 18, 12, 0.6);
  color: #f4ead6; font: 13px/1 Georgia, 'Times New Roman', serif; letter-spacing: 0.06em; cursor: pointer; display: none;
  touch-action: manipulation; -webkit-user-select: none; user-select: none;
}
#n-voice.has { display: block; }
#n-voice.off { opacity: 0.6; }
body.menu #n-voice, body:not(.ready) #n-voice { display: none; }
`;

/** "1 Nephi 4:11–12" → "1-nephi-4-11-12": the name its recording is kept under. The same in tools/narrate.mjs. */
export const slug = (ref) => ref.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * @param sounds createSounds(): its context and its way out
 * @param options.base where the recordings are
 * @param options.note says a word at the top of the screen (main.js, note)
 */
export function createNarration(sounds, { base = './audio/narration/', note = null } = {}) {
  const have = new Set();
  const buffers = new Map(); // slug -> Promise<AudioBuffer | null>
  let on = true;
  try {
    on = localStorage.getItem('journeys.voice') !== 'off';
  } catch {
    // (no storage: it is read, and not remembered)
  }
  let current = null; // { source, gain, handle }

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  const button = document.createElement('button');
  button.id = 'n-voice';
  document.body.append(button);
  const show = () => {
    button.textContent = on ? 'Voice on' : 'Voice off';
    button.classList.toggle('off', !on);
    button.setAttribute('aria-pressed', String(on));
    button.title = 'Read the scripture aloud (M)';
  };
  show();

  // A recording as it comes over the wire, asked for once. It is asked for a little before its card comes up (see
  // `ahead`), so that on a slow connection the reading begins with the card and not some seconds into it; it is only
  // made into sound when it is to be read, since sound takes many times the room.
  const bytes = new Map(); // slug -> Promise<ArrayBuffer | null>
  const wired = (key) => {
    if (!bytes.has(key)) {
      bytes.set(
        key,
        fetch(`${base}${key}.mp3`)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
          .catch(() => null),
      );
    }
    return bytes.get(key);
  };
  const fetched = (key) => {
    if (!buffers.has(key)) {
      const ctx = sounds.context;
      buffers.set(
        key,
        wired(key)
          .then((got) => (got ? ctx.decodeAudioData(got) : null))
          .catch(() => null),
      );
    }
    return buffers.get(key);
  };
  // The recordings in the order of the account (chapter, then verse), which is nearly the order they are read in.
  let order = [];
  const place = (key) => key.split('-').slice(2).map(Number);
  /** Asks for the recording at `key` (if it is not had yet) and the `more` after it in the account. */
  const ahead = (key, more = 2) => {
    if (!on) return;
    const i = order.indexOf(key);
    if (i < 0) return;
    for (const k of order.slice(i, i + 1 + more)) if (!buffers.has(k)) wired(k);
  };

  function stop(fade = 0.12) {
    if (!current) return;
    const { source, gain } = current;
    current = null;
    const ctx = sounds.context;
    try {
      gain.gain.setTargetAtTime(0, ctx.currentTime, fade / 3);
      source.stop(ctx.currentTime + fade);
    } catch {
      // (already over)
    }
  }

  function toggle() {
    on = !on;
    if (!on) stop();
    try {
      localStorage.setItem('journeys.voice', on ? 'on' : 'off');
    } catch {
      // (not remembered)
    }
    show();
    note?.(on ? 'Reading aloud' : 'Reading off');
  }
  button.addEventListener('click', (e) => {
    toggle();
    e.target.blur();
  });
  addEventListener('keydown', (e) => {
    if (e.code === 'KeyM' && !e.repeat && have.size) toggle();
  });

  return {
    /** Learns which recordings there are. Nothing is read until it has. */
    async load() {
      try {
        const list = await (await fetch(`${base}manifest.json`)).json();
        for (const key of Object.keys(list)) have.add(key);
        order = [...have].sort((a, b) => {
          const [ca, va] = place(a);
          const [cb, vb] = place(b);
          return ca - cb || va - vb;
        });
      } catch {
        // (none)
      }
      button.classList.toggle('has', have.size > 0);
    },
    get on() {
      return on;
    },
    has: (ref) => have.has(slug(ref)),
    /** A reading that is coming soon (the first of an act, while its title is up): it is asked for now. */
    warm: (ref) => ahead(slug(ref ?? '')),
    /**
     * Reads the scripture at `ref`, if there is a recording of it and the reading is on. Returns a handle whose
     * `ended` turns true when it has been read to its end (not when it is stopped), or null if nothing is read.
     */
    say(ref) {
      const key = slug(ref ?? '');
      const ctx = sounds.context;
      if (!on || !ctx || !have.has(key)) return null;
      stop();
      const handle = { ended: false };
      const mine = { source: null, gain: null, handle };
      current = mine;
      ahead(key);
      fetched(key).then((buffer) => {
        // (gone on from the card before it came, or no sound yet to play it through: then the card just waits)
        if (current !== mine) return;
        if (!buffer || ctx.state !== 'running') return void (current = null);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = 1;
        source.connect(gain).connect(sounds.out);
        source.onended = () => {
          if (current === mine) {
            current = null;
            handle.ended = true;
          }
        };
        mine.source = source;
        mine.gain = gain;
        source.start();
      });
      return handle;
    },
    stop() {
      if (current && !current.source) current = null;
      else stop();
    },
  };
}
