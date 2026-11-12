// The people of Jerusalem, by day: a few in the streets and at the gate, going about their own business, who say
// nothing (the account gives them no words). By night the streets are empty, as Nephi found them (4:5).
// Each is one of the cast (npc.js), walking to and fro between two places or standing where he is put.
import { GATE } from './places.js';

// What they wear: tunics and robes of undyed and plainly dyed wool, a cloth on the head. None has a mantle (the
// cloth of one is worked out every frame, and there are ten of them).
const wool = (lit, shade, hem, trim) => ({
  SHIRT: [lit, shade],
  TROUSERS: [lit.map((v) => v * 0.95), shade],
  SKIRT: [lit, shade],
  TRIM: [trim, trim.map((v) => v * 0.6)],
  HAT: [[0.8, 0.74, 0.62].map((v, i) => v * (0.85 + 0.15 * lit[i])), [0.46, 0.42, 0.44]],
  BELT: [[0.4, 0.28, 0.17], [0.2, 0.14, 0.11]],
  OUTFIT: { head: 'cloth', cloak: false, hem, edge: 0, bare: 0, belt: 2, cuffs: 0, lace: 0.3, blade: 0 },
});
export const TOWN_CLOTHES = [
  wool([0.74, 0.66, 0.52], [0.42, 0.37, 0.37], 0.5, [0.44, 0.3, 0.2]),
  wool([0.58, 0.42, 0.3], [0.32, 0.22, 0.2], 0.13, [0.8, 0.7, 0.5]),
  wool([0.44, 0.5, 0.56], [0.22, 0.26, 0.36], 0.13, [0.78, 0.72, 0.6]),
  wool([0.82, 0.78, 0.68], [0.5, 0.47, 0.5], 0.45, [0.5, 0.2, 0.18]),
  wool([0.56, 0.52, 0.34], [0.3, 0.28, 0.22], 0.13, [0.36, 0.26, 0.16]),
];
/** Who they are, for the cast: [name, which of TOWN_CLOTHES, bearded]. */
export const TOWNSFOLK = Array.from({ length: 10 }, (_, i) => [`town${i}`, i % TOWN_CLOTHES.length, i % 3 !== 1]);

export function createTown(g) {
  const { P, C } = g;
  // Where each goes. Two places: he walks from one to the other and back, stopping a while at each. One: he stands
  // there, facing the second point. (None of them uses the street before Laban's house, where the story happens.)
  const WAYS = [
    { walk: [C(-56, -1.9), C(52, -1.9)], pace: 1.25 },
    { walk: [C(44, 2.0), C(-52, 2.0)], pace: 1.4 },
    { walk: [C(-27, -40), C(-27, 38)], pace: 1.2 },
    { walk: [C(20.5, -38), C(20.5, -7)], pace: 1.3 },
    { stand: C(-53, 8), face: C(-51.6, 8.9) },
    { stand: C(-51.6, 8.9), face: C(-53, 8) },
    { walk: [C(-50, 1.6), P(GATE[0] - 24, 3)], pace: 1.35 },
    { stand: C(-9, 3.0), face: C(-9, -3) },
    { stand: C(31, -2.7), face: C(32.3, -2.2) },
    { stand: C(32.3, -2.2), face: C(31, -2.7) },
  ];
  // (which day this is: a walker whose day has ended does not set out again)
  let day = 0;
  const people = () => TOWNSFOLK.map(([name]) => g.cast.get(name));

  return {
    /** The streets as they are by day. */
    day() {
      const mine = ++day;
      people().forEach((npc, i) => {
        const way = WAYS[i];
        if (way.stand) return void npc.place(...way.stand, 0).face(...way.face);
        // he sets out from somewhere along his way, so the street is not empty at its ends
        const [a, b] = way.walk;
        const t = (i * 0.37) % 1;
        npc.place(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, Math.atan2(b[0] - a[0], b[1] - a[1]));
        let to = 1;
        const go = async () => {
          while (mine === day) {
            await npc.walk([way.walk[to]], way.pace);
            if (mine !== day) return;
            // (he stops a while where he was going: a few seconds, not the same for each)
            await new Promise((done) => {
              npc.arrive = done;
              npc.rest = 3 + ((i * 1.7) % 4);
            });
            to = 1 - to;
          }
        };
        go();
      });
    },
    /** The streets as they are by night: no one. (The cast's own clear() has taken them in.) */
    night() {
      day++;
    },
    /** Everyone stops where he is and turns to look at Nephi: something is happening in the street. */
    watch() {
      for (const npc of people()) {
        if (!npc.visible) continue;
        if (npc.mode === 'walk') {
          day++;
          npc.stop();
        }
        npc.face(g.player.x, g.player.z);
      }
    },
  };
}
