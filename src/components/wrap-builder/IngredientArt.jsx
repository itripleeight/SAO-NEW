import React from 'react';
import { blobPath, blobPoints, closedCurve, seededRandom } from './geometry';

// Every piece is drawn around (0, 0) at thumbnail scale. The stage and the picker thumbnails
// place, rotate and scale them, so one drawing serves both.

// Gradients and shadows shared by every wrap-builder SVG on the page. Rendered once and kept
// off-screen (not display:none, which stops some browsers from painting the gradients).
export const WrapArtDefs = () => (
  <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="wb-chicken" cx="0.45" cy="0.4">
        <stop offset="0" stopColor="#FAD27E" />
        <stop offset="0.55" stopColor="#ECA74A" />
        <stop offset="1" stopColor="#D88834" />
      </radialGradient>
      <radialGradient id="wb-beef" cx="0.45" cy="0.4">
        <stop offset="0" stopColor="#A65F38" />
        <stop offset="0.55" stopColor="#84421F" />
        <stop offset="1" stopColor="#6A3218" />
      </radialGradient>
      <radialGradient id="wb-gyro" cx="0.45" cy="0.4">
        <stop offset="0" stopColor="#C68C6C" />
        <stop offset="0.6" stopColor="#A9704E" />
        <stop offset="1" stopColor="#915A3B" />
      </radialGradient>
      <radialGradient id="wb-lettuce">
        <stop offset="0" stopColor="#E2F3B9" />
        <stop offset="0.55" stopColor="#B4DB6E" />
        <stop offset="1" stopColor="#86BC45" />
      </radialGradient>
      <radialGradient id="wb-lettuce-dark">
        <stop offset="0" stopColor="#C9E79A" />
        <stop offset="0.55" stopColor="#93C651" />
        <stop offset="1" stopColor="#6DA33A" />
      </radialGradient>
      <linearGradient id="wb-tomato" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF7259" />
        <stop offset="1" stopColor="#DC3A2C" />
      </linearGradient>
      <radialGradient id="wb-cucumber">
        <stop offset="0" stopColor="#F5FAE6" />
        <stop offset="0.75" stopColor="#E0EEBF" />
        <stop offset="1" stopColor="#BCD889" />
      </radialGradient>
      <linearGradient id="wb-pickle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#B9BE4C" />
        <stop offset="1" stopColor="#7B8A22" />
      </linearGradient>
      <linearGradient id="wb-turnip" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F983AE" />
        <stop offset="1" stopColor="#C8195F" />
      </linearGradient>
      <filter id="wb-piece-shadow" x="-10%" y="-15%" width="120%" height="140%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#3B200D" floodOpacity="0.4" />
      </filter>
      <filter id="wb-thumb-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#3B200D" floodOpacity="0.3" />
      </filter>
      <filter id="wb-sauce-shadow" x="-5%" y="-20%" width="110%" height="140%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#3B200D" floodOpacity="0.3" />
      </filter>
    </defs>
  </svg>
);

// Shaved meat: irregular, tapering slices. A darker copy of the outline sits under the meat,
// offset a little, so each slice gets a seared rim that is thicker on one side.
const meatSlices = ({ seed, width, height, wobble, taper, squareness }) => {
  const rand = seededRandom(seed);
  const between = ([min, max]) => min + rand() * (max - min);

  return Array.from({ length: 6 }, () => {
    const rx = between(width);
    const ry = between(height);
    const outline = blobPoints(rand, rx, ry, { points: 13, wobble, taper, squareness });
    const dx = (rand() - 0.5) * 1.6;
    const dy = 0.5 + rand() * 0.6;
    const grain = (y) => {
      const bow = (rand() - 0.5) * 3;
      return `M${(-rx * 0.62).toFixed(1)},${y.toFixed(1)} Q0,${(y + bow).toFixed(1)} ${(rx * 0.6).toFixed(1)},${(y - bow * 0.4).toFixed(1)}`;
    };
    const streak = rx * (0.35 + rand() * 0.3);
    const sy = -ry * (0.15 + rand() * 0.15);

    return {
      rim: closedCurve(outline),
      body: closedCurve(outline.map(([x, y]) => [x * 0.9 + dx, y * 0.8 + dy])),
      grain: [-0.32, 0.05, 0.38].map((t) => grain(t * ry)),
      specks: Array.from({ length: 3 }, () => [(rand() - 0.5) * rx * 1.1, (rand() - 0.5) * ry * 0.9, 0.5 + rand() * 0.4]),
      streak: `M${(-streak / 2).toFixed(1)},${sy.toFixed(1)} q${(streak / 2).toFixed(1)},${(-1 - rand() * 1.5).toFixed(1)} ${streak.toFixed(1)},0`,
    };
  });
};

