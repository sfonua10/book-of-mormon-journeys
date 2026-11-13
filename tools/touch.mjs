// Checks the touch controls on a phone-sized, touch-only page, the clock stepped by hand: the list of journeys is
// tapped, cards are tapped through, the thumb stick walks, a drag looks, the run button toggles.
//   CHROME=... node tools/touch.mjs [--out shots/touch] [--size 844x390]
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = resolve(fileURLToPath(import.meta.url), '..', '..');
const args = process.argv.slice(2);
const flag = (name, fallback) => (args.indexOf(`--${name}`) >= 0 ? args[args.indexOf(`--${name}`) + 1] : fallback);
const out = resolve(here, flag('out', 'shots/touch'));
const [width, height] = flag('size', '844x390').split('x').map(Number);
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
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  headless: true,
  args: ['--mute-audio', '--ignore-gpu-blocklist', `--use-angle=${process.platform === 'darwin' ? 'metal' : 'd3d11'}`, '--enable-gpu'],
});
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await context.newPage();
const problems = [];
page.on('console', (m) => (m.type() === 'error' ? problems.push(m.text().slice(0, 600)) : null));
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
await page.goto(`http://127.0.0.1:${server.address().port}/?step&nosound&dpr=1`);
await page.waitForFunction(() => window.__tg?.ready, null, { timeout: 120000 });
const cdp = await context.newCDPSession(page);
const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([x, y], id) => ({ x, y, id })) });
const ticks = (n) =>
  page.evaluate(async (count) => {
    for (let i = 0; i < count; i++) {
      window.__tg.tick(1 / 30);
      await new Promise((r) => setTimeout(r, 0));
    }
  }, n);
const state = () =>
  page.evaluate(() => {
    const tg = window.__tg;
    return { x: tg.player.x, z: tg.player.z, yaw: tg.follow.yaw, frozen: tg.director.frozen, card: !!document.querySelector('#g-card.on'), sprint: tg.input.touch?.sprint, touch: document.body.classList.contains('touch'), locked: !!document.pointerLockElement };
  });
const fails = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) fails.push(what);
};

check((await state()).touch, 'the page knows it is played by touch');
await page.screenshot({ path: join(out, '1-journeys.png') });
await page.tap('#g-title button[data-id="plates-of-brass"][data-go]');
await ticks(60);
// tap through the cards the journey opens with
let read = 0;
for (let i = 0; i < 120; i++) {
  const s = await state();
  if (read && !s.frozen && !s.card) break;
  if (s.card) {
    if (read === 0) await page.screenshot({ path: join(out, '2-card.png') });
    await ticks(20);
    // (on the card, then off it: either goes on)
    await page.touchscreen.tap(read % 2 ? width * 0.7 : width * 0.5, read % 2 ? height * 0.3 : height * 0.8);
    read++;
  }
  await ticks(20);
}
check(read > 0, `cards go on at a tap (${read} read)`);
const a = await state();
check(!a.frozen, 'the story hands over to the player');
check(!a.locked, 'the mouse is not asked for');

await touch('touchStart', [[150, 260]]);
await touch('touchMove', [[150, 190]]);
await ticks(75);
await page.screenshot({ path: join(out, '3-walking.png') });
const b = await state();
await touch('touchEnd', []);
const walked = Math.hypot(b.x - a.x, b.z - a.z);
check(walked > 3, `the thumb stick walks (${walked.toFixed(1)} m in 2.5 s)`);

await touch('touchStart', [[600, 200]]);
await touch('touchMove', [[660, 200]]);
await touch('touchMove', [[720, 200]]);
await ticks(5);
await touch('touchEnd', []);
const c = await state();
check(Math.abs(c.yaw - b.yaw) > 0.3, `a drag on the right looks round (${(c.yaw - b.yaw).toFixed(2)} rad)`);
await ticks(30);
const d = await state();
check(Math.hypot(d.x - c.x, d.z - c.z) < 1.5, 'he stops when the thumb lifts');

await page.tap('#t-run');
check((await state()).sprint === true, 'the run button turns running on');
await page.tap('#t-run');
check((await state()).sprint === false, 'and off again');

// the prompt to act is tapped, as E is pressed
{
  const at = await page.evaluate(() => window.__tg.director.interactable);
  check(!!at, 'there is something to act on');
  if (at) {
    await page.evaluate(({ x, z }) => window.__tg.standAt(x, z + 0.6), at);
    await ticks(20);
    await page.screenshot({ path: join(out, '4-prompt.png') });
    const shown = await page.evaluate(() => document.querySelector('#g-prompt.on')?.textContent ?? '');
    check(shown.startsWith('Tap'), `the prompt says to tap ("${shown}")`);
    await page.tap('#g-prompt');
    await ticks(30);
    check((await state()).frozen, 'a tap on the prompt acts');
  }
}

// the questions about Zoram, in the treasury: an answer is tapped to take it
await page.goto(`http://127.0.0.1:${server.address().port}/?step&nosound&dpr=1&beat=a3-treasury`);
await page.waitForFunction(() => window.__tg?.ready, null, { timeout: 120000 });
const look = () =>
  page.evaluate(() => {
    const d = window.__tg.director;
    return { answers: document.querySelectorAll('#g-card.on .answer').length, card: !!document.querySelector('#g-card.on'), prompt: !!document.querySelector('#g-prompt.on'), near: d.interactable, goal: d.goal, text: document.querySelector('#g-card.on .text')?.textContent ?? '' };
  });
let acted = 0;
let asked = null;
for (let i = 0; i < 200 && !asked; i++) {
  await ticks(20);
  const s = await look();
  if (s.answers) asked = s;
  else if (s.card) await page.touchscreen.tap(width * 0.5, height * 0.85);
  else if (s.prompt) {
    await page.tap('#g-prompt');
    acted++;
  } else if (s.near ?? s.goal) await page.evaluate(({ x, z }) => window.__tg.standAt(x, z + 0.6), s.near ?? s.goal);
}
check(!!asked, 'a card asks a question');
if (asked) {
  await page.screenshot({ path: join(out, '5-question.png') });
  await page.touchscreen.tap(width * 0.7, 6);
  await ticks(30);
  const still = await look();
  check(still.answers > 0 && still.text === asked.text, 'a tap elsewhere answers nothing');
  await page.tap('#g-card .answer:nth-child(1)');
  await ticks(30);
  const after = await look();
  check(after.text !== asked.text || !after.answers, 'a tap on an answer takes it');
}

if (problems.length) console.log(`problems:\n${problems.join('\n')}`);
await browser.close();
server.close();
process.exit(fails.length || problems.length ? 1 : 0);
