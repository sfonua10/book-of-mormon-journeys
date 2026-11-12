// The story, 1 Nephi 3–4 (and the joy of 1 Nephi 5), in beats. Each beat sets the world up for itself (so a family
// can come back to it, and a test can start there) and then runs: cards of scripture, places to walk to, things to
// do. The words on the cards are the scripture's own (scripture.js); the few lines that are not scripture are marked
// as thoughts, in italic and without a reference.
//
// What happens is fixed, as it is written; how Nephi does it is the player's. He may be overtaken in the chase, and
// it begins again (3:27); he may shrink before Laban as long as he will, and the Spirit speaks again (4:10–12); he
// may answer Zoram wrongly, and is asked again (4:20–24). Nothing he does changes the account.
//
// What is shown follows what the text says and how a family would want it told: Laman and Lemuel's beating of their
// brothers and Laban's death are read, not seen; the screen goes dark for them.
import { LEHI_TABLE } from './city.js';
import { GATE, IN_CITY, LEHI_HOUSE, ROCK } from './places.js';

// What each of them wears, as cel paint ([in the light, in the shade]) and as an outfit (wanderer.js, ROBE).
// Jerusalem about 600 BC: a tunic of wool or linen, short for work and long for the rich, belted; a mantle over it;
// sandals; a cloth on the head. The four brothers are dressed as families know them from the paintings of them.
const tunic = (lit, shade) => ({ SHIRT: [lit, shade], TROUSERS: [lit.map((v) => v * 0.95), shade], SKIRT: [lit, shade] });
export const CLOTHES = {
  // a deep green tunic with short sleeves and a border of scales, a reddish-brown wrap over his shoulder and back,
  // gold bands at his wrist and upper arm, a dagger in his belt
  laman: {
    ...tunic([0.2, 0.42, 0.27], [0.1, 0.21, 0.21]),
    TRIM: [[0.82, 0.64, 0.3], [0.5, 0.38, 0.2]],
    CLOAK: [[0.56, 0.25, 0.15], [0.3, 0.12, 0.11]],
    BELT: [[0.36, 0.22, 0.12], [0.18, 0.11, 0.09]],
    OUTFIT: { head: 'none', cloak: true, hem: 0.5, edge: 2, bare: 0, belt: 2, cuffs: 2, lace: 0.36, blade: 0.2 },
  },
  // a dark fur skin round his waist and nothing over his chest, a band at his wrist, sandals
  lemuel: {
    ...tunic([0.3, 0.21, 0.14], [0.15, 0.1, 0.09]),
    HAIR: [[0.1, 0.07, 0.05], [0.05, 0.04, 0.04]],
    OUTFIT: { head: 'none', cloak: false, hem: 0.6, edge: 3, bare: 2, belt: 0, cuffs: 3, lace: 0.36, blade: 0 },
  },
  // as Nephi: a tunic of rough hide over one shoulder, a wide banded belt, forearm guards; a blue band on his brow
  sam: {
    ...tunic([0.82, 0.72, 0.5], [0.52, 0.42, 0.32]),
    HEADBAND: [[0.22, 0.32, 0.6], [0.12, 0.16, 0.38]],
    HAIR: [[0.22, 0.14, 0.08], [0.11, 0.07, 0.06]],
    OUTFIT: { head: 'band', cloak: false, hem: 0.6, edge: 1, bare: 1, belt: 1, cuffs: 1, lace: 0.42, blade: 0 },
  },
  // a captain of the city, a "mighty man" who "can command fifty" (3:31): a coat of bronze scales over a knee-length
  // tunic of fine white linen, its hem bordered with scales; a wide crimson belt banded with gold; bronze guards on
  // his forearms; a purple mantle bordered with gold, the mark of his rank; and his sword, "the hilt thereof was of
  // pure gold" (4:9). It is this that Nephi puts on: "I did gird on his armor about my loins" (4:19).
  laban: {
    ...tunic([0.96, 0.93, 0.86], [0.56, 0.54, 0.64]),
    CLOAK: [[0.44, 0.15, 0.44], [0.21, 0.07, 0.26]],
    HAT: [[0.95, 0.9, 0.78], [0.58, 0.54, 0.6]],
    TRIM: [[1.0, 0.8, 0.3], [0.62, 0.46, 0.2]],
    BOOTS: [[0.5, 0.32, 0.16], [0.26, 0.15, 0.1]],
    BELT: [[0.62, 0.12, 0.12], [0.34, 0.06, 0.1]],
    BELT2: [[1.0, 0.78, 0.3], [0.62, 0.42, 0.18]],
    LEATHER: [[0.72, 0.5, 0.26], [0.4, 0.27, 0.17]],
    GOLD: [[0.98, 0.74, 0.3], [0.6, 0.4, 0.18]],
    OUTFIT: { head: 'cloth', cloak: true, hem: 0.47, edge: 2, bare: 0, belt: 1, cuffs: 1, lace: 0.4, blade: 0.75, armour: true },
  },
  // his servants: short tunics of undyed wool with a brown stripe at the hem, a cord belt, a plain head cloth
  servant: {
    ...tunic([0.68, 0.61, 0.5], [0.38, 0.34, 0.36]),
    TRIM: [[0.42, 0.3, 0.2], [0.24, 0.16, 0.13]],
    HAT: [[0.6, 0.53, 0.42], [0.34, 0.3, 0.3]],
    BELT: [[0.46, 0.36, 0.24], [0.24, 0.18, 0.15]],
    OUTFIT: { head: 'cloth', cloak: false, hem: 0.55, edge: 0, bare: 0, belt: 2, cuffs: 0, lace: 0.3, blade: 0 },
  },
  // the servant who keeps the treasury: a knee-length linen tunic with a blue band at the hem, a grey-brown mantle
  zoram: {
    ...tunic([0.82, 0.76, 0.62], [0.47, 0.44, 0.5]),
    TRIM: [[0.3, 0.4, 0.62], [0.16, 0.22, 0.4]],
    CLOAK: [[0.44, 0.4, 0.36], [0.22, 0.2, 0.24]],
    HAT: [[0.72, 0.66, 0.54], [0.42, 0.38, 0.42]],
    BELT: [[0.36, 0.22, 0.12], [0.18, 0.11, 0.09]],
    OUTFIT: { head: 'cloth', cloak: true, hem: 0.5, edge: 0, bare: 0, belt: 2, cuffs: 0, lace: 0.32, blade: 0 },
  },
  // a heavenly messenger: a loose white robe to below the feet, wide sleeves, open at the neck; white hair
  angel: {
    ...tunic([1.0, 0.98, 0.94], [0.8, 0.8, 0.87]),
    CLOAK: [[1.0, 0.98, 0.94], [0.8, 0.8, 0.87]],
    HAIR: [[0.9, 0.88, 0.84], [0.66, 0.66, 0.7]],
    SKIN: [[0.96, 0.76, 0.6], [0.7, 0.52, 0.48]],
    BOOTS: [[0.96, 0.76, 0.6], [0.7, 0.52, 0.48]],
    TRIM: [[0.98, 0.95, 0.88], [0.8, 0.78, 0.8]],
    OUTFIT: { head: 'none', cloak: false, hem: 0.01, edge: 0, bare: 0, belt: 0, cuffs: 0, lace: 0, blade: 0, sleeves: true, neck: 'v' },
  },
};
/** Who is in the story, in the order they are made, and whether they wear a beard. */
export const PEOPLE = [
  ['laman', 'laman', true],
  ['lemuel', 'lemuel', true],
  ['sam', 'sam', false],
  ['laban', 'laban', true],
  ['servant1', 'servant', true],
  ['servant2', 'servant', false],
  ['zoram', 'zoram', false],
  ['angel', 'angel', false],
];

