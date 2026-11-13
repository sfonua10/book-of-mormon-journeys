// The story of Daniel 6, in beats: the writing that is signed, Daniel at his open windows, the den of lions, and the
// morning. It is told as the Daniel 3 journey is (daniel.js): the words on the cards are the scripture's own
// (scripture-daniel.js, the King James Version); the few lines that are not are what to do, or a thought in italic
// without a reference.
//
// You are Daniel. What happens is fixed, as it is written; how you do it is yours. When he knows that the writing is
// signed you are asked what you will do, and there is no haste to answer: go into your house and pray, as before,
// or not; choose not to, and it is read again what he did (6:10). In his chamber you kneel three times, as the sun
// crosses the sky; at the third, those who sought occasion against him are at the door, and what there is to do is
// keep praying. In the den you walk among the lions.
//
// What is shown follows what the text says and how a family would want it told. Daniel is cast into the den between
// one picture and the next. Of his night there the chapter tells only what he says in the morning: "My God hath sent
// his angel, and hath shut the lions' mouths, that they have not hurt me" (6:22). So that is what is shown: a figure
// in white, in light, who says nothing; the lions' mouths shut; and the lions lying down as he goes among them
// (which is the story's picture of "they have not hurt me", not the text's words). What was done to those who
// accused him, and to their children and their wives (6:24), is read, in the dark, and not seen.
import { BABYLON_DARIUS, IN_BABYLON, IN_DARIUS } from './babylon.js';
import { createCrowd } from './crowd.js';
import { createHalo } from './halo.js';
import { createLions } from './lions.js';
import { GATE } from './places.js';
import { BLANKS, EXCERPTS, SAID } from './scripture-daniel.js';
import { telling } from './telling.js';

/** Babylon in the days of Darius: the same city, with Daniel's house and the den on the plain before it. */
export const LOOK = BABYLON_DARIUS;

// What each of them wears, as cel paint ([in the light, in the shade]) and as an outfit (wanderer.js, ROBE). Of how
// the court of "Darius the Median" (5:31) was dressed little can be said (the README says how little): they are
// given the long fringed tunic and mantle of Babylon, as in the Daniel 3 journey, the king a robe of blue and a
// mantle of crimson. Daniel is an old man by now (he was brought to Babylon as a youth, some seventy years before):
// his hair and beard are white, and he wears a band about his brow.
const tunic = (lit, shade) => ({ SHIRT: [lit, shade], TROUSERS: [lit.map((v) => v * 0.95), shade], SKIRT: [lit, shade] });
const WHITE_HAIR = [[0.9, 0.88, 0.84], [0.58, 0.58, 0.64]];
const DARK_HAIR = [[0.1, 0.08, 0.07], [0.05, 0.04, 0.05]];
const officer = (lit, shade, cloak, cloakShade, head = 'cap') => ({
  ...tunic(lit, shade),
  CLOAK: [cloak, cloakShade],
  HAT: [[0.88, 0.82, 0.7], [0.54, 0.5, 0.52]],
  TRIM: [[0.86, 0.72, 0.42], [0.52, 0.42, 0.28]],
  BELT: [[0.4, 0.26, 0.15], [0.2, 0.13, 0.1]],
  OUTFIT: { head, hair: 'long', cloak: true, hem: 0.04, edge: 4, bare: 0, belt: 2, cuffs: 0, lace: 0.32, blade: 0, sleeves: true },
});
export const CLOTHES = {
  // you, Daniel: a long tunic of deep green-blue, a mantle of pale wool, a band of red and gold about the brow
  player: {
    ...officer([0.18, 0.4, 0.44], [0.09, 0.2, 0.27], [0.86, 0.8, 0.68], [0.52, 0.48, 0.48], 'band'),
    HEADBAND: [[0.78, 0.3, 0.16], [0.46, 0.16, 0.12]],
    HAIR: WHITE_HAIR,
    BEARD: WHITE_HAIR,
    OUTFIT: { head: 'band', hair: 'long', beard: 'long', cloak: true, hem: 0.04, edge: 4, bare: 0, belt: 2, cuffs: 0, lace: 0.32, blade: 0, sleeves: true },
  },
  // Darius the king: a tall crown banded with gold, a robe of blue, a mantle of crimson bordered with gold
  king: {
    ...tunic([0.22, 0.32, 0.6], [0.11, 0.16, 0.36]),
    CLOAK: [[0.56, 0.12, 0.14], [0.3, 0.06, 0.1]],
    HAT: [[0.94, 0.9, 0.8], [0.6, 0.56, 0.6]],
    HEADBAND: [[1.0, 0.8, 0.3], [0.62, 0.46, 0.2]],
    TRIM: [[1.0, 0.8, 0.3], [0.62, 0.46, 0.2]],
    BELT: [[0.86, 0.66, 0.26], [0.5, 0.36, 0.16]],
    HAIR: DARK_HAIR,
    BEARD: DARK_HAIR,
    OUTFIT: { head: 'crown', hair: 'long', beard: 'long', cloak: true, hem: 0.02, edge: 4, bare: 0, belt: 1, cuffs: 1, lace: 0.3, blade: 0, sleeves: true },
  },
  // the other two presidents (6:2): men of rank, in dark red and in ochre, turbaned
  president1: officer([0.5, 0.16, 0.16], [0.26, 0.08, 0.1], [0.74, 0.62, 0.4], [0.44, 0.36, 0.28], 'turban'),
  president2: officer([0.66, 0.5, 0.22], [0.36, 0.26, 0.14], [0.36, 0.2, 0.3], [0.2, 0.1, 0.2], 'turban'),
  // the king's men, who bring Daniel to the den: a coat of bronze scales over a short tunic, a pointed helmet
  guard: {
    ...tunic([0.7, 0.62, 0.5], [0.4, 0.35, 0.36]),
    TRIM: [[0.5, 0.2, 0.16], [0.28, 0.1, 0.1]],
    BELT: [[0.3, 0.2, 0.12], [0.16, 0.1, 0.08]],
    LEATHER: [[0.6, 0.42, 0.24], [0.34, 0.23, 0.16]],
    GOLD: [[0.86, 0.62, 0.3], [0.5, 0.34, 0.18]],
    OUTFIT: { head: 'helmet', hair: 'long', cloak: false, hem: 0.5, edge: 2, bare: 0, belt: 1, cuffs: 1, lace: 0.4, blade: 0.5, armour: true },
  },
  // the angel (6:22): a loose white robe to below the feet, wide sleeves, open at the neck
  angel: {
    ...tunic([1.0, 0.98, 0.94], [0.82, 0.82, 0.88]),
    CLOAK: [[1.0, 0.98, 0.94], [0.82, 0.82, 0.88]],
    HAIR: [[0.36, 0.25, 0.16], [0.2, 0.14, 0.11]],
    SKIN: [[0.96, 0.76, 0.6], [0.7, 0.52, 0.48]],
    BOOTS: [[0.96, 0.76, 0.6], [0.7, 0.52, 0.48]],
    TRIM: [[0.98, 0.95, 0.88], [0.8, 0.78, 0.8]],
    OUTFIT: { head: 'none', cloak: false, hem: 0.01, edge: 0, bare: 0, belt: 0, cuffs: 0, lace: 0, blade: 0, sleeves: true, neck: 'v' },
  },
};

