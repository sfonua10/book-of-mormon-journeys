// Checks the list of journeys (the first screen), headless, against dist/: that it lists the first journey and the
// one to come, that a place kept before there were other journeys is brought over and gone on from, and that the end
// of a journey marks it finished and leads back to the list.
//
//   npm run build && node tools/journeys.mjs [--shots]
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { guard } from './no-pointer-lock.mjs';

guard(chromium);
const here = resolve(fileURLToPath(import.meta.url), '..', '..');
const shots = process.argv.includes('--shots');
const out = resolve(here, 'shots/journeys');
if (shots) mkdirSync(out, { recursive: true });

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
const base = `http://127.0.0.1:${server.address().port}/`;
const common = 'step&nosound&dpr=1&quality=low';

const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  headless: true,
  args: ['--mute-audio', '--ignore-gpu-blocklist', `--use-angle=${process.platform === 'darwin' ? 'metal' : 'd3d11'}`, '--enable-gpu'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const problems = [];
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`error: ${m.text().slice(0, 600)}`);
});
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));

let failed = 0;
const check = (name, ok, got = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${ok || got === '' ? '' : `  (got ${JSON.stringify(got)})`}`);
};
const ready = () => page.waitForFunction(() => window.__tg?.ready, null, { timeout: 120000 });
const open = async (query = '') => {
  await page.goto(`${base}?${common}${query ? `&${query}` : ''}`);
  await ready();
};
/** What the list shows: its heading, and each journey's title, buttons and whether it is only to come. */
const list = () =>
  page.evaluate(() => ({
    on: document.querySelector('#g-title')?.classList.contains('on'),
    heading: document.querySelector('#g-title h1')?.textContent,
    items: [...document.querySelectorAll('#g-title .journeys li')].map((li) => ({
      soon: li.classList.contains('soon'),
      title: li.querySelector('h2').textContent,
      no: li.querySelector('.no').textContent,
      buttons: [...li.querySelectorAll('button')].map((b) => b.textContent),
    })),
  }));
const keys = () => page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
const ticks = (n) =>
  page.evaluate(async (count) => {
    for (let i = 0; i < count; i++) {
      window.__tg.tick(1 / 30);
      await new Promise((r) => setTimeout(r, 0));
    }
  }, n);

// 1. nothing kept: the list, the first journey to begin, the next one only told of
await open();
await page.evaluate(() => localStorage.clear());
await open();
let l = await list();
check('the list is the first screen', l.on === true && l.heading === 'Book of Mormon Journeys', l.heading);
check('the page is named for the game', (await page.title()) === 'Book of Mormon Journeys', await page.title());
check('two journeys are listed', l.items.length === 2, l.items.length);
check('the first can be begun', l.items[0]?.title === 'I Will Go and Do' && l.items[0].buttons.join('|') === 'Begin', l.items[0]);
check('the next is coming, with no button', l.items[1]?.soon && l.items[1].buttons.length === 0 && /Coming next week/.test(l.items[1].no), l.items[1]);
if (shots) await page.screenshot({ path: join(out, '1-list.png') });

// 2. a place kept under the old key is brought over, and can be gone on from
await page.evaluate(() => localStorage.setItem('nephi-plates:beat', 'a2'));
await open();
l = await list();
let k = await keys();
check('the old place is offered', /^Continue · /.test(l.items[0]?.buttons[0] ?? '') && l.items[0].buttons[1] === 'Start over', l.items[0]?.buttons);
check('it is kept under the new key', k['bom-journeys:plates-of-brass:beat'] === 'a2' && !('nephi-plates:beat' in k), k);
if (shots) await page.screenshot({ path: join(out, '2-continue.png') });
await page.click('#g-title button[data-go="continue"]');
await ticks(5);
check('Continue goes on from there', (await page.evaluate(() => window.__tg.director.beat)) === 'a2', await page.evaluate(() => window.__tg.director.beat));

// 3. Start over begins at the beginning
await open();
await page.click('#g-title button[data-go="begin"]');
await ticks(5);
check('Start over begins at the first beat', (await page.evaluate(() => window.__tg.director.beat)) === 'a1', await page.evaluate(() => window.__tg.director.beat));

// 4. the end of the journey: its own words, marked finished, and back to the list
await open('auto&beat=home');
let ended = false;
for (let i = 0; i < 60 && !ended; i++) {
  await ticks(60);
  ended = await page.evaluate(() => window.__tg.director.ended);
}
check('the last beat ends', ended);
const end = await page.evaluate(() => ({
  on: document.querySelector('#g-end')?.classList.contains('on'),
  heading: document.querySelector('#g-end h1')?.textContent,
  links: document.querySelectorAll('#g-end a').length,
  buttons: [...document.querySelectorAll('#g-end button')].map((b) => b.textContent),
}));
check("the end screen has the journey's words", end.on && end.heading === 'The Lord Prepared a Way' && end.links === 3, end);
check('and the ways on', end.buttons.join('|') === 'Back to journeys|Play again', end.buttons);
k = await keys();
check('the journey is marked finished, its place forgotten', k['bom-journeys:plates-of-brass:done'] === '1' && !('bom-journeys:plates-of-brass:beat' in k), k);
if (shots) await page.screenshot({ path: join(out, '3-end.png') });
await Promise.all([page.waitForNavigation(), page.click('#g-end button[data-go="back"]')]);
await ready();
l = await list();
check('Back to journeys shows the list', l.on === true && !/[?&](auto|beat|story|go)\b/.test(page.url()), page.url());
check('with the journey ticked, to play again', /Finished/.test(l.items[0]?.no ?? '') && l.items[0].buttons.join('|') === 'Play again', l.items[0]);
if (shots) await page.screenshot({ path: join(out, '4-finished.png') });

// 5. a journey there is not falls back to the first; one asked for with ?go begins without the list
await open('story=nonsense');
l = await list();
check('an unknown ?story shows the list', l.on === true && l.items.length === 2, l);
await open('story=plates-of-brass&go=begin');
await ticks(5);
const went = await page.evaluate(() => ({ beat: window.__tg.director.beat, list: document.querySelector('#g-title')?.classList.contains('on') }));
check('?go=begin begins at once', went.beat === 'a1' && !went.list && !/[?&]go=/.test(page.url()), { ...went, url: page.url() });

check('no errors on the page', problems.length === 0, problems);
await browser.close();
server.close();
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
