# Licence notes

*I Will Go and Do* is a remix of Patch's **Painted valley** block (`blendi/painted-valley` 1.1.1, MIT code, CC0 art). The table below is Painted valley's own, kept as it was, with the rows for what this game adds or changes first.

## What this game adds or changes

| Part | Where it came from | Licence | In this repo? |
|---|---|---|---|
| `src/game/` (the story, the city, the cast, the director, the cards, the leading light) | Written for this game | MIT; what it draws CC0 | Yes |
| `src/game/scripture.js` (1 Nephi 3–5) | The Book of Mormon, Project Gutenberg eBook #17, generated from its text | Public domain | Yes |
| `src/game/scripture-daniel.js` (Daniel 3 and 6; four verses of the Gospels) | The King James Version of the Bible, Project Gutenberg eBook #10, generated from its text by `tools/verses.mjs` | Public domain | Yes |
| `src/game/lions.js` (the lions of Daniel 6) | Written for this game: every lion is made in code, of spheres, cylinders and a turned shape; no model or picture is loaded | MIT; what it draws CC0 | Yes |
| Changes in `src/valley/` and `src/lib/` (the hill country, its palette, the night, the head cloth, the made sounds) | Edits for this game to Painted valley's files | MIT | Yes |
| `public/audio/narration/*.mp3` (the scripture read aloud) | Made with ElevenLabs text to speech (its own voice "Brian", model `eleven_multilingual_v2`) by `tools/narrate.mjs`, from the public-domain text | Made on ElevenLabs' free plan, whose terms allow non-commercial use only: this game is free and carries no advertising. Not CC0; not to be reused commercially | Yes |
| `lib/patch-block.js` | **Replaced** by a short stand-in written for this game; Patch's own helper is not carried | MIT | Yes |
| `public/figure/*.glb`, `public/textures/*` | As below, fetched from Painted valley's repository and checked against their LFS checksums. Kept in plain Git here, not LFS | As below | Yes |

## Painted valley's own notes

Code MIT. Art in this repo CC0 1.0. Checked 2026-11-11.

| Part | Where it came from | Licence | In this repo? |
|---|---|---|---|
| `src/valley/` (the land, sky, clouds, mountains, plain, village, trees, stones, water, brushwork, the walk) | Written by Patch for this block. Every cloud, mountain, tree, house and brush mark is made in code; no picture or model is loaded for them | MIT; what it draws CC0 | Yes |
| `src/lib/` (the grass, flowers, the ground under them, the frame's finish) | Patch's grass block (`blendi/touch-grass`), copied and restyled for this look | MIT; what it draws CC0 | Yes |
| `src/valley/wanderer.js` (the wanderer's look, his hat) | Written by Patch for this block | MIT; what it draws CC0 | Yes |
| `src/figure/cloak.js`, `camera.js` | Written by Patch for its oil paint block (`blendi/oil-paint`), copied | MIT | Yes |
| `src/figure/man.js`, `animator.js`, `player.js`, `input.js`, `hands-anymove.json` | Patch's starter man, by way of the oil paint block | CC0 1.0, Patch | Yes |
| `public/figure/starter-man.glb` | Patch's starter man: built with MPFB2 from MakeHuman system assets (the body, `male_casualsuit06`, `shoes05`, `short01` hair), rigged by Patch onto the Universal Animation Library's skeleton. Its pictures are taken out, since the demo colours him itself | CC0 1.0 (MakeHuman's system assets are released as CC0) | Yes, in Git LFS |
| `public/figure/starter-man-clips.glb` | Quaternius' Universal Animation Library 1 and 2 (idle, walk, jog, strafes, turns, jumps), and Patch's own clips made with anymove (run, sprint, starts, stops, the tired idle). Rewritten by `tools/compact-glb.mjs` without the data no clip uses; the clips themselves are byte for byte the same | CC0 1.0 (Quaternius); CC0 1.0, Patch | Yes, in Git LFS |
| `src/figure/rapier/` | Rapier 0.21.0, `@dimforge/rapier3d-compat` | Apache-2.0, `src/figure/rapier/LICENSE`, shipped as `RAPIER-LICENSE.txt` | Yes |
| `public/textures/Ground048_*`, `Ground103_*` | ambientCG (https://ambientcg.com), Ground048 and Ground103, 1K JPEG maps | CC0 1.0 | Yes, in Git LFS |
| `public/audio/footstepOnGrass*.ogg` | Kenney's Impact Sounds, through Patch's asset library (`kenney:impact-sounds/footstep_grass_000` to `_004`) | CC0 1.0 | Yes |
| `public/audio/summer.ogg`, `leaves.ogg`, `grass.ogg`, `lake.ogg`, `crickets.ogg` | Cut from the Sonniss GDC Game Audio Bundles (2017, 2018, 2019). The exact recordings are in `MISSING_ASSETS.md` | Sonniss GDC bundle licence: use in a game, not to be passed on as files | **No.** In the released demo only |
| `lib/patch-block.js` | Patch's block helper, from staging.patch.gg/patch-block.js | Patch's, shipped with every block | Yes |
| `shots/` | Stills of this demo | CC0 1.0, Patch | Yes, in Git LFS |
| three.js 0.186.1 | npm | MIT | Installed by npm; its notice ships as `THIRD-PARTY-NOTICES.md` |

**The sounds.** The repo's licences cover what is in the repo. The released demo plays five ambience recordings that are not in it, because their licence lets them be used in a game but not handed on. A build made from this repo alone has footsteps and nothing else; `MISSING_ASSETS.md` says how to put the five back for a game of your own.

**The look.** The valley was painted toward the look of hand-painted backgrounds in animated films. While it was being made, published stills from such films and two pictures its author supplied were looked at side by side with it, for colour, light and how much is drawn where. None of them is in this repo or its history, none was traced or copied, and no place, building or character from any film is reproduced: the valley, the village, the mountains and the sky here are this demo's own, made in code. The wanderer is Patch's own figure from its oil paint block, in a hat and cloak of Patch's making; the flat colour and inked line he is drawn with are the common way of drawing people in hand-drawn film, not any one film's character.

**Nothing here has no stated source.**
