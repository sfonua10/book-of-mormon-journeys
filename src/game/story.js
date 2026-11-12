// The story, 1 Nephi 3–4 (and the joy of 1 Nephi 5), in beats. Each beat sets the world up for itself (so a family
// can come back to it, and a test can start there) and then runs: cards of scripture, places to walk to, things to
// do. The words on the cards are the scripture's own (scripture.js); the few lines that are not scripture are marked
// as thoughts, in italic and without a reference.
//
// What is shown follows what the text says and how a family would want it told: Laman and Lemuel's beating of their
// brothers and Laban's death are read, not seen; the screen goes dark for them.
import { GATE, IN_CITY, LEHI_HOUSE, ROCK } from './places.js';

// What each of them wears, as cel paint: [in the light, in the shade].
const tunic = (lit, shade) => ({ SHIRT: [lit, shade], TROUSERS: [lit.map((v) => v * 0.95), shade] });
export const CLOTHES = {
  laman: { CLOAK: [[0.62, 0.2, 0.14], [0.34, 0.1, 0.13]], ...tunic([0.78, 0.68, 0.52], [0.44, 0.38, 0.44]), HAT: [[0.84, 0.76, 0.6], [0.5, 0.44, 0.48]], TRIM: [[0.9, 0.7, 0.36], [0.5, 0.4, 0.3]] },
  lemuel: { CLOAK: [[0.72, 0.53, 0.2], [0.42, 0.28, 0.17]], ...tunic([0.8, 0.76, 0.66], [0.46, 0.44, 0.5]), HAT: [[0.62, 0.5, 0.36], [0.36, 0.28, 0.28]], TRIM: [[0.5, 0.2, 0.12], [0.3, 0.12, 0.1]] },
  sam: { CLOAK: [[0.32, 0.43, 0.22], [0.16, 0.22, 0.17]], ...tunic([0.88, 0.82, 0.68], [0.5, 0.48, 0.56]), HAT: [[0.9, 0.86, 0.76], [0.54, 0.52, 0.6]], TRIM: [[0.86, 0.8, 0.6], [0.5, 0.46, 0.44]] },
  laban: {
    CLOAK: [[0.44, 0.15, 0.44], [0.21, 0.07, 0.26]],
    ...tunic([0.96, 0.93, 0.86], [0.56, 0.54, 0.64]),
    HAT: [[0.95, 0.9, 0.78], [0.58, 0.54, 0.6]],
    TRIM: [[1.0, 0.8, 0.3], [0.62, 0.46, 0.2]],
    BOOTS: [[0.5, 0.32, 0.16], [0.26, 0.15, 0.1]],
  },
  servant: { CLOAK: [[0.3, 0.22, 0.16], [0.15, 0.1, 0.09]], ...tunic([0.56, 0.5, 0.42], [0.3, 0.27, 0.3]), HAT: [[0.4, 0.34, 0.28], [0.22, 0.18, 0.18]], TRIM: [[0.3, 0.22, 0.16], [0.15, 0.1, 0.09]] },
  zoram: { CLOAK: [[0.4, 0.43, 0.48], [0.2, 0.22, 0.3]], ...tunic([0.8, 0.74, 0.6], [0.46, 0.43, 0.5]), HAT: [[0.72, 0.66, 0.54], [0.42, 0.38, 0.42]], TRIM: [[0.6, 0.6, 0.62], [0.34, 0.34, 0.4]] },
  angel: {
    CLOAK: [[1.0, 0.98, 0.94], [0.8, 0.8, 0.86]],
    ...tunic([1.0, 0.98, 0.94], [0.82, 0.82, 0.88]),
    HAT: [[1.0, 0.98, 0.94], [0.82, 0.82, 0.88]],
    HAIR: [[0.9, 0.86, 0.76], [0.7, 0.68, 0.7]],
    SKIN: [[1.0, 0.9, 0.8], [0.8, 0.72, 0.7]],
    BOOTS: [[1.0, 0.98, 0.94], [0.82, 0.82, 0.88]],
    TRIM: [[1.0, 0.92, 0.7], [0.8, 0.74, 0.6]],
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
  // the ways: from the land of inheritance up to the gate, and through the city to Laban's
  const fromLehi = [lehiOut, P(175, -190), P(190, -110), P(205, -40), gateOut];
  const toLaban = [gateIn, C(-20, 0), C(19.5, 1), C(19.5, 22)];
  const outOfCity = [C(19.5, 1), C(-20, 0), gateIn, gateOut];
  // the riches, in Lehi's court and storeroom
  const riches = {
    gold: { at: P(LEHI_HOUSE[0] + 2.6, LEHI_HOUSE[1] - 1.5), label: 'Gather the gold', done: 'The gold' },
    silver: { at: P(LEHI_HOUSE[0] - 5.5, LEHI_HOUSE[1] + 3), label: 'Gather the silver', done: 'The silver' },
    precious: { at: P(LEHI_HOUSE[0] - 1, LEHI_HOUSE[1] - 2.8), label: 'Gather the precious things', done: 'The precious things' },
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
  function followMe() {
    who('sam').follow(g.player, 2.4, 1.1);
    who('laman').follow(g.player, 3.6, -1.4);
    who('lemuel').follow(g.player, 4.6, 1.6);
  }
  const nearest = (names) => names.map(who).sort((a, b) => Math.hypot(a.x - g.player.x, a.z - g.player.z) - Math.hypot(b.x - g.player.x, b.z - g.player.z))[0];
  function reset({ hour, stand, face, clothes = 'nephi' }) {
    g.cast.clear();
    g.props.reset();
    g.setHour(hour);
    g.dress(clothes);
    g.view(null);
    g.guidance.lead(null);
    g.standAt(stand[0], stand[1], yawTo(stand, face));
  }

  return [
    // ---- Act one: up to Jerusalem (1 Nephi 3:7–21) ----
    {
      id: 'a1',
      label: 'Act One',
      scene: true,
      setup() {
        reset({ hour: 15.4, stand: camp, face: gateOut });
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
        reset({ hour: 15.8, stand: gateOut, face: gateIn });
        brothersAt(P(GATE[0] - 18, -3), gateIn);
      },
      async run(c) {
        c.objective(null);
        const laman = who('laman');
        for (const n of ['sam', 'lemuel']) who(n).stop().face(...gateIn);
        // the lot fell upon Laman: he goes in alone
        await c.hold(laman.walk([P(GATE[0] - 6, -1), gateIn, C(-40, 1)], 1.6));
        laman.show(false);
        await c.verse('3:12', '3:13');
        // and comes back out, fast
        laman.place(...C(-40, 0), yawTo(C(-40, 0), gateIn));
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
        reset({ hour: 18.2, stand: lehiOut, face: lehiYard });
        brothersAt(P(LEHI_HOUSE[0] + 3, LEHI_HOUSE[1] + 20), lehiYard);
        for (const [name, r] of Object.entries(riches)) g.props.show(name, r.at);
      },
      async run(c) {
        await c.fade(0, 1.5);
        await c.chapter('Act Two', 'Our Gold and Our Silver', '1 Nephi 3');
        await c.verse('3:22');
        followMe();
        c.objective("Go into your father's court.");
        await c.reach(...P(LEHI_HOUSE[0], LEHI_HOUSE[1] + 8), 3, { via: [P(LEHI_HOUSE[0], LEHI_HOUSE[1] + 14)] });
        for (const [name, r] of Object.entries(riches)) {
          c.objective(`${r.label}, in your father's court.`);
          await c.act(...r.at, 2.4, r.label);
          g.props.hide(name);
          g.sounds.pick?.();
          c.toast(`${r.done}: gathered.`, '', 2.5);
        }
        c.objective(null);
        await c.verse('3:23');
        c.objective('Go up again unto the house of Laban, inside the city.');
        await c.reach(...labanGate, 6, { via: [...fromLehi, ...toLaban] });
      },
    },
    {
      id: 'a2-laban',
      label: 'Act Two',
      setup() {
        reset({ hour: 18.9, stand: C(16, 27), face: labanGate });
        brothersAt(C(14, 24), labanGate);
      },
      async run(c) {
        c.objective(null);
        for (const n of ['laman', 'lemuel', 'sam']) who(n).stop().face(...labanGate);
        const laban = who('laban').place(...C(24.5, 30.5), -Math.PI / 2);
        laban.face(...me());
        const s1 = who('servant1').place(...C(27, 27), 0);
        const s2 = who('servant2').place(...C(27, 34), Math.PI);
        s1.face(...me());
        s2.face(...me());
        await c.verse('3:24');
        await c.verse('3:25');
        // they run: the brothers ahead, out of the gate and away; the servants after Nephi
        c.objective('Flee from the servants of Laban! Out of the city, into the wilderness.');
        const away = [C(18, 1), C(-30, 0), gateIn, gateOut, P(200, 90), P(ROCK[0] + 8, ROCK[1] - 6)];
        who('sam').walk(away.map(([x, z]) => [x + 1, z]), 5.2);
        who('laman').walk(away, 5.6);
        who('lemuel').walk(away.map(([x, z]) => [x - 1, z + 1]), 5.4);
        s1.follow(g.player, 1.2);
        s1.maxSpeed = 4.4;
        s2.follow(g.player, 1.6, 0.8);
        s2.maxSpeed = 4.1;
        c.toast(g.verses('3:26'), g.reference('3:26'), 9);
        await c.reach(...P(GATE[0] - 30, 0), 10, { via: outOfCity });
        // the servants of Laban did not overtake us
        for (const s of [s1, s2]) s.walk([gateIn, C(-20, 0)], 1.8).then(() => s.show(false));
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
        const angel = who('angel').place(...P(ROCK[0] + 7, ROCK[1] - 1), yawTo(P(ROCK[0] + 7, ROCK[1] - 1), hollow));
        angel.w.glow.value = 0;
        g.ui.fade(0, 0.6);
        await c.hold(c.until(() => (angel.w.glow.value = Math.min(0.85, angel.w.glow.value + 0.02)) >= 0.85));
        for (const n of ['laman', 'lemuel', 'sam']) who(n).face(...at(angel));
        g.view({ from: [...lerp(hollow, at(angel), -0.25), 2.2], to: [...at(angel), 1.6] });
        await c.verse('3:29');
        await c.verse('3:30');
        g.view(null);
        await c.hold(c.until(() => (angel.w.glow.value = Math.min(1.6, angel.w.glow.value + 0.03)) >= 1.6));
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
        who('laban').place(...fallen, 1.2).lie(true);
        who('zoram').place(...beforeTreasury, Math.PI).face(...C(IN_CITY.treasuryDoor[0] - 6, 0));
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
          return Math.hypot(g.player.x - fallen[0], g.player.z - fallen[1]) < 4.5;
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
        who('laban').place(...fallen, 1.2).lie(true);
        who('zoram').place(...beforeTreasury, Math.PI).face(...C(IN_CITY.treasuryDoor[0] - 6, 0));
      },
      async run(c) {
        await c.verse('4:7');
        await c.verse('4:8');
        await c.verse('4:9');
        await c.verse('4:10');
        await c.verse('4:11');
        await c.verse('4:12', '4:13');
        await c.verse('4:14');
        await c.verse('4:15', '4:16');
        await c.verse('4:17');
        await c.act(...fallen, 3.6, 'Obey the voice of the Spirit');
        await c.fade(1, 1.4);
        await c.card('Therefore I did obey the voice of the Spirit …', '1 Nephi 4:18');
        who('laban').show(false);
        g.dress('laban');
        await c.verse('4:19');
        await c.fade(0, 1.4);
        g.guidance.lead([me(), C(19.5, 14), C(19.5, 0), C(IN_CITY.treasuryDoor[0] - 6, -1), beforeTreasury]);
        await c.until(() => {
          if (g.auto) c.lead(g.guidance.point && { ...g.guidance.point, r: 1 });
          return Math.hypot(g.player.x - beforeTreasury[0], g.player.z - beforeTreasury[1]) < 6;
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
        await c.verse('4:20');
        await c.verse('4:21');
        await c.verse('4:22', '4:23');
        await c.verse('4:24');
        // he fetches the plates from the treasury
        await c.hold(zoram.walk([treasuryDoor], 1.4));
        zoram.show(false);
        await c.wait(1.6);
        zoram.place(...treasuryDoor, 0);
        g.props.carry('plates', zoram);
        await c.hold(zoram.walk([lerp(beforeTreasury, me(), 0.5)], 1.4));
        zoram.face(...me());
        await c.thought('Zoram brings out the plates of brass.');
        await c.verse('4:25');
        zoram.follow(g.player, 2.4, 1.2);
        await c.verse('4:26');
        c.objective('Go forth unto your brethren, who are without the walls.');
        c.toast(g.verses('4:27'), g.reference('4:27'), 9);
        await c.reach(...hide, 15, { via: [C(19.5, 1), C(-20, 0), gateIn, gateOut] });
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
        zoram.stop().walk([P(GATE[0] - 12, 6), gateOut, gateIn], 2.3);
        await c.verse('4:30');
        c.objective('Hold Zoram, that he should not flee.');
        await c.until(() => {
          c.lead({ x: zoram.x, z: zoram.z, r: 1.6 });
          return Math.hypot(zoram.x - g.player.x, zoram.z - g.player.z) < 2.2;
        });
        c.lead(null);
        c.objective(null);
        zoram.stop().face(...me());
        await c.verse('4:31');
        await c.verse('4:32');
        await c.verse('4:33');
        await c.verse('4:34');
        await c.verse('4:35');
        await c.verse('4:37');
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
