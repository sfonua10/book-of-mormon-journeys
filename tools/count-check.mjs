// Checks what leaves the page (src/game/tally.js). The last of a journey is played with the autopilot, headless:
//   once as a test plays it (?auto): nothing may be counted, and nothing sent to any other host (Umami's script is
//   asked for, as index.html asks for it, and on this address it must count nothing);
//   once with ?count=log: the counts are written to the console in their order (the journey gone on with, the act
//   reached, its end), the end's question is answered and a note written and sent, and still nothing is sent;
//   and once left before its end, which is counted once.
//   node tools/count-check.mjs [--story fiery-furnace] [--beat a3-walls] [--limit 900] [--out shots/count]
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { guard } from './no-pointer-lock.mjs';

guard(chromium);
const here = resolve(fileURLToPath(import.meta.url), '..', '..');
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const story = flag('story', '');
const beat = flag('beat', 'a3-walls');
const limit = Number(flag('limit', '900')); // seconds of story time
const out = resolve(here, flag('out', 'shots/count'));
mkdirSync(out, { recursive: true });

const root = resolve(here, 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.ogg': 'audio/ogg', '.glb': 'model/gltf-binary' };
const server = createServer((req, res) => {
  let file = normalize(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(root) || !existsSync(file)) return void res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/?step&auto&nosound&dpr=1&quality=low&beat=${beat}${story ? `&story=${story}` : ''}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  headless: true,
  args: ['--mute-audio', '--ignore-gpu-blocklist', `--use-angle=${process.platform === 'darwin' ? 'metal' : 'd3d11'}`, '--enable-gpu'],
});

const SCRIPT = 'https://cloud.umami.is/script.js';
const failures = [];
const fail = (why) => {
  failures.push(why);
  console.log(`FAIL  ${why}`);
};

/** Plays from the beat to the journey's end; gives the page, the lines it counted and the hosts it asked anything of. */
async function play(query, size = { width: 1280, height: 720 }) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  const counted = [];
  const abroad = [];
  page.on('console', (m) => {
    const text = m.text();
    if (/^\[game\] (count|note) /.test(text)) counted.push(text.slice(7));
  });
  page.on('pageerror', (e) => fail(`pageerror: ${e.message}`));
  page.on('request', (r) => {
    const host = new URL(r.url()).hostname;
    // (Umami's script itself is asked for by index.html; anything else to another host is something sent)
    if (host && host !== '127.0.0.1' && r.url() !== SCRIPT) abroad.push(`${r.method()} ${r.url()}`);
  });
  await page.goto(`${base}${query}`);
  await page.waitForFunction(() => window.__tg?.ready, null, { timeout: 120000 });
  let ended = false;
  for (let simulated = 0; simulated < limit && !ended; simulated += 3) {
    ended = await page.evaluate(async () => {
      const tg = window.__tg;
      for (let i = 0; i < 90; i++) {
        tg.tick(1 / 30);
        await new Promise((r) => setTimeout(r, 0));
      }
      return tg.director.ended && !!document.querySelector('#g-end.on');
    });
  }
  if (!ended) fail(`${query || '(as a test)'}: did not reach the journey's end`);
  return { page, counted, abroad };
}

// ---- as a test plays it: nothing counted, nothing asked of another host ------------------------------------------
{
  const { page, counted, abroad } = await play('');
  if (counted.length) fail(`a test's play was counted: ${counted.join(' | ')}`);
  if (abroad.length) fail(`a test's play sent to another host: ${abroad.join(' | ')}`);
  if (await page.locator('#g-end .heard').count()) fail('the end asks its question where nothing is counted');
  console.log(`as a test: ${counted.length} counts, ${abroad.length} requests to other hosts`);
  await page.close();
}

// ---- with ?count=log: the counts in their order, the question answered, a note written and sent -------------------
{
  const { page, counted, abroad } = await play('&count=log&utm_source=Check!');
  for (const line of counted) console.log(`  ${line}`);
  const wanted = [/^count start \/[a-z0-9-]+ .*"go":"continue".*"from":"check"/, /^count end .*"minutes":\d+/];
  let at = 0;
  for (const want of wanted) {
    const found = counted.findIndex((line, i) => i >= at && want.test(line));
    if (found < 0) fail(`not counted, or out of its order: ${want}`);
    else at = found + 1;
  }
  if (counted.some((line) => line.startsWith('count left'))) fail('a journey played to its end was counted as left');

  // the question: one tap, counted, and the answers give place to thanks
  await page.click('#g-end [data-enjoyed="yes"]');
  if (!counted.some((line) => /^count enjoyed .*"answer":"yes"/.test(line))) fail('the answer to the question was not counted');
  if (await page.locator('#g-end [data-enjoyed]').count()) fail('the answers stayed after one was tapped');

  // a note: written with the keys the game takes for itself (space, e, enter is not sent), and sent
  await page.click('#g-note');
  await page.keyboard.type('We read it together, and we were glad.');
  const written = await page.inputValue('#g-note');
  if (written !== 'We read it together, and we were glad.') fail(`the note was not written as typed: "${written}"`);
  if (!(await page.locator('#g-end.on').count())) fail('writing a note left the end screen');
  await page.screenshot({ path: join(out, 'end.png'), fullPage: false });
  await page.click('#g-end form.note button');
  await page.waitForFunction(() => !document.querySelector('#g-end form.note textarea'), null, { timeout: 5000 }).catch(() => fail('the note box stayed after it was sent'));
  if (!counted.some((line) => /^note \S+ 38 characters$/.test(line))) fail('the note was not sent');
  if (!counted.some((line) => line.startsWith('count note'))) fail('that a note was sent was not counted');
  if (abroad.length) fail(`with ?count=log something was sent to another host: ${abroad.join(' | ')}`);
  await page.close();
}

// ---- left before its end: counted once, with the beat it was left at ---------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const counted = [];
  page.on('console', (m) => {
    const text = m.text();
    if (text.startsWith('[game] count ')) counted.push(text.slice(7));
  });
  await page.goto(`${base}&count=log`);
  await page.waitForFunction(() => window.__tg?.ready, null, { timeout: 120000 });
  await page.evaluate(async () => {
    for (let i = 0; i < 30; i++) {
      window.__tg.tick(1 / 30);
      await new Promise((r) => setTimeout(r, 0));
    }
    dispatchEvent(new Event('pagehide'));
    dispatchEvent(new Event('pagehide'));
  });
  const left = counted.filter((line) => line.startsWith('count left'));
  if (left.length !== 1 || !left[0].includes(`"at":"${beat}"`)) fail(`leaving at ${beat} was counted ${left.length} times: ${left.join(' | ')}`);
  else console.log(`  ${left[0]}`);
  await page.close();
}

await browser.close();
server.close();
console.log(failures.length ? `${failures.length} failed` : 'what is counted is as it should be');
process.exit(failures.length ? 1 : 0);
