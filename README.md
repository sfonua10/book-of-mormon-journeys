# Scripture Journeys

**Play it: <https://sfonua10.github.io/scripture-journeys/>**

Painted walking games through the scriptures, one journey at a time. The first screen asks for a book of scripture (the Book of Mormon, the Old Testament), then lists that book's journeys, with the next one shown as coming.

Adding a journey: write its story beside `src/game/story.js`, give it an entry in `src/game/stories.js` with its `work` (the book it belongs to), its `scripture` (the verses its cards quote) and `released: true`. A journey may bring its own land (`land`: the hill country round Jerusalem, or `'plain'`, the river plain of Babylon, in `src/valley/world.js`), its own city (`look`), people and clothes, as the Daniel journeys do (`src/game/daniel.js`, `src/game/lions-den.js`, `src/game/babylon.js`). Each journey keeps its own place in the browser.

(The game was first called Book of Mormon Journeys, when the Book of Mormon was all it held. The old web address and the old repository name redirect to the new ones.)

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

## Old Testament, Journey 2: As He Did Aforetime

**Daniel 6**, in the King James Version: the writing that is signed, Daniel at his open windows, the den of lions, and the morning. You are Daniel. It follows the same week's *Come, Follow Me* (Daniel 1–7: "I can trust in the Lord when my faith is tried"; and for children, "Heavenly Father wants me to pray often" and "Jesus will help me do what is right even when it's hard"), and its end asks what the lesson asks.

> "Now when Daniel knew that the writing was signed, he went into his house; and his windows being open in his chamber toward Jerusalem, he kneeled upon his knees three times a day, and prayed, and gave thanks before his God, as he did aforetime." (Daniel 6:10)

It is told as the Daniel 3 journey is: what is said is a card under the speaker's name (Darius, The presidents and princes, Daniel), what is only done is a line read while you walk, a cut verse is marked with "…", and `tools/excerpts.mjs` checks every one against its verse. It takes about 12–15 minutes.

| Act | Verses | What you do |
|---|---|---|
| One: An Excellent Spirit | 6:1–9 | Walk out by the Ishtar Gate, between the walls of lions, to the king's seat. Hear the accounts of four of the princes, in what order you will (6:2), while the other two presidents keep behind you and watch; what they sought and did not find (6:4) is told a part at a time. Then, from a little way off, they go to the king, and he signs the writing. Fill in "the law of the Medes and Persians, which ___ not". |
| Two: Three Times a Day | 6:10–15 | You are asked, with no haste to answer, what you will do now that the writing is signed: go into your house and pray, as before, or not; choose not to, and what Daniel did is read again (the question and its two answers are not scripture, and are shown in italics without a reference). Go into your house. Kneel at the open window three times, in the morning, at noon and at evening, the sun crossing the sky between. At the third, the men assemble at the door and the windows and find you praying: there is one thing to do, and it is to keep praying. Fill in "and prayed, and gave ___ before his God". Then, before the king, the sun goes down as he labours to deliver you. |
| Three: The Den of Lions | 6:16–18 | The king's men bring you to the den. From its floor you look up to its mouth as the king speaks, and the stone is laid upon it and the light goes. In the dark the lions prowl, their eyes shining. Then there is light, and one in white standing in it, and every lion's mouth is shut. Walk among the lions: each one you come to lies down. The king's sleepless night is read as you rest among them. |
| Four: The Living God | 6:19–28 | Very early in the morning the stone is drawn off and the king cries down to you. Answer him: fill in "hath shut the lions' ___". You are taken up: fill in "because he ___ in his God". Go with the king to his seat, where he sends his writing to all people. |

Four times a verse is shown with a word left out, as in the Daniel 3 journey; a wrong answer costs nothing. There is no score and no other ending. It has no recorded reading yet (45 recordings, about 5,200 characters, are listed by `node tools/narrate.mjs --story lions-den --dry`).

What is shown, and what is not:

- Daniel is cast into the den between one picture and the next, and taken up out of it the same way.
- Of his night there the chapter tells only what he says in the morning: "My God hath sent his angel, and hath shut the lions' mouths, that they have not hurt me" (6:22). That is what is shown: a figure in white, in light, who says nothing and is called nothing but what the verse calls him; the lions' mouths shut. The lions lying down as you go among them is the game's picture of "they have not hurt me", not the text's words.
- What was done to those who accused him, "them, their children, and their wives" (6:24), is read whole, in the dark, and not seen, as the men slain by the flame are in the Daniel 3 journey.
- The lions (`src/game/lions.js`) are made in code, of a few solid parts, and painted as the people are. They walk, look, open and shut their mouths, and lie down. Nothing shows a lion harming anyone.

**The end of it** sets four things told of Daniel beside four told of Jesus Christ, each the verse's own words and nothing said of them (the Gospel verses are from the same King James text, and `tools/excerpts.mjs` checks them too), and then asks one question: no fault found in him (6:4, Luke 23:4); a ruler who sought to deliver him (6:14, John 19:12); a stone laid and sealed (6:17, Matthew 27:66); very early in the morning (6:19, Mark 16:2). This is a long-held reading of the chapter among Christians; it is not in that week's *Come, Follow Me*, which is why it is set apart under its own heading, after the lesson's questions.

### Babylon in the days of Darius, and how sure we are of it

