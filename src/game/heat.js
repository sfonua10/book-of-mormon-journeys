// The furnace's heat, felt at the edges of the picture: a glow of orange round its border that comes up as the fire is
// made hotter (Daniel 3:19, "seven times more") and flickers as flames do. Drawn over the painting like the story's
// other layers (ui.js), and taking nothing from the pointer.

const CSS = /* css */ `
#g-heat {
  position: fixed; inset: 0; pointer-events: none; z-index: 4; opacity: 0; transition: opacity 1.4s ease;
  background: radial-gradient(ellipse at 50% 55%, transparent 46%, rgba(255, 130, 40, 0.22) 74%, rgba(255, 90, 20, 0.5) 100%);
  animation: g-heat 1.7s ease-in-out infinite alternate;
}
@keyframes g-heat { from { filter: brightness(0.9); } to { filter: brightness(1.15); } }
@media (prefers-reduced-motion: reduce) { #g-heat { animation: none; } }
`;

export function createHeat() {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  const el = document.createElement('div');
  el.id = 'g-heat';
  document.body.append(el);
  return {
    /** How strongly it is felt, 0 to 1. */
    set(level) {
      el.style.opacity = String(Math.max(0, Math.min(1, level)));
    },
  };
}
