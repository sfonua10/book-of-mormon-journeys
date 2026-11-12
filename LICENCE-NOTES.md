# Licence notes: painted valley

Code MIT. Art in this repo CC0 1.0. Checked 2026-11-11.

| Part | Where it came from | Licence | In this repo? |
|---|---|---|---|
| `src/valley/` (the land, sky, clouds, mountains, plain, village, trees, stones, water, brushwork, the walker) | Written by Patch for this block. Every cloud, mountain, tree, house and brush mark is made in code; no picture or model is loaded for them | MIT; what it draws CC0 | Yes |
| `src/lib/` (the grass, flowers, the ground under them, the frame's finish) | Patch's grass block (`blendi/touch-grass`), copied and restyled for this look | MIT; what it draws CC0 | Yes |
| `public/textures/Ground048_*`, `Ground103_*` | ambientCG (https://ambientcg.com), Ground048 and Ground103, 1K JPEG maps | CC0 1.0 | Yes, in Git LFS |
| `public/audio/footstepOnGrass*.ogg` | Kenney's Impact Sounds, through Patch's asset library (`kenney:impact-sounds/footstep_grass_000` to `_004`) | CC0 1.0 | Yes |
| `public/audio/summer.ogg`, `leaves.ogg`, `grass.ogg`, `lake.ogg`, `crickets.ogg` | Cut from the Sonniss GDC Game Audio Bundles (2017, 2018, 2019). The exact recordings are in `MISSING_ASSETS.md` | Sonniss GDC bundle licence: use in a game, not to be passed on as files | **No.** In the released demo only |
| `lib/patch-block.js` | Patch's block helper, from staging.patch.gg/patch-block.js | Patch's, shipped with every block | Yes |
| `shots/` | Stills of this demo | CC0 1.0, Patch | Yes, in Git LFS |
| three.js 0.186.1 | npm | MIT | Installed by npm; its notice ships as `THIRD-PARTY-NOTICES.md` |

**The sounds.** The repo's licences cover what is in the repo. The released demo plays five ambience recordings that are not in it, because their licence lets them be used in a game but not handed on. A build made from this repo alone has footsteps and nothing else; `MISSING_ASSETS.md` says how to put the five back for a game of your own.

**The look.** The valley was painted toward the look of hand-painted backgrounds in animated films. While it was being made, published stills from such films and two pictures its author supplied were looked at side by side with it, for colour, light and how much is drawn where. None of them is in this repo or its history, none was traced or copied, and no place, building or character from any film is reproduced: the valley, the village, the mountains and the sky here are this demo's own, made in code.

**Nothing here has no stated source.**
