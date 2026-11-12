// Plays the whole story with the autopilot (?auto), headless, the clock stepped by hand, and fails unless it reaches
// the end. A still is taken as each beat begins.
//   node tools/story.mjs [--beat a2] [--out shots/story] [--limit 2400] [--size 1280x720] [--shots]
//     [--query "hold&wrong"]  (more for the page's address: ?hold is overtaken in the chase once before it
//     leaves the property; ?wrong answers Zoram wrongly once each time)
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
const shots = args.includes('--shots');
const out = resolve(here, flag('out', 'shots/story'));
const limit = Number(flag('limit', '2400')); // seconds of story time
const [width, height] = flag('size', '1280x720').split('x').map(Number);
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
const beat = flag('beat', '');
const snaps = new Set((flag('snap', '') || '').split(',').filter(Boolean));
const url = `http://127.0.0.1:${server.address().port}/?step&auto&nosound&dpr=1&quality=${flag('quality', 'low')}${beat ? `&beat=${beat}` : ''}${snaps.size ? '&autoread=1.2' : ''}${flag('query', '') ? `&${flag('query', '')}` : ''}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  headless: true,
  args: ['--mute-audio', '--ignore-gpu-blocklist', `--use-angle=${process.platform === 'darwin' ? 'metal' : 'd3d11'}`, '--enable-gpu'],
});
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const problems = [];
const log = [];
page.on('console', (m) => {
  const text = m.text();
  if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${text.slice(0, 1500)}`);
  else if (text.startsWith('[game]')) {
    log.push(text);
    console.log(text);
  }
});
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}\n${e.stack ?? ''}`));
const t0 = Date.now();
await page.goto(url);
try {
  await page.waitForFunction(() => window.__tg?.ready, null, { timeout: 120000 });
} catch {
  console.log('never ready\n' + problems.join('\n'));
  process.exit(1);
}
console.log(`ready in ${Date.now() - t0} ms`);
await page.addStyleTag({ content: '#start { display: none !important; }' });

let simulated = 0;
let lastBeat = null;
let ended = false;
while (simulated < limit) {
  // a few seconds of story at a time, at 30 frames a second
  const state = await page.evaluate(async (wanted) => {
    const tg = window.__tg;
    const cards = [];
    for (let i = 0; i < 90; i++) {
      tg.tick(1 / 30);
      // (let the story's promises run between frames)
      await new Promise((r) => setTimeout(r, 0));
      // a card wanted for a still: stop here, with it on the screen
      const ref = document.querySelector('#g-card.on .ref')?.textContent;
      if (ref && wanted.some((w) => ref.includes(w))) {
        cards.push(ref);
        break;
      }
    }
    const d = tg.director;
    return { cards, beat: d.beat, ended: d.ended, x: tg.player.x, z: tg.player.z, goal: d.goal, frozen: d.frozen, hour: tg.sky.hour };
  }, [...snaps]);
  simulated += 3;
  for (const ref of state.cards) {
    const key = [...snaps].find((s) => ref && ref.includes(s));
    if (key) {
      snaps.delete(key);
      // (the card's own fade, in real time)
      await page.evaluate(() => new Promise((r) => setTimeout(r, 450)));
      await page.screenshot({ path: join(out, `card-${key.replace(':', '_')}.png`) });
      console.log(`snapped ${key}`);
    }
  }
  if (state.beat !== lastBeat) {
    lastBeat = state.beat;
    console.log(`${simulated.toFixed(0).padStart(5)} s  beat ${state.beat}  at (${state.x.toFixed(0)}, ${state.z.toFixed(0)})  hour ${state.hour}`);
    if (shots) await page.screenshot({ path: join(out, `${String(simulated).padStart(5, '0')}-${state.beat}.png`) });
  }
  if (state.ended) {
    ended = true;
    break;
  }
  if (simulated % 60 === 0) console.log(`${simulated.toFixed(0).padStart(5)} s  ${state.beat}  at (${state.x.toFixed(0)}, ${state.z.toFixed(0)})  goal ${state.goal ? `(${state.goal.x.toFixed(0)}, ${state.goal.z.toFixed(0)})` : '-'}  ${state.frozen ? 'frozen' : ''}`);
}
if (shots) await page.screenshot({ path: join(out, 'zz-end.png') });
if (problems.length) console.log(problems.slice(0, 20).join('\n'));
console.log(ended ? `reached the end in ${simulated} s of story time` : `did NOT reach the end in ${simulated} s (stopped at ${lastBeat})`);
await browser.close();
server.close();
process.exit(ended && !problems.some((p) => p.startsWith('pageerror')) ? 0 : 1);