/** The princes (6:1), who are the cast's ten "townsfolk" (town.js): tunics of many colours, fringed, caps and turbans. */
const prince = (lit, shade, head, hat, hem) => ({
  ...tunic(lit, shade),
  HAT: [hat, hat.map((v) => v * 0.6)],
  TRIM: [[0.84, 0.7, 0.42], [0.5, 0.42, 0.28]],
  BELT: [[0.4, 0.28, 0.17], [0.2, 0.14, 0.11]],
  OUTFIT: { head, hair: 'long', cloak: false, hem, edge: 4, bare: 0, belt: 2, cuffs: 0, lace: 0.3, blade: 0 },
});
const PRINCES = [
  prince([0.78, 0.7, 0.54], [0.44, 0.4, 0.4], 'cap', [0.88, 0.84, 0.74], 0.05),
  prince([0.3, 0.42, 0.56], [0.15, 0.21, 0.34], 'turban', [0.86, 0.8, 0.66], 0.05),
  prince([0.6, 0.3, 0.2], [0.32, 0.15, 0.14], 'cap', [0.82, 0.74, 0.58], 0.05),
  prince([0.4, 0.5, 0.34], [0.2, 0.25, 0.22], 'turban', [0.62, 0.3, 0.24], 0.05),
  prince([0.72, 0.58, 0.32], [0.4, 0.31, 0.2], 'cap', [0.88, 0.84, 0.74], 0.05),
];

/** Who is in the story, in the order they are made, and whether they wear a beard. */
export const PEOPLE = [
  ['darius', 'king', true],
  ['president1', 'president1', true],
  ['president2', 'president2', true],
  ['guard1', 'guard', true],
  ['guard2', 'guard', true],
  ['angel', 'angel', false],
];

/** What is written, small, over those the text names (names.js). `you` is the one you walk as. */
export const NAMES = { you: 'Daniel', darius: 'Darius' };

