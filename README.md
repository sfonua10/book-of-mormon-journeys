# Scripture Journeys

Painted walking games through the scriptures, one journey at a time. The first screen asks for a book of scripture (the Book of Mormon, the Old Testament), then lists that book's journeys, with the next one shown as coming.

Adding a journey: write its story beside `src/game/story.js`, give it an entry in `src/game/stories.js` with its `work` (the book it belongs to), its `scripture` (the verses its cards quote) and `released: true`. A journey may bring its own land (`land`: the hill country round Jerusalem, or `'plain'`, the river plain of Babylon, in `src/valley/world.js`), its own city (`look`), people and clothes, as the Daniel journey does (`src/game/daniel.js`, `src/game/babylon.js`). Each journey keeps its own place in the browser.

(The game was first called Book of Mormon Journeys; the web address and the repository keep that name.)

## Book of Mormon, Journey 1: I Will Go and Do

A short painted walking game through **1 Nephi 3–4**: Nephi and his brothers go back to Jerusalem for the plates of brass. You walk where they walked and read what they said, in the scripture's own words, at the moment each thing happens. The aim is to help families understand the account and see how the Lord prepared a way.

> "I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them." (1 Nephi 3:7)

## Old Testament, Journey 1: But If Not

**Daniel 3**, in the King James Version: Shadrach, Meshach and Abed-nego before the image of gold, before the king, and in the burning fiery furnace. You are one of the three. It follows that week's *Come, Follow Me* ("I can trust in the Lord when my faith is tried"), and its end asks what the lesson asks.

> "If it be so, our God whom we serve is able to deliver us from the burning fiery furnace, and he will deliver us out of thine hand, O king. But if not, be it known unto thee, O king, that we will not serve thy gods, nor worship the golden image which thou hast set up." (Daniel 3:17–18)

It is played more than it is read. What is said (the herald's command, the king's words, the three's answer) is a card, read before the story goes on; what is only done is a line low on the screen, read while you walk; a list said over again is cut short with "…" (the cut verses are in `src/game/scripture-daniel.js` and `tools/excerpts.mjs` checks each is the verse's own words in order). There are about 22 stops.

