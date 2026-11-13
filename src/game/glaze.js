// The glazed brick of Babylon, drawn here into one picture that the city's paint reads (city.js, PART.GLAZE): the
// animals that walk in rows on the Ishtar Gate and along the Processional Way, and the borders and columns of the
// king's house. Each is drawn as the glaze has it, flat colour on the blue, in profile, facing right:
//   0 a bull (the gate: rows of bulls and of dragons, never mixed in one row)
//   1 the dragon, the mushhushshu: a serpent's head with a horn, a scaly body, a lion's forelegs, an eagle's hind
//     legs, a scorpion's tail
//   2 a lion striding, its mouth open (the walls of the Processional Way)
//   3 a rosette (the borders)
//   4 a column with a palmette above it (the front of the throne room)
// What is drawn: red, where the figure is; green, how light it is there (the brick's relief); blue, where it is in
// its second colour (a bull's horns and hooves, a lion's mane, a rosette's heart, a capital's volutes).
import * as THREE from 'three';

/** How many figures across the picture, and how many texels each is. */
export const GLAZE_CELLS = 5;
const CELL = 256;

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The picture, as a canvas (for a look at it) or a texture. */
export function glazeCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = CELL * GLAZE_CELLS;
  canvas.height = CELL;
  const g = canvas.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, canvas.width, canvas.height);
  const paint = (tone, second = 0) => `rgb(255,${Math.round(tone)},${second ? 255 : 0})`;
  const random = mulberry(5);

  /** A filled shape through points, with curves between them where `round` is set. */
  const shape = (points, fill, round = true) => {
    g.fillStyle = fill;
    g.beginPath();
    g.moveTo(...points[0]);
    if (!round) for (const p of points.slice(1)) g.lineTo(...p);
    else {
      for (let i = 1; i < points.length; i++) {
        const [ax, ay] = points[i - 1];
        const [bx, by] = points[i];
        g.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2);
      }
      g.lineTo(...points[points.length - 1]);
    }
    g.closePath();
    g.fill();
  };
  const ellipse = (x, y, rx, ry, turn, fill) => {
    g.fillStyle = fill;
    g.beginPath();
    g.ellipse(x, y, rx, ry, turn, 0, Math.PI * 2);
    g.fill();
  };
  /** A leg: a tapering band from hip to hoof, `w0` wide at the top and `w1` at the foot. */
  const leg = (x0, y0, x1, y1, w0, w1, fill) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const l = Math.hypot(dx, dy);
    const [nx, ny] = [-dy / l, dx / l];
    shape([[x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], fill, false);
  };
  const stroke = (points, width, fill) => {
    g.strokeStyle = fill;
    g.lineWidth = width;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(...points[0]);
    for (let i = 1; i < points.length - 1; i++) {
      const [ax, ay] = points[i];
      const [bx, by] = points[i + 1];
      g.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2);
    }
    g.lineTo(...points[points.length - 1]);
    g.stroke();
  };

  // ---- 0: the bull ----
  g.save();
  {
    const far = paint(150);
    const body = paint(225);
    const shade = paint(180);
    // the far legs, a step behind the near ones
    leg(158, 146, 150, 226, 13, 8, far);
    leg(92, 142, 104, 226, 14, 8, far);
    // tail, with its tuft
    stroke([[58, 110], [46, 150], [48, 194]], 7, body);
    ellipse(48, 200, 8, 13, 0, paint(200, 1));
    // the body: deep in the chest, a hump over the shoulders, the back falling to the rump
    shape([[52, 124], [60, 100], [96, 92], [140, 88], [168, 72], [192, 78], [208, 98], [210, 128], [194, 152], [160, 164], [110, 166], [70, 160], [52, 144]], body);
    shape([[150, 156], [196, 148], [178, 168], [138, 170]], shade);
    // the head, held forward and a little down, the muzzle heavy
    ellipse(218, 120, 25, 18, 0.55, body);
    ellipse(232, 142, 14, 12, 0.3, body);
    // the horn, curving forward; the ear; the curled hair of the dewlap and along the belly
    stroke([[206, 102], [214, 80], [234, 72]], 9, paint(220, 1));
    shape([[200, 104], [184, 94], [194, 114]], shade, false);
    for (let i = 0; i < 6; i++) ellipse(180 + i * 6, 156 + Math.sin(i) * 2, 3.6, 5, 0, paint(200, 1));
    for (let i = 0; i < 8; i++) ellipse(84 + i * 10, 166, 3.8, 5, 0, paint(200, 1));
    for (let i = 0; i < 5; i++) ellipse(176 + i * 7, 82 + i * 4, 3.4, 4.6, 0.4, paint(200, 1));
    // the near legs, thick, striding
    leg(176, 148, 184, 226, 14, 8, body);
    leg(76, 142, 66, 226, 15, 8, body);
    for (const x of [150, 104, 184, 66]) ellipse(x, 226, 10, 5.5, 0, paint(200, 1));
    ellipse(216, 116, 2.8, 2.8, 0, paint(60));
  }
  g.restore();

  // ---- 1: the dragon ----
  g.save();
  g.translate(CELL, 0);
  {
    const far = paint(150);
    const body = paint(235);
    // the scorpion's tail, rising high behind and curling forward at its tip, its sting in the second colour
    stroke([[70, 124], [44, 116], [28, 86], [32, 56], [50, 44], [64, 52]], 12, body);
    shape([[62, 44], [80, 52], [64, 62]], paint(220, 1), false);
    leg(148, 142, 142, 224, 10, 7, far);
    leg(94, 140, 102, 192, 11, 7, far);
    leg(102, 192, 98, 222, 7, 4, far);
    // the body, long and narrow; the neck rising, sinuous, to a serpent's head
    shape([[66, 122], [92, 106], [150, 104], [170, 96], [182, 72], [194, 50], [210, 42], [212, 60], [198, 84], [186, 118], [164, 144], [110, 148], [72, 140]], body);
    ellipse(216, 48, 22, 10, -0.15, body);
    // the horn sweeping back, the frill behind the head, the forked tongue, the scales
    stroke([[208, 40], [196, 20], [180, 12]], 6, paint(220, 1));
    for (let i = 0; i < 4; i++) stroke([[200 - i * 5, 58 + i * 8], [190 - i * 5, 62 + i * 8]], 3, paint(210, 1));
    stroke([[236, 47], [248, 42]], 3, paint(220, 1));
    stroke([[236, 50], [248, 55]], 3, paint(220, 1));
    for (let row = 0; row < 3; row++) for (let i = 0; i < 8; i++) ellipse(92 + i * 9 + row * 4, 114 + row * 9, 3.8, 3.2, 0, paint(170, (i + row) % 2));
    // a lion's forelegs; an eagle's hind legs, feathered at the thigh, with their talons
    leg(164, 140, 170, 224, 11, 8, body);
    leg(84, 132, 76, 192, 14, 7, body);
    leg(76, 192, 82, 222, 7, 4, body);
    for (let i = 0; i < 4; i++) ellipse(84 - i * 2, 146 + i * 11, 6, 4, 0.4, paint(200, 1));
    for (const [x, talon] of [[82, 1], [98, 1], [170, 0], [142, 0]]) {
      if (talon) for (const a of [-0.7, 0, 0.7]) stroke([[x, 220], [x + Math.sin(a) * 14, 230]], 3.5, paint(210, 1));
      else ellipse(x + 2, 226, 11, 5, 0, paint(220, 1));
    }
    ellipse(220, 45, 2.6, 2.6, 0, paint(60));
  }
  g.restore();

  // ---- 2: the lion ----
  g.save();
  g.translate(CELL * 2, 0);
  {
    const far = paint(150);
    const body = paint(232);
    leg(150, 146, 144, 228, 8, 6, far);
    leg(96, 144, 108, 228, 9, 6, far);
    // the tail, raised in a curve, its tuft in the second colour
    stroke([[64, 124], [44, 112], [32, 86], [40, 68]], 5, body);
    ellipse(40, 64, 7, 10, 0.3, paint(210, 1));
    // the body, lean, and the mane round the head and down the chest
    shape([[60, 126], [84, 112], [140, 110], [176, 100], [190, 120], [184, 148], [150, 152], [100, 154], [70, 148]], body);
    shape([[160, 92], [174, 70], [196, 66], [208, 80], [206, 104], [196, 136], [176, 150], [160, 128]], paint(205, 1));
    for (let i = 0; i < 9; i++) stroke([[170 + (i % 3) * 9, 80 + Math.floor(i / 3) * 18], [164 + (i % 3) * 9, 94 + Math.floor(i / 3) * 18]], 3, paint(160, 1));
    // the head, its jaws open
    ellipse(208, 92, 20, 15, 0.1, body);
    shape([[214, 98], [234, 96], [236, 104], [216, 108]], body, false);
    shape([[220, 102], [236, 100], [226, 106]], paint(40), false);
    shape([[216, 106], [232, 108], [220, 116]], body, false);
    shape([[196, 76], [202, 64], [208, 78]], body, false);
    ellipse(214, 88, 2.4, 2.4, 0, paint(50));
    leg(168, 146, 176, 228, 9, 6, body);
    leg(80, 142, 72, 228, 10, 6, body);
    for (const x of [144, 108, 176, 72]) ellipse(x + 3, 227, 9, 4.5, 0, paint(215));
  }
  g.restore();

  // ---- 3: a rosette ----
  g.save();
  g.translate(CELL * 3 + 128, 128);
  for (let i = 0; i < 12; i++) {
    g.rotate((Math.PI * 2) / 12);
    ellipse(0, -62, 15, 40, 0, paint(225));
  }
  ellipse(0, 0, 30, 30, 0, paint(235, 1));
  ellipse(0, 0, 14, 14, 0, paint(170, 1));
  g.restore();

  // ---- 4: a column with a palmette ----
  g.save();
  g.translate(CELL * 4, 0);
  {
    // the shaft, with its bands
    g.fillStyle = paint(225);
    g.fillRect(104, 128, 48, 128);
    for (const y of [150, 200, 240]) {
      g.fillStyle = paint(170);
      g.fillRect(104, y, 48, 5);
    }
    // the capital: two volutes, in the second colour
    for (const side of [-1, 1]) {
      g.save();
      g.translate(128 + side * 34, 112);
      g.strokeStyle = paint(225, 1);
      g.lineWidth = 9;
      g.beginPath();
      for (let k = 0; k <= 40; k++) {
        const a = k * 0.28;
        const r = 26 - k * 0.55;
        g.lineTo(side * Math.cos(a) * r, -Math.sin(a) * r);
      }
      g.stroke();
      g.restore();
    }
    g.fillStyle = paint(225, 1);
    g.fillRect(96, 104, 64, 16);
    // the palmette: leaves fanning up from the capital
    for (let i = -4; i <= 4; i++) {
      g.save();
      g.translate(128, 96);
      g.rotate(i * 0.24);
      ellipse(0, -46, 10, 42, 0, paint(i % 2 ? 210 : 235));
      g.restore();
    }
  }
  g.restore();
  return canvas;
}

export function glazeTexture() {
  const texture = new THREE.CanvasTexture(glazeCanvas());
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