export function story(g) {
  const { P, C } = g;
  const yawTo = ([x0, z0], [x1, z1]) => Math.atan2(x1 - x0, z1 - z0);
  const who = (name) => g.cast.get(name);
  const at = (npc) => [npc.x, npc.z];
  const me = () => [g.player.x, g.player.z];

  // the places, in the world's (x, z)
  const camp = P(12, 6);
  const tents = P(-4, 12);
  const gateOut = P(GATE[0] - 14, 0);
  const gateIn = C(-62, 0);
  const labanGate = C(21, 30.5);
  const lehiYard = P(LEHI_HOUSE[0], LEHI_HOUSE[1] + 2);
  const lehiOut = P(LEHI_HOUSE[0], LEHI_HOUSE[1] + 24);
  const hide = P(GATE[0] - 10, 32);
  const rock = P(ROCK[0], ROCK[1]);
  const hollow = P(ROCK[0] - 1, ROCK[1]);
  const fallen = C(...IN_CITY.fallen);
  const treasuryDoor = C(IN_CITY.treasuryDoor[0], IN_CITY.treasuryDoor[1]);
  const beforeTreasury = C(IN_CITY.treasuryDoor[0] - 1, IN_CITY.treasuryDoor[1] + 3.5);
  // into the treasury: before its door, within it, the table at the back where the plates lie, and where the two
  // of them stand by it
  const doorOut = C(IN_CITY.treasuryDoor[0], IN_CITY.treasuryDoor[1] + 1.5);
  const doorIn = C(IN_CITY.treasuryDoor[0], IN_CITY.treasuryDoor[1] - 3.5);
  const table = C(...IN_CITY.table);
  const byTable = C(IN_CITY.table[0] + 1.7, IN_CITY.table[1] + 1.6);
  const withHim = C(IN_CITY.table[0] - 0.9, IN_CITY.table[1] + 3.1);
  const room = C(IN_CITY.table[0], IN_CITY.table[1] + 5.5);
  // the ways: from the land of inheritance up to the gate, and through the city to Laban's
  const fromLehi = [lehiOut, P(175, -190), P(190, -110), P(205, -40), gateOut];
  const toLaban = [gateIn, C(-20, 0), C(19.5, 1), C(19.5, 22)];
  const outOfCity = [C(19.5, 1), C(-20, 0), gateIn, gateOut];
  // Lehi's house: the way in by its door (before it, and within), and where the brothers stand in it
  const H = (du, dv) => P(LEHI_HOUSE[0] + du, LEHI_HOUSE[1] + dv);
  const lehiDoorOut = H(0, -2.2);
  const lehiDoorIn = H(0, -6.6);
  const inLehi = { laman: H(-4.2, -8.0), lemuel: H(4.6, -6.4), sam: H(1.9, -6.0) };
  // the riches, within the house: the gold at the back, the silver by the east wall, the precious things on the table
  const riches = {
    gold: { at: H(-5.6, -10.2), name: 'The gold', label: 'Gather the gold', taken: 'Laman takes up the gold.' },
    silver: { at: H(6.3, -8.4), name: 'The silver', label: 'Gather the silver', taken: 'Lemuel takes up the silver.' },
    precious: { at: H(0, -10.85), up: LEHI_TABLE, name: 'The precious things', label: 'Gather the precious things', taken: 'You take up the precious things.' },
  };

  /** The three brothers, standing about a place and facing a point. */
  function brothersAt([x, z], face) {
    const spots = [[-2.4, 1.2], [-1.2, 2.8], [1.8, 2.2]];
    ['laman', 'lemuel', 'sam'].forEach((name, i) => {
      const [dx, dz] = spots[i];
      const p = [x + dx, z + dz];
      who(name).place(p[0], p[1], yawTo(p, face)).face(...face);
    });
  }
  /** The three keep up with Nephi, Sam nearest. */
  function followMe(options) {
    who('sam').follow(g.player, 2.4, 1.1, options);
    who('laman').follow(g.player, 3.6, -1.4, options);
    who('lemuel').follow(g.player, 4.6, 1.6, options);
  }
  /** Over Nephi's shoulder, at someone or something: a still view while the cards about it are read. */
  const shoulder = (point, options) => g.shoulder(point, options);
  const nearest = (names) => names.map(who).sort((a, b) => Math.hypot(a.x - g.player.x, a.z - g.player.z) - Math.hypot(b.x - g.player.x, b.z - g.player.z))[0];
  function reset({ hour, stand, face, clothes = 'nephi', town = false }) {
    g.cast.clear();
    g.props.reset();
    g.setHour(hour);
    g.dress(clothes);
    g.view(null);
    g.guidance.lead(null);
    g.guidance.shine(null);
    g.music.stop();
    g.sounds.hush(0);
    g.burden(null);
    // the treasury is shut, and the plates lie in it, where a lamp burns
    g.room('treasury');
    g.door(false);
    g.props.show('plates', table, { up: IN_CITY.tableTop });
    // people in the streets by day; none by night
    if (town) g.town.day();
    else g.town.night();
    g.standAt(stand[0], stand[1], yawTo(stand, face));
  }
  /** Their property, in their arms: Laman has the gold, Lemuel the silver, Nephi the precious things. */
  const bearers = { gold: () => who('laman'), silver: () => who('lemuel'), precious: () => g.player };
  const bear = (name) => g.props.carry(name, bearers[name](), { out: 0.34, up: 1.0, size: 0.6, wide: name === 'gold' ? 0.27 : 0.3 });
  /** Laban where he fell, with the wine he had drunk (4:7). */
  function fallenLaban() {
    const laban = who('laban').place(...fallen, 1.2).lie(true);
    laban.stirs = true;
    g.props.show('jar', [fallen[0] + 1.25, fallen[1] + 0.5], { turn: 0.7 });
    g.props.show('cup', [fallen[0] - 0.75, fallen[1] + 0.85], { turn: 2.3 });
    return laban;
  }
  const from = ([x, z]) => Math.hypot(g.player.x - x, g.player.z - z);
  /**
   * Asks how Nephi will answer, until he answers as he did. What is asked is a thought, and so is what follows a
   * wrong answer (they are not the scripture's words, and are in italic); the right answer is the scripture's, and
   * its verse follows. With ?wrong a test takes the wrong answer first.
   */
  async function ask(c, question, answers, right, otherwise) {
    for (let tries = 0; ; tries++) {
      const took = await c.choice(question, answers, { auto: g.flag('wrong') && tries === 0 ? 1 - right : right });
      if (took === right) return;
      await c.thought(otherwise);
    }
  }

  return [
    // ---- Act one: up to Jerusalem (1 Nephi 3:7–21) ----
    {
      id: 'a1',
      label: 'Act One',
      scene: true,
      setup() {
        reset({ hour: 15.4, stand: camp, face: gateOut, town: true });
        brothersAt(tents, camp);
      },
      async run(c) {
        await c.fade(0, 2);
        await c.chapter('Act One', 'Up to Jerusalem', '1 Nephi 3');
        await c.verse('3:7');
        await c.verse('3:9');
        c.objective('Speak with your brethren by the tents.');
        await c.act(...at(who('sam')), 4.5, 'Consult with your brethren');
        c.objective(null);
        await c.verse('3:10', '3:11');
        c.objective('Go up to the gate of Jerusalem with your brethren.');
        followMe();
        await c.reach(...gateOut, 9);
      },
    },
    {
      id: 'a1-gate',
      label: 'Act One',
      setup() {
        reset({ hour: 15.8, stand: gateOut, face: gateIn, town: true });
        brothersAt(P(GATE[0] - 18, -3), gateIn);
      },
      async run(c) {
        c.objective(null);
        const laman = who('laman');
        for (const n of ['sam', 'lemuel']) who(n).stop().face(...gateIn);
        // the lot fell upon Laman: he goes in alone
        await c.hold(laman.walk([P(GATE[0] - 6, -1), gateIn, C(-58, 0.5)], 2.0));
        laman.show(false);
        await c.verse('3:12', '3:13');
        // and comes back out, fast
        laman.place(...C(-55, 0), yawTo(C(-55, 0), gateIn));
        await c.hold(laman.walk([gateIn, P(GATE[0] - 8, 0), [g.player.x + 2.5, g.player.z + 1]], 5));
        laman.face(...me());
        await c.verse('3:14');
        c.objective('Speak to your brethren.');
        await c.act(...at(laman), 4.5, 'Answer your brethren');
        c.objective(null);
        await c.verse('3:15');
        await c.verse('3:16');
        await c.verse('3:19', '3:20');
        await c.verse('3:21');
        await c.fade(1, 1.5);
      },
    },

    // ---- Act two: our gold and our silver (1 Nephi 3:22–4:4) ----
    {
      id: 'a2',
      label: 'Act Two',
      scene: true,
      setup() {
        reset({ hour: 18.2, stand: lehiOut, face: lehiYard, town: true });
        brothersAt(P(LEHI_HOUSE[0] + 3, LEHI_HOUSE[1] + 20), lehiYard);
        g.room('lehi');
        for (const [name, r] of Object.entries(riches)) g.props.show(name, r.at, { up: r.up });
      },
      async run(c) {
        await c.fade(0, 1.5);
        await c.chapter('Act Two', 'Our Gold and Our Silver', '1 Nephi 3');
        await c.verse('3:22');
        followMe();
        c.objective("Go into your father's house, by its door.");
        await c.reach(...lehiDoorIn, 1.7, { via: [H(0, 14), lehiYard, lehiDoorOut] });
        // his brothers come in after him by the door, and stand about the room
        const brothers = ['laman', 'lemuel', 'sam'];
        for (const name of brothers) {
          const n = who(name);
          // (one already in the doorway does not go back out to come in)
          const way = Math.hypot(n.x - lehiDoorIn[0], n.z - lehiDoorIn[1]) < 2.3 ? [] : [lehiDoorOut];
          n.walk([...way, lehiDoorIn, inLehi[name]], 2.1).then(() => n.face(...H(0, -9)));
        }
        // The riches may be gathered in any order. Each is taken up and carried as it is gathered: the gold by Laman,
        // the silver by Lemuel, the precious things by Nephi. What is still to gather is listed, and marked.
        const left = new Set(Object.keys(riches));
        while (left.size) {
          c.objective('Gather your gold, and your silver, and your precious things.', Object.entries(riches).map(([name, r]) => ({ label: r.name, done: !left.has(name) })));
          let near = null;
          await c.until(() => {
            const [first] = [...left].sort((a, b) => from(riches[a].at) - from(riches[b].at));
            const [x, z] = riches[first].at;
            c.lead({ x, z, r: 1.2, mark: true });
            near = !g.frozen && from(riches[first].at) < 2.3 ? first : null;
            c.prompt(near ? riches[near].label : null);
            return !!near && (c.pressed || g.auto);
          });
          c.prompt(null);
          left.delete(near);
          bear(near);
          g.music.pluck();
          c.toast(riches[near].taken, '', 3);
        }
        c.lead(null);
        c.objective('Gather your gold, and your silver, and your precious things.', Object.values(riches).map((r) => ({ label: r.name, done: true })));
        await c.wait(1.2);
        c.objective(null);
        // they carry it out before him, and wait for him in the court
        const out = Promise.all(brothers.map((name, i) => who(name).stop().walk([lehiDoorIn, lehiDoorOut, H((i - 1) * 2.4, 3.5 + i)], 2.3)));
        await c.verse('3:23');
        c.objective('Go up again unto the house of Laban, inside the city.');
        await c.reach(...lehiYard, 3, { via: [lehiDoorIn, lehiDoorOut] });
        // (they keep to the way he came out by: through the court's gate, not its wall)
        out.then(() => {
          for (const name of brothers) who(name).face(null);
          followMe({ whole: true });
        });
        await c.reach(...labanGate, 6, { via: [...fromLehi, ...toLaban] });
      },
    },
    {
      id: 'a2-laban',
      label: 'Act Two',
      setup() {
        reset({ hour: 18.9, stand: C(19.2, 25.5), face: labanGate, town: true });
        brothersAt(C(18.4, 22), labanGate);
        for (const name of Object.keys(riches)) bear(name);
      },
      async run(c) {
        c.objective(null);
        const laban = who('laban');
        const s1 = who('servant1');
        const s2 = who('servant2');
        // Laban comes out to them in the street, his servants in the gateway behind him
        const stage = () => {
          for (const n of ['laman', 'lemuel', 'sam']) who(n).stop().face(...labanGate);
          laban.place(...C(20.6, 30.5), -Math.PI / 2).face(...me());
          s1.place(...C(23.2, 29.2), 0).face(...me());
          s2.place(...C(23.2, 31.8), Math.PI).face(...me());
        };
        stage();
        shoulder(at(laban));
        await c.verse('3:24');
        await c.verse('3:25');
        g.view(null);
        // They run: the brothers ahead, out of the gate and away; the servants after Nephi. What he carries weighs on
        // him, and they gain on him until he leaves it (3:26). If they overtake him it is begun again from here: "the
        // servants of Laban did not overtake us" (3:27).
        const away = [C(18, 1), C(-30, 0), gateIn, gateOut, P(200, 90), P(ROCK[0] + 8, ROCK[1] - 6)];
        for (let tries = 0; ; tries++) {
          c.objective('Flee from the servants of Laban! Out of the city, into the wilderness.');
          g.burden(3.7);
          // (his brothers let fall what they carry, and are gone)
          g.props.show('gold', at(who('laman')));
          g.props.show('silver', at(who('lemuel')));
          who('sam').walk(away.map(([x, z]) => [x + 1, z]), 5.2);
          who('laman').walk(away, 5.6);
          who('lemuel').walk(away.map(([x, z]) => [x - 1, z + 1]), 5.4);
          const began = c.time;
          let after = [];
          let left = false;
          let taken = false;
          const free = await c.reach(...P(GATE[0] - 30, 0), 10, {
            via: outOfCity,
            unless() {
              if (!after.length && c.time - began > 1.1) {
                after = [s1, s2];
                Object.assign(s1.follow(g.player, 0.8), { maxSpeed: 4.3, keen: true });
                Object.assign(s2.follow(g.player, 0.8, 0.9), { maxSpeed: 4.1, keen: true });
              }
              g.town.watch();
              const d = Math.min(30, ...after.map((s) => from(at(s))));
              // the drum: slow while they are far behind, quick when they are at his heels
              g.music.drum(Math.min(1, Math.max(0.12, 1 - (d - 2) / 14)));
              if (!left) {
                c.prompt('Leave the property behind');
                if (c.pressed || (g.auto && d < 5 && !(g.flag('hold') && tries === 0))) {
                  left = true;
                  c.prompt(null);
                  g.props.show('precious', me());
                  g.burden(null);
                  c.toast(g.verses('3:26'), g.reference('3:26'), 9);
                  // one of them stops for it: "it fell into the hands of Laban"
                  after = [s1];
                  s2.keen = false;
                  s2.walk([me()], 3.2).then(() => s2.face(...labanGate));
                }
              }
              taken = d < 1.3;
              return taken;
            },
          });
          g.music.drum(0);
          c.prompt(null);
          c.objective(null);
          g.burden(null);
          if (free && !taken) break;
          g.log(`overtaken (try ${tries + 1})`);
          await c.fade(1, 0.6);
          await c.card('… and the servants of Laban did not overtake us …', '1 Nephi 3:27');
          g.standAt(...C(19.2, 25.5), yawTo(C(19.2, 25.5), C(18, 1)));
          brothersAt(C(18.4, 22), labanGate);
          stage();
          for (const name of Object.keys(riches)) bear(name);
          g.town.day();
          await c.fade(0, 0.8);
        }
        // the servants of Laban did not overtake us
        for (const s of [s1, s2]) {
          s.keen = false;
          s.walk([gateIn, C(-20, 0)], 1.8).then(() => s.show(false));
        }
        laban.show(false);
        c.objective('Hide yourselves in the cavity of a rock.');
        await c.reach(...rock, 7, { via: [P(ROCK[0] + 14, ROCK[1])] });
      },
    },
    {
      id: 'a2-rock',
      label: 'Act Two',
      setup() {
        reset({ hour: 19.6, stand: hollow, face: P(ROCK[0] + 10, ROCK[1] - 6) });
      },
      async run(c) {
        c.objective(null);
        const face = me();
        who('sam').place(...P(ROCK[0] + 1.5, ROCK[1] + 1.8), 0).face(...face);
        who('laman').place(...P(ROCK[0] + 3.5, ROCK[1] - 1.5), 0).face(...face);
        who('lemuel').place(...P(ROCK[0] + 4.5, ROCK[1] + 1), 0).face(...face);
        await c.verse('3:27');
        // (the beating is read, not shown)
        g.ui.fade(0.55, 0.8);
        await c.verse('3:28');
        // the angel
        const stands = P(ROCK[0] + 9, ROCK[1] - 2);
        const angel = who('angel').place(...stands, yawTo(stands, hollow));
        angel.w.glow.value = 0;
        // above the ground a little, his hands open
        angel.lift = 0.55;
        angel.open = 0.3;
        g.ui.fade(0, 0.6);
        for (const n of ['laman', 'lemuel', 'sam']) who(n).face(...stands);
        // a low view from beside the brothers, up at him, with the light round him on the ground
        const side = lerp(stands, hollow, 0.62);
        const [ax, az] = [stands[0] - hollow[0], stands[1] - hollow[1]];
        g.view({ from: [side[0] + az * 0.28, side[1] - ax * 0.28, 1.0], to: [...stands, 1.35] });
        let bright = 0;
        await c.hold(
          c.until(() => {
            bright = Math.min(1, bright + 0.015);
            angel.w.glow.value = 0.4 * bright;
            angel.aura = bright;
            g.guidance.shine(...stands, 9 * bright);
            // (one bright chord, swelling with the light)
            g.music.angel(bright);
            return bright >= 1;
          }),
        );
        await c.verse('3:29');
        await c.verse('3:30');
        await c.hold(
          c.until(() => {
            bright = Math.max(0, bright - 0.02);
            angel.w.glow.value = 0.4 + (1 - bright) * 1.2;
            angel.aura = bright;
            g.guidance.shine(...stands, 9 * bright);
            return bright <= 0;
          }),
        );
        g.guidance.shine(null);
        // (and gone the moment he is)
        g.music.angel(0);
        g.view(null);
        angel.aura = 0;
        angel.show(false);
        for (const n of ['laman', 'lemuel', 'sam']) who(n).face(...me());
        await c.verse('3:31');
        c.objective('Speak to your brethren.');
        await c.act(...at(who('laman')), 4.5, 'Speak to your brethren');
        c.objective(null);
        await c.verse('4:1');
        await c.verse('4:2', '4:3');
        await c.verse('4:4');
        await c.fade(1, 2);
      },
    },

    // ---- Act three: led by the Spirit (1 Nephi 4:5–38) ----
    {
      id: 'a3',
      label: 'Act Three',
      scene: true,
      setup() {
        reset({ hour: 22.5, stand: hide, face: gateOut });
        brothersAt(P(GATE[0] - 13, 36), hide);
        fallenLaban();
      },
      async run(c) {
        await c.fade(0, 2);
        await c.chapter('Act Three', 'Led by the Spirit', '1 Nephi 4');
        await c.verse('4:5');
        await c.verse('4:6');
        await c.thought('No one marks the way tonight. When you do not know where to go, stand still a moment, and look.');
        g.guidance.lead([hide, gateOut, gateIn, C(-20, 0), C(19.5, 0), C(19.5, 14), fallen]);
        c.lead(null);
        await c.until(() => {
          // (the autopilot goes where the light is)
          if (g.auto) c.lead(g.guidance.point && { ...g.guidance.point, r: 1 });
          // (a man's heavy breathing, heard before he is seen)
          g.music.breath(Math.min(1, Math.max(0, 1 - (from(fallen) - 4) / 14)));
          return from(fallen) < 4.5;
        });
        c.lead(null);
        g.guidance.lead(null);
      },
    },
    {
      id: 'a3-laban',
      label: 'Act Three',
      setup() {
        reset({ hour: 22.6, stand: C(18.5, 21), face: fallen });
        fallenLaban();
      },
      async run(c) {
        g.music.breath(1);
        shoulder(fallen, { back: 4.5, up: 2.8, look: 0.3 });
        await c.verse('4:7');
        await c.verse('4:8');
        g.view(null);
        await c.verse('4:9');
        // from here there is no sound in the street but his breathing
        g.sounds.hush(1);
        await c.verse('4:10');
        // "And I shrunk." He may obey now, or step back from it, or only stand there: each time he shrinks the Spirit
        // speaks again, as it did (4:11, 4:12), and the third time he remembers the words of the Lord (4:14–17).
        // Nothing marks the place; the light that led him here rests on it.
        const again = [
          () => c.verse('4:11'),
          () => c.verse('4:12', '4:13'),
          async () => {
            await c.verse('4:14');
            await c.verse('4:15', '4:16');
            await c.verse('4:17');
          },
        ];
        let heard = 0;
        g.guidance.lead([me(), fallen], { hint: false });
        for (;;) {
          const began = c.time;
          let came = from(fallen) < 5.5;
          const obeyed = await c.act(...fallen, 3.6, 'Obey the voice of the Spirit', {
            mark: false,
            unless() {
              if (heard >= again.length || g.auto) return false;
              if (from(fallen) < 5.5) came = true;
              return (came && from(fallen) > 8) || c.time - began > 16;
            },
          });
          if (obeyed) break;
          await again[heard++]();
        }
        // (what he had not yet heard, if he did not shrink so long: all of it is what brought him to obey)
        while (heard < again.length) await again[heard++]();
        g.guidance.lead(null);
        g.music.breath(0);
        await c.fade(1, 1.4);
        await c.card('Therefore I did obey the voice of the Spirit …', '1 Nephi 4:18');
        who('laban').show(false);
        g.dress('laban');
        await c.verse('4:19');
        g.sounds.hush(0);
        // (Zoram, at the treasury door, is first seen now, as Nephi goes there)
        who('zoram').place(...beforeTreasury, Math.PI).face(...C(IN_CITY.treasuryDoor[0] - 6, 0));
        await c.fade(0, 1.4);
        g.guidance.lead([me(), C(19.5, 14), C(19.5, 0), C(IN_CITY.treasuryDoor[0] - 6, -1), beforeTreasury]);
        await c.until(() => {
          if (g.auto) c.lead(g.guidance.point && { ...g.guidance.point, r: 1 });
          return from(beforeTreasury) < 6;
        });
        c.lead(null);
        g.guidance.lead(null);
      },
    },
    {
      id: 'a3-treasury',
      label: 'Act Three',
      setup() {
        reset({ hour: 22.7, stand: C(IN_CITY.treasuryDoor[0] - 6, 0), face: beforeTreasury, clothes: 'laban' });
        who('zoram').place(...beforeTreasury, Math.PI);
      },
      async run(c) {
        const zoram = who('zoram').face(...me());
        shoulder(at(zoram));
        // "I commanded him in the voice of Laban" (4:20)
        await ask(
          c,
          'A servant of Laban stands before the treasury, and the keys are in his keeping. He takes you for his master. How will you speak to him?',
          ['As a stranger: ask him where the records are kept.', 'In the voice of Laban: command him to go with you into the treasury.'],
          1,
          'He looks at you a long moment. His master does not ask.',
        );
        await c.verse('4:20');
        await c.verse('4:21');
        g.view(null);
        // he opens the treasury and goes in, and Nephi with him; a lamp burns there
        g.door(true);
        g.guidance.shine(...room, 5);
        const there = zoram.walk([doorOut, doorIn, byTable], 1.7);
        await c.reach(...withHim, 2.4, { via: [doorOut, doorIn], mark: false });
        // (if Nephi is there before him, he waits for him)
        await c.hold(there);
        zoram.face(...me());
        shoulder(at(zoram), { back: 3, up: 2 });
        await c.verse('4:22');
        // "And I spake unto him as if it had been Laban" (4:23)
        await ask(
          c,
          'He speaks of the elders of the Jews, among whom his master has been this night. How will you answer him?',
          ['As if you were Laban, who was among them.', 'Say that you know nothing of the elders.'],
          0,
          'He stops, the keys still in his hand. Laban was with the elders this very night.',
        );
        await c.verse('4:23');
        // he takes up the plates
        await c.hold(zoram.walk([C(IN_CITY.table[0] + 0.5, IN_CITY.table[1] + 1.3)], 1.2));
        g.props.carry('plates', zoram);
        zoram.face(...me());
        // "to my elder brethren, who were without the walls" (4:24)
        await ask(
          c,
          'He holds the plates of brass. Where will you say they are to go?',
          ['To your father, in the wilderness.', 'To your elder brethren, who are without the walls.'],
          1,
          'He draws the plates back a little. Laban has no father in the wilderness.',
        );
        g.view(null);
        await c.verse('4:24');
        await c.verse('4:25');
        zoram.follow(g.player, 2.4, 1.2);
        await c.verse('4:26');
        c.objective('Go forth unto your brethren, who are without the walls.');
        c.toast(g.verses('4:27'), g.reference('4:27'), 9);
        await c.reach(...hide, 15, { via: [doorIn, doorOut, C(19.5, 1), C(-20, 0), gateIn, gateOut] });
        g.guidance.shine(null);
      },
    },
    {
      id: 'a3-walls',
      label: 'Act Three',
      setup() {
        reset({ hour: 22.8, stand: P(GATE[0] - 14, 14), face: hide, clothes: 'laban' });
        brothersAt(P(GATE[0] - 13, 36), P(GATE[0] - 14, 14));
        who('zoram').place(...P(GATE[0] - 12, 11), 0).follow(g.player, 2.4, 1.2);
        g.props.carry('plates', who('zoram'));
      },
      async run(c) {
        c.objective(null);
        const zoram = who('zoram');
        // they take him for Laban, and run
        const flee = (name, du, dv) => who(name).walk([P(GATE[0] - 13 + du, 36 + dv)], 4.2);
        flee('laman', -14, 16);
        flee('lemuel', -10, 19);
        flee('sam', -18, 12);
        await c.verse('4:28');
        await c.act(...at(nearest(['laman', 'lemuel', 'sam'])), 22, 'Call after them');
        await c.verse('4:29');
        const back = P(GATE[0] - 13, 30);
        brothersAt(back, me());
        // and Zoram, seeing them, makes for the city
        zoram.stop().walk([P(GATE[0] - 12, 6), P(GATE[0] - 16, 1)], 2.1);
        await c.verse('4:30');
        c.objective('Hold Zoram, that he should not flee.');
        await c.until(() => {
          c.lead({ x: zoram.x, z: zoram.z, r: 1.6 });
          return Math.hypot(zoram.x - g.player.x, zoram.z - g.player.z) < 2.2;
        });
        c.lead(null);
        c.objective(null);
        zoram.stop().face(...me());
        shoulder(at(zoram), { back: 2.8, side: 0.9, up: 1.9, look: 1.5 });
        await c.verse('4:31');
        await c.verse('4:32');
        await c.verse('4:33');
        await c.verse('4:34');
        await c.verse('4:35');
        await c.verse('4:37');
        g.view(null);
        await c.verse('4:38');
        await c.fade(1, 2);
      },
    },
    {
      id: 'home',
      label: 'The tent of their father',
      scene: true,
      setup() {
        reset({ hour: 17.2, stand: camp, face: tents });
      },
      async run(c) {
        brothersAt(P(-2, 9), camp);
        who('zoram').place(...P(4, 13), 0).face(...me());
        g.props.carry('plates', null);
        g.props.show('plates', P(3, 8.5));
        // the one tune of the story: a lyre, for their joy
        g.music.theme();
        await c.fade(0, 2);
        await c.verse('5:7');
        await c.verse('5:8');
        await c.verse('5:21');
        await c.verse('3:7');
        await c.fade(1, 2);
        g.ui.end({ onAgain: () => location.reload() });
      },
    },
  ];
}

const lerp = ([x0, z0], [x1, z1], t) => [x0 + (x1 - x0) * t, z0 + (z1 - z0) * t];