/** The people of the city are the story's to place (the princes, the multitude): none walk it. */
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
  const { part, verse, line, lineOf, fill } = telling(g, { EXCERPTS, BLANKS, SAID });
  /** The ten princes who are seen near at hand; the rest of the hundred and twenty are the multitude, painted. */
  const princes = Array.from({ length: 10 }, (_, i) => `town${i}`);
  princes.forEach((name, i) => who(name).w.dress(PRINCES[i % PRINCES.length]));
  const everyone = [...princes, 'darius', 'president1', 'president2', 'guard1', 'guard2', 'angel'];
  const accusers = ['president1', 'president2', 'town0', 'town1', 'town2', 'town3'];
  const crowd = createCrowd(g.scene, g.field, g.heightAt);
  const lions = createLions(g.scene, g.field, g.heightAt, { count: 6 });
  g.each((dt) => {
    lions.update(dt, g.player, g.camera.position);
    crowd.update(g.clock());
  });
  // (for stills and tests: tools/look.mjs --eval can stand the lions anywhere)
  g.den = { lions };

  // ---- the places, in the world's (x, z) ----
  // inside the gate, and out between the walls of lions
  const gateOut = P(GATE[0] - 14, 0);
  const gateIn = C(-62, 0);
  const square = C(-48, 0);
  // the king on his dais (he faces +v), and the ground before it
  const [ku, kv] = IN_BABYLON.king;
  const kingAt = P(ku, kv);
  const inCourt = P(ku, kv + 9);
  const toCourt = [gateIn, gateOut, P(214, 0), P(198, -8)];
  // Daniel's house: its door (in its -v wall), the ground before the door, within the door, and the mat before the
  // middle window, where he kneels looking out of it (+u)
  const H = IN_DARIUS.house;
  const doorOut = P(H.door.at, H.v[0] - 2.2);
  const doorIn = P(H.door.at, H.v[0] + 1.6);
  const mat = P(H.u[1] - H.wall - 1.7, H.windows[1]);
  const window_ = P(H.u[1] + 6, H.windows[1]);
  const homeward = P(150, -11);
  // the den: its middle, under its mouth; the foot of the ramp up to its roof; where the king stands at the mouth's
  // edge, on the roof; and how high the roof is
  const [du, dv] = IN_DARIUS.den.at;
  const D = IN_DARIUS.den;
  const under = P(du, dv);
  const rampFoot = P(du, dv - D.half[1] - 13);
  const rim = P(du, dv - D.mouth / 2 - 0.9);
  const ROOF = D.tall + D.slab;
  const fell = P(du - 0.6, dv + 4.8);
  /** Looking up from the floor of the den to its mouth, and to whoever stands at its edge above. */
  const lookUp = () => g.view({ from: [...P(du + 0.9, dv + 3.4), 1.5], to: [...P(du, dv - 0.9), ROOF + 0.9] });

  // ---- the den's light, its stone, its lions ----
  const DAYLIGHT = [0.95, 0.88, 0.74];
  const ANGEL = [1.3, 1.24, 1.08];
  /** The den's own light: how far the light under its mouth reaches, how much its roof keeps off, and its colour. */
  const denLight = (reach, shade, tint = DAYLIGHT) => g.room('den', { reach, shade, tint });
  /** The stone: `k` of the way over the mouth (0: drawn off to one side; 1: laid upon it). */
  const stone = (k) => g.props.show('stone', P(du + 4.75 * (1 - k), dv), { up: ROOF });
  // (the day's light in the mouth of the den, seen from below when the stone is off it)
  const shaft = createHalo(g.scene, { color: [1.5, 1.36, 1.05], width: 3.4, height: 3.2, back: 0, rays: 0.5 });
  let shaftK = 0;
  g.each(() => {
    shaft.update(g.clock());
    shaft.set(under[0], g.heightAt(...under) + ROOF - 0.5, under[1], shaftK);
  });
  /** Where each lion walks: a round of points within the den's walls. */
  const ROUNDS = [
    [[-7, -5], [7, -5], [7, 5], [-7, 5]],
    [[6, 4], [-6, 4], [-6, -4], [6, -4]],
    [[-4, -2.4], [4, -2.4], [4, 2.4], [-4, 2.4]],
    [[-7.5, 0], [0, -5.5], [7.5, 0], [0, 5.5]],
    [[7, -3], [3, 4.5], [-3, 4.5], [-7, -3], [0, -5]],
    [[-6, 5], [6, -5]],
  ].map((round) => round.map(([a, b]) => P(du + a, dv + b)));
  /** The lions in the den, each on its round (`calm`: lying down already, their mouths shut, as in the morning). */
  function lionsIn(calm = false) {
    lions.show(true);
    ROUNDS.forEach((round, i) => {
      const start = round[i % round.length];
      lions.place(i, start[0], start[1], yawTo(start, round[(i + 1) % round.length]));
      if (calm) lions.calm(i, true, true);
      else lions.prowl(i, round, 0.75 + (i % 3) * 0.12);
    });
    lions.mouths(!calm);
  }
  /** Where the lions lie in the morning: about the middle of the den, round where he is. */
  const LAIRS = [[-3.4, 2.2, 1.2], [3.6, 3.0, -1.0], [-2.2, -3.2, 0.5], [3.0, -2.6, -0.6], [-5.6, -0.6, 1.5], [5.4, 0.4, -1.6]];
  function lionsAtRest() {
    lions.show(true);
    LAIRS.forEach(([a, b, yaw], i) => {
      const p = P(du + a, dv + b);
      lions.place(i, p[0], p[1], yawTo(p, under) + yaw * 0.5);
      lions.calm(i, true, true);
    });
    lions.mouths(false);
  }

  /** His hands together before him as he prays. */
  const PRAYING = { out: 0.21, up: 1.2, wide: 0.035 };
  function kneel(on) {
    g.player.kneel = on ? 1 : 0;
    g.player.holds = on ? PRAYING : null;
  }
  /** The hour goes from one to another over some seconds, the sun seen to move. Resolves when it is there. */
  function sweep(c, hour0, hour1, seconds) {
    const began = c.time;
    return c.until(() => {
      const k = Math.min(1, (c.time - began) / seconds);
      g.setHour(hour0 + (hour1 - hour0) * k, true);
      return k >= 1;
    });
  }

  function reset({ hour, stand, face, room = 'chamber' }) {
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
    g.room(room);
    for (const name of everyone) {
      const n = who(name);
      n.bow = 0;
      n.kneel = 0;
      n.aura = 0;
      n.lift = 0;
      n.open = 0;
      n.holds = null;
    }
    who('angel').w.glow.value = 0;
    kneel(false);
    crowd.show(false);
    lions.show(false);
    lions.dim(0);
    lions.eyes(0);
    shaftK = 0;
    g.standAt(stand[0], stand[1], yawTo(stand, face));
  }
  /** The king on his dais, a man of his either side of it. */
  function court({ guards = true } = {}) {
    const toward = P(ku, kv + 16);
    who('darius').place(...kingAt, yawTo(kingAt, toward)).face(...toward);
    if (!guards) return;
    who('guard1').place(...P(ku - 4.2, kv + 2.6), 0).face(...toward);
    who('guard2').place(...P(ku + 4.2, kv + 2.6), 0).face(...toward);
  }
  /** Where each of the ten princes stands about the court, in twos and threes, before the king's seat. */
  const STANDS = [[-9, 12], [-7.4, 13.6], [8, 11], [9.8, 12.4], [-3, 19], [-1.2, 20.4], [5, 20], [-13, 20], [13, 19], [11.4, 21]];
  const standOf = (i) => P(ku + STANDS[i][0], kv + STANDS[i][1]);
  function princesAtCourt() {
    princes.forEach((name, i) => {
      const p = standOf(i);
      const other = standOf(i % 2 ? i - 1 : Math.min(9, i + 1));
      who(name).place(p[0], p[1], yawTo(p, other)).face(...other);
    });
  }
  /** The other two presidents, standing apart, towards the king's right hand. */
  const APART = [P(ku + 15, kv + 6), P(ku + 16.6, kv + 7.4)];
  function presidentsApart() {
    ['president1', 'president2'].forEach((name, i) => who(name).place(...APART[i], yawTo(APART[i], inCourt)).face(...inCourt));
  }
  /** The multitude before the king's seat, when he sends his writing to all people (6:25): painted (crowd.js). */
  function multitude() {
    const many = [];
    let k = 5;
    const shake = () => (k = (k * 16807) % 2147483647) / 2147483647 - 0.5;
    for (let r = 0; r < 9; r++) for (let a = -26; a <= 26; a += 1.6) if (Math.abs(a) > 5 || r > 4) many.push(P(ku + a + shake() * 0.7, kv + 17 + r * 1.9 + shake() * 0.6));
    crowd.place(many, 11);
  }
  /** Those who accuse him go before the king, and stand facing him. */
  function accusersBeforeKing(walk = false) {
    return Promise.all(
      accusers.map((name, i) => {
        const p = P(ku - 5 + i * 2, kv + 5.4 + (i % 2) * 1.3);
        const n = who(name);
        if (!walk) return void n.place(...p, yawTo(p, kingAt)).face(...kingAt);
        return n.walk([p], 1.9).then(() => n.face(...kingAt));
      }),
    );
  }

  /**
   * What is asked when Daniel knows that the writing is signed. These are not the scripture's words: the card is a
   * thought, in italic, without a reference. The first answer is what he did.
   */
  const ASKED = { text: 'The writing is signed. What will you do?', answers: ['Go into my house and pray, as before', 'Not pray, until the thirty days are past'] };

  return [
    // ---- Act one: an excellent spirit (Daniel 6:1–9) ----
    {
      id: 'a1',
      label: 'Act One',
      scene: true,
      setup() {
        reset({ hour: 15.6, stand: square, face: gateIn });
        court();
        princesAtCourt();
        presidentsApart();
      },
      async run(c) {
        await c.fade(0, 2);
        g.narration?.warm(g.reference('6:1'));
        await c.chapter('Act One', 'An Excellent Spirit', 'Daniel 6');
        await c.verse('6:1');
        c.objective('Go out by the gate to the king’s seat, where the princes give their accounts.');
        line(c, '6:2');
        await c.reach(...inCourt, 9, { via: toCourt });
      },
    },
    {
      id: 'a1-accounts',
      label: 'Act One',
      setup() {
        reset({ hour: 15.6, stand: P(ku + 4, kv + 16), face: kingAt });
        court();
        princesAtCourt();
        presidentsApart();
      },
      async run(c) {
        line(c, '6:3');
        // "that the princes might give accounts unto them" (6:2): hear four of them, in what order you will. The
        // other two presidents keep behind you as you go, and watch; and what they sought, and did not find, is
        // told a part at a time (6:4).
        const [p1, p2] = [who('president1'), who('president2')];
        Object.assign(p1.follow(g.player, 4.6, 2.2), { maxSpeed: 3 });
        Object.assign(p2.follow(g.player, 5.6, -2.4), { maxSpeed: 3 });
        const told = ['6:4-a', '6:4-b', '6:4-c', '6:4-d'];
        const givers = [0, 2, 4, 8].map((i) => ({ n: who(princes[i]), heard: false }));
        let heard = 0;
        const list = () => told.map((key, i) => ({ label: EXCERPTS[key].text.replace(/^… /, '').replace(/ …$/, '').replace(/\.$/, ''), done: i < heard }));
        while (heard < givers.length) {
          c.objective('Hear the accounts of the princes.', list());
          let near = null;
          await c.until(() => {
            const left = givers.filter((p) => !p.heard).sort((a, b) => from(at(a.n)) - from(at(b.n)));
            c.lead({ x: left[0].n.x, z: left[0].n.z, r: 1.4, mark: true });
            near = left.find((p) => from(at(p.n)) < 2.6) ?? null;
            return !!near;
          });
          near.heard = true;
          near.n.face(...me());
          lineOf(c, told[heard]);
          heard++;
          g.music.pluck();
          // (a moment with each: an account is heard, not passed by)
          await c.wait(g.auto ? 0.4 : 1.6);
        }
        c.lead(null);
        c.objective('Hear the accounts of the princes.', list());
        await c.wait(1.2);
        c.objective(null);
        await c.verse('6:4');
        // what the two say, apart
        for (const [n, p] of [[p1, APART[0]], [p2, APART[1]]]) n.stop().walk([p], 1.6).then(() => n.face(...at(n === p1 ? p2 : p1)));
        await c.wait(1.2);
        shoulder(at(p1), { back: 4.2, up: 2.2, look: 1.5 });
        await part(c, '6:5-said');
        g.view(null);
        // The writing is asked of the king, and signed: Daniel is not there. It is seen from a little way off,
        // between one dark and the next.
        await c.fade(1, 1);
        g.standAt(...homeward, yawTo(homeward, doorOut));
        const went = accusersBeforeKing(true);
        g.view({ from: [...P(ku - 9, kv + 15), 2.6], to: [...P(ku, kv + 2.5), 1.5] });
        await c.fade(0, 1.2);
        await Promise.all([lineOf(c, '6:6-a'), Promise.race([went, c.wait(9)])]);
        await part(c, '6:6-said');
        await verse(c, '6:7');
        await fill(c, 'altereth');
        g.view({ from: [...P(ku + 5.6, kv + 9.2), 2.7], to: [...kingAt, 1.6] });
        await c.verse('6:9');
        await c.fade(1, 1.2);
        g.view(null);
      },
    },

    // ---- Act two: three times a day (Daniel 6:10–15) ----
    {
      id: 'a2',
      label: 'Act Two',
      scene: true,
      setup() {
        reset({ hour: 7.6, stand: homeward, face: doorOut });
        court();
      },
      async run(c) {
        g.narration?.warm(g.reference('6:10'));
        await c.fade(0, 1.6);
        await c.chapter('Act Two', 'Three Times a Day', 'Daniel 6', 2.6);
        // It is asked what you will do, and there is no haste to answer. With ?wrong a test first chooses not to pray.
        for (let tries = 0; ; tries++) {
          const took = await c.choice(ASKED.text, ASKED.answers, { auto: g.flag('wrong') && tries === 0 ? 1 : 0 });
          if (took === 0) break;
          g.log(`chose not to pray (try ${tries + 1})`);
          await part(c, '6:10-a');
        }
        c.objective('Go into your house.');
        lineOf(c, '6:10-a');
        await c.reach(...doorIn, 1.8, { via: [doorOut] });
        lineOf(c, '6:10-b');
        // Three times: in the morning, at noon, and as the sun goes down. Each time the light in the room is a little
        // more, and a part of what he did is read.
        const HOURS = [7.6, 12.4, 17.6];
        for (let time = 0; time < 3; time++) {
          c.objective('Kneel at the open window, toward Jerusalem.', ['In the morning', 'At noon', 'At evening'].map((label, i) => ({ label, done: i < time })));
          await c.act(...mat, 1.5, 'Kneel and pray');
          c.objective(null);
          g.standAt(...mat, yawTo(mat, window_));
          kneel(true);
          g.view({ from: [...P(H.u[1] - H.wall - 4.3, H.windows[1] - 2.4), 1.25], to: [...P(H.u[1] + 3, H.windows[1] + 1.2), 1.15] });
          g.music.still(0.45 + 0.25 * time);
          g.room('chamber', { reach: 5 + 2.5 * time, shade: 0.5 - 0.1 * time, tint: [1.2, 1.05, 0.8] });
          if (time < 2) {
            await c.wait(1.6);
            await lineOf(c, time === 0 ? '6:10-c' : '6:10-d');
            await c.wait(g.auto ? 0.3 : 1.2);
            // he rises; the day goes on to the next time of prayer
            kneel(false);
            g.view(null);
            g.music.still(0.15);
            await sweep(c, HOURS[time], HOURS[time + 1], g.auto ? 1.5 : 5);
            continue;
          }
          // The third time: those who sought occasion against him assemble, and find him praying (6:11). They come
          // to the door and to the windows. There is nothing to be done but to keep praying.
          await c.wait(1.4);
          accusers.forEach((name, i) => {
            const n = who(name);
            const start = P(H.u[1] + 16 + i * 1.4, H.v[0] - 9 - (i % 2) * 2);
            const to = i < 2 ? P(H.door.at + (i ? 0.5 : -0.5), H.v[0] - 1.4 - i * 1.1) : P(H.u[1] + 1.5 + (i % 2) * 1.1, H.windows[i % 3] + (i > 4 ? 0.5 : -0.4));
            n.place(...start, yawTo(start, to));
            n.walk(i < 2 ? [P(H.u[1] + 4, H.v[0] - 5), to] : [to], 2.2).then(() => n.face(...mat));
          });
          g.music.drum(0.18);
          await line(c, '6:11');
          c.prompt('Keep praying');
          await c.until(() => c.pressed || g.auto);
          c.prompt(null);
          g.music.drum(0);
          g.music.still(1);
          g.room('chamber', { reach: 11, shade: 0.25, tint: [1.25, 1.1, 0.85] });
          await lineOf(c, '6:10-e');
          await c.wait(g.auto ? 0.3 : 1.5);
          await fill(c, 'thanks');
        }
        await c.fade(1, 1.2);
        kneel(false);
        g.view(null);
      },
    },
    {
      id: 'a2-king',
      label: 'Act Two',
      scene: true,
      setup() {
        const stand = P(ku - 7, kv + 13);
        reset({ hour: 17.8, stand, face: kingAt });
        court({ guards: false });
        accusersBeforeKing();
        who('guard1').place(...P(ku - 8.6, kv + 13.4), 0).face(...kingAt);
        who('guard2').place(...P(ku - 5.4, kv + 13.4), 0).face(...kingAt);
        princes.slice(4).forEach((name, i) => {
          const p = P(ku + 9 + (i % 3) * 2, kv + 10 + Math.floor(i / 3) * 2.2);
          who(name).place(...p, yawTo(p, kingAt)).face(...kingAt);
        });
      },
      async run(c) {
        const king = who('darius');
        g.narration?.warm(g.reference('6:12'));
        c.freeze(true);
        g.view({ from: [...P(ku - 8.5, kv + 16), 2.6], to: [...P(ku, kv + 2.5), 1.5] });
        await c.fade(0, 1.4);
        await lineOf(c, '6:12-a');
        await part(c, '6:12-said');
        g.view({ from: [...P(ku + 5.6, kv + 9.2), 2.7], to: [...kingAt, 1.6] });
        await part(c, '6:12-answer');
        g.view({ from: [...P(ku - 8.5, kv + 16), 2.6], to: [...P(ku, kv + 2.5), 1.5] });
        await part(c, '6:13-said');
        // "he laboured till the going down of the sun to deliver him": the sun goes down as it is read
        king.face(...me());
        g.view({ from: [...P(ku - 2, kv + 18), 2.2], to: [...P(ku + 6, kv - 2), 3.4] });
        const down = sweep(c, 17.8, 20.3, g.auto ? 2 : 9);
        await c.verse('6:14');
        await down;
        g.view({ from: [...P(ku - 8.5, kv + 16), 2.6], to: [...P(ku, kv + 2.5), 1.5] });
        await part(c, '6:15-said');
        g.view(null);
        c.freeze(false);
      },
    },

    // ---- Act three: the den of lions (Daniel 6:16–18) ----
    {
      id: 'a3',
      label: 'Act Three',
      setup() {
        const stand = P(ku - 7, kv + 13);
        reset({ hour: 20.3, stand, face: kingAt });
        court({ guards: false });
        accusersBeforeKing();
        who('guard1').place(...P(ku - 8.6, kv + 13.4), 0).face(...kingAt);
        who('guard2').place(...P(ku - 5.4, kv + 13.4), 0).face(...kingAt);
      },
      async run(c) {
        g.narration?.warm(g.reference('6:16'));
        await c.chapter('Act Three', 'The Den of Lions', 'Daniel 6', 2.6);
        stone(0);
        // the king's men bring him to the den; the king comes after
        const [m1, m2] = [who('guard1'), who('guard2')];
        Object.assign(m1.follow(g.player, 1.7, 1.4), { maxSpeed: 3 });
        Object.assign(m2.follow(g.player, 1.7, -1.4), { maxSpeed: 3 });
        Object.assign(who('darius').follow(g.player, 5.5, 0), { maxSpeed: 2.6 });
        g.burden(2.4);
        g.music.drum(0.22);
        lineOf(c, '6:16-a');
        c.objective('Go with the king’s men to the den.');
        await c.reach(...rampFoot, 3.4, { via: [P(ku + 2, kv + 22)] });
        c.objective(null);
        // (the casting in is between one picture and the next)
        await c.fade(1, 1.2);
        g.music.drum(0);
        g.burden(null);
      },
    },
    {
      id: 'a3-den',
      label: 'Act Three',
      scene: true,
      setup() {
        reset({ hour: 20.3, stand: fell, face: under, room: 'den' });
        stone(0);
        denLight(14, 0.5);
        lions.dim(0.45);
        lionsIn();
        shaftK = 0.5;
        // the king at the mouth, above; his lords by him
        const king = who('darius').place(...rim, yawTo(rim, under)).face(...fell);
        king.lift = ROOF;
        ['president1', 'president2'].forEach((name, i) => {
          const p = P(du + (i ? 2.6 : -2.6), dv - D.mouth / 2 - 1.2);
          who(name).place(...p, yawTo(p, under)).face(...under).lift = ROOF;
        });
      },
      async run(c) {
        const king = who('darius');
        const angel = who('angel');
        // looking up from the floor of the den to its mouth, where the king stands
        c.freeze(true);
        lookUp();
        g.sounds.hush(0.6);
        await c.fade(0, 2);
        await part(c, '6:16-said');
        // the stone is laid upon the mouth: the light goes as it comes over
        const shut = lineOf(c, '6:17-a');
        const began = c.time;
        await c.until(() => {
          const k = Math.min(1, (c.time - began) / (g.auto ? 1.5 : 6));
          const s = k * k * (3 - 2 * k);
          stone(s);
          denLight(14 * (1 - s), 0.5 + 0.42 * s);
          lions.dim(0.45 + 0.45 * s);
          shaftK = 0.5 * (1 - s);
          return k >= 1;
        });
        await shut;
        // dark
        await c.fade(1, 0.5);
        g.setHour(21.6);
        denLight(0, 0.92);
        lions.dim(0.9);
        lions.eyes(1);
        king.show(false);
        for (const name of ['president1', 'president2']) who(name).show(false);
        g.sounds.hush(1);
        g.view(null);
        g.standAt(...fell, yawTo(fell, under));
        await c.fade(0, 1.6);
        c.freeze(false);
        g.music.breath(0.6);
        await lineOf(c, '6:17-b');
        await c.wait(g.auto ? 0.5 : 2.5);
        // "My God hath sent his angel, and hath shut the lions' mouths" (6:22): light, under the mouth of the den,
        // and one in white standing in it; every mouth is shut. He comes to walk with you.
        angel.place(...under, yawTo(under, me())).face(...me());
        angel.w.glow.value = 0.45;
        angel.aura = 1;
        angel.open = 0.25;
        g.music.breath(0);
        g.music.angel(0.7);
        lions.mouths(false);
        const came = c.time;
        const light = () => {
          const k = Math.min(1, (c.time - came) / 3);
          denLight(9 * k, 0.92, ANGEL);
          g.guidance.shine(angel.x, angel.z, 7 * k);
        };
        await c.until(() => (light(), c.time - came > 3));
        angel.walk([[g.player.x + (under[0] - g.player.x) * 0.35, g.player.z + (under[1] - g.player.z) * 0.35]], 1.0).then(() => angel.follow(g.player, 2.0, 1.4));
        // Walk among the lions: each one you come to lies down.
        const still = Array.from({ length: lions.count }, () => false);
        const count = () => still.filter(Boolean).length;
        while (count() < lions.count) {
          c.objective(`Walk among the lions. ${count() ? `${count()} of ${lions.count} lie still.` : 'Their mouths are shut.'}`);
          let near = -1;
          await c.until(() => {
            light();
            let best = Infinity;
            let to = -1;
            near = -1;
            for (let i = 0; i < lions.count; i++) {
              if (still[i]) continue;
              const d = from(at(lions.at(i)));
              if (d < best) [best, to] = [d, i];
              if (d < 2.7) near = i;
            }
            const l = lions.at(to);
            c.lead({ x: l.x, z: l.z, r: 1.6, mark: true });
            return near >= 0;
          });
          still[near] = true;
          lions.calm(near);
          g.music.pluck();
        }
        c.lead(null);
        c.objective(`Walk among the lions. ${lions.count} of ${lions.count} lie still.`);
        await c.until(() => (light(), c.time - came > 0) && Array.from({ length: lions.count }, (_, i) => lions.at(i).down).every((d) => d > 0.9));
        c.objective(null);
        // He is safe among them; and above, the king does not sleep (6:18).
        c.freeze(true);
        angel.stop().face(...me());
        g.view({ from: [...P(du - 7.4, dv - 5.4), 3.3], to: [g.player.x, g.player.z, 0.7] });
        await c.wait(1.2);
        await c.verse('6:18');
        await c.fade(1, 2);
        g.view(null);
        c.freeze(false);
        g.music.angel(0);
        g.guidance.shine(null);
      },
    },

    // ---- Act four: the living God (Daniel 6:19–28) ----
    {
      id: 'a4',
      label: 'Act Four',
      scene: true,
      setup() {
        reset({ hour: 21.6, stand: P(du - 1.4, dv + 4.6), face: under, room: 'den' });
        stone(1);
        denLight(0, 0.92);
        lions.dim(0.9);
        lions.eyes(0.6);
        lionsAtRest();
        g.sounds.hush(1);
      },
      async run(c) {
        const king = who('darius');
        g.narration?.warm(g.reference('6:19'));
        await c.chapter('Act Four', 'The Living God', 'Daniel 6', 2.6);
        // very early in the morning: the stone is drawn off, and the day comes down into the den
        g.setHour(6.7);
        lions.eyes(0);
        c.freeze(true);
        lookUp();
        await c.fade(0, 1.6);
        const early = line(c, '6:19');
        const began = c.time;
        await c.until(() => {
          const k = Math.min(1, (c.time - began) / (g.auto ? 1.5 : 5));
          const s = k * k * (3 - 2 * k);
          stone(1 - s);
          denLight(16 * s, 0.92 - 0.42 * s);
          lions.dim(0.9 - 0.5 * s);
          shaftK = 0.6 * s;
          return k >= 1;
        });
        g.sounds.hush(0.5);
        // the king comes to the mouth in haste
        const back = P(du, dv - D.half[1] + 1.5);
        king.place(...back, yawTo(back, rim));
        king.lift = ROOF;
        await Promise.all([early, king.walk([rim], 3.4).then(() => king.face(...me()))]);
        await lineOf(c, '6:20-a');
        await part(c, '6:20-said');
        g.view(null);
        c.freeze(false);
        c.objective('Answer the king.');
        await c.act(...under, 3.2, 'Answer the king');
        c.objective(null);
        c.freeze(true);
        lookUp();
        await part(c, '6:21-said');
        await fill(c, 'mouths');
        g.music.still(0.6);
        await part(c, '6:23-a');
        // (he is taken up between one picture and the next)
        await c.fade(1, 1.2);
        g.view(null);
        c.freeze(false);
      },
    },
    {
      id: 'a4-up',
      label: 'Act Four',
      scene: true,
      setup() {
        const stand = P(du - 1.2, dv - D.half[1] - 16);
        reset({ hour: 7.3, stand, face: P(du - 1.2, dv - D.half[1] - 30) });
        stone(0);
        const by = P(du + 1.6, dv - D.half[1] - 17.5);
        who('darius').place(...by, yawTo(by, stand)).face(...stand);
        who('guard1').place(...P(du - 4.4, dv - D.half[1] - 13), 0).face(...stand);
        who('guard2').place(...P(du + 5, dv - D.half[1] - 13.4), 0).face(...stand);
        // (the princes who had no part in it, and the multitude, are gathered before the king's seat)
        princes.slice(4).forEach((name, i) => {
          const p = P(ku - 6 + i * 2.4, kv + 13 + (i % 2) * 1.6);
          who(name).place(...p, yawTo(p, kingAt)).face(...kingAt);
        });
        multitude();
      },
      async run(c) {
        const king = who('darius');
        g.music.still(0.5);
        shoulder(at(king), { back: 3.4, up: 2.0, look: 1.5 });
        await c.fade(0, 1.6);
        await fill(c, 'believed');
        g.view(null);
        // (what was done to those who had accused him is read, and not seen)
        await c.fade(1, 1);
        g.music.still(0);
        await c.verse('6:24');
        await c.fade(0, 1.2);
        // the king goes to his seat, and writes to all people
        c.objective('Go with the king to his seat.');
        const seated = king.walk([P(ku + 3, kv + 12), kingAt], 2.2).then(() => king.face(...P(ku, kv + 16)));
        lineOf(c, '6:25-a');
        await c.reach(...P(ku, kv + 10), 3.2);
        c.objective(null);
        await Promise.race([seated, c.wait(12)]);
        c.freeze(true);
        g.view({ from: [...P(ku - 7, kv + 12.5), 2.3], to: [...P(ku + 0.6, kv + 1), 1.7] });
        await part(c, '6:25-said');
        await verse(c, '6:26');
        g.view({ from: [...P(ku + 2, kv - 1), 3.2], to: [...P(ku - 3, kv + 24), 0.8] });
        await verse(c, '6:27');
        g.music.theme();
        g.view({ from: [...P(ku - 7, kv + 12.5), 2.3], to: [...P(ku + 0.6, kv + 1), 1.7] });
        await c.verse('6:28');
        await c.fade(1, 2);
        g.view(null);
        c.freeze(false);
        g.end();
      },
    },
  ];
}
