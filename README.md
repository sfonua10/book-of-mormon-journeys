---
kind: effect
engine: three.js
---

# Painted valley

A summer valley to walk through, drawn in the look of hand-painted animated film backgrounds: flat, clean colour, heaped white cloud, far mountains with every face painted, a village of tiled roofs, and a meadow whose brush marks stay round under your feet. Everything you see is made in code, in three.js.

![A meadow hill above a village of red roofs, a river plain behind it and snow mountains under heaped white clouds](shots/readme.jpg)

**In the demo:** click to look with the mouse, WASD to walk, Shift to run. T changes the time of day (noon, afternoon, golden hour, sunset) and 1 to 4 go straight to one; `,` and `.` nudge the hour, 0 lets the day pass by itself. P takes the paint finish off and on. There is nothing to do but walk: down the hill to the village, along the river, up to the tarn.

![The village from the path](shots/village.jpg)

![The same hill at sunset](shots/sunset.jpg)

It is a starting point, not a filter. You can't lay it over a finished game: the look comes from how each part of the place is painted. Start from the valley, change it, put your own game in it.

## The idea

A painted background reads as paint because of what is left out: no photographed texture, no noise at every scale, few tones, and detail only where a brush would have put it.

- **Few tones, chosen as paint.** Each thing has a lit colour and a shade colour and a short step between them. One shared palette (`meadowGreen`, `meadowLight` in `src/valley/world.js`) paints the grass, the ground under it, the far fields and the hills, so the valley is one picture.
- **Marks, not noise.** The meadow is one slow green with thin strokes that follow the slope, and dabs laid out as they would look from the hill where the walk starts, so they are round from there and fade before they could turn to speckle (`heroPaint`). Far ground has no fine pattern at all: it would shimmer.
- **Far things are painted once.** The mountains are a height map marched into a strip of paint (lit colour, shade colour, where the light falls, air, a bank of cloud), which the sky then lights for the hour. Rock is cut into facets, the lower slopes carry rounded tree crowns, and three ranks of foothills step back in the haze. Nothing far costs anything per frame.
- **Clouds are heaps.** Each cumulus is a pile of spheres, ray-marched once into a cube map and given flat tones: white top, cool shade, a warm underside. They stand still on purpose; a redraw per hour changes their light.
- **The plain is a painting too.** Fields, hedges, roads and the river are drawn into one texture, with trees, orchards, poplars and a mill standing on it as small painted cards.
- **Buildings carry detail the way a background painter gives it:** rows of tiles, limewash with stains under the eaves, shutters, doors, attic windows, chimneys, all drawn in the shader from the wall's own coordinates.
- **A finish over the frame** (a small Kuwahara pass) rounds everything into strokes, and leaves the sky and anything else that asks to be left alone.

## Use it in a game

It is a place with its own renderer set-up, not a material: `src/valley/main.js` is the whole demo and the thing to start from. Built on three 0.186, WebGL2.

```js
import { createField, createFrame } from './src/lib/index.js';
import { createSky } from './src/valley/sky.js';
import { createTrees } from './src/valley/trees.js';
import { heightAt, START } from './src/valley/world.js';

const field = createField({ /* the meadow: grass, flowers, the ground; see main.js */ });
const frame = createFrame(renderer, field, { samples: 4, bloom: 0.1 });
const sky = createSky(renderer, field, { /* clouds and mountains are painted in here */ });
scene.add(sky.mesh, createTrees(field).group);

frame.paint = 3;                    // the paint finish: 0 is off
sky.setHour(15.5);                  // 12.5 noon to 20.4 sunset
camera.position.y = heightAt(x, z) + 1.7;
frame.render(scene, camera);
```

- **Your own things in it.** Add meshes to the scene as usual. To be left out of the paint finish (a crisp character, a HUD in the world), write alpha below 0.6. To sit in the valley's light, read the sun and sky colours from `field.uniforms`.
- **Change the place.** `src/valley/world.js` holds the land: `heightAt`, the paths, the tarn, the river, where the village and the woods are. `village.js` builds houses from eight shapes. `backdrop.js` holds the mountains' outline, `clouds.js` where each cloud stands.
- **Change the hour.** `sky.js` has one set of colours per hour key; add a night, a storm, a dawn.
- **Performance mode.** `?quality=low` or `medium` draws less: fewer blades, no seed fluff, a lighter finish.

## What is where

| | |
|---|---|
| `src/valley/main.js` | The demo: start-up, the walker, the keys, the loop |
| `src/valley/world.js` | The land and the shared palette |
| `src/valley/sky.js`, `clouds.js`, `backdrop.js` | The sky and its hours, the clouds, the far mountains and foothills |
| `src/valley/horizon.js`, `floor.js`, `farwoods.js` | The plain out to 6 km, its painted fields and roads, its trees and mill |
| `src/valley/village.js` | The houses, church and barns |
| `src/valley/trees.js`, `dressing.js`, `water.js` | Near trees and bushes with their shade, stones and drifting seeds, the tarn |
| `src/valley/strokes.js` | The brush-dab texture the ground is painted with |
| `src/valley/sounds.js` | The sound, from recordings (see below) |
| `src/lib/` | The grass, flowers, ground and frame, from Patch's grass block (`blendi/touch-grass`), restyled for this look |
| `tools/` | Headless stills (`shots.mjs`), frame time (`fps.mjs`), a first visit (`cold.mjs`), the sound cuts (`sounds.mjs`) |

## Sound

The released demo has wind in the grass, leaves, birds and insects, water at the tarn and crickets at dusk. Those five recordings come from the Sonniss GDC bundles, which may be used in a game but not passed on as files, so they are **not in this repo**: a build from it has footsteps only. [MISSING_ASSETS.md](MISSING_ASSETS.md) names each recording, where to get it and the one command that cuts it back in.

## Limits

- three.js on WebGL2 only.
- One valley, about 2 km across, with painted land out to the mountains. Walk past its edge and you are turned back.
- Noon to sunset only: there is no night, and the clouds don't move.
- You can't go into the houses, and nobody lives there yet.
- Measured only on an RTX 4090 at 1080p. A first visit is ready in about 7 seconds there; the demo downloads about 6 MB.

## Build

`npm install`, then `npm run build`: the demo is in `dist/` with `index.html` at the top. `npm run serve` serves it on port 5383. The tools in `tools/` drive it headless with Playwright: set `CHROME` to a Chromium of your own if Playwright has none.

## Credits

Code MIT, art CC0 1.0. The earth of the footpaths is two ambientCG grounds (CC0); the footsteps are Kenney's (CC0). Everything else you see is made in code. Every part and its source is in [LICENCE-NOTES.md](LICENCE-NOTES.md).