const CHICKEN = meatSlices({ seed: 11, width: [14, 22], height: [7, 11], wobble: 0.42, taper: 0.2 });
const BEEF = meatSlices({ seed: 23, width: [13, 21], height: [5, 7.5], wobble: 0.44, taper: 0.3 });
// Gyro is shaved off a cone in wide, flat strips, so its slices are boxier.
const GYRO = meatSlices({ seed: 37, width: [18, 24], height: [8, 11], wobble: 0.14, taper: 0.1, squareness: 0.55 });

const Meat = ({ slices, variant, fill, rim, grain, speck, shine }) => {
  const slice = slices[variant % slices.length];
  return (
    <g>
      <path d={slice.rim} fill={rim} />
      <path d={slice.body} fill={fill} />
      <g fill="none" stroke={grain} strokeWidth="0.9" strokeLinecap="round" opacity="0.4">
        {slice.grain.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d={slice.streak} fill="none" stroke={shine} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {slice.specks.map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={speck} opacity="0.65" />
      ))}
    </g>
  );
};

const Chicken = ({ variant }) => (
  <Meat slices={CHICKEN} variant={variant} fill="url(#wb-chicken)" rim="#A4551D" grain="#B8682A" speck="#9C2F0A" shine="#FFEBB8" />
);

const Beef = ({ variant }) => (
  <Meat slices={BEEF} variant={variant} fill="url(#wb-beef)" rim="#2E1307" grain="#4A200E" speck="#2A1004" shine="#C98458" />
);

const Gyro = ({ variant }) => (
  <Meat slices={GYRO} variant={variant} fill="url(#wb-gyro)" rim="#55290F" grain="#7A4628" speck="#F0D2B0" shine="#EBC39C" />
);

// Torn lettuce leaves with a ruffled edge and a pale rib.
const LETTUCE = (() => {
  const rand = seededRandom(31);
  return Array.from({ length: 6 }, () => {
    const rx = 13 + rand() * 6;
    const ry = 8 + rand() * 4;
    const bend = (rand() - 0.5) * 5;
    return {
      body: blobPath(rand, rx, ry, { points: 18, wobble: 0.16, ruffle: 0.14 }),
      rib: `M${(-rx * 0.85).toFixed(1)},${(-bend).toFixed(1)} Q0,${bend.toFixed(1)} ${(rx * 0.85).toFixed(1)},${(-bend * 0.6).toFixed(1)}`,
      veins: [-0.5, -0.1, 0.3].map((t) => {
        const side = rand() < 0.5 ? -1 : 1;
        return `M${(t * rx).toFixed(1)},${(bend * 0.3).toFixed(1)} l${(rx * 0.22).toFixed(1)},${(side * ry * 0.55).toFixed(1)}`;
      }),
    };
  });
})();

const Lettuce = ({ variant }) => {
  const leaf = LETTUCE[variant % LETTUCE.length];
  return (
    <g>
      <path d={leaf.body} fill={variant % 2 ? 'url(#wb-lettuce-dark)' : 'url(#wb-lettuce)'} stroke="#6A9E30" strokeWidth="0.8" />
      <g fill="none" stroke="#EEF8D8" strokeLinecap="round">
        <path d={leaf.rib} strokeWidth="2.2" opacity="0.85" />
        {leaf.veins.map((d) => (
          <path key={d} d={d} strokeWidth="0.9" opacity="0.6" />
        ))}
      </g>
    </g>
  );
};

const TOMATO_SEEDS = [[-1.2, 0], [0.8, -1.8], [0.6, 1.8]];

const TomatoLocule = ({ angle, distance }) => (
  <g transform={`rotate(${angle}) translate(0 ${-distance})`}>
    <ellipse rx="3.4" ry="4.6" fill="#FF9E80" opacity="0.92" />
    {TOMATO_SEEDS.map(([x, y]) => (
      <ellipse key={`${x}${y}`} cx={x} cy={y} rx="0.8" ry="1.3" fill="#FFF1B5" />
    ))}
  </g>
);

const Tomato = ({ variant }) => {
  if (variant % 2 === 0) {
    // Half-moon slice, nudged so it sits centred on (0, 0).
    return (
      <g transform="translate(0 6)">
        <path d="M-15,0 A15,15 0 0 1 15,0 Z" fill="#B71C1C" />
        <path d="M-13.4,0 A13.4,13.4 0 0 1 13.4,0 Z" fill="url(#wb-tomato)" />
        <path d="M0,0 V-10" stroke="#FF8A65" strokeWidth="2.6" />
        <TomatoLocule angle={-42} distance={6.6} />
        <TomatoLocule angle={42} distance={6.6} />
        <path d="M-13.4,0 H13.4" stroke="#FFCCBC" strokeWidth="1.4" />
        <path d="M-11,-7 A13,13 0 0 1 -4,-12" fill="none" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
      </g>
    );
  }
  return (
    <g>
      <circle r="14" fill="#B71C1C" />
      <circle r="12.6" fill="url(#wb-tomato)" />
      <TomatoLocule angle={0} distance={6.2} />
      <TomatoLocule angle={120} distance={6.2} />
      <TomatoLocule angle={240} distance={6.2} />
      <circle r="2.6" fill="#FF8A65" />
      <path d="M-10,-6 A12,12 0 0 1 -3,-11.5" fill="none" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
    </g>
  );
};

