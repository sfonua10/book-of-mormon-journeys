// The story of Daniel 3, in beats: the image of gold on the plain of Dura, the answer of Shadrach, Meshach and
// Abed-nego to the king, and the burning fiery furnace. It is told as the first journey is (story.js): the words on
// the cards are the scripture's own (scripture-daniel.js, the King James Version); the few lines that are not are
// what to do, or thoughts in italic without a reference.
//
// It is played more than it is read. What is said (the herald, the king, the three's answer) is a card, read before
// the story goes on, under the name of who says it: the name stands where the verse tells who spoke ("Nebuchadnezzar
// spake and said unto them,"), and under it is only what was said. What is only done is a line low on the screen,
// read while you walk; a list said over again is cut short with "…". Four times a verse is shown with a word left
// out, to be filled in, and then read whole.
//
// You are one of the three, and the other two are with you. What happens is fixed, as it is written; how you do it
// is yours. When the music sounds and all the people fall down, you are asked what you will do: stand, or fall down
// with them. Fall down, and it begins again: "they serve not thy gods, nor worship the golden image which thou hast
// set up" (3:12).
//
// What is shown follows what the text says and how a family would want it told. The men who cast them in are slain
// by the flame (3:22): that is read, in the dark, and not seen. The fourth in the fire is shown as the king saw him,
// "like the Son of God" (3:25): a figure in white, in light, who says and does nothing the text does not.
import { BABYLON, IN_BABYLON } from './babylon.js';
import { createCrowd } from './crowd.js';
import { createHalo } from './halo.js';
import { createHeat } from './heat.js';
import { INSTRUMENTS } from './music.js';
import { GATE } from './places.js';
import { BLANKS, EXCERPTS, SAID } from './scripture-daniel.js';

/** Babylon, in place of Jerusalem. */
export const LOOK = BABYLON;

