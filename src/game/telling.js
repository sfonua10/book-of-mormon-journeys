// How a story shows its scripture, when the verses are kept as scripture-daniel.js keeps them: whole (VERSES), in
// parts (EXCERPTS), under the name of who speaks (SAID, and an excerpt's `who`), and with a word left out (BLANKS).
// These are the few lines every beat of such a story uses; daniel.js has its own copies of them, as it was written.
//
// What is said is a card, read before the story goes on, under the name of who says it. What is only done is a line
// low on the screen, read while the story goes on.

/**
 * @param g the game (main.js): its reference(verse), verses(verse), flag(name), log(message)
 * @param tables { EXCERPTS, BLANKS, SAID } of the story's book
 */
export function telling(g, { EXCERPTS, BLANKS, SAID }) {
  /** A card of part of a verse (EXCERPTS), read before the story goes on: under the speaker's name, if it is said. */
  const part = (c, key) => c.card(EXCERPTS[key].text, g.reference(EXCERPTS[key].verse), { voice: EXCERPTS[key].voice, who: EXCERPTS[key].who ?? '' });
  /** A verse whole, as a card: under the speaker's name, where the whole of it is what one of them says (SAID). */
  const verse = (c, v) => c.verse(v, v, { who: SAID[v] ?? '' });
  /** A line low on the screen, read while the story goes on: a whole verse, or part of one. */
  const line = (c, v) => c.line(g.verses(v), g.reference(v));
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
  return { part, verse, line, lineOf, fill };
}