// Red onion slivers: arcs of ring, as [radius, start angle, end angle].
const ONION = [[14, 200, 340], [11, 185, 355], [16.5, 215, 325], [12.5, 165, 375]];

const arc = (r, from, to) => {
  const rad = (deg) => (deg * Math.PI) / 180;
  const x0 = (r * Math.cos(rad(from))).toFixed(2);
  const y0 = (r * Math.sin(rad(from))).toFixed(2);
  const x1 = (r * Math.cos(rad(to))).toFixed(2);
  const y1 = (r * Math.sin(rad(to))).toFixed(2);
  return `M${x0},${y0} A${r},${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1},${y1}`;
};

const Onion = ({ variant }) => {
  const [r, from, to] = ONION[variant % ONION.length];
  return (
    <g transform={`translate(0 ${r * 0.7})`} fill="none" strokeLinecap="round">
      <path d={arc(r, from, to)} stroke="#F3E3F5" strokeWidth="4.8" />
      <path d={arc(r - 1.6, from + 4, to - 4)} stroke="#DCC0E0" strokeWidth="0.9" />
      <path d={arc(r + 2.3, from + 2, to - 2)} stroke="#7B1FA2" strokeWidth="1.9" />
    </g>
  );
};

const CUCUMBER_SEEDS = [0, 60, 120, 180, 240, 300];

const Cucumber = ({ variant }) => (
  <g transform={variant % 2 ? 'scale(1 0.88)' : undefined}>
    <circle r="12.5" fill="#2F6B2B" />
    <circle r="11.3" fill="#7FB547" />
    <circle r="10.5" fill="url(#wb-cucumber)" />
    <circle r="5.8" fill="#CFE3A0" opacity="0.8" />
    {CUCUMBER_SEEDS.map((angle) => (
      <ellipse key={angle} cy="-3.6" rx="0.95" ry="1.6" fill="#F8FCEC" transform={`rotate(${angle + (variant % 2) * 30})`} />
    ))}
    <path d="M-7,-6 A9,9 0 0 1 2,-9.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
  </g>
);

// Lengthwise pickle slices, so they read differently from the round cucumbers.
const PICKLE = [
  'M-18,0 C-18,-6 -9,-7 0,-7 C9,-7 18,-6 18,0 C18,6 9,7 0,7 C-9,7 -18,6 -18,0 Z',
  'M-17,3 C-17,-4 -8,-8 2,-7 C11,-6 18,-3 17,2 C16,7 8,6 0,5 C-8,5 -17,9 -17,3 Z',
];
const PICKLE_SEEDS = [-9, -4.5, 0, 4.5, 9];

const Pickle = ({ variant }) => (
  <g>
    <path d={PICKLE[variant % PICKLE.length]} fill="url(#wb-pickle)" stroke="#55661A" strokeWidth="1.5" />
    <path d="M-12,0 C-4,-1.2 4,-1.2 12,0" fill="none" stroke="#DCE08F" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
    {PICKLE_SEEDS.map((x) => (
      <ellipse key={x} cx={x} cy="-0.6" rx="1.3" ry="0.85" fill="#F1F3C4" opacity="0.9" />
    ))}
  </g>
);

// Pickled turnip batons as [width, height].
const TURNIPS = [[28, 7], [22, 6.4], [32, 7.6]];

const Turnip = ({ variant }) => {
  const [w, h] = TURNIPS[variant % TURNIPS.length];
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.38} fill="url(#wb-turnip)" stroke="#AD1457" strokeWidth="0.8" />
      <path d={`M${-w / 2 + 3},${-h / 2 + 1.8} H${w / 2 - 3}`} stroke="#FFD3E3" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    </g>
  );
};

const ART = {
  chicken: Chicken,
  beef: Beef,
  gyro: Gyro,
  lettuce: Lettuce,
  tomato: Tomato,
  onion: Onion,
  cucumber: Cucumber,
  pickles: Pickle,
  turnips: Turnip,
};

export const IngredientPiece = ({ id, variant = 0 }) => {
  const Art = ART[id];
  return <Art variant={variant} />;
};

export const IngredientThumb = ({ ingredient, className = '' }) => (
  <svg viewBox="-32 -32 64 64" className={className} aria-hidden="true" focusable="false">
    <g filter="url(#wb-thumb-shadow)">
      {ingredient.thumb.map(([x, y, rotate, scale, variant]) => (
        <g key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
          <IngredientPiece id={ingredient.id} variant={variant} />
        </g>
      ))}
    </g>
  </svg>
);