The same city and plain (`BABYLON_DARIUS` in `src/game/babylon.js`: the same walls, gate and king's seat, so the Daniel 3 journey is not changed by it), with Daniel's house and the den where the image and the furnace stood a lifetime before.

- **Not known**: where Daniel's house stood, where the den was, or where the king sat; who "Darius the Median" (5:31) was, outside the book of Daniel; how his court was dressed. They are given Babylon's long fringed tunics and mantles, the king a robe of blue and a mantle of crimson.
- **A guess**: the den as a walled and roofed place of brick entered from above by one mouth, with a ramp up to its roof. The text has him "cast into" it, a stone "laid upon the mouth" of it, Daniel "taken up out of" it, and "the bottom of the den" (6:16–17, 6:23–24), and that is all that is known of it. Kings of Assyria and Babylon did keep lions.
- **A guess**: Daniel's house as one room with three open windows in one wall (6:10 says "his chamber", which the Aramaic has as an upper room). The windows look the way the sun goes down in this land, past the walls of Babylon.
- **Reckoned**: that Daniel is an old man. He was brought to Babylon as a youth (1:1–6), and Babylon fell some seventy years later; so his hair and beard are white.
- **Not in the text, shown because a scene needs it**: hearing the princes' accounts (6:2 says only that they gave them); the men coming to the door and windows (6:11 says they "assembled, and found Daniel praying"); the light in the chamber as he prays; the king and his lords standing at the den's mouth; the multitude before the king's seat when he writes "unto all people" (6:25).

The morning's light is the evening's turned about (`src/valley/sky.js`): this land had only afternoons and nights before.

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
- `?names=0` leaves off the names written small over those the text names (`src/game/names.js`)
- `?beat=a2` starts at a beat. The beats are `a1`, `a1-gate`, `a2`, `a2-laban`, `a2-rock`, `a3`, `a3-laban`, `a3-treasury`, `a3-walls` and `home`. (With `?story=fiery-furnace`: `a1`, `a1-dura`, `a2`, `a3`, `a3-fire`, `a3-forth`. With `?story=lions-den`: `a1`, `a1-accounts`, `a2`, `a2-king`, `a3`, `a3-den`, `a4`, `a4-up`.)
- `?auto` lets the game play itself. With `&hold` it is overtaken once in the chase before it leaves the property, and with `&wrong` it answers Zoram wrongly once each time and fills in every left-out word wrongly, so a test covers those ways too.
- `?count=log` writes what would be counted to the console in place of counting it (see "What is counted").

## What is counted

To know whether the game is played, and where it is left off, a little is counted, with [Umami](https://umami.is): no cookies, nothing kept in the browser, and nothing that says who is playing.

- Umami's script (in `index.html`) counts each visit: the page, the site that linked to it, the country, and the kind of device.
- `src/game/tally.js` counts a journey as it is played: `start` (which journey, begun or gone on with, by touch or keys), each act as it is reached (`act-two`, `act-three`, …), `left` (the beat it was left at, and after how many minutes) if the page is closed before the end, `end` (and how many minutes it took), and `again`. In Umami these are filed under the journey's name as a page (`/scripture-journeys/fiery-furnace`), so one journey's can be told from another's.
- The end of a journey asks one question, "Did your family enjoy this journey?", answered with a tap (`enjoyed`: yes, somewhat or no).
- A parent may write a note there, and leave an email to hear of new journeys. That goes to a Google Form, not to Umami (which is told only that a note was sent), and the box is shown only once the form is named in `GAME.notes` in `src/game/stories.js`.

Nothing is counted on your own machine or by the tests (the script counts only on the address named in its `data-domains`, which must be changed if the game moves), nor where the browser asks not to be tracked. To leave your own plays on the live game out, run `localStorage.setItem('umami.disabled', 1)` once in that browser's console.

To see which place a link was posted brings players, give each its own: `…/scripture-journeys/?utm_source=facebook`, `?utm_source=reddit`, `?utm_source=x` (add `&story=fiery-furnace` to open on that journey's book). Umami lists these as sources, and `start` carries the same word as `from`.

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
node tools/story.mjs --query "story=lions-den"                                       # the Daniel 6 journey, to its end
node tools/story.mjs --query "story=lions-den&wrong"                                 # choosing not to pray once, every word filled in wrongly
node tools/journeys.mjs                                                              # the list of journeys, what is kept, and the end screens
node tools/excerpts.mjs                                                              # every shortened verse is the verse's own words
node tools/verses.mjs pg10.txt "The Book of Daniel" --check src/game/scripture-daniel.js VERSES   # the verses are as the King James text has them
node tools/same.mjs shots/before shots/after                                         # two folders of stills, pixel by pixel
node tools/count-check.mjs                                                           # what is counted, and that a test's play is not
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
- `src/game/tally.js`: what leaves the page: the counts of how a journey is played, and a parent's note at its end.
- `src/game/daniel.js`, `src/game/scripture-daniel.js`: the Daniel journey's beats, people and clothes; Daniel 3 verse by verse, the shortened verses and those with a word left out.
- `src/game/babylon.js`, `src/game/glaze.js`: Babylon and the plain of Dura; the glazed brick's figures (bull, dragon, lion, rosette, palmette), drawn in code.
- `src/game/lions-den.js`, `src/game/lions.js`, `src/game/telling.js`: the Daniel 6 journey's beats, people and clothes; the lions of the den, made in code; and how a story shows its scripture (a card, a line, a verse with a word left out).
- `tools/verses.mjs`: prints verses for `scripture-daniel.js` from the King James text as published (Project Gutenberg #10), and checks the table against it.
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
