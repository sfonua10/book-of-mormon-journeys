// The journeys of the game, in the order they are released: one a week. Each is a story of its own (its beats, its
// people, what is said at its end); the select screen lists them, and the page plays the one asked for (?story=id).
//
// To release the next: write its story beside story.js, give it an entry here with `released: true`, and put a new
// teaser after it. The teaser is the one entry with `released: false`: with a title and a ref it is named on the
// select screen, and without them it only says that a new journey is coming.
import { CLOTHES, PEOPLE, story } from './story.js';

export const GAME = {
  name: 'Book of Mormon Journeys',
  /** The start of every key kept in the browser. */
  save: 'bom-journeys',
};

export const STORIES = [
  {
    id: 'plates-of-brass',
    number: 1,
    title: 'I Will Go and Do',
    ref: '1 Nephi 3–4',
    blurb: 'Nephi and his brothers return to Jerusalem for the plates of brass.',
    released: true,
    /** The beat it begins at. */
    first: 'a1',
    beats: story,
    people: PEOPLE,
    clothes: CLOTHES,
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
  // the teaser: what comes next week
  { id: 'next', number: 2, title: null, ref: null, released: false },
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
