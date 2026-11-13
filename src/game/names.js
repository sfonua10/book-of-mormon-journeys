// The names of those the text names, written small over their heads, so that Laman is known from Lemuel. Plain DOM
// over the painting, as all else that is written is (ui.js): the letters stay sharp however the picture is drawn.
//
// A name is meant to be found when looked for and not to be in the way: it is small and pale, plainest near at hand,
// thinner with distance and gone by thirty metres. It is not shown through a wall, nor over one who is not drawn,
// and it gives way to the way-marker where the two would be written over each other.
import * as THREE from 'three';

const CSS = /* css */ `
#g-names { inset: 0; overflow: hidden; z-index: 4; }
#g-names .n {
  position: absolute; left: 0; top: 0; opacity: 0; transition: opacity 0.35s; white-space: nowrap; will-change: transform, opacity;
  color: var(--ink, #f4ead6); font-size: 13px; letter-spacing: 0.09em; font-variant: small-caps;
  /* (dark close about the letters, so that they are read against pale sand and sky as against a wall) */
  text-shadow: 0 0 2px rgba(12, 8, 4, 0.95), 0 1px 3px rgba(12, 8, 4, 0.8), 0 0 8px rgba(12, 8, 4, 0.5);
}
body.touch #g-names .n { font-size: 12px; }
`;

/** Metres from the eye: as plain as it gets within NEAR, gone at FAR. MOST is how plain that is (1 would be solid). */
const NEAR = 12;
const FAR = 30;
const MOST = 0.8;
/**
 * How far over the ground (metres) a name is written: just over a man's head as he stands, which is as high as what
 * he wears on it (the `head` of his outfit, wanderer.js: a bare head's crown is at 1.76 m); and over one who lies in
 * the street.
 */
const OVER = { none: 1.84, band: 1.84, cloth: 1.86, cap: 1.95, turban: 1.98, helmet: 1.98, crown: 2.17 };
const OVER_LYING = 0.7;

/**
 * @param blocked (from, dir, max) => metres to what stands in the way along that line, or null (the walker's ray)
 */
export function createNames(blocked) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  const layer = document.createElement('div');
  layer.id = 'g-names';
  layer.className = 'g-layer';
  document.body.append(layer);
  const list = [];
  const at = new THREE.Vector3();
  const eye = new THREE.Vector3();
  const dir = new THREE.Vector3();
  let turn = 0;
  return {
    /**
     * A name over someone. `object` is what he is drawn as (it stands where his feet are); `seen()` says whether he
     * is drawn at all, `head()` what he wears on his head now, `lying()` whether he lies on the ground.
     */
    add(text, object, seen, head = () => 'none', lying = () => false) {
      const e = document.createElement('div');
      e.className = 'n';
      e.textContent = text;
      layer.append(e);
      list.push({ e, object, seen, head, lying, wide: 4.5 * text.length, clear: true, show: 0, where: '' });
    },
    /**
     * Each frame, once the camera is where the frame is drawn from. With `on` false, none are shown. `marker` is
     * where on the page the way-marker is ([x, y]), if it is shown: its words hang under it.
     */
    update(camera, width, height, on = true, marker = null) {
      eye.setFromMatrixPosition(camera.matrixWorld);
      turn++;
      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        let show = 0;
        if (on && n.seen()) {
          const o = n.object;
          at.set(o.position.x, o.position.y + (n.lying() ? OVER_LYING : (OVER[n.head()] ?? OVER.cap) * o.scale.y), o.position.z);
          const far = at.distanceTo(eye);
          if (far < FAR) {
            // (whether anything stands between is asked every fourth frame, each of them in his turn)
            if ((turn + i) % 4 === 0) {
              const hit = blocked(eye, dir.copy(at).sub(eye).divideScalar(far), far);
              n.clear = hit == null || hit > far - 0.5;
            }
            at.project(camera);
            if (at.z < 1) {
              // (it is kept where he is even off the edge of the picture, so that it fades there and not on the way)
              const x = (at.x * 0.5 + 0.5) * width;
              const y = (-at.y * 0.5 + 0.5) * height;
              const where = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
              if (where !== n.where) n.e.style.transform = n.where = where;
              const under = marker && Math.abs(x - marker[0]) < 70 + n.wide && y > marker[1] - 18 && y < marker[1] + 70;
              if (n.clear && !under && Math.abs(at.x) < 1.1 && Math.abs(at.y) < 1.1) show = MOST * Math.min(1, (FAR - far) / (FAR - NEAR));
            }
          }
        }
        show = Math.round(show * 20) / 20;
        if (show !== n.show) n.e.style.opacity = n.show = show;
      }
    },
  };
}