// What each of them wears, as cel paint ([in the light, in the shade]) and as an outfit (wanderer.js, ROBE). As near
// as can be told of men in Babylon about 600 BC (the README says how near, and what is a guess): a tunic to the feet,
// fringed at its hem, a mantle over it, sandals, a round cap or a cloth wound about the head, hair worn to the
// shoulders, a beard. The three are officers of the province (2:49, 3:12), and were bound "in their coats, their
// hosen, and their hats, and their other garments" (3:21: what the Aramaic words named is not certain). Their colours
// are not known: they are told apart by them.
const tunic = (lit, shade) => ({ SHIRT: [lit, shade], TROUSERS: [lit.map((v) => v * 0.95), shade], SKIRT: [lit, shade] });
const officer = (lit, shade, cloak, cloakShade) => ({
  ...tunic(lit, shade),
  CLOAK: [cloak, cloakShade],
  HAT: [[0.88, 0.82, 0.7], [0.54, 0.5, 0.52]],
  TRIM: [[0.86, 0.72, 0.42], [0.52, 0.42, 0.28]],
  BELT: [[0.4, 0.26, 0.15], [0.2, 0.13, 0.1]],
  OUTFIT: { head: 'cap', hair: 'long', cloak: true, hem: 0.04, edge: 4, bare: 0, belt: 2, cuffs: 0, lace: 0.32, blade: 0, sleeves: true },
});
export const CLOTHES = {
  // you: a long tunic of deep blue, a mantle of undyed wool
  player: officer([0.24, 0.36, 0.6], [0.12, 0.18, 0.36], [0.84, 0.78, 0.66], [0.5, 0.46, 0.46]),
  // the other two: one in green, one in a red-brown
  friend1: officer([0.3, 0.5, 0.36], [0.15, 0.25, 0.24], [0.8, 0.74, 0.6], [0.46, 0.42, 0.42]),
  friend2: officer([0.62, 0.34, 0.24], [0.32, 0.16, 0.16], [0.86, 0.8, 0.68], [0.52, 0.48, 0.48]),
  // Nebuchadnezzar the king, as the kings of Babylon are carved: a tall conical crown with a band of gold and its
  // ribbons hanging behind, a long fringed robe, a mantle of purple bordered with gold, a long beard, and a staff
  // as tall as himself
  king: {
    ...tunic([0.95, 0.92, 0.86], [0.56, 0.54, 0.64]),
    CLOAK: [[0.36, 0.08, 0.22], [0.18, 0.04, 0.14]],
    HAT: [[0.95, 0.92, 0.84], [0.6, 0.57, 0.62]],
    HEADBAND: [[1.0, 0.8, 0.3], [0.62, 0.46, 0.2]],
    TRIM: [[1.0, 0.8, 0.3], [0.62, 0.46, 0.2]],
    BELT: [[0.62, 0.12, 0.12], [0.34, 0.06, 0.1]],
    HAIR: [[0.1, 0.08, 0.07], [0.05, 0.04, 0.05]],
    BEARD: [[0.1, 0.08, 0.07], [0.05, 0.04, 0.05]],
    OUTFIT: { head: 'crown', hair: 'long', beard: 'long', cloak: true, hem: 0.02, edge: 4, bare: 0, belt: 1, cuffs: 1, lace: 0.3, blade: 0, sleeves: true, staff: true },
  },
  // the herald: a tunic of red to the calf, a cloth wound about his head
  herald: {
    ...tunic([0.66, 0.2, 0.16], [0.36, 0.1, 0.12]),
    TRIM: [[0.86, 0.72, 0.4], [0.52, 0.42, 0.26]],
    HAT: [[0.84, 0.78, 0.64], [0.5, 0.46, 0.46]],
    BELT: [[0.36, 0.22, 0.12], [0.18, 0.11, 0.09]],
    OUTFIT: { head: 'turban', hair: 'long', cloak: false, hem: 0.28, edge: 4, bare: 0, belt: 2, cuffs: 0, lace: 0.34, blade: 0 },
  },
  // "the most mighty men that were in his army" (3:20): a coat of bronze scales over a short tunic, a pointed
  // helmet, guards on the forearms (of how Babylon's soldiers were armed almost nothing is pictured: this is a guess)
  mighty: {
    ...tunic([0.7, 0.62, 0.5], [0.4, 0.35, 0.36]),
    TRIM: [[0.5, 0.2, 0.16], [0.28, 0.1, 0.1]],
    BELT: [[0.3, 0.2, 0.12], [0.16, 0.1, 0.08]],
    LEATHER: [[0.6, 0.42, 0.24], [0.34, 0.23, 0.16]],
    GOLD: [[0.86, 0.62, 0.3], [0.5, 0.34, 0.18]],
    OUTFIT: { head: 'helmet', hair: 'long', cloak: false, hem: 0.5, edge: 2, bare: 0, belt: 1, cuffs: 1, lace: 0.4, blade: 0.5, armour: true },
  },
  // the fourth: a loose white robe to below the feet, wide sleeves, open at the neck
  fourth: {
    ...tunic([1.0, 0.98, 0.94], [0.82, 0.82, 0.88]),
    CLOAK: [[1.0, 0.98, 0.94], [0.82, 0.82, 0.88]],
    HAIR: [[0.36, 0.25, 0.16], [0.2, 0.14, 0.11]],
    SKIN: [[0.96, 0.76, 0.6], [0.7, 0.52, 0.48]],
    BOOTS: [[0.96, 0.76, 0.6], [0.7, 0.52, 0.48]],
    TRIM: [[0.98, 0.95, 0.88], [0.8, 0.78, 0.8]],
    OUTFIT: { head: 'none', cloak: false, hem: 0.01, edge: 0, bare: 0, belt: 0, cuffs: 0, lace: 0, blade: 0, sleeves: true, neck: 'v' },
  },
};

/**
 * The people gathered on the plain (the cast's ten "townsfolk", town.js): officers of the provinces and people of
 * many nations, in tunics of many colours, fringed, caps and turbans.
 */
const gathered_ = (lit, shade, head, hat, hem) => ({
  ...tunic(lit, shade),
  HAT: [hat, hat.map((v) => v * 0.6)],
  TRIM: [[0.84, 0.7, 0.42], [0.5, 0.42, 0.28]],
  BELT: [[0.4, 0.28, 0.17], [0.2, 0.14, 0.11]],
  OUTFIT: { head, hair: 'long', cloak: false, hem, edge: 4, bare: 0, belt: 2, cuffs: 0, lace: 0.3, blade: 0 },
});
const PEOPLE_CLOTHES = [
  gathered_([0.8, 0.74, 0.6], [0.46, 0.42, 0.42], 'cap', [0.88, 0.84, 0.74], 0.05),
  gathered_([0.6, 0.24, 0.18], [0.32, 0.12, 0.13], 'turban', [0.86, 0.8, 0.66], 0.05),
  gathered_([0.26, 0.34, 0.54], [0.13, 0.17, 0.32], 'cap', [0.82, 0.74, 0.58], 0.05),
  gathered_([0.72, 0.56, 0.3], [0.4, 0.3, 0.2], 'turban', [0.3, 0.36, 0.52], 0.3),
  gathered_([0.34, 0.44, 0.32], [0.17, 0.22, 0.2], 'cap', [0.88, 0.84, 0.74], 0.05),
];

