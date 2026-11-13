// Checks that every card that shows less than a whole verse shows the verse's own words: each excerpt's pieces
// (between its "…") are found in the verse, in order; and each verse with a word left out, with the right word put
// back, is an excerpt of its verse too. A card under a speaker's name (`who`) need not mark with "…" what it leaves
// off, the name standing in its place: for each of those, the words left off are listed, to be read over. The
// verses set side by side at the end of the Daniel 6 journey (PAIRS: Daniel 6 beside the Gospels) are checked the
// same way, each against its own verse. Fails if one is not the verse's words.
//   node tools/excerpts.mjs
import { BLANKS, EXCERPTS, GOSPELS, PAIRS, SAID, SPEAKERS, VERSES as DANIEL } from '../src/game/scripture-daniel.js';

// (every verse a card may quote: Daniel's by chapter and verse, the Gospels' by book as well)
const VERSES = { ...DANIEL, ...GOSPELS };

let bad = 0;
const names = new Set(Object.values(SPEAKERS));
/** Whether `text` is the verse's own words in order, with "…" where any are left out (or, under a name, without). */
function check(name, verse, text, who = '') {
  const whole = VERSES[verse];
  if (!whole) {
    console.log(`${name}: no verse ${verse}`);
    bad++;
    return;
  }
  if (who && !names.has(who)) {
    console.log(`${name} (${verse}): "${who}" is not one of the speakers`);
    bad++;
    return;
  }
  let from = 0;
  const left = [];
  for (const piece of text.split('…').map((p) => p.trim()).filter(Boolean)) {
    const at = whole.indexOf(piece, from);
    if (at < 0) {
      console.log(`${name} (${verse}): not the verse's words, or not in its order: "${piece}"`);
      bad++;
      return;
    }
    if (whole.slice(from, at).trim()) left.push(whole.slice(from, at).trim());
    from = at + piece.length;
  }
  if (whole.slice(from).trim()) left.push(whole.slice(from).trim());
  if (!who && !text.includes('…') && text !== whole) {
    console.log(`${name} (${verse}): shorter than the verse, but nothing marks where`);
    bad++;
    return;
  }
  console.log(`${name} (${verse}): the verse's own words${who ? `, under "${who}"; left off: ${left.length ? left.map((l) => `"${l}"`).join(' … ') : 'nothing'}` : ''}`);
}
for (const [key, e] of Object.entries(EXCERPTS)) check(key, e.verse, e.text, e.who);
for (const [key, b] of Object.entries(BLANKS)) {
  if ((b.text.match(/_____/g) ?? []).length !== 1) {
    console.log(`${key}: should have one word left out`);
    bad++;
    continue;
  }
  check(`${key} (filled)`, b.verse, b.text.replace('_____', b.answers[b.right]), b.who);
  if (b.said && !(EXCERPTS[b.said]?.verse === b.verse && EXCERPTS[b.said].who === b.who)) {
    console.log(`${key}: "${b.said}" is not what ${b.who} says in ${b.verse}`);
    bad++;
  }
}
PAIRS.forEach(([a, b], i) => {
  check(`pair ${i + 1}, Daniel`, a.verse, a.text);
  check(`pair ${i + 1}, beside it`, b.verse, b.text);
});
// (a verse shown whole under a name is nothing but the verse)
for (const [verse, who] of Object.entries(SAID)) check(`${verse} (whole)`, verse, VERSES[verse] ?? '', who);
console.log(bad ? `${bad} wrong` : 'all are the scripture as written');
process.exit(bad ? 1 : 0);
