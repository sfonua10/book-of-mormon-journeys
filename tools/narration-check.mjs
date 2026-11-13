// Checks the reading aloud, with the build's recordings or, where it has none, a stand-in put into dist/ (the PC's
// own voice, never published): a
// card with a recording goes on by itself when it has been read, a press still goes on at once, and with the
// reading off the card waits.   CHROME=... node tools/narration-check.mjs   (after npm run build; needs ffmpeg, say)
import { execFileSync } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = resolve(fileURLToPath(import.meta.url), '..', '..');
const root = resolve(here, 'dist');
const dir = join(root, 'audio/narration');
const manifest = join(dir, 'manifest.json');
const kept = existsSync(manifest) ? readFileSync(manifest, 'utf8') : null;
// (with real recordings in the build, they are what is checked; without, a stand-in is made and taken away again)
const real = !!kept && kept.trim() !== '{}';
if (!real) {
  mkdirSync(dir, { recursive: true });
  execFileSync('say', ['-o', join(dir, 'x.aiff'), 'I will go and do.']);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(dir, 'x.aiff'), '-ac', '1', '-b:a', '64k', join(dir, '1-nephi-3-7.mp3')]);
  rmSync(join(dir, 'x.aiff'));
  writeFileSync(manifest, '{"1-nephi-3-7":"test"}');
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.glb': 'model/gltf-binary' };
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
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist', `--use-angle=${process.platform === 'darwin' ? 'metal' : 'd3d11'}`, '--enable-gpu'],
});
const fails = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) fails.push(what);
};
try {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push(e.message));
  /** Runs the story in real time for some seconds, or until the test says so; returns what the card says. */
  const run = (seconds, until) =>
    page.evaluate(
      async ([s, want]) => {
        const card = () => document.querySelector('#g-card.on .ref')?.textContent ?? (document.querySelector('#g-card.on') ? '(a card)' : '');
        const t0 = performance.now();
        let last = t0;
        while (performance.now() - t0 < s * 1000) {
          await new Promise((r) => setTimeout(r, 30));
          const now = performance.now();
          window.__tg.tick((now - last) / 1000);
          last = now;
          if (want === 'card' && card()) break;
          if (want === 'gone' && !card().includes('3:7')) break;
        }
        return { card: card(), took: (performance.now() - t0) / 1000 };
      },
      [seconds, until],
    );
  const open = async () => {
    await page.goto(`http://127.0.0.1:${server.address().port}/?step&dpr=1`);
    await page.waitForFunction(() => window.__tg?.ready, null, { timeout: 120000 });
    await page.waitForSelector('#n-voice.has', { state: 'attached', timeout: 10000 });
    await page.tap('#g-title button');
    return run(20, 'card');
  };

  let s = await open();
  check(s.card.includes('3:7'), `the first card is the one with a recording (${s.card})`);
  check(await page.evaluate(() => window.__tg.sounds.context?.state === 'running'), 'the sound is running');
  s = await run(40, 'gone');
  check(!s.card.includes('3:7') && s.took > 1, `read to its end, the card goes on by itself (after ${s.took.toFixed(1)} s)`);

  s = await open();
  await run(0.7);
  await page.touchscreen.tap(600, 60);
  s = await run(0.6, 'gone');
  check(!s.card.includes('3:7'), 'a tap goes on at once, without waiting for the reading');

  await page.goto(`http://127.0.0.1:${server.address().port}/?step&dpr=1`);
  await page.waitForFunction(() => window.__tg?.ready, null, { timeout: 120000 });
  await page.tap('#g-title button');
  await run(20, 'card');
  await page.tap('#n-voice');
  check((await page.textContent('#n-voice')) === 'Voice off', 'the button turns the reading off');
  await page.reload();
  await page.waitForFunction(() => window.__tg?.ready, null, { timeout: 120000 });
  await page.tap('#g-title button');
  await run(20, 'card');
  check((await page.textContent('#n-voice')) === 'Voice off', 'and it is remembered');
  s = await run(6, 'gone');
  check(s.card.includes('3:7'), 'with the reading off, the card waits to be tapped');
  await page.screenshot({ path: join(here, 'shots', 'touch', '6-voice.png') });
  if (problems.length) fails.push(...problems), console.log(problems.join('\n'));
} finally {
  if (!real) {
    rmSync(join(dir, '1-nephi-3-7.mp3'), { force: true });
    writeFileSync(manifest, kept ?? '{}\n');
  }
  await browser.close();
  server.close();
}
process.exit(fails.length ? 1 : 0);
