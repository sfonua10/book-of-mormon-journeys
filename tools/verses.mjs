// Prints verses of the King James Version as entries for a table of verses (src/game/scripture-daniel.js), from the
// text as published: Project Gutenberg eBook #10, "The King James Version of the Bible" (public domain), saved to a
// file. So the game's verses are copied by a program from the text, and not typed.
//   curl -L -o pg10.txt https://www.gutenberg.org/cache/epub/10/pg10.txt
//   node tools/verses.mjs pg10.txt "The Book of Daniel" 6            # a chapter
//   node tools/verses.mjs pg10.txt "The Book of Daniel" 6:10 6:22    # verses
//   node tools/verses.mjs pg10.txt "The Gospel According to Saint Luke" 23:4 --book Luke
// The book is named as the text heads it (its list of books is at its top). With --book the keys carry the book's
// name ("Luke 23:4"), for a table of verses from more than one book. With --check <module> <export> nothing is
// printed but what differs between the text and that table (every verse of it, keyed 'ch:v'), and it fails if any
// does.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const take = (flag, n = 1) => {
  const i = args.indexOf(flag);
  return i < 0 ? null : args.splice(i, n + 1).slice(1);
};
const named = take('--book')?.[0] ?? '';
const check = take('--check', 2);
const [file, heading, ...wanted] = args;
if (!file || !heading) {
  console.log('usage: node tools/verses.mjs <pg10.txt> "<the book, as the text heads it>" [chapter | chapter:verse …] [--book Name] [--check module export]');
  process.exit(1);
}

/** The book's verses, 'ch:v' → text, from where the text heads it (the second time: the first is its list of books). */
function book(text, heading) {
  const lines = text.replace(/\r/g, '').split('\n');
  const heads = lines.flatMap((line, i) => (line.trim() === heading ? [i] : []));
  if (heads.length < 2) throw new Error(`no book headed "${heading}" in ${file}`);
  const verses = {};
  let paragraph = [];
  const flush = () => {
    const joined = paragraph.join(' ').replace(/\s+/g, ' ').trim();
    paragraph = [];
    if (!/^\d+:\d+ /.test(joined)) return true;
    // (a paragraph may hold more than one verse)
    const marks = [...joined.matchAll(/(?:^| )(\d+:\d+) /g)];
    for (let k = 0; k < marks.length; k++) {
      const key = marks[k][1];
      // (the next book has begun: its first chapter's first verse)
      if (key in verses) return false;
      const from = marks[k].index + marks[k][0].length;
      verses[key] = joined.slice(from, k + 1 < marks.length ? marks[k + 1].index : undefined).trim();
    }
    return true;
  };
  for (let i = heads[1] + 1; i < lines.length; i++) {
    if (lines[i].trim()) paragraph.push(lines[i]);
    else if (paragraph.length && !flush()) break;
  }
  return verses;
}

const verses = book(readFileSync(file, 'utf8'), heading);

if (check) {
  const table = (await import(pathToFileURL(resolve(check[0])).href))[check[1]];
  let bad = 0;
  for (const [key, text] of Object.entries(table)) {
    if (verses[key] === text) continue;
    bad++;
    console.log(`${key} differs:\n  the text:  ${verses[key] ?? '(no such verse)'}\n  the table: ${text}`);
  }
  console.log(bad ? `${bad} differ from the text` : `all ${Object.keys(table).length} verses are as the text has them`);
  process.exit(bad ? 1 : 0);
}

const keys = Object.keys(verses).filter((key) => !wanted.length || wanted.some((w) => (w.includes(':') ? key === w : key.startsWith(`${w}:`))));
if (!keys.length) {
  console.log(`none of ${wanted.join(', ')} in "${heading}"`);
  process.exit(1);
}
for (const key of keys) console.log(`  '${named ? `${named} ` : ''}${key}': ${JSON.stringify(verses[key])},`);
