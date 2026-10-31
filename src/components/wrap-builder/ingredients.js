import { seededRandom } from './geometry';

// Geometry for the wrap stage, in its SVG units (the stage viewBox is 500 x 500).
export const BREAD = { cx: 250, cy: 250, r: 205 };
export const FILLING_BAND = { x0: 82, x1: 418, cy: 252, half: 50 };
// Pieces are drawn at thumbnail-friendly sizes; the stage shows them a bit larger.
const STAGE_SCALE = 1.2;

// Scatter an ingredient along the filling band, left to right, so the pieces land in one sweep.
const layoutPieces = ({ count, seed, variants, rows = 1, size = [0.9, 1.1], spin = 'along' }) => {
  const rand = seededRandom(seed);
  const { x0, x1, cy, half } = FILLING_BAND;

  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.15 + rand() * 0.7) / count;
    // The line of fillings narrows toward the ends, like it does on a real wrap.
    const taper = 1 - Math.abs(t * 2 - 1) ** 3 * 0.55;
    const lane = rows === 2 ? (i % 2 ? 0.5 : -0.5) + (rand() - 0.5) : rand() * 2 - 1;
    const flip = rand() < 0.5 ? 0 : 180;

    return {
      key: i,
      x: x0 + t * (x1 - x0),
      y: cy + lane * half * taper,
      rotate: spin === 'free' ? rand() * 360 : (rand() * 2 - 1) * 30 + flip,
      scale: (size[0] + rand() * (size[1] - size[0])) * STAGE_SCALE,
      variant: Math.floor(rand() * variants),
      delay: i * 0.026 + rand() * 0.05,
    };
  });
};

// `thumb` entries are [x, y, rotate, scale, variant] inside the picker thumbnail's 64 x 64 viewBox.
export const PROTEINS = [
  {
    id: 'chicken',
    name: 'Chicken',
    wrapName: 'Chicken Shawarma Wrap',
    description: 'Marinated chicken shawarma',
    color: '#DE8E34',
    layout: layoutPieces({ count: 28, seed: 101, variants: 6, rows: 2, size: [0.95, 1.2] }),
    thumb: [[-9, -10, -20, 0.62, 0], [10, -7, 24, 0.62, 1], [-9, 9, 12, 0.62, 2], [10, 10, -14, 0.58, 3], [0, 0, 6, 0.64, 4]],
  },
  {
    id: 'beef',
    name: 'Beef',
    wrapName: 'Beef Shawarma Wrap',
    description: 'Seasoned beef shawarma',
    color: '#7A3B1C',
    layout: layoutPieces({ count: 32, seed: 202, variants: 6, rows: 2, size: [0.95, 1.2] }),
    thumb: [[-8, -11, -15, 0.68, 0], [9, -6, 20, 0.68, 1], [-10, 8, 10, 0.66, 2], [9, 11, -18, 0.62, 3], [0, 0, 4, 0.68, 4]],
  },
  {
    id: 'gyro',
    name: 'Gyro',
    wrapName: 'Gyro Wrap',
    description: 'Classic sliced gyro',
    color: '#9C633F',
    layout: layoutPieces({ count: 22, seed: 303, variants: 6, rows: 2, size: [0.95, 1.15] }),
    thumb: [[-8, -10, -14, 0.58, 0], [10, -6, 18, 0.57, 1], [-8, 9, 8, 0.57, 2], [10, 10, -12, 0.54, 3], [0, 0, 4, 0.6, 4]],
  },
];

