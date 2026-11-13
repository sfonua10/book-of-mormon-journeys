// Stills of the built game from any place, headless, with the clock stepped by hand.
//   node tools/look.mjs name:u,v,turn,pitch[,fov[,y]] ... [--out dir] [--query "hour=17"] [--size 1280x720] [--ticks 40]
//   [--eval "js run in the page before the shots, with tg = window.__tg"]
// u is metres down the valley from the camp, v metres to the right of it; turn is degrees right of the valley's line,
// pitch degrees up. A view named "player" takes the game's own camera instead (third person), after --ticks ticks.
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
const views = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) i++;
  else {
    const [name, spec = ''] = args[i].split(':');
    const [u, v, turn, pitch, fov, y] = spec.split(',').map(Number);
    views.push({ name, u, v, turn, pitch, fov: fov || 68, y: Number.isFinite(y) ? y : 1.68 });
  }
}
const out = resolve(here, flag('out', 'shots/work'));
const [width, height] = flag('size', '1280x720').split('x').map(Number);
const ticks = Number(flag('ticks', '40'));
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
const url = `http://127.0.0.1:${server.address().port}/?step&dpr=1&nosound&quality=medium&${flag('query', '')}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  headless: true,
  args: ['--mute-audio', '--ignore-gpu-blocklist', `--use-angle=${process.platform === 'darwin' ? 'metal' : 'd3d11'}`, '--enable-gpu'],
});
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const problems = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text().slice(0, 1500)}`);
  else if (m.text().startsWith('[game]')) console.log(m.text());
});
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}\n${e.stack ?? ''}`));
const t0 = Date.now();
await page.goto(url);
try {
  await page.waitForFunction(() => window.__tg?.ready, null, { timeout: 120000 });
} catch {
  console.log('never ready\n' + problems.join('\n'));
  await browser.close();
  server.close();
  process.exit(1);
}
console.log(`ready in ${Date.now() - t0} ms`);
// (the list of journeys is not what a still is of)
await page.addStyleTag({ content: '#start, #g-title { display: none !important; }' });
const pre = flag('eval', '');
if (pre) console.log('eval:', JSON.stringify(await page.evaluate(`(async () => { const tg = window.__tg; ${pre} })()`)));

for (const view of views) {
  await page.evaluate(
    async ({ v, ticks }) => {
      const tg = window.__tg;
      if (v.name.startsWith('player')) tg.view = null;
      else {
        const [x, z] = tg.fromValley(v.u, v.v);
        const base = Math.atan2(-0.6, -0.8);
        tg.view = { x, z, y: v.y, yaw: base - (v.turn * Math.PI) / 180, pitch: (v.pitch * Math.PI) / 180, fov: v.fov };
      }
      for (let i = 0; i < ticks; i++) {
        tg.tick(1 / 30);
        await null;
      }
      tg.renderer.getContext().finish();
    },
    { v: view, ticks },
  );
  await page.screenshot({ path: join(out, `${view.name}.png`) });
  console.log(`shot ${view.name}`);
}
if (problems.length) console.log(problems.join('\n'));
await browser.close();
server.close();
