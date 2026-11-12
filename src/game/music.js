// The story's music: very little of it, and all of it made here, so there is nothing to license. A lyre, a frame
// drum and a held tone are as much as there is, and for most of the walk there is only the land's own sound.
//   - the Spirit's leading (4:6): a soft tone that gathers with the light when Nephi stands still, and is lost with it
//   - the chase (3:26): a frame drum alone, quicker as the servants of Laban come nearer
//   - the angel (3:29): one bright chord, held while he stands there, gone the moment he is
//   - Laban in the street (4:7): his breathing, and nothing else
//   - the tent of their father (5:7): the one tune, on a lyre
// It plays through the valley's sounds (sounds.js): where they have no sound, neither has this.

/** A plucked string (Karplus and Strong's): a burst of noise going round a loop as long as the note, wearing away. */
function makePluck(ctx, hz, seconds = 3.2) {
  const rate = ctx.sampleRate;
  const n = Math.floor(seconds * rate);
  const buffer = ctx.createBuffer(1, n, rate);
  const data = buffer.getChannelData(0);
  const period = Math.max(2, Math.round(rate / hz));
  const ring = new Float32Array(period);
  // (the pluck itself: noise, a little softened, so the string is gut and not wire)
  let soft = 0;
  for (let i = 0; i < period; i++) {
    soft += (Math.random() * 2 - 1 - soft) * 0.55;
    ring[i] = soft;
  }
  let at = 0;
  for (let i = 0; i < n; i++) {
    const next = (at + 1) % period;
    data[i] = ring[at];
    ring[at] = (ring[at] + ring[next]) * 0.4985;
    at = next;
  }
  // its last third fades to nothing
  const tail = Math.floor(n / 3);
  for (let i = 0; i < tail; i++) data[n - tail + i] *= 1 - i / tail;
  return buffer;
}

/** A frame drum struck in the middle (low: 'dum') or at the rim (high and short: 'tek'). */
function makeDrum(ctx, low) {
  const rate = ctx.sampleRate;
  const seconds = low ? 0.5 : 0.16;
  const n = Math.floor(seconds * rate);
  const buffer = ctx.createBuffer(1, n, rate);
  const data = buffer.getChannelData(0);
  let phase = 0;
  let slap = 0;
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    // the skin: a tone that falls as it rings; the hand on it: a short slap of noise
    const hz = low ? 62 + 60 * Math.exp(-t * 26) : 210 + 120 * Math.exp(-t * 40);
    phase += (hz / rate) * Math.PI * 2;
    slap += (Math.random() * 2 - 1 - slap) * (low ? 0.2 : 0.6);
    data[i] = Math.sin(phase) * Math.exp(-t * (low ? 9 : 30)) * (low ? 1 : 0.5) + slap * Math.exp(-t * (low ? 60 : 45)) * (low ? 0.5 : 0.7);
  }
  return buffer;
}

/** Breath, drawn and let go: soft noise, to loop. */
function makeBreath(ctx, seconds = 4.4) {
  const rate = ctx.sampleRate;
  const n = Math.floor(seconds * rate);
  const buffer = ctx.createBuffer(1, n, rate);
  const data = buffer.getChannelData(0);
  let soft = 0;
  let softer = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    soft += (Math.random() * 2 - 1 - soft) * 0.12;
    softer += (soft - softer) * 0.2;
    // in for a little under half of it, rougher; a rest; out, longer and lower; a rest
    const breathIn = Math.sin(Math.min(1, t / 0.38) * Math.PI) ** 2 * (t < 0.38 ? 1 : 0);
    const breathOut = Math.sin(Math.min(1, Math.max(0, (t - 0.46) / 0.46)) * Math.PI) ** 2 * 0.7;
    const rattle = 0.75 + 0.25 * Math.sin(t * seconds * 2 * Math.PI * 23);
    data[i] = (soft * breathIn * rattle + softer * breathOut) * 2.4;
  }
  return buffer;
}

// D, in the old way of tuning a lyre: five notes to the octave (D E F♯ A B), which cannot sound wrong together.
const HZ = { D2: 73.42, A2: 110, D3: 146.83, A3: 220, B3: 246.94, D4: 293.66, E4: 329.63, Fs4: 369.99, A4: 440, B4: 493.88, D5: 587.33, Fs5: 739.99, A5: 880 };
// The tune of the return (its own, written for this): [note, beats], in four phrases. The last comes home to D.
const TUNE = [
  ['A3', 1], ['D4', 1], ['E4', 1], ['Fs4', 2], ['E4', 1], ['D4', 1], ['B3', 2], ['A3', 2],
  ['D4', 1], ['E4', 1], ['Fs4', 1], ['A4', 2], ['Fs4', 1], ['E4', 1], ['D4', 1], ['E4', 3],
  ['A3', 1], ['D4', 1], ['E4', 1], ['Fs4', 2], ['A4', 1], ['B4', 2], ['A4', 1], ['Fs4', 2],
  ['E4', 1], ['D4', 1], ['B3', 1], ['D4', 2], ['A3', 1], ['D4', 5],
];
const BEAT = 0.62;

/**
 * @param sounds createSounds() (sounds.js): its clock and its way out are used
 */
