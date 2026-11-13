// Makes the recordings of the scripture that the game reads aloud (src/game/narration.js), with ElevenLabs.
// It needs a key in .env (ELEVENLABS_API_KEY=...), which stays on this machine: only the recordings are published.
//
//   node tools/narrate.mjs --voices                 the voices the account may use, with a link to hear each
//   node tools/narrate.mjs --sample --voice <id>    one short verse, into shots/narration/, to hear a voice by
//   node tools/narrate.mjs --say "some words" --as name --voice <id>   those words as written, into shots/narration/name.mp3
//   node tools/narrate.mjs --dry                    what would be made, and what it would cost, without making it
//   node tools/narrate.mjs --voice <id>             makes every recording there is not yet one of
//
// A card's recording is named for its reference (1-nephi-4-11-12.mp3) and listed in manifest.json with a mark of
// its words and voice, so a card is made again only if those change. Where the month's allowance will not cover
// every card, the key verses (KEY, below) are made first and then as many of the others as fit, the longest left
// out first, so that the fewest cards go unread. Run it again next month and it makes the ones left.
//   --voice <id> (or ELEVENLABS_VOICE_ID)   --model <id> (eleven_multilingual_v2)   --keep <n> credits back (300)
//   --left <n>: suppose n credits are left (with --dry, to see what a smaller allowance would leave out)
//   --plain: send the names as they are spelt, not as they are said (NAMES, below)
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const flag = (name, fallback) => (has(name) ? args[args.indexOf(`--${name}`) + 1] : fallback);

// .env, read by hand: KEY=value lines
const env = { ...process.env };
try {
  for (const line of fs.readFileSync(path.join(here, '.env'), 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m) env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  // (no .env)
}
const KEY_ = env.ELEVENLABS_API_KEY;
const voice = flag('voice', env.ELEVENLABS_VOICE_ID);
const model = flag('model', env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2');
const format = flag('format', 'mp3_44100_64');
const API = 'https://api.elevenlabs.io';

/** The verses that carry the story: made first, whatever else there is room for. */
const KEY = ['3:7', '3:15', '3:29', '4:1', '4:6', '4:10', '4:11', '4:12-4:13', '4:32', '4:33', '4:35', '5:8', '5:21'];
/** How the names are said, spelt so that a voice says them so. Sent in place of the names (unless --plain). */
const NAMES = { Nephi: 'Nee-fye', Lehi: 'Lee-hye', Laban: 'Lay-bun', Laman: 'Lay-mun', Lemuel: 'Lem-yool', Zoram: 'Zore-um', Sariah: 'Suh-rye-uh' };

const slug = (ref) => ref.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const spoken = (text) => (has('plain') ? text : text.replace(new RegExp(`\\b(${Object.keys(NAMES).join('|')})\\b`, 'g'), (n) => NAMES[n]));

// the cards, in the story's order: every verse or run of verses story.js quotes
const { verses, reference } = await import(path.join(here, 'src/game/scripture.js'));
const story = fs.readFileSync(path.join(here, 'src/game/story.js'), 'utf8');
const cards = [];
for (const m of story.matchAll(/verses?\('(\d+:\d+)'(?:, '(\d+:\d+)')?/g)) {
  const first = m[1];
  const last = m[2] ?? first;
  const ref = reference(first, last);
  if (cards.some((c) => c.ref === ref)) continue;
  const text = spoken(verses(first, last));
  cards.push({ id: first === last ? first : `${first}-${last}`, ref, key: slug(ref), text, mark: createHash('sha1').update(`${model}|${voice}|${text}`).digest('hex').slice(0, 12) });
}

const dir = path.join(here, 'public/audio/narration');
const manifestPath = path.join(dir, 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};

const call = async (url, options = {}) => {
  if (!KEY_) throw new Error('No key: put ELEVENLABS_API_KEY=... in .env (elevenlabs.io → Developers → API keys).');
  const r = await fetch(API + url, { ...options, headers: { 'xi-api-key': KEY_, 'Content-Type': 'application/json', ...options.headers } });
  if (!r.ok) throw new Error(`${r.status} from ${url}: ${(await r.text()).slice(0, 400)}`);
  return r;
};
const speak = async (text, to) => {
  const r = await call(`/v1/text-to-speech/${voice}?output_format=${format}`, {
    method: 'POST',
    body: JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0, speed: 0.95 } }),
  });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, Buffer.from(await r.arrayBuffer()));
};

