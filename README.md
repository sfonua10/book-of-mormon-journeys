# I Will Go and Do

A short painted walking game through **1 Nephi 3–4**: Nephi and his brothers go back to Jerusalem for the plates of brass. You walk where they walked and read what they said, in the scripture's own words, at the moment each thing happens. The aim is to help families understand the account and see how the Lord prepared a way.

> "I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them." (1 Nephi 3:7)

It is a remix of Patch's [Painted valley](https://patch.gg/blendi/painted-valley), a three.js scene painted like an animated film's backgrounds. The painting, grass, sky, figure and walk come from Painted valley. This game adds the hill country, the city, the story and the night.

## The story

| Act | Verses | When | What you do |
|---|---|---|---|
| One: Up to Jerusalem | 3:7–21 | Afternoon | Consult with your brothers, walk to the gate. Laman goes in and is driven out. You answer your brothers (3:15–20). |
| Two: Our Gold and Our Silver | 3:22–4:4 | Golden hour | Go into Lehi's house by its door and gather the gold, the silver and the precious things, in any order: a list at the top left ticks each off, and Laman, Lemuel and you carry them out. Carry them to Laban. Flee his servants: what you carry slows you, and they gain on you until you leave the property behind (3:26). If they overtake you the chase begins again. Hide in the rock. The angel speaks. You answer your brothers again (4:1–3). |
| Three: Led by the Spirit | 4:5–38 | Night | No marker and no objective. Stand still and a soft light gathers in the air the way you should go, with a soft tone (4:6). Take a wrong turning and there is no light until you stand still again. Find Laban, drunken in the street. You may obey at once, or shrink as Nephi did (4:10): step back or wait, and the Spirit speaks again (4:11, 4:12–13). Then speak to Zoram in the voice of Laban, go with him into the treasury, and choose how you answer him three times. Go back to your brothers outside the walls, and make the oath. |
| The tent of their father | 5:7–8, 5:21, 3:7 | Evening | The return, and the end screen with questions to talk about. |

The words on the cards are the scripture's own, quoted from `src/game/scripture.js`. The few lines that are not scripture are shown in italics without a reference. That includes the three questions about Zoram and their answers: the right answer is what the verse says Nephi did, and the verse follows it; a wrong answer makes Zoram hesitate, and the question is asked again.

What happens is fixed; how you do it is yours. There is no score, no meter and no other ending.

By day there are a few people in the streets of Jerusalem, who say nothing. By night there are none. Laban is dressed as a captain who "can command fifty" (3:31), in a coat of bronze scales, which is the armour Nephi puts on (4:19).

There is very little music, and all of it is made in code (`src/game/music.js`): the tone of the Spirit's leading, a frame drum in the chase, one chord for the angel, only Laban's breathing in the street, and a single lyre tune at the tent of their father. The beating at the rock (3:28) and Laban's death (4:18) are read, not shown: the screen dims or goes dark, and the 4:18 card quotes only "Therefore I did obey the voice of the Spirit …".

The game takes about 15–20 minutes. The act you reached is kept in the browser, so you can stop and continue later.

## Running it

```sh
npm install
npm run dev        # http://127.0.0.1:5384
npm run build      # a static site in dist/, to host anywhere
npm run serve      # serves dist/ on 5383
```

Controls: W A S D to walk, Shift to run, the mouse to look (click to capture it), E or Enter to act and to go on from a card, Esc to pause. When a card asks a question, W and S choose an answer and E takes it (or press 1 or 2). A gamepad works too, for walking.

Useful URL options:
- `?quality=low|medium|high` (medium by default)
- `?beat=a2` starts at a beat. The beats are `a1`, `a1-gate`, `a2`, `a2-laban`, `a2-rock`, `a3`, `a3-laban`, `a3-treasury`, `a3-walls` and `home`.
- `?auto` lets the game play itself. With `&hold` it is overtaken once in the chase before it leaves the property, and with `&wrong` it answers Zoram wrongly once each time, so a test covers those ways too.

## Checking it

```sh
npm run build
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node tools/story.mjs            # plays the whole story headless; fails unless it reaches the end
node tools/story.mjs --query "hold&wrong"                                            # the same, overtaken once and answering wrongly once
node tools/story.mjs --beat a3 --snap "4:6,4:9" --quality medium --out shots/story   # stills when those cards are up
node tools/look.mjs city:120,0,0,4,50 --out shots/work                               # a still from any place (u, v, turn, pitch, fov)
node tools/fps.mjs --query "quality=medium&beat=a2-laban"                            # frame rate
```

On an Apple M4 at 1080p the game runs at about 56–68 fps at medium with the cast on screen, and about 52 fps at high.

## What is where

- `src/game/places.js`: where everything is (the camp, the city and gate, Lehi's house, the rock) and the paths between them.
- `src/game/city.js`: the walls and gate, the flat-roofed houses, Laban's house and court, the treasury, Lehi's house and the tents. The same boxes are the colliders.
- `src/game/story.js`: the beats, and who wears what.
- `src/game/director.js`: runs the beats (cards, places to reach, things to act on), saves checkpoints, and drives the autopilot.
- `src/game/npc.js`: the brothers, Laban, his servants, Zoram and the angel. They are clones of the one figure that walk paths or follow Nephi's trail.
- `src/game/guidance.js`: the leading light for the night act.
- `src/game/town.js`: the people in the streets by day.
- `src/game/music.js`: the story's music, made in code and played through the valley's sounds.
- `src/game/ui.js`: the cards, the "What to do" panel (a line, and a checklist when the thing has parts), prompt, marker, fades, and the title and end screens.
- `src/valley/`, `src/lib/`, `src/figure/`: Painted valley's painting, recoloured for dry hills and given a night (`sky.js`).

## Credits and licences

See `LICENCE-NOTES.md` and `public/CREDITS.md`. In short:
- The code is MIT, from Patch and this game.
- The figure, textures and footsteps are CC0.
- The scripture text is public domain (Project Gutenberg #17).
- Painted valley's five ambience recordings are not included, because their licence doesn't allow passing them on. Wind and crickets are made in code instead.
- The music is made in code and its one tune was written for this game, so there is nothing to license.

This is an independent project. It is not an official product of The Church of Jesus Christ of Latter-day Saints.
