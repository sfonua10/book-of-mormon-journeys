// A stand-in for Patch's block helper (Patch ships its own with every block, under no stated open licence, so it is
// not carried here). The game only needs three things of it: to say how far loading has got, to say it is ready,
// and to hear when it can't be seen, so it can stop drawing. Here the page itself says when it is hidden.
export function patchBlock({ onVisible } = {}) {
  let visible = !document.hidden;
  document.addEventListener('visibilitychange', () => {
    if (visible === !document.hidden) return;
    visible = !document.hidden;
    onVisible?.(visible);
  });
  return {
    progress() {},
    ready() {},
    state() {},
    get values() {
      return {};
    },
    get visible() {
      return visible;
    },
  };
}