try {
  if (has('voices')) {
    const { voices } = await (await call('/v2/voices?page_size=100')).json();
    for (const v of voices) console.log(`${v.voice_id}  ${v.name.padEnd(28)} ${v.category.padEnd(10)} ${Object.values(v.labels ?? {}).join(', ')}\n    ${v.preview_url ?? ''}`);
    console.log(`\n${voices.length} voices. The links play a sample of each, at no cost.`);
    process.exit(0);
  }

  for (const id of KEY) if (!cards.some((c) => c.id === id)) console.warn(`(a key verse the story does not quote: ${id})`);
  const todo = cards.filter((c) => manifest[c.key] !== c.mark || !fs.existsSync(path.join(dir, `${c.key}.mp3`)));
  const total = todo.reduce((n, c) => n + c.text.length, 0);
  console.log(`${cards.length} cards in the story; ${cards.length - todo.length} already made; ${todo.length} to make, ${total} characters.`);

  if (has('say')) {
    // a few words of your own, as they are written, to try how something is said
    if (!voice) throw new Error('Say which voice: --voice <id> (see --voices).');
    const to = path.join(here, 'shots/narration', `${flag('as', 'say')}.mp3`);
    await speak(flag('say'), to);
    console.log(`${flag('say').length} characters → ${to}`);
    process.exit(0);
  }
  if (has('sample')) {
    if (!voice) throw new Error('Say which voice: --voice <id> (see --voices).');
    const card = cards.find((c) => c.id === flag('verse', '4:1')) ?? cards[0];
    const to = path.join(here, 'shots/narration', `${voice}-${card.key}.mp3`);
    await speak(card.text, to);
    console.log(`${card.ref} (${card.text.length} characters) → ${to}`);
    process.exit(0);
  }

  // what the month has left
  let left = has('left') ? Number(flag('left')) : Infinity;
  if (has('left')) console.log(`Supposing ${left} credits left.`);
  else if (KEY_) {
    try {
      const sub = await (await call('/v1/user/subscription')).json();
      left = sub.character_limit - sub.character_count;
      const reset = sub.next_character_count_reset_unix ? new Date(sub.next_character_count_reset_unix * 1000).toDateString() : 'unknown';
      console.log(`Plan: ${sub.tier}. ${left} of ${sub.character_limit} credits left; they come again on ${reset}.`);
    } catch (e) {
      // (a key that may not read the account: then say what is left with --left, or the free plan's whole month is supposed)
      if (!/user_read/.test(e.message)) throw e;
      left = 10000;
      console.log(`The key may not read the account, so ${left} credits are supposed (say otherwise with --left <n>).`);
    }
  } else console.log('No key in .env, so the allowance is not known: this is only the list.');
  const budget = left - Number(flag('keep', '300'));

  // the key verses, then the rest; where they do not all fit, the longest of the rest are left for next time
  const isKey = (c) => KEY.includes(c.id);
  const chosen = todo.filter(isKey);
  let cost = chosen.reduce((n, c) => n + c.text.length, 0);
  const left_out = [];
  const rest = todo.filter((c) => !isKey(c));
  let over = cost + rest.reduce((n, c) => n + c.text.length, 0) - budget;
  const byLength = [...rest].sort((a, b) => b.text.length - a.text.length);
  const dropped = new Set();
  for (const c of byLength) {
    if (over <= 0) break;
    dropped.add(c);
    over -= c.text.length;
  }
  for (const c of rest) (dropped.has(c) ? left_out : chosen).push(c);
  cost = chosen.reduce((n, c) => n + c.text.length, 0);
  if (cost > budget) throw new Error(`Even the key verses (${cost} characters) are more than is left (${budget}).`);
  console.log(`Making ${chosen.length} (${cost} characters)${left_out.length ? `; leaving ${left_out.length} for next time: ${left_out.map((c) => c.ref.replace('1 Nephi ', '')).join(', ')}` : ''}.`);
  if (has('dry') || !KEY_) process.exit(0);
  if (!voice) throw new Error('Say which voice: --voice <id> (see --voices).');

  fs.mkdirSync(dir, { recursive: true });
  for (const c of chosen) {
    await speak(c.text, path.join(dir, `${c.key}.mp3`));
    manifest[c.key] = c.mark;
    // (written as it goes, so a run that stops half way keeps what it made)
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 1)}\n`);
    console.log(`  ${c.ref}`);
  }
  console.log('Done. npm run build, and push.');
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