export function createMusic(sounds) {
  let made = false;
  // each held sound: the gain it goes through, how loud it is wanted, how fast it comes and goes
  const held = {};
  const plucks = new Map();
  let dum = null;
  let tek = null;
  let drumLevel = 0;
  let nextBeat = 0;
  let beatCount = 0;
  let playing = [];
  let out = null;

  const ctx = () => {
    const c = sounds.context;
    return c && c.state === 'running' ? c : null;
  };

  /** Makes the held sounds, the first time there is a running clock to make them on. */
  function make(c) {
    made = true;
    out = c.createGain();
    out.gain.value = 0.9;
    out.connect(sounds.out);
    const hold = (name, rise, fall) => {
      const gain = c.createGain();
      gain.gain.value = 0;
      gain.connect(out);
      held[name] = { gain, want: 0, rise, fall };
      return gain;
    };
    // tones: [hz, how loud] each, two of each a hair apart so they beat slowly
    const tones = (to, list, type = 'sine') => {
      for (const [hz, loud] of list) {
        for (const cents of [-4, 5]) {
          const o = c.createOscillator();
          o.type = type;
          o.frequency.value = hz;
          o.detune.value = cents;
          const g = c.createGain();
          g.gain.value = loud / 2;
          o.connect(g).connect(to);
          o.start();
        }
      }
    };
    // the Spirit's leading: low and still, a fifth with its octave
    tones(hold('spirit', 0.9, 1.6), [[HZ.D3, 0.5], [HZ.A3, 0.34], [HZ.D4, 0.2], [HZ.Fs4, 0.06]]);
    // the angel: the same chord opened upward, bright
    tones(hold('angel', 1.1, 9), [[HZ.D4, 0.3], [HZ.A4, 0.3], [HZ.D5, 0.24], [HZ.Fs5, 0.16], [HZ.A5, 0.1]]);
    // a man's breath
    const breath = c.createBufferSource();
    breath.buffer = makeBreath(c);
    breath.loop = true;
    const band = c.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 520;
    band.Q.value = 0.7;
    breath.connect(band).connect(hold('breath', 1.2, 1.2));
    breath.start();
    dum = makeDrum(c, true);
    tek = makeDrum(c, false);
    for (const [name, level] of Object.entries(wanted)) held[name].want = level;
  }

  /** One buffer played once, at `when` on the sound's clock. */
  function play(c, buffer, when, loud, { pan = 0, keep = false } = {}) {
    const source = c.createBufferSource();
    source.buffer = buffer;
    const gain = c.createGain();
    gain.gain.value = loud;
    const p = c.createStereoPanner();
    p.pan.value = pan;
    source.connect(gain).connect(p).connect(out);
    source.start(when);
    if (keep) playing.push(source);
    return source;
  }
  function string(c, note) {
    if (!plucks.has(note)) plucks.set(note, makePluck(c, HZ[note]));
    return plucks.get(note);
  }
  const set = (name, level) => {
    if (held[name]) held[name].want = level;
    else wanted[name] = level;
  };
  // (what was asked for before there was any sound to make it with)
  const wanted = {};

  return {
    /** How strongly the Spirit leads now, 0 to 1 (guidance.js): the tone gathers and fades with the light. */
    spirit: (level) => set('spirit', level * 0.22),
    /** The angel's chord, 0 to 1; at 0 it is gone at once. */
    angel: (level) => set('angel', level * 0.15),
    /** A man breathing near by, 0 to 1. */
    breath: (level) => set('breath', level * 0.4),
    /** The drum of the chase: 0 for none, towards 1 as they close. */
    drum(level) {
      if (level > 0 && drumLevel === 0) nextBeat = 0;
      drumLevel = level;
    },
    /** Two notes of the lyre: something gathered, something done. */
    pluck() {
      const c = ctx();
      if (!c) return;
      if (!made) make(c);
      play(c, string(c, 'D4'), c.currentTime + 0.02, 0.32);
      play(c, string(c, 'A4'), c.currentTime + 0.17, 0.26);
    },
    /** The tune of the return, once through, over a string held low. */
    theme() {
      const c = ctx();
      if (!c) return;
      if (!made) make(c);
      let at = c.currentTime + 0.4;
      let beats = 0;
      for (const [note, len] of TUNE) {
        play(c, string(c, note), at, 0.55, { pan: -0.12, keep: true });
        // the low strings, at the start of each four beats
        if (beats % 4 === 0) play(c, string(c, beats % 8 === 0 ? 'D2' : 'A2'), at, 0.42, { pan: 0.15, keep: true });
        if (beats % 8 === 0) play(c, string(c, 'D3'), at + 0.03, 0.28, { pan: 0.15, keep: true });
        beats += len;
        at += len * BEAT;
      }
    },
    /** Everything still: between scenes, and when a scene is begun again. */
    stop() {
      for (const name of Object.keys(held)) held[name].want = 0;
      for (const name of Object.keys(wanted)) wanted[name] = 0;
      drumLevel = 0;
      for (const source of playing) {
        try {
          source.stop();
        } catch {
          // (it had ended already)
        }
      }
      playing = [];
    },
    update(dt) {
      const c = ctx();
      if (!c) return;
      if (!made) make(c);
      for (const h of Object.values(held)) {
        const v = h.gain.gain.value;
        h.gain.gain.value = v + (h.want - v) * Math.min(1, dt * (h.want > v ? h.rise : h.fall));
      }
      // the drum: struck in the middle on the beat, and at the rim between beats once they are close
      if (drumLevel > 0) {
        const every = 0.66 - 0.34 * Math.min(1, drumLevel);
        if (nextBeat < c.currentTime) nextBeat = c.currentTime + 0.05;
        while (nextBeat < c.currentTime + 0.12) {
          const loud = 0.28 + 0.3 * drumLevel;
          play(c, dum, nextBeat, beatCount % 4 === 0 ? loud : loud * 0.72);
          if (drumLevel > 0.45) play(c, tek, nextBeat + every / 2, loud * 0.5, { pan: 0.2 });
          nextBeat += every;
          beatCount++;
        }
      }
    },
  };
}
