// The story of Daniel 3, in beats: the image of gold on the plain of Dura, the answer of Shadrach, Meshach and
// Abed-nego to the king, and the burning fiery furnace. It is told as the first journey is (story.js): the words on
// the cards are the scripture's own (scripture-daniel.js, the King James Version); the few lines that are not are
// what to do, or thoughts in italic without a reference.
//
// You are one of the three, and the other two are with you. What happens is fixed, as it is written; how you do it
// is yours. When the music sounds and all the people fall down, you may fall down with them, and it begins again:
// "they serve not thy gods, nor worship the golden image which thou hast set up" (3:12).
//
// What is shown follows what the text says and how a family would want it told. The men who cast them in are slain
// by the flame (3:22): that is read, in the dark, and not seen. The fourth in the fire is shown as the king saw him,
// "like the Son of God" (3:25): a figure in white, in light, who says and does nothing the text does not.
import { BABYLON, IN_BABYLON } from './babylon.js';
import { createHalo } from './halo.js';
import { GATE } from './places.js';

/** Babylon, in place of Jerusalem. */
export const LOOK = BABYLON;

// What each of them wears, as cel paint ([in the light, in the shade]) and as an outfit (wanderer.js, ROBE).
// Babylon about 600 BC: a long tunic, a mantle over it, a cloth or a band on the head. The three were "bound in
// their coats, their hosen, and their hats, and their other garments" (3:21): men of rank, fully dressed.
const tunic = (lit, shade) => ({ SHIRT: [lit, shade], TROUSERS: [lit.map((v) => v * 0.95), shade], SKIRT: [lit, shade] });
const officer = (lit, shade, cloak, cloakShade) => ({
  ...tunic(lit, shade),
  CLOAK: [cloak, cloakShade],
  HAT: [[0.9, 0.86, 0.76], [0.56, 0.53, 0.56]],
  TRIM: [[0.82, 0.68, 0.4], [0.5, 0.4, 0.26]],
  BELT: [[0.4, 0.26, 0.15], [0.2, 0.13, 0.1]],
  OUTFIT: { head: 'cloth', cloak: true, hem: 0.12, edge: 2, bare: 0, belt: 2, cuffs: 0, lace: 0.32, blade: 0, sleeves: true },
});
export const CLOTHES = {
  // you: a long tunic of deep blue, a mantle of undyed wool
  player: officer([0.24, 0.36, 0.6], [0.12, 0.18, 0.36], [0.84, 0.78, 0.66], [0.5, 0.46, 0.46]),
  // the other two: one in green, one in a red-brown
  friend1: officer([0.3, 0.5, 0.36], [0.15, 0.25, 0.24], [0.8, 0.74, 0.6], [0.46, 0.42, 0.42]),
  friend2: officer([0.62, 0.34, 0.24], [0.32, 0.16, 0.16], [0.86, 0.8, 0.68], [0.52, 0.48, 0.48]),
  // Nebuchadnezzar the king: a long robe of white, a mantle of purple bordered with gold, a band of gold on his brow
  king: {
    ...tunic([0.95, 0.92, 0.86], [0.56, 0.54, 0.64]),
    CLOAK: [[0.46, 0.14, 0.46], [0.22, 0.07, 0.27]],
    HEADBAND: [[1.0, 0.8, 0.3], [0.62, 0.46, 0.2]],
    TRIM: [[1.0, 0.8, 0.3], [0.62, 0.46, 0.2]],
    BELT: [[0.62, 0.12, 0.12], [0.34, 0.06, 0.1]],
    HAIR: [[0.1, 0.08, 0.07], [0.05, 0.04, 0.05]],
    OUTFIT: { head: 'band', cloak: true, hem: 0.06, edge: 2, bare: 0, belt: 1, cuffs: 1, lace: 0.3, blade: 0, sleeves: true },
  },
  // the herald: a short tunic of red, a plain head cloth
  herald: {
    ...tunic([0.66, 0.2, 0.16], [0.36, 0.1, 0.12]),
    TRIM: [[0.86, 0.72, 0.4], [0.52, 0.42, 0.26]],
    HAT: [[0.84, 0.78, 0.64], [0.5, 0.46, 0.46]],
    BELT: [[0.36, 0.22, 0.12], [0.18, 0.11, 0.09]],
    OUTFIT: { head: 'cloth', cloak: false, hem: 0.42, edge: 2, bare: 0, belt: 2, cuffs: 0, lace: 0.34, blade: 0 },
  },
  // "the most mighty men that were in his army" (3:20): a coat of bronze scales over a short tunic, guards on the
  // forearms, a head cloth
  mighty: {
    ...tunic([0.7, 0.62, 0.5], [0.4, 0.35, 0.36]),
    HAT: [[0.62, 0.3, 0.2], [0.34, 0.16, 0.16]],
    TRIM: [[0.5, 0.2, 0.16], [0.28, 0.1, 0.1]],
    BELT: [[0.3, 0.2, 0.12], [0.16, 0.1, 0.08]],
    LEATHER: [[0.6, 0.42, 0.24], [0.34, 0.23, 0.16]],
    GOLD: [[0.86, 0.62, 0.3], [0.5, 0.34, 0.18]],
    OUTFIT: { head: 'cloth', cloak: false, hem: 0.5, edge: 2, bare: 0, belt: 1, cuffs: 1, lace: 0.4, blade: 0.5, armour: true },
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
  /** The ten people of the city: the crowd, the counsellors. */
  const people = Array.from({ length: 10 }, (_, i) => `town${i}`);

  // the places, in the world's (x, z)
  const gateOut = P(GATE[0] - 14, 0);
  const gateIn = C(-62, 0);
  const square = C(-44, 0);
  const image = P(...IN_BABYLON.image);
  // before the image, on its east side (it looks towards the city): where the herald stands, the crowd, and you
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

  // ---- the fire -------------------------------------------------------------------------------------------------
  // Flames within the furnace: glows that face the eye, each wavering in its own time. `fire.level` is how hot it
  // burns: as it is wont (about half), or "one seven times more" (1). They are only drawn; nothing is burned.
  // (and over its open top, the fire standing up out of it, to be seen from all the plain)
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
      const [x, z] = f.at;
      const waver = 0.78 + 0.22 * Math.sin(t * f.pace) * Math.sin(t * f.pace * 0.37 + f.pace);
      f.halo.update(t * 6);
      f.halo.set(x, g.heightAt(x, z) + f.up + 0.25 * Math.sin(t * f.pace * 0.8), z, fire.now * waver * 0.5);
    }
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
    fire.level = 0.5;
    g.standAt(stand[0], stand[1], yawTo(stand, face));
  }
  /** The people gathered before the image, in two rows, and the herald at its foot. */
  function gathered() {
    people.forEach((name, i) => {
      const row = Math.floor(i / 5);
      const p = P(iu + 14 + row * 2.6, iv + (i % 5 - 2) * 2.3 + (row ? 1.1 : 0) - 1);
      who(name).place(p[0], p[1], yawTo(p, image)).face(...image);
    });
    who('herald').place(...heraldAt, yawTo(heraldAt, before)).face(...before);
  }
  /** All the people fall down before the image (or rise), not all at the one moment. */
  function fallDown(on) {
    people.forEach((name, i) => setTimeout(() => (who(name).bow = on ? 1 : 0), on ? 150 + ((i * 370) % 1300) : (i * 210) % 900));
    who('herald').bow = on ? 1 : 0;
  }

  /**
   * Verses with a word left out, to be filled in from three: the words are the verse's own (shortened with "…" where
   * it is long), and the right answer is the word that was there. `verse` is the verse shown again after a wrong one.
   */
  const RECALL = {
    able: { verse: '3:17', text: 'If it be so, our God whom we serve is _____ to deliver us from the burning fiery furnace …', answers: ['asked', 'able', 'told'], right: 1 },
    not: { verse: '3:18', text: 'But if _____, be it known unto thee, O king, that we will not serve thy gods …', answers: ['so', 'now', 'not'], right: 2 },
    trusted: { verse: '3:28', text: '… who hath sent his angel, and delivered his servants that _____ in him …', answers: ['trusted', 'hid', 'stood'], right: 0 },
  };
  /**
   * Asks for the word left out of a verse, once. If it was not the verse's, the whole verse is read again. Nothing is
   * lost by a wrong answer. With ?wrong a test answers wrongly.
   */
  async function recall(c, key) {
    const q = RECALL[key];
    const auto = g.flag('wrong') ? (q.right + 1) % q.answers.length : q.right;
    const took = await c.choice(q.text, q.answers, { ref: g.reference(q.verse), auto });
    if (took !== q.right) await c.verse(q.verse);
  }

  return [
    // ---- Act one: the image of gold (Daniel 3:1–12) ----
    {
      id: 'a1',
      label: 'Act One',
      scene: true,
      setup() {
        reset({ hour: 15.2, stand: square, face: gateIn });
        who('meshach').place(...C(-42, 2.2), yawTo(C(-42, 2.2), gateIn));
        who('abednego').place(...C(-41.4, -2), yawTo(C(-41.4, -2), gateIn));
        gathered();
      },
      async run(c) {
        await c.fade(0, 2);
        g.narration?.warm(g.reference('3:1'));
        await c.chapter('Act One', 'The Image of Gold', 'Daniel 3');
        await c.verse('3:1');
        c.objective('Go out by the gate to the plain of Dura, where the image stands.');
        withMe();
        await c.reach(...before, 8, { via: toPlain });
      },
    },
    {
      id: 'a1-dura',
      label: 'Act One',
      setup() {
        reset({ hour: 15.6, stand: before, face: image });
        const [a, b] = [P(iu + 33.5, iv + 2.4), P(iu + 34.2, iv - 3.6)];
        who('meshach').place(...a, yawTo(a, image)).face(...image);
        who('abednego').place(...b, yawTo(b, image)).face(...image);
        gathered();
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
        g.view({ from: [...P(iu + 42, iv + 6), 1.5], to: [...image, 13] });
        await c.verse('3:3');
        g.view(null);
        shoulder(at(who('herald')), { back: 4.4, up: 2.4, look: 1.5 });
        await c.verse('3:4');
        await c.verse('3:5');
        await c.verse('3:6');
        g.view(null);
        // The music sounds, and all the people fall down. He may stand, as they did, or fall down with the rest: then
        // it is begun again. With ?bow a test falls down the first time.
        for (let tries = 0; ; tries++) {
          g.music.fanfare(13);
          fallDown(true);
          const began = c.time;
          let fell = false;
          await c.until(() => {
            c.prompt('Fall down and worship the golden image');
            if (c.pressed || (g.auto && g.flag('bow') && tries === 0 && c.time - began > 2)) fell = true;
            return fell || c.time - began > 12;
          });
          c.prompt(null);
          if (!fell) break;
          g.log(`fell down (try ${tries + 1})`);
          await c.fade(1, 0.6);
          g.music.stop();
          await c.card('… they serve not thy gods, nor worship the golden image which thou hast set up.', 'Daniel 3:12');
          fallDown(false);
          await c.fade(0, 0.8);
          await c.wait(1.2);
        }
        g.view({ from: [...P(iu + 36, iv + 9), 3.4], to: [...P(iu + 15, iv + 1), -0.5] });
        await c.verse('3:7');
        g.view(null);
        g.music.stop();
        fallDown(false);
        await c.verse('3:8');
        await c.verse('3:12');
        // they are sent for: two of the king's mighty men come out from the city
        const [m1, m2] = [who('mighty1'), who('mighty2')];
        m1.place(...P(iu + 62, iv + 10), 0);
        m2.place(...P(iu + 63.5, iv + 11.5), 0);
        await c.hold(Promise.all([m1.walk([[g.player.x + 2.2, g.player.z + 1.4]], 3.2), m2.walk([[g.player.x + 3.2, g.player.z - 1.2]], 3.2)]));
        m1.face(...me());
        m2.face(...me());
        await c.verse('3:13');
        await c.fade(1, 1.5);
      },
    },

    // ---- Act two: before the king (Daniel 3:13–18) ----
    {
      id: 'a2',
      label: 'Act Two',
      scene: true,
      setup() {
        reset({ hour: 16.6, stand: inCourt, face: kingAt });
        who('king').place(...kingAt, yawTo(kingAt, inCourt)).face(...inCourt);
        const [a, b] = [P(ku + 2.4, kv + 8.4), P(ku - 2.3, kv + 8.6)];
        who('meshach').place(...a, yawTo(a, kingAt)).face(...kingAt);
        who('abednego').place(...b, yawTo(b, kingAt)).face(...kingAt);
        // the mighty men behind them; the king's counsellors down either side of the ground before his seat
        who('mighty1').place(...P(ku + 1.8, kv + 11.5), 0).face(...kingAt);
        who('mighty2').place(...P(ku - 1.8, kv + 11.5), 0).face(...kingAt);
        people.slice(0, 8).forEach((name, i) => {
          const p = P(ku + (i % 2 ? 7.5 : -7.5), kv + 1 + Math.floor(i / 2) * 2.4);
          who(name).place(p[0], p[1], 0).face(...P(ku, kv + 1 + Math.floor(i / 2) * 2.4));
        });
        who('herald').place(...P(ku + 3.2, kv + 2.2), 0).face(...inCourt);
      },
      async run(c) {
        await c.fade(0, 1.5);
        g.narration?.warm(g.reference('3:14'));
        await c.chapter('Act Two', 'Before the King', 'Daniel 3');
        c.objective('Stand before the king.');
        withMe();
        await c.act(...kingAt, 5.2, 'Stand before the king');
        c.objective(null);
        for (const n of ['meshach', 'abednego']) who(n).stop().face(...kingAt);
        who('king').face(...me());
        shoulder(at(who('king')), { back: 3.6, up: 2.2, look: 1.5 });
        await c.verse('3:14');
        await c.verse('3:15');
        g.view(null);
        c.objective('Answer the king.');
        await c.act(...kingAt, 6.5, 'Answer the king');
        c.objective(null);
        shoulder(at(who('king')), { back: 3.6, side: -1.1, up: 2.2, look: 1.5 });
        await c.verse('3:16');
        await c.verse('3:17');
        await recall(c, 'able');
        await c.verse('3:18');
        await recall(c, 'not');
        g.view(null);
        await c.fade(1, 1.5);
      },
    },

    // ---- Act three: in the midst of the fire (Daniel 3:19–30) ----
    {
      id: 'a3',
      label: 'Act Three',
      scene: true,
      setup() {
        reset({ hour: 17.6, stand: street, face: mouth });
        const [a, b] = [P(mu + 2.2, mv - 6.2), P(mu - 2.2, mv - 6.2)];
        who('meshach').place(...a, yawTo(a, mouth)).face(...mouth);
        who('abednego').place(...b, yawTo(b, mouth)).face(...mouth);
        who('mighty1').place(...P(mu + 3.6, mv - 8), 0).face(...mouth);
        who('mighty2').place(...P(mu - 3.6, mv - 8), 0).face(...mouth);
        const k = P(mu - 8, mv - 9.5);
        who('king').place(...k, yawTo(k, mouth)).face(...mouth);
        // "the princes, governors, and captains, and the king's counsellors, being gathered together" (3:27)
        people.slice(0, 8).forEach((name, i) => {
          const p = P(mu - 14 + i * 3.6 + (i > 3 ? 4 : 0), mv - 12.4 - (i % 2) * 0.9);
          who(name).place(p[0], p[1], 0).face(...mouth);
        });
      },
      async run(c) {
        const king = who('king');
        await c.fade(0, 1.5);
        g.narration?.warm(g.reference('3:19'));
        await c.chapter('Act Three', 'In the Midst of the Fire', 'Daniel 3');
        shoulder(mouth, { back: 4.2, up: 2.4, look: 1.6 });
        await c.verse('3:19');
        // heated "one seven times more than it was wont to be heated"
        fire.level = 1;
        g.music.drum(0.25);
        await c.verse('3:20');
        bind(true);
        g.burden(1.6);
        await c.verse('3:21');
        g.view(null);
        // (the casting in, and what the flame did to those who cast them, are read and not seen)
        await c.fade(1, 1.2);
        g.music.drum(0);
        await c.verse('3:22');
        await c.verse('3:23');
        // within: loose, and not alone
        for (const n of ['mighty1', 'mighty2']) who(n).show(false);
        bind(false);
        g.burden(null);
        g.standAt(...midst, yawTo(midst, deep));
        const [a, b] = [P(mu + 2.4, mv + 4.6), P(mu - 2.3, mv + 4.2)];
        who('meshach').place(...a, yawTo(a, deep)).face(...deep);
        who('abednego').place(...b, yawTo(b, deep)).face(...deep);
        const fourth = who('fourth').place(...deep, yawTo(deep, midst)).face(...midst);
        fourth.w.glow.value = 0.45;
        fourth.aura = 1;
        fourth.open = 0.25;
        g.guidance.shine(...deep, 7);
        g.music.angel(0.7);
        const near = P(mu - 6.5, mv - 3.4);
        king.place(...near, yawTo(near, mouth)).face(...mouth);
        await c.fade(0, 2.2);
        // "walking in the midst of the fire": he may walk as he will; the story goes on when he comes to the fourth
        withMe();
        await c.reach(...deep, 3.4, { mark: false });
        for (const n of ['meshach', 'abednego']) who(n).stop().face(...deep);
        // as the king saw it, from before the mouth: the four of them, each to be seen
        const seen = [[g.player, P(mu - 1.3, mv + 6.4)], [who('meshach'), P(mu + 2.3, mv + 6.9)], [who('abednego'), P(mu - 2.9, mv + 8.2)]];
        const stood = P(mu + 0.5, mv + 8.6);
        fourth.place(...stood, yawTo(stood, mouth)).face(...mouth);
        g.guidance.shine(...stood, 7);
        for (const [one, p] of seen) {
          if (one === g.player) g.standAt(...p, yawTo(p, stood));
          else one.place(...p, yawTo(p, stood)).face(...stood);
        }
        g.view({ from: [...P(mu - 0.3, mv - 4.6), 1.7], to: [...P(mu, mv + 7.4), 1.2] });
        await c.verse('3:24');
        await c.verse('3:25');
        g.view(null);
        await c.verse('3:26');
        c.objective('Come forth of the midst of the fire.');
        withMe();
        await c.reach(...street, 3.2, { via: [mouth] });
        c.objective(null);
        // (nothing is said of where the fourth went: when they have come forth he is not seen)
        fourth.aura = 0;
        fourth.show(false);
        g.guidance.shine(null);
        g.music.angel(0);
        fire.level = 0.5;
        for (const n of ['meshach', 'abednego']) who(n).stop().face(...at(king));
        king.face(...me());
        shoulder(at(king), { back: 3.6, up: 2.2, look: 1.5 });
        await c.verse('3:27');
        await c.verse('3:28');
        await recall(c, 'trusted');
        await c.card('… because there is no other God that can deliver after this sort.', 'Daniel 3:29');
        g.music.theme();
        await c.verse('3:30');
        g.view(null);
        await c.fade(1, 2);
        g.end();
      },
    },
  ];
}
