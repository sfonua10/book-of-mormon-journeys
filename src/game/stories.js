// The journeys of the game, in the order they are released: one a week. Each is a story of its own (its beats, its
// people, what is said at its end); the select screen lists them, and the page plays the one asked for (?story=id).
//
// To release the next: write its story beside story.js, give it an entry here with `released: true`, and put a new
// teaser after it. The teaser is the one entry with `released: false`: with a title and a ref it is named on the
// select screen, and without them it only says that a new journey is coming.
import * as furnace from './daniel.js';
import { nephi } from './scripture.js';
import { daniel } from './scripture-daniel.js';
import { CLOTHES, NAMES, PEOPLE, story } from './story.js';

export const GAME = {
  name: 'Scripture Journeys',
  /** The start of every key kept in the browser. */
  save: 'bom-journeys',
};

/**
 * The standard works, in their order, and within each its books, in their order. The first screen is a tree of
 * them: a work, its books under it, and a card under each book for each of its journeys. A book with no journey yet
 * is shown greyed; a work with no journey at all, as coming. A book is one heading of journeys: a book of scripture
 * (1 Nephi, Daniel), or where it reads better, the life of one prophet across several (Moses, Elijah). `face`: the
 * portrait on its journeys' cards, in public/faces/, with `who` written under it (a story's own `face` takes its
 * place). Each story names its `work` and its `book` (the book's id).
 */
const books = (...names) => names.map((name) => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name }));

export const WORKS = [
  {
    id: 'ot',
    name: 'Old Testament',
    books: [{ id: 'daniel', name: 'Daniel', face: { src: './faces/daniel.webp', who: 'Daniel' } }],
  },
  { id: 'nt', name: 'New Testament', books: [] },
  {
    id: 'bom',
    name: 'Book of Mormon',
    books: [
      { id: '1-nephi', name: '1 Nephi', face: { src: './faces/nephi.webp', who: 'Nephi' } },
      ...books('2 Nephi', 'Jacob', 'Enos', 'Jarom', 'Omni', 'Words of Mormon', 'Mosiah', 'Alma', 'Helaman', '3 Nephi', '4 Nephi', 'Mormon', 'Ether', 'Moroni'),
    ],
  },
  { id: 'dc', name: 'Doctrine and Covenants', books: [] },
  { id: 'pgp', name: 'Pearl of Great Price', books: [] },
];

export const STORIES = [
  {
    id: 'plates-of-brass',
    work: 'bom',
    book: '1-nephi',
    /** Its number among the journeys of its book. */
    number: 1,
    title: 'I Will Go and Do',
    ref: '1 Nephi 3–4',
    blurb: 'Nephi and his brothers return to Jerusalem for the plates of brass.',
    released: true,
    /** The beat it begins at. */
    first: 'a1',
    beats: story,
    people: PEOPLE,
    names: NAMES,
    clothes: CLOTHES,
    /** The book its cards quote (scripture.js). */
    scripture: nephi,
    /** The key this story's place was kept under before there were others. */
    oldSave: 'nephi-plates:beat',
    end: {
      heading: 'The Lord Prepared a Way',
      quote: '“I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.”',
      cite: '1 Nephi 3:7',
      talk: 'Nephi and his brothers tried three times. What did Nephi know about the Lord that helped him keep going? When has the Lord prepared a way for you?',
      links: [
        ['1 Nephi 3', 'https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/3?lang=eng'],
        ['1 Nephi 4', 'https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/4?lang=eng'],
        ['1 Nephi 5', 'https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/5?lang=eng'],
      ],
    },
  },
  // the teaser: what comes next week (with no `book`, it is listed under its work's books, without a number)
  { id: 'next', work: 'bom', book: null, number: 2, title: null, ref: null, released: false },
  {
    id: 'fiery-furnace',
    work: 'ot',
    book: 'daniel',
    number: 1,
    title: 'But If Not',
    ref: 'Daniel 3',
    blurb: 'Shadrach, Meshach and Abed-nego will not bow to the image of gold, and are cast into the fire.',
    released: true,
    first: 'a1',
    beats: furnace.story,
    people: furnace.PEOPLE,
    names: furnace.NAMES,
    clothes: furnace.CLOTHES,
    scripture: daniel,
    /** Babylon, in place of Jerusalem (babylon.js), and its own people in place of Jerusalem's. */
    look: furnace.LOOK,
    /** The river plain of Babylon, in place of the hill country round Jerusalem (world.js). */
    land: 'plain',
    town: furnace.town,
    end: {
      heading: 'But If Not',
      quote: '“… our God whom we serve is able to deliver us from the burning fiery furnace, and he will deliver us out of thine hand, O king. But if not, be it known unto thee, O king, that we will not serve thy gods …”',
      cite: 'Daniel 3:17–18',
      // (as this week's Come, Follow Me asks: about trusting the Lord when faith is tried, and about choices that
      // lead others to Him; and, for children, that Jesus will help them do what is right when it is hard)
      talk: 'They did not know whether they would be delivered, and they trusted the Lord all the same. When have you been asked to do something you knew was wrong? What if faith does not bring the miracle we hope for? How did their choice lead a king to bless God, and whom might your choices help? Jesus will help you do what is right, even when it is hard: “whosoever shall put their trust in God shall be supported in their trials” (Alma 36:3).',
      links: [
        ['Daniel 3', 'https://www.churchofjesuschrist.org/study/scriptures/ot/dan/3?lang=eng'],
        ['this week’s Come, Follow Me', 'https://www.churchofjesuschrist.org/study/manual/come-follow-me-for-home-and-church-old-testament-2026/46?lang=eng'],
      ],
    },
  },
];

/** The released story of that id, or the first if there is none. */
export const storyById = (id) => STORIES.find((s) => s.released && s.id === id) ?? STORIES.find((s) => s.released);

// ---- what is kept in the browser, by story ------------------------------------------------------------------------
const key = (id, what) => `${GAME.save}:${id}:${what}`;
const get = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const set = (k, value) => {
  try {
    if (value) localStorage.setItem(k, value);
    else localStorage.removeItem(k);
  } catch {
    // (no storage: the story just starts from the beginning next time)
  }
};

/**
 * What is kept of a story: the beat reached with its act's name (`place`: { id, label } or null; `keep(id, label)`,
 * or `keep(null)` to forget it), and whether it has been finished (`done`).
 */
export function keeper(entry) {
  // (a place kept before there were other stories is brought over once)
  const old = entry.oldSave && get(entry.oldSave);
  if (old) {
    if (!get(key(entry.id, 'beat'))) set(key(entry.id, 'beat'), old);
    set(entry.oldSave, null);
  }
  return {
    get place() {
      const id = get(key(entry.id, 'beat'));
      return id ? { id, label: get(key(entry.id, 'label')) } : null;
    },
    keep(id, label = null) {
      set(key(entry.id, 'beat'), id);
      set(key(entry.id, 'label'), id && label);
    },
    get done() {
      return !!get(key(entry.id, 'done'));
    },
    set done(yes) {
      set(key(entry.id, 'done'), yes ? '1' : null);
    },
  };
}