/** Who is in the story, in the order they are made, and whether they wear a beard. */
export const PEOPLE = [
  ['meshach', 'friend1', true],
  ['abednego', 'friend2', true],
  ['king', 'king', true],
  ['herald', 'herald', true],
  ['mighty1', 'mighty', true],
  ['mighty2', 'mighty', true],
  ['fourth', 'fourth', true],
];

/**
 * What is written, small, over each of them the text names (names.js), spelled as the cards spell them. `you` is the
 * one you walk as: the other two being Meshach and Abednego, you are Shadrach. The fourth has no name written.
 */
export const NAMES = { you: 'Shadrach', meshach: 'Meshach', abednego: 'Abednego', king: 'Nebuchadnezzar' };

/** The people of the city are the story's to place (the crowd on the plain, the king's counsellors): none walk it. */
export function town() {
  return { day() {}, night() {}, watch() {} };
}

export function story(g) {
  const { P, C } = g;
  const yawTo = ([x0, z0], [x1, z1]) => Math.atan2(x1 - x0, z1 - z0);
  const who = (name) => g.cast.get(name);
  const at = (npc) => [npc.x, npc.z];
  const me = () => [g.player.x, g.player.z];
  const from = ([x, z]) => Math.hypot(g.player.x - x, g.player.z - z);
  const shoulder = (point, options) => g.shoulder(point, options);
  /** The ten people of the city: the crowd, the counsellors. They are dressed as Babylon's. */
  const people = Array.from({ length: 10 }, (_, i) => `town${i}`);
  people.forEach((name, i) => who(name).w.dress(PEOPLE_CLOTHES[i % PEOPLE_CLOTHES.length]));
  // and about them the multitude, painted (crowd.js); and the heat of the furnace, at the picture's edges (heat.js)
  const crowd = createCrowd(g.scene, g.field, g.heightAt);
  const heat = createHeat();

  // ---- the places, in the world's (x, z) ----
  // inside the gate, and out between the walls of lions
  const gateOut = P(GATE[0] - 14, 0);
  const gateIn = C(-62, 0);
  const square = C(-44, 0);
  // the image, and before it (it looks towards the city): where the herald stands, and where you stand, at the back
  // of the multitude
  const image = P(...IN_BABYLON.image);
  const [iu, iv] = IN_BABYLON.image;
  const heraldAt = P(iu + 6, iv);
  const before = P(iu + 34, iv - 1.5);
  // the king on his dais, and the ground before it
  const [ku, kv] = IN_BABYLON.king;
  const kingAt = P(ku, kv);
  const inCourt = P(ku, kv + 8);
  // the furnace's door, the ground before it (towards the king's seat), and within
  const [mu, mv] = IN_BABYLON.mouth;
  const mouth = P(mu, mv);
  const street = P(mu, mv - 6.5);
  const midst = P(mu, mv + 5);
  const deep = P(mu, mv + 9);
  // the way out of the city to the plain
  const toPlain = [C(-56, 0), gateIn, gateOut, P(206, 0)];

  // ---- the fire ----
  // Flames within the furnace: glows that face the eye, each wavering in its own time. `fire.level` is how hot it
  // burns: as it is wont (about half), or "one seven times more" (1). They are only drawn; nothing is burned. Near
  // one of the three in the midst of it they lean away.
  const rim = IN_BABYLON.furnaceTall + 1.4;
  const flames = [[-3.2, 3.4, 1.5], [3.1, 3.0, 1.5], [-2.6, 8.2, 1.5], [2.9, 8.6, 1.5], [0.2, 10.0, 1.5], [-3.6, 5.9, 1.5], [3.6, 6.1, 1.5], [0, 1.4, 1.5], [-4, 4.5, rim], [0.5, 4, rim], [4.2, 5, rim], [-3, 9.5, rim], [2.5, 9.8, rim]].map(([du, dv, up], i) => ({
    at: P(mu + du, mv + dv),
    up,
    halo: createHalo(g.scene, { color: i % 2 ? [2.6, 0.9, 0.16] : [2.8, 1.25, 0.3], width: (3.2 + (i % 3) * 0.7) * (up > 2 ? 1.5 : 1), height: (5 + (i % 2) * 1.4) * (up > 2 ? 1.4 : 1), back: 0, rays: 0.35 }),
    pace: 2.1 + i * 0.47,
  }));
  const fire = { level: 0, now: 0 };
  const burn = () => {
    const t = performance.now() / 1000;
    fire.now += (fire.level - fire.now) * 0.04;
    for (const f of flames) {
      let [x, z] = f.at;
      if (f.up < 2) {
        const dx = x - g.player.x;
        const dz = z - g.player.z;
        const d = Math.hypot(dx, dz) || 1;
        if (d < 3.4) {
          x += (dx / d) * (3.4 - d) * 0.7;
          z += (dz / d) * (3.4 - d) * 0.7;
        }
      }
      const waver = 0.78 + 0.22 * Math.sin(t * f.pace) * Math.sin(t * f.pace * 0.37 + f.pace);
      f.halo.update(t * 6);
      f.halo.set(x, g.heightAt(...f.at) + f.up + 0.25 * Math.sin(t * f.pace * 0.8), z, fire.now * waver * 0.5);
    }
    crowd.update(g.clock());
    requestAnimationFrame(burn);
  };
  requestAnimationFrame(burn);

  /** Bound, hands together before him (3:21), or loosed. */
  const BOUND = { out: 0.24, up: 0.98, wide: 0.05 };
  function bind(on) {
    g.player.holds = on ? BOUND : null;
    for (const n of ['meshach', 'abednego']) who(n).holds = on ? BOUND : null;
  }
  /** The two who are with you keep by you. */
  function withMe() {
    who('meshach').follow(g.player, 2.2, 1.2);
    who('abednego').follow(g.player, 2.6, -1.3);
  }
  function reset({ hour, stand, face }) {
    g.cast.clear();
    g.props.reset();
    g.setHour(hour);
    g.dress('player');
    g.view(null);
    g.guidance.lead(null);
    g.guidance.shine(null);
    g.music.stop();
    g.sounds.hush(0);
    g.burden(null);
    g.room('furnace');
    for (const name of [...people, 'meshach', 'abednego', 'king', 'herald', 'mighty1', 'mighty2', 'fourth']) {
      const n = who(name);
      n.bow = 0;
      n.aura = 0;
      n.lift = 0;
    }
    bind(false);
    crowd.show(false);
    crowd.fall(null);
    heat.set(0);
    fire.level = 0.5;
    g.standAt(stand[0], stand[1], yawTo(stand, face));
  }
  /**
   * The people gathered before the image: the ten nearest you in two rows, the multitude before them and to either
   * side, all facing the image; the herald at its foot.
   */
  function gathered() {
    people.forEach((name, i) => {
      const row = Math.floor(i / 5);
      const p = P(iu + 28 + row * 2.6, iv + (i % 5 - 2) * 2.3 + (row ? 1.1 : 0) - 1);
      who(name).place(p[0], p[1], yawTo(p, image)).face(...image);
    });
    who('herald').place(...heraldAt, yawTo(heraldAt, before)).face(...before);
    const many = [];
    let k = 1;
    const shake = () => (k = (k * 16807) % 2147483647) / 2147483647 - 0.5;
    for (let r = 0; r < 10; r++) for (let v = -24; v <= 24; v += 1.55) if (Math.abs(v) > 1.4) many.push(P(iu + 10 + r * 1.8 + shake() * 0.6, iv + v + shake() * 0.7));
    for (let u = iu + 27; u < iu + 46; u += 2) for (const side of [-1, 1]) for (let v = 9; v <= 24; v += 1.7) many.push(P(u + shake() * 0.7, iv + side * (v + shake() * 0.6)));
    crowd.place(many, 7);
  }
  /** The king on his dais, his mighty men by it. */
  function court() {
    const toward = P(ku - 16, kv + 18);
    who('king').place(...kingAt, yawTo(kingAt, toward)).face(...toward);
    who('mighty1').place(...P(ku - 3.5, kv + 4.5), 0).face(...toward);
    who('mighty2').place(...P(ku + 3.5, kv + 4.5), 0).face(...toward);
  }
  /** All the people fall down before the image (or rise), not all at the one moment. */
  function fallDown(on) {
    people.forEach((name, i) => setTimeout(() => (who(name).bow = on ? 1 : 0), on ? 150 + ((i * 370) % 1300) : (i * 210) % 900));
    who('herald').bow = on ? 1 : 0;
    crowd.fall(on ? g.clock() : null);
  }

  // ---- what is shown of the scripture ----
  /** A card of part of a verse (EXCERPTS), read before the story goes on: under the speaker's name, if it is said. */
  const part = (c, key) => c.card(EXCERPTS[key].text, g.reference(EXCERPTS[key].verse), { voice: EXCERPTS[key].voice, who: EXCERPTS[key].who ?? '' });
  /** A verse whole, as a card: under the speaker's name, where the whole of it is what one of them says (SAID). */
  const verse = (c, v) => c.verse(v, v, { who: SAID[v] ?? '' });
  /** A line low on the screen, read while the story goes on: a whole verse, or part of one. */
  const line = (c, verse) => c.line(g.verses(verse), g.reference(verse));
  const lineOf = (c, key) => c.line(EXCERPTS[key].text, g.reference(EXCERPTS[key].verse), { voice: EXCERPTS[key].voice });
  /**
   * A verse with a word left out (BLANKS), to be filled in from three; then the verse whole in its place (or what
   * is said in it, under the speaker's name), whatever was chosen. Nothing is lost by a wrong answer. With ?wrong a
   * test answers wrongly.
   */
  async function fill(c, key) {
    const q = BLANKS[key];
    const auto = g.flag('wrong') ? (q.right + 1) % q.answers.length : q.right;
    const took = await c.choice(q.text, q.answers, { ref: g.reference(q.verse), who: q.who ?? '', auto, keep: true });
    g.log(`filled ${key}: ${took === q.right ? 'the word that was there' : 'another'}`);
    if (q.said) await part(c, q.said);
    else await verse(c, q.verse);
  }
  /**
   * What is asked when the music has sounded and all the people have fallen down. These are not the scripture's
   * words: the card is a thought, in italic, without a reference. The first answer is what the three did.
   */
  const ASKED = { text: 'All the people fall down and worship the golden image. What will you do?', answers: ['Stand', 'Fall down and worship'] };
  /** "the sound of the cornet, flute, …": the instruments, as 3:5 names them, each as it begins to play. */
  const NAMED = ['cornet', 'flute', 'harp', 'sackbut', 'psaltery', 'dulcimer', 'and all kinds of musick'];
  async function music(c, quick = false) {
    for (let i = 0; i < INSTRUMENTS.length; i++) {
      g.music.consort(INSTRUMENTS[i]);
      const heard = `… the sound of the ${NAMED.slice(0, i + 1).join(', ')} …`;
      c.toast(heard, '', 4);
      if (i === INSTRUMENTS.length - 1) fallDown(true);
      await c.wait(quick ? 0.35 : 1.5);
    }
  }

  return [
    // ---- Act one: the image of gold (Daniel 3:1–13) ----
    {
      id: 'a1',
      label: 'Act One',
      scene: true,
      setup() {
        reset({ hour: 16.0, stand: square, face: gateIn });
        who('meshach').place(...C(-42, 2.2), yawTo(C(-42, 2.2), gateIn));
        who('abednego').place(...C(-41.4, -2), yawTo(C(-41.4, -2), gateIn));
        gathered();
        court();
        // (three of the officers are late, and go out before you)
        people.slice(7).forEach((name, i) => {
          const n = who(name);
          const was = [n.x, n.z];
          const p = C(-49 - i * 2.5, (i - 1) * 2.2);
          n.place(...p, yawTo(p, gateIn));
          n.walk([gateIn, gateOut, P(206, (i - 1) * 2), was], 1.35).then(() => n.face(...image));
        });
      },
      async run(c) {
        await c.fade(0, 2);
        g.narration?.warm(g.reference('3:1'));
        await c.chapter('Act One', 'The Image of Gold', 'Daniel 3');
        await c.verse('3:1');
        c.objective('Go out by the gate to the plain of Dura, where the image stands.');
        withMe();
        line(c, '3:2');
        await c.reach(...before, 8, { via: toPlain });
      },
    },
    {
      id: 'a1-dura',
      label: 'Act One',
      setup() {
        reset({ hour: 16.0, stand: before, face: image });
        const [a, b] = [P(iu + 33.5, iv + 2.4), P(iu + 34.2, iv - 3.6)];
        who('meshach').place(...a, yawTo(a, image)).face(...image);
        who('abednego').place(...b, yawTo(b, image)).face(...image);
        gathered();
        court();
      },
      async run(c) {
        c.objective(null);
        // the two with you come up to stand by you (if you ran ahead of them, they are waited for a little)
        const came = c.time;
        await c.until(() => c.time - came > 10 || ['meshach', 'abednego'].every((n) => from(at(who(n))) < 7));
        for (const [n, p] of [['meshach', P(iu + 33.5, iv + 2.4)], ['abednego', P(iu + 34.2, iv - 3.6)]]) {
          const one = who(n).stop();
          if (from(at(one)) < 12) one.walk([p], 2.4).then(() => one.face(...image));
          else one.place(...p, yawTo(p, image)).face(...image);
        }
        // the image over them all, seen from where you stand
        c.freeze(true);
        g.view({ from: [...P(iu + 42, iv + 6), 1.5], to: [...image, 13] });
        await lineOf(c, '3:3');
        g.view(null);
        c.freeze(false);
        shoulder(at(who('herald')), { back: 4.4, up: 2.4, look: 1.5 });
        await part(c, '3:4-said');
        await verse(c, '3:5');
        await verse(c, '3:6');
        g.view(null);
        // The music sounds, an instrument at a time, and all the people fall down. Then it is asked what you will
        // do, and there is no haste to answer: stand, as they did, or fall down with the rest, and it is begun
        // again. With ?bow a test falls down the first time.
        for (let tries = 0; ; tries++) {
          await music(c, tries > 0);
          // (a moment to see them all down)
          await c.wait(1);
          const took = await c.choice(ASKED.text, ASKED.answers, { auto: g.flag('bow') && tries === 0 ? 1 : 0 });
          if (took === 0) break;
          g.log(`fell down (try ${tries + 1})`);
          await c.fade(1, 0.6);
          g.music.stop();
          await part(c, '3:12-end');
          fallDown(false);
          await c.fade(0, 0.8);
          await c.wait(1.2);
        }
        // only three stand: seen from above, among them all
        c.freeze(true);
        g.view({ from: [...P(iu + 50, iv + 16), 9], to: [...P(iu + 30, iv - 1), 0.5] });
        await lineOf(c, '3:7');
        g.view(null);
        c.freeze(false);
        g.music.stop();
        fallDown(false);
        // certain Chaldeans go to the king, and accuse them
        const [ch1, ch2] = [who('town3'), who('town6')];
        const went = Promise.all([ch1.walk([P(ku - 2, kv + 6)], 2.6).then(() => ch1.face(...kingAt)), ch2.walk([P(ku + 2, kv + 6)], 2.6).then(() => ch2.face(...kingAt))]);
        await Promise.all([line(c, '3:8'), Promise.race([went, c.wait(14)])]);
        c.freeze(true);
        g.view({ from: [...P(ku - 7, kv + 15), 2.8], to: [...P(ku, kv + 3), 1.4] });
        await verse(c, '3:12');
        g.view(null);
        c.freeze(false);
        // they are sent for: two of the king's mighty men come to them
        const [m1, m2] = [who('mighty1'), who('mighty2')];
        await c.hold(Promise.all([m1.walk([[g.player.x + 2.2, g.player.z + 1.4]], 3.2), m2.walk([[g.player.x + 3.2, g.player.z - 1.2]], 3.2)]));
        m1.face(...me());
        m2.face(...me());
        line(c, '3:13');
      },
    },

    // ---- Act two: before the king (Daniel 3:13–18) ----
    {
      id: 'a2',
      label: 'Act Two',
      setup() {
        const stand = P(ku - 6, kv + 20);
        reset({ hour: 16.0, stand, face: kingAt });
        gathered();
        court();
        const [a, b] = [P(ku - 8, kv + 21.5), P(ku - 4.2, kv + 21.8)];
        who('meshach').place(...a, yawTo(a, kingAt)).face(...kingAt);
        who('abednego').place(...b, yawTo(b, kingAt)).face(...kingAt);
        who('mighty1').place(...P(ku - 4, kv + 18), 0).face(...me());
        who('mighty2').place(...P(ku - 8, kv + 18), 0).face(...me());
      },
      async run(c) {
        g.narration?.warm(g.reference('3:14'));
        c.objective('Go with the mighty men, and stand before the king.');
        withMe();
        // (they go with you, one either side)
        Object.assign(who('mighty1').follow(g.player, 2.4, 2.2), { maxSpeed: 4 });
        Object.assign(who('mighty2').follow(g.player, 2.4, -2.2), { maxSpeed: 4 });
        await c.chapter('Act Two', 'Before the King', 'Daniel 3', 2.6);
        await c.act(...kingAt, 5.5, 'Stand before the king');
        c.objective(null);
        for (const n of ['meshach', 'abednego', 'mighty1', 'mighty2']) who(n).stop().face(...kingAt);
        who('king').face(...me());
        shoulder(at(who('king')), { back: 3.6, up: 2.2, look: 1.5 });
        await part(c, '3:14-said');
        // (as he names the furnace, the eye goes to it)
        g.view({ from: [...P(ku - 3, kv + 9), 2.4], to: [...P(mu, mv + 4), 5] });
        await part(c, '3:15');
        g.view(null);
        c.objective('Answer the king.');
        await c.act(...kingAt, 6.5, 'Answer the king');
        c.objective(null);
        shoulder(at(who('king')), { back: 3.6, side: -1.1, up: 2.2, look: 1.5 });
        await part(c, '3:16-said');
        await verse(c, '3:17');
        await fill(c, 'not');
        g.view(null);
      },
    },

    // ---- Act three: in the midst of the fire (Daniel 3:19–30) ----
    {
      id: 'a3',
      label: 'Act Three',
      setup() {
        reset({ hour: 16.0, stand: inCourt, face: kingAt });
        gathered();
        court();
        who('king').face(...inCourt);
        const [a, b] = [P(ku + 2.4, kv + 8.4), P(ku - 2.3, kv + 8.6)];
        who('meshach').place(...a, yawTo(a, kingAt)).face(...kingAt);
        who('abednego').place(...b, yawTo(b, kingAt)).face(...kingAt);
        who('mighty1').place(...P(ku + 1.8, kv + 11.5), 0).face(...kingAt);
        who('mighty2').place(...P(ku - 1.8, kv + 11.5), 0).face(...kingAt);
      },
      async run(c) {
        const king = who('king');
        g.narration?.warm(g.reference('3:19'));
        await c.chapter('Act Three', 'In the Midst of the Fire', 'Daniel 3', 2.6);
        shoulder(at(king), { back: 3.6, up: 2.2, look: 1.5 });
        // heated "one seven times more than it was wont to be heated"
        await c.verse('3:19');
        fire.level = 1;
        heat.set(0.45);
        g.music.drum(0.3);
        g.view(null);
        // the mighty men bind them, and lead them to the furnace, slowly
        bind(true);
        g.burden(2.0);
        const [m1, m2] = [who('mighty1'), who('mighty2')];
        Object.assign(m1.follow(g.player, 1.6, 1.4), { maxSpeed: 2.4 });
        Object.assign(m2.follow(g.player, 1.6, -1.4), { maxSpeed: 2.4 });
        withMe();
        line(c, '3:20');
        c.objective('Go to the mouth of the furnace.');
        // half way there, what you know comes to mind; the drum softens, and a still chord comes in
        await c.reach(...street, 3.2, { via: [P(ku + 1, kv + 14)], unless: () => from(street) < from(inCourt) });
        c.objective(null);
        await fill(c, 'able');
        g.music.drum(0.08);
        g.music.still(1);
        heat.set(0.65);
        c.objective('Go to the mouth of the furnace.');
        line(c, '3:21');
        await c.reach(...street, 3.2);
        c.objective(null);
        // (the casting in, and what the flame did to those who cast them, are read and not seen)
        await c.fade(1, 1.2);
        g.music.drum(0);
        await c.verse('3:22', '3:23');
      },
    },
    {
      id: 'a3-fire',
      label: 'Act Three',
      scene: true,
      setup() {
        reset({ hour: 16.8, stand: midst, face: deep });
        fire.level = 1;
        heat.set(0.6);
        gathered();
        court();
        const [a, b] = [P(mu + 2.4, mv + 4.6), P(mu - 2.3, mv + 4.2)];
        who('meshach').place(...a, yawTo(a, deep)).face(...deep);
        who('abednego').place(...b, yawTo(b, deep)).face(...deep);
        const fourth = who('fourth').place(...deep, yawTo(deep, midst)).face(...midst);
        fourth.w.glow.value = 0.45;
        fourth.aura = 1;
        fourth.open = 0.25;
        g.guidance.shine(...deep, 7);
        // the king has come down from his seat to look, his counsellors with him
        const near = P(mu - 6.5, mv - 3.4);
        who('king').place(...near, yawTo(near, mouth)).face(...mouth);
        people.slice(0, 8).forEach((name, i) => {
          const p = P(mu - 14 + i * 3.6 + (i > 3 ? 4 : 0), mv - 12.4 - (i % 2) * 0.9);
          who(name).place(p[0], p[1], 0).face(...mouth);
        });
      },
      async run(c) {
        const king = who('king');
        const fourth = who('fourth');
        g.music.angel(0.7);
        await c.fade(0, 2.2);
        // loose, and not alone: "walking in the midst of the fire". Nothing is asked: walk as you will; the one who
        // stood there comes to walk with you, and the story goes on when you come to where he stood.
        withMe();
        fourth.walk([[g.player.x + 1.6, g.player.z + 0.8]], 1.0).then(() => fourth.follow(g.player, 1.8, 1.5));
        await c.reach(...deep, 3.0, { mark: false });
        for (const n of ['meshach', 'abednego']) who(n).stop().face(...deep);
        // as the king saw it, from before the mouth: count them
        const seen = [[g.player, P(mu - 1.3, mv + 6.4)], [who('meshach'), P(mu + 2.3, mv + 6.9)], [who('abednego'), P(mu - 2.9, mv + 8.2)]];
        const stood = P(mu + 0.5, mv + 8.6);
        fourth.place(...stood, yawTo(stood, mouth)).face(...mouth);
        g.guidance.shine(...stood, 7);
        for (const [one, p] of seen) {
          if (one === g.player) g.standAt(...p, yawTo(p, stood));
          else one.place(...p, yawTo(p, stood)).face(...stood);
        }
        g.view({ from: [...P(mu - 0.3, mv - 4.6), 1.7], to: [...P(mu, mv + 7.4), 1.2] });
        await part(c, '3:24-a');
        await part(c, '3:24-said');
        await part(c, '3:24-answer');
        await fill(c, 'four');
        g.view(null);
        king.face(...mouth);
      },
    },
    {
      id: 'a3-forth',
      label: 'Act Three',
      setup() {
        reset({ hour: 16.8, stand: P(mu - 1.3, mv + 6.4), face: mouth });
        fire.level = 1;
        heat.set(0.6);
        gathered();
        court();
        who('meshach').place(...P(mu + 2.3, mv + 6.9), 0).face(...mouth);
        who('abednego').place(...P(mu - 2.9, mv + 8.2), 0).face(...mouth);
        const near = P(mu - 6.5, mv - 3.4);
        who('king').place(...near, yawTo(near, mouth)).face(...mouth);
        const fourth = who('fourth').place(...P(mu + 0.5, mv + 8.6), 0).face(...mouth);
        fourth.w.glow.value = 0.45;
        fourth.aura = 1;
        fourth.open = 0.25;
        g.music.angel(0.7);
        people.slice(0, 8).forEach((name, i) => {
          const p = P(mu - 14 + i * 3.6 + (i > 3 ? 4 : 0), mv - 12.4 - (i % 2) * 0.9);
          who(name).place(p[0], p[1], 0).face(...mouth);
        });
      },
      async run(c) {
        const king = who('king');
        const fourth = who('fourth');
        shoulder(at(king), { back: 3.2, up: 1.9, look: 1.6 });
        await part(c, '3:26-a');
        await part(c, '3:26-said');
        g.view(null);
        c.objective('Come forth of the midst of the fire.');
        withMe();
        // (the end of the verse is what you now do)
        lineOf(c, '3:26-end');
        await c.reach(...street, 3.2, { via: [mouth] });
        c.objective(null);
        // (nothing is said of where the fourth went: when they have come forth he is not seen)
        fourth.aura = 0;
        fourth.show(false);
        g.guidance.shine(null);
        g.music.angel(0);
        fire.level = 0.5;
        heat.set(0);
        // The princes, governors, captains and counsellors gather round them, and see (3:27): go among them, and
        // what they saw is told, a part at a time.
        const saw = ['3:27-a', '3:27-b', '3:27-c', '3:27-d'];
        const lookers = people.slice(0, 4).map((name, i) => {
          const n = who(name);
          const p = P(mu - 9 + i * 6, mv - 14 - (i % 2) * 3);
          n.walk([p], 1.4).then(() => n.face(...me()));
          return { n, key: saw[i], seen: false, at: p };
        });
        for (const name of people.slice(4, 8)) who(name).face(...me());
        const list = () => lookers.map((l) => ({ label: EXCERPTS[l.key].text.replace(/^… /, '').replace(/ …$/, '').replace(/\.$/, ''), done: l.seen }));
        while (lookers.some((l) => !l.seen)) {
          c.objective('Go among the princes and counsellors.', list());
          let near = null;
          await c.until(() => {
            const left = lookers.filter((l) => !l.seen).sort((a, b) => from(at(a.n)) - from(at(b.n)));
            c.lead({ x: left[0].n.x, z: left[0].n.z, r: 1.4, mark: true });
            near = left.find((l) => from(at(l.n)) < 2.6) ?? null;
            return !!near;
          });
          near.seen = true;
          near.n.face(...me());
          lineOf(c, near.key);
          g.music.pluck();
        }
        c.lead(null);
        c.objective('Go among the princes and counsellors.', list());
        await c.wait(1.2);
        c.objective(null);
        await c.verse('3:27');
        // the king blesses God
        king.walk([[g.player.x - 2.2, g.player.z - 3]], 1.4).then(() => king.face(...me()));
        await c.wait(1.5);
        shoulder(at(king), { back: 3.6, up: 2.2, look: 1.5 });
        await fill(c, 'trusted');
        await part(c, '3:29-end');
        g.music.theme();
        await c.verse('3:30');
        g.view(null);
        await c.fade(1, 2);
        g.end();
      },
    },
  ];
}