export const VEGGIES = [
  {
    id: 'lettuce',
    name: 'Lettuce',
    color: '#8BC34A',
    layout: layoutPieces({ count: 13, seed: 404, variants: 6, size: [0.9, 1.15] }),
    thumb: [[-6, -10, -20, 0.78, 0], [8, -3, 15, 0.78, 3], [-7, 7, 5, 0.78, 4], [7, 11, -10, 0.72, 1]],
  },
  {
    id: 'tomato',
    name: 'Tomatoes',
    color: '#E53935',
    layout: layoutPieces({ count: 8, seed: 505, variants: 2, size: [0.9, 1.1], spin: 'free' }),
    thumb: [[-9, -7, -20, 0.85, 0], [9, -6, 30, 0.85, 1], [0, 9, 10, 0.85, 0]],
  },
  {
    id: 'onion',
    name: 'Onions',
    color: '#AB47BC',
    layout: layoutPieces({ count: 10, seed: 606, variants: 4, size: [0.85, 1.1], spin: 'free' }),
    thumb: [[-8, -6, -15, 0.9, 0], [9, -3, 40, 0.9, 1], [-2, 10, 190, 0.9, 2], [1, -2, 120, 0.8, 3]],
  },
  {
    id: 'cucumber',
    name: 'Cucumbers',
    color: '#9CCC65',
    layout: layoutPieces({ count: 8, seed: 707, variants: 2, size: [0.9, 1.05], spin: 'free' }),
    thumb: [[-9, -7, 0, 0.9, 0], [9, -6, 0, 0.9, 1], [0, 9, 0, 0.95, 0]],
  },
  {
    id: 'pickles',
    name: 'Pickles',
    color: '#9E9D24',
    layout: layoutPieces({ count: 7, seed: 808, variants: 2, size: [0.9, 1.1] }),
    thumb: [[-6, -10, -25, 0.85, 0], [6, 0, 15, 0.85, 1], [-4, 10, -5, 0.85, 0]],
  },
  {
    id: 'turnips',
    name: 'Turnips',
    color: '#E91E63',
    layout: layoutPieces({ count: 9, seed: 909, variants: 3, size: [0.9, 1.1] }),
    thumb: [[-6, -11, -30, 0.85, 0], [7, -4, 20, 0.85, 1], [-5, 4, -10, 0.85, 2], [6, 12, 35, 0.85, 0]],
  },
];

export const SIZES = [
  { id: 'regular', name: 'Regular' },
  { id: 'large', name: 'Large' },
];

// Sauces can be combined, like on the Square menu. `drizzle` sauces are piped across the
// fillings; hummus goes on in dollops.
export const SAUCES = [
  { id: 'garlic', name: 'Garlic', color: '#FFFDF4', edge: '#E2D5BA', style: 'drizzle', seed: 11, amplitude: 34, waves: 7 },
  { id: 'spicy-mayo', name: 'Spicy Mayo', color: '#F5A16C', edge: '#D97A45', style: 'drizzle', seed: 22, amplitude: 27, waves: 8 },
  { id: 'tahini', name: 'Tahini', color: '#E4CA9C', edge: '#C4A16A', style: 'drizzle', seed: 33, amplitude: 39, waves: 6 },
  { id: 'hummus', name: 'Hummus', color: '#E7CC98', edge: '#C9A56A', style: 'dollop', seed: 44 },
  { id: 'tzatziki', name: 'Tzatziki', color: '#F4F8EC', edge: '#C8D6B3', style: 'drizzle', seed: 55, amplitude: 31, waves: 7, specks: '#6E9F3A' },
];

// Hot sauce on the Square menu is measured in drops and lines, so that is what the stage draws.
export const HEAT_LEVELS = [
  { id: 'mild', name: 'Mild', detail: '4 drops', drops: 4 },
  { id: 'one-line', name: 'One line', detail: '1 line', lines: 1 },
  { id: 'medium', name: 'Medium', detail: '2 lines', lines: 2 },
  { id: 'hot', name: 'Hot', detail: '4 lines', lines: 4 },
  { id: 'extra-hot', name: 'Extra hot', detail: '6 lines', lines: 6 },
  { id: 'suicide', name: 'Suicide', detail: '8 lines', lines: 8 },
];

export const HOT_SAUCE_COLOR = '#C62828';
