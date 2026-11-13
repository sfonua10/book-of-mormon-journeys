// What leaves the page: a count of how the game is played, and a parent's note at a journey's end. Nothing else in
// the game sends anything anywhere, and this is the one file that knows where it goes.
//
// The counts go to Umami (umami.is) through its own script, which index.html loads and which counts each page as it
// is opened. Here the journey is counted as it is played: that it was begun, each act reached, where it was left,
// that it was finished, and the answer to the one question at its end. No cookie is set, nothing is kept in the
// browser, and nothing says who is playing. A count that cannot be made (the script kept out by a blocker, or not
// yet come) is let go: the game never waits on one.
//
// Nothing is counted on a developer's machine or in a test: the script counts only on the game's own address
// (`data-domains` in index.html), and not where the browser asks not to be tracked (`data-do-not-track`), nor in a
// browser where `umami.disabled` has been kept (`localStorage.setItem('umami.disabled', 1)` in the console, to leave
// your own plays out). Here, besides, nothing is counted in a test (?auto, ?step, ?beat, or a browser driven by a
// program). `?count=log` writes each count to the console in place of making it, anywhere, for checking.

/** Lower-case letters, digits, - and _, and not long: all that is taken from the address for where a visitor came from. */
const plain = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);

const kept = (name) => {
  try {
    return localStorage.getItem(name);
  } catch {
    return null;
  }
};

/**
 * @param options.journey the id of the journey this page plays: its counts are filed under it, as a page of that
 *   name beside the game's own, so that one journey's can be told from another's
 * @param options.params the address's options
 * @param options.log writes a line (for ?count=log)
 * @returns `count(name, data)` for something that happened, with `count.on` (whether it would be counted now) and
 *   `count.from` (where the link was posted: the address's `?utm_source=`, which Umami reads too, or `?from=`)
 */
export function createTally({ journey = '', params = new URLSearchParams(location.search), log = console.log } = {}) {
  const logging = params.get('count') === 'log';
  const local = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);
  const test = ['auto', 'step', 'beat'].some((name) => params.has(name)) || !!navigator.webdriver;
  const asked = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const may = !local && !test && !asked && !kept('umami.disabled');
  const url = `${location.pathname.replace(/[^/]*$/, '')}${journey}`;

  const count = (name, data = null) => {
    if (logging) return void log(`count ${name} ${url}${data ? ` ${JSON.stringify(data)}` : ''}`);
    if (!may) return;
    try {
      // (as Umami's script makes a count of its own, under this journey's name in place of the page's address)
      window.umami?.track((page) => ({ ...page, url, name, ...(data && { data }) }));
    } catch {
      // (the count is let go)
    }
  };
  Object.defineProperty(count, 'on', { get: () => logging || (may && !!window.umami) });
  count.from = plain(params.get('utm_source') ?? params.get('from'));
  return count;
}

/**
 * A parent's note at a journey's end, sent to a Google Form whose answers its owner reads in a sheet.
 * @param options.form { url, journey, note, email }: the form's `formResponse` address and the names of its three
 *   fields (`entry.123…`), from stories.js; with no address there is no note to send
 * @returns `send({ journey, note, email })`, which resolves when it has gone (and rejects if it could not), or null
 *   where there is nowhere to send one. With ?count=log it is written to the console instead (its length, not its words).
 */
export function createNotes({ form = {}, params = new URLSearchParams(location.search), log = console.log } = {}) {
  if (params.get('count') === 'log') {
    return async ({ journey, note, email }) => log(`note ${journey} ${note.length} characters${email ? ', with an email' : ''}`);
  }
  if (!form.url || !form.note) return null;
  return async ({ journey, note, email }) => {
    const body = new URLSearchParams();
    if (form.journey) body.set(form.journey, journey);
    body.set(form.note, note);
    if (form.email && email) body.set(form.email, email);
    // (no-cors: the form takes the answer and says nothing this page may read, which is all that is wanted)
    await fetch(form.url, { method: 'POST', mode: 'no-cors', body, credentials: 'omit' });
  };
}
