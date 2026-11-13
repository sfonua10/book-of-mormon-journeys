// Checks that every card that shows less than a whole verse shows the verse's own words: each excerpt's pieces
// (between its "…") are found in the verse, in order; and each verse with a word left out, with the right word put
// back, is an excerpt of its verse too. Fails if one is not.
//   node tools/excerpts.mjs
import { BLANKS, EXCERPTS, VERSES } from '../src/game/scripture-daniel.js';

let bad = 0;
/** Whether `text` is the verse's own words in order, with "…" where any are left out. */
function check(name, verse, text) {
  const whole = VERSES[verse];
  if (!whole) {
    console.log(`${name}: no verse ${verse}`);
    bad++;
    return;
  }
  let from = 0;
  for (const piece of text.split('…').map((p) => p.trim()).filter(Boolean)) {
    const at = whole.indexOf(piece, from);
    if (at < 0) {
      console.log(`${name} (${verse}): not the verse's words, or not in its order: "${piece}"`);
      bad++;
      return;
    }
    from = at + piece.length;
  }
  if (!text.includes('…') && text !== whole) {
    console.log(`${name} (${verse}): shorter than the verse, but nothing marks where`);
    bad++;
    return;
  }
  console.log(`${name} (${verse}): the verse's own words`);
}
for (const [key, e] of Object.entries(EXCERPTS)) check(key, e.verse, e.text);
for (const [key, b] of Object.entries(BLANKS)) {
  if ((b.text.match(/_____/g) ?? []).length !== 1) {
    console.log(`${key}: should have one word left out`);
    bad++;
    continue;
  }
  check(`${key} (filled)`, b.verse, b.text.replace('_____', b.answers[b.right]));
}
console.log(bad ? `${bad} wrong` : 'all are the scripture as written');
process.exit(bad ? 1 : 0);