A card of what someone says has their name over it, and under the name only what they said: "NEBUCHADNEZZAR · Is it true, O Shadrach, Meshach, and Abednego …" where the verse reads "Nebuchadnezzar spake and said unto them, Is it true …". The five names (The herald, Certain Chaldeans, Nebuchadnezzar, Shadrach, Meshach, and Abednego, The king's counsellors) are the only words on those cards that are not the verse's; the reference stays, and `tools/excerpts.mjs` lists for each card the words its name stands in place of. The first journey's cards are not yet shown this way.

| Act | Verses | What you do |
|---|---|---|
| One: The Image of Gold | 3:1–13 | Walk out of Babylon by the Ishtar Gate, between the walls of lions, to the plain of Dura, where the image stands and the multitude is gathered. The herald cries. The music of 3:5 enters an instrument at a time, in the verse's order, and all the people fall down. You are asked, with no haste to answer, what you will do: stand, as the three did, or fall down and worship, and then it begins again (the question and its two answers are not scripture, and are shown in italics without a reference). Then you see the three standing among them all. Two Chaldeans go to the king and accuse them. |
| Two: Before the King | 3:13–18 | The mighty men take you to the king's seat. As he names the furnace you see it. Answer him: fill in "But if ___". |
| Three: In the Midst of the Fire | 3:19–30 | The furnace is heated seven times more; you are bound and led to it, and on the way remember that "our God whom we serve is ___ to deliver us". In the fire the fourth comes to walk with you; then, as the king saw it, count them. Come forth, and go among the princes and counsellors as the four things they saw (3:27) are told. The king blesses God. |

Four times a verse is shown with a word left out, to be filled in from three, and is then read whole; a wrong answer costs nothing. The fourth in the fire is shown as the king saw him, "like the Son of God" (3:25): a figure in white, in light, who says and does nothing the text does not, and is not seen once they have come forth. The men slain by the flame (3:22) are read of in the dark, not shown. There is no score and no other ending. It has no recorded reading yet (35 recordings, about 4,900 characters, are listed by `node tools/narrate.mjs --story fiery-furnace --dry`); the cards are read on the screen.

### Babylon, and how sure we are of it

Babylon has its own land (`world.js`, `'plain'`): a level river plain, the Euphrates going by the city, canals with fields of barley, stubble and fallow along them, date palms, and air thick with dust, no hills and no mountains. Its city (`src/game/babylon.js`) and its people (`daniel.js`) are drawn from what is known of Babylon about 600 BC:

- **Well attested** (the excavations, the museums' reconstructions): a city of brick, the colour of the brick, with glazed brick only on its great works; the Ishtar Gate faced with blue glaze, bulls and dragons walking on it in rows, never mixed in one row; the Processional Way paved with pale limestone edged with red stone, between walls of glazed lions; the king's house with yellow columns and palmettes on blue; the temple tower in stages with a blue shrine; the king as the stelae show him, in a tall conical crown with ribbons hanging behind, a long fringed robe, with a staff as tall as himself.
- **Probable, or a guess**: stepped battlements (no wall top survives to show them); houses blind to the street; men's dress of a tunic to the feet, a mantle and a cap over hair to the shoulders (Herodotus, writing later); soldiers in scale coats and pointed helmets (almost no Babylonian soldier is pictured); the furnace as a brick kiln with a door in its side and an opening at its top; the instruments of 3:5 (the Church's footnotes give "triangular stringed instrument" and "bagpipe"; others say a drum); the colours of everyone's clothes.
- **Not to scale**: the city is a small one, and its temple tower smaller than the real one (91 m square at its base).
- **Not known**: where the plain of Dura was; what the image of gold was an image of. It is given the verse's measure, 60 by 6 cubits (27.4 m by 2.74 m), as a robed figure with a tall cap and no face on a tall base, as the Church's illustrated story has "a giant, golden statue".

Not in the text, shown because a scene needs it: the king's seat on a dais under a canopy; the furnace's ramp; the people's staffs, helmets and colours; the fourth walking beside you (3:25 says "walking"); remembering 3:17 on the way to the furnace, and the still chord that follows; the four things of 3:27 told as you go among the officials.

It is a remix of Patch's [Painted valley](https://patch.gg/blendi/painted-valley), a three.js scene painted like an animated film's backgrounds. The painting, grass, sky, figure and walk come from Painted valley. This game adds the hill country, the city, the story and the night.

## The story

| Act | Verses | When | What you do |
|---|---|---|---|
| One: Up to Jerusalem | 3:7–21 | Afternoon | Consult with your brothers, walk to the gate. Laman goes in and is driven out. You answer your brothers (3:15–20). |
| Two: Our Gold and Our Silver | 3:22–4:4 | Golden hour | Go into Lehi's house by its door and gather the gold, the silver and the precious things, in any order: a list at the top left ticks each off, and Laman, Lemuel and you carry them out. Carry them to Laban. Before you flee you are asked for a word of a verse you have read; remember it and you are strengthened for the first moments of the chase. Flee his servants: what you carry slows you, and they gain on you until you leave the property behind (3:26). If they overtake you the chase begins again. Hide in the rock. The angel speaks. You answer your brothers again (4:1–3). |
| Three: Led by the Spirit | 4:5–38 | Night | No marker and no objective. Stand still and a soft light gathers in the air the way you should go, with a soft tone (4:6). Take a wrong turning and there is no light until you stand still again. Find Laban, drunken in the street. You may obey at once, or shrink as Nephi did (4:10): step back or wait, and the Spirit speaks again (4:11, 4:12–13). Then speak to Zoram in the voice of Laban, go with him into the treasury, and choose how you answer him three times. Go back to your brothers outside the walls, and make the oath. |
| The tent of their father | 5:7–8, 5:21, 3:7 | Evening | The return, and the end screen with questions to talk about. |

The words on the cards are the scripture's own, quoted from `src/game/scripture.js`. The few lines that are not scripture are shown in italics without a reference. That includes the three questions about Zoram and their answers: the right answer is what the verse says Nephi did, and the verse follows it; a wrong answer makes Zoram hesitate, and the question is asked again.

Four times a verse is shown with a word left out, to be filled in from three: after 3:7, before each try at the chase (3:16, 3:15 or 3:7, a different one each try), after 4:1 and after 4:6. The card is the verse's own words with its reference, and the right answer is the word that was there. A wrong answer costs nothing: the whole verse is read again and the story goes on.

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

On a phone or a tablet it is played by touch (`src/game/touch.js`): a thumb on the left of the screen is a stick to walk by, a finger dragged on the right looks round, a tap goes on from a card or acts, an answer is tapped to take it, and the button at the lower right runs. It is painted at low quality there unless the address says otherwise. `?touch` tries the same controls with a mouse.

Useful URL options:
- `?quality=low|medium|high` (medium by default)
- `?beat=a2` starts at a beat. The beats are `a1`, `a1-gate`, `a2`, `a2-laban`, `a2-rock`, `a3`, `a3-laban`, `a3-treasury`, `a3-walls` and `home`.
- `?auto` lets the game play itself. With `&hold` it is overtaken once in the chase before it leaves the property, and with `&wrong` it answers Zoram wrongly once each time and fills in every left-out word wrongly, so a test covers those ways too.

## Checking it

```sh
npm run build
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node tools/story.mjs            # plays the whole story headless; fails unless it reaches the end
node tools/story.mjs --query "hold&wrong"                                            # the same, overtaken once and answering wrongly once
node tools/story.mjs --beat a3 --snap "4:6,4:9" --quality medium --out shots/story   # stills when those cards are up
node tools/look.mjs city:120,0,0,4,50 --out shots/work                               # a still from any place (u, v, turn, pitch, fov)
node tools/touch.mjs                                                                 # the touch controls, on a phone-sized touch page
node tools/narration-check.mjs                                                       # the reading aloud, with a stand-in recording
node tools/fps.mjs --query "quality=medium&beat=a2-laban"                            # frame rate
node tools/story.mjs --query "story=fiery-furnace"                                   # the Daniel journey, to its end
node tools/story.mjs --query "story=fiery-furnace&bow&wrong"                         # falling down once, every word filled in wrongly
node tools/excerpts.mjs                                                              # every shortened verse is the verse's own words
node tools/same.mjs shots/before shots/after                                         # two folders of stills, pixel by pixel
```

`tools/same.mjs` is how a change to one journey is shown to leave another as it was: take stills of it with `tools/look.mjs` before the change and after, and compare.

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
- `src/game/narration.js`: the scripture read aloud, from recordings in `public/audio/narration/` made by `tools/narrate.mjs` (ElevenLabs; the key is in `.env` and stays on your machine). A card with a recording goes on by itself when it has been read; the button at the top right, or M, turns the reading off.
- `src/game/touch.js`: the touch controls, for phones and tablets.
- `src/game/daniel.js`, `src/game/scripture-daniel.js`: the Daniel journey's beats, people and clothes; Daniel 3 verse by verse, the shortened verses and those with a word left out.
- `src/game/babylon.js`, `src/game/glaze.js`: Babylon and the plain of Dura; the glazed brick's figures (bull, dragon, lion, rosette, palmette), drawn in code.
- `src/game/crowd.js`: the multitude, painted, which falls down when the music sounds.
- `src/game/heat.js`: the furnace's heat at the picture's edges.
- `src/game/ui.js`: the cards, the "What to do" panel at the top left (a line, and a checklist when the thing has parts), the prompt and the line of scripture low on the screen (the prompt above the line, so that no two lie in the one place), the way-marker (a gold diamond with how far it is, which says "Go here" when the thing to do is new, and at the picture's edge points to where the place is), fades, and the title and end screens.
- `src/valley/`, `src/lib/`, `src/figure/`: Painted valley's painting, recoloured for dry hills and given a night (`sky.js`). `world.js` has the two lands; `sky.js`, `clouds.js`, `trees.js` (olives, or date palms), `water.js` (the river) and the shared colours (`uLand` in `src/lib/glsl.js`) follow whichever the page is laid out on.

## Credits and licences

See `LICENCE-NOTES.md` and `public/CREDITS.md`. In short:
- The code is MIT, from Patch and this game.
- The figure, textures and footsteps are CC0.
- The scripture text is public domain (the Book of Mormon, Project Gutenberg #17; the King James Bible, Project Gutenberg #10).
- Painted valley's five ambience recordings are not included, because their licence doesn't allow passing them on. Wind and crickets are made in code instead.
- The music is made in code and its tunes were written for this game, so there is nothing to license.

This is an independent project. It is not an official product of The Church of Jesus Christ of Latter-day Saints.
