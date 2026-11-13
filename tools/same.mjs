// Whether two sets of stills are the same picture: for each .png in the first folder, the one of the same name in the
// second, compared pixel by pixel in a headless page. Used to show that a change to one journey has left another as
// it was (take its stills before, take them again after, and compare).
//   node tools/same.mjs shots/before shots/after [--tolerance 6] [--share 0.001] [--diff shots/diff]
// A pixel differs where any of its channels is further apart than `tolerance` (0 to 255). A still is the same where
// no more than `share` of its pixels differ. With --diff, a picture of where they differ is written for each that
// does not match. Exits 1 if any differs or is missing.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const [a, b] = args.filter((x, i) => !x.startsWith('--') && !args[i - 1]?.startsWith('--')).map((p) => resolve(p));
if (!a || !b) {
  console.error('node tools/same.mjs <folder> <other folder> [--tolerance 6] [--share 0.001] [--diff dir]');
  process.exit(2);
}
const tolerance = Number(flag('tolerance', '6'));
const share = Number(flag('share', '0.001'));
const diffDir = flag('diff', '');
if (diffDir) mkdirSync(resolve(diffDir), { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME, headless: true });
const page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');
let bad = 0;
for (const name of readdirSync(a).filter((n) => n.endsWith('.png')).sort()) {
  if (!existsSync(join(b, name))) {
    console.log(`${name}: missing from ${b}`);
    bad++;
    continue;
  }
  const url = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
  const r = await page.evaluate(
    async ({ one, two, tolerance, diff }) => {
      const load = (src) =>
        new Promise((done, fail) => {
          const i = new Image();
          i.onload = () => done(i);
          i.onerror = fail;
          i.src = src;
        });
      const [p, q] = await Promise.all([load(one), load(two)]);
      if (p.width !== q.width || p.height !== q.height) return { size: `${p.width}x${p.height} against ${q.width}x${q.height}` };
      const c = document.getElementById('c');
      c.width = p.width;
      c.height = p.height;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(p, 0, 0);
      const da = x.getImageData(0, 0, p.width, p.height);
      x.drawImage(q, 0, 0);
      const db = x.getImageData(0, 0, p.width, p.height);
      const out = x.createImageData(p.width, p.height);
      let differ = 0;
      let most = 0;
      for (let k = 0; k < da.data.length; k += 4) {
        const d = Math.max(Math.abs(da.data[k] - db.data[k]), Math.abs(da.data[k + 1] - db.data[k + 1]), Math.abs(da.data[k + 2] - db.data[k + 2]));
        most = Math.max(most, d);
        const off = d > tolerance;
        if (off) differ++;
        // (the picture of the difference: the first still faded, and where they differ in red)
        const grey = (da.data[k] + da.data[k + 1] + da.data[k + 2]) / 9;
        out.data.set(off ? [255, 40, 40, 255] : [grey, grey, grey, 255], k);
      }
      let png = null;
      if (diff) {
        x.putImageData(out, 0, 0);
        png = c.toDataURL('image/png');
      }
      return { differ, total: da.data.length / 4, most, png };
    },
    { one: url(join(a, name)), two: url(join(b, name)), tolerance, diff: !!diffDir },
  );
  if (r.size) {
    console.log(`${name}: not the same size (${r.size})`);
    bad++;
    continue;
  }
  const part = r.differ / r.total;
  const same = part <= share;
  if (!same) bad++;
  console.log(`${name}: ${same ? 'same' : 'DIFFERS'}  (${(part * 100).toFixed(3)}% of pixels beyond ${tolerance}; the most any differs is ${r.most})`);
  if (!same && diffDir && r.png) writeFileSync(join(resolve(diffDir), name), Buffer.from(r.png.split(',')[1], 'base64'));
}
await browser.close();
console.log(bad ? `${bad} not the same` : 'all the same');
process.exit(bad ? 1 : 0);
