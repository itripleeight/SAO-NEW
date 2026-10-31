import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FILLING_BAND, HOT_SAUCE_COLOR } from './ingredients';
import { blobPath, openCurve, seededRandom } from './geometry';

const { x0, x1, cy } = FILLING_BAND;

// Pipes a path on from left to right, like sauce leaving a squeeze bottle.
const piped = (delay = 0, opacity = 1) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity,
    transition: { pathLength: { duration: 0.9, ease: 'easeInOut', delay }, opacity: { duration: 0.01, delay } },
  },
});

// A zig-zag across the fillings, narrower toward the ends of the wrap.
const drizzlePoints = ({ seed, amplitude, waves }) => {
  const rand = seededRandom(seed);
  const steps = waves * 2;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const taper = 1 - Math.abs(t * 2 - 1) ** 3 * 0.5;
    return [
      x0 + 14 + t * (x1 - x0 - 28) + (rand() - 0.5) * 8,
      cy + (i % 2 ? 1 : -1) * amplitude * taper * (0.75 + rand() * 0.35),
    ];
  });
};

const Drizzle = ({ sauce }) => {
  const { d, specks } = useMemo(() => {
    const points = drizzlePoints(sauce);
    const rand = seededRandom(sauce.seed + 7);
    return {
      d: openCurve(points),
      // Herb flecks sit on the line, so they only need to land near the points it passes through.
      specks: sauce.specks ? points.flatMap(([x, y]) => [0, 1].map(() => [x + (rand() - 0.5) * 7, y + (rand() - 0.5) * 4])) : [],
    };
  }, [sauce]);

  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <motion.path d={d} stroke={sauce.edge} strokeWidth="7.5" {...piped()} />
      <motion.path d={d} stroke={sauce.color} strokeWidth="5.5" {...piped()} />
      <g transform="translate(-0.8 -1.4)">
        <motion.path d={d} stroke="#FFFFFF" strokeWidth="1.4" {...piped(0, 0.55)} />
      </g>
      {specks.map(([x, y], i) => (
        <motion.circle
          key={`${x}${y}`}
          cx={x}
          cy={y}
          r="1.1"
          fill={sauce.specks}
          stroke="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 0.4 + i * 0.02 }}
        />
      ))}
    </g>
  );
};

const HUMMUS_SWIRL = 'M-6,1 C-6,-5 4,-6 5,-1 C6,3 0,5 -2,2 C-3,0 0,-2 1,0';
const PAPRIKA = [[-5, 4, 0.9], [6, -4, 0.8], [3, 5, 0.7]];

const Dollops = ({ sauce }) => {
  const dollops = useMemo(() => {
    const rand = seededRandom(sauce.seed);
    return Array.from({ length: 5 }, (_, i) => ({
      key: i,
      x: x0 + 24 + ((i + 0.5) / 5) * (x1 - x0 - 48) + (rand() - 0.5) * 16,
      y: cy + (rand() - 0.5) * 40,
      body: blobPath(rand, 15, 11, { points: 10, wobble: 0.25 }),
      rotate: Math.round(rand() * 360),
    }));
  }, [sauce]);

  return dollops.map((dollop) => (
    <g key={dollop.key} transform={`translate(${dollop.x.toFixed(1)} ${dollop.y.toFixed(1)})`}>
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 15, delay: dollop.key * 0.09 }}
      >
        <path d={dollop.body} fill={sauce.color} stroke={sauce.edge} strokeWidth="1" transform={`rotate(${dollop.rotate})`} />
        <path d={HUMMUS_SWIRL} fill="none" stroke={sauce.edge} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <ellipse cx="1" cy="-1" rx="3.2" ry="2.2" fill="#D9A93A" opacity="0.7" />
        {PAPRIKA.map(([x, y, r]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#B5361F" />
        ))}
      </motion.g>
    </g>
  ));
};

// One sauce on the stage. It sits above the veggies and fades away when removed.
export const SauceLayer = ({ sauce }) => (
  <motion.g exit={{ opacity: 0, transition: { duration: 0.25 } }} filter="url(#wb-sauce-shadow)">
    {sauce.style === 'dollop' ? <Dollops sauce={sauce} /> : <Drizzle sauce={sauce} />}
  </motion.g>
);

// Hot sauce, drawn the way the menu measures it: in drops or in lines along the wrap.
export const HeatLayer = ({ level }) => {
  const marks = useMemo(() => {
    const rand = seededRandom(level.id.length * 97);
    if (level.drops) {
      return {
        drops: Array.from({ length: level.drops }, (_, i) => [
          x0 + 50 + ((i + 0.5) / level.drops) * (x1 - x0 - 100) + (rand() - 0.5) * 20,
          cy + (rand() - 0.5) * 50,
        ]),
      };
    }
    const spacing = Math.min(13, 70 / level.lines);
    return {
      lines: Array.from({ length: level.lines }, (_, i) => {
        const offset = (i - (level.lines - 1) / 2) * spacing;
        return openCurve(
          Array.from({ length: 7 }, (__, k) => {
            const t = k / 6;
            const taper = 1 - Math.abs(t * 2 - 1) ** 3 * 0.45;
            return [x0 + 22 + t * (x1 - x0 - 44), cy + offset * taper + (rand() - 0.5) * 7];
          })
        );
      }),
    };
  }, [level]);

  return (
    <motion.g exit={{ opacity: 0, transition: { duration: 0.25 } }} filter="url(#wb-sauce-shadow)">
      {marks.drops?.map(([x, y], i) => (
        <g key={`${x}${y}`} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14, delay: i * 0.12 }}
          >
            <circle r="4.6" fill={HOT_SAUCE_COLOR} />
            <circle cx="-1.4" cy="-1.5" r="1.3" fill="#FF8A80" opacity="0.8" />
          </motion.g>
        </g>
      ))}
      {marks.lines?.map((d, i) => (
        <motion.path key={d} d={d} fill="none" stroke={HOT_SAUCE_COLOR} strokeWidth="2.6" strokeLinecap="round" {...piped(i * 0.1)} />
      ))}
    </motion.g>
  );
};

// A sauce cup for the picker. Without a sauce it is the empty cup for "No sauce".
export const SauceThumb = ({ sauce, className = '' }) => (
  <svg viewBox="-32 -32 64 64" className={className} aria-hidden="true" focusable="false">
    <ellipse cy="17" rx="21" ry="5" fill="#3B200D" opacity="0.15" />
    <path d="M-21,-4 C-20,10 -14,17 0,17 C14,17 20,10 21,-4 Z" fill="#FFFFFF" stroke="#DCD2C3" strokeWidth="1.2" />
    <ellipse cy="-4" rx="21" ry="7.5" fill="#F3EDE4" stroke="#DCD2C3" strokeWidth="1.2" />
    {sauce ? (
      <g>
        <ellipse cy="-3.5" rx="17.5" ry="5.6" fill={sauce.color} stroke={sauce.edge} strokeWidth="0.9" />
        {sauce.style === 'dollop' ? (
          <g transform="translate(0 -3.5) scale(1.3 0.5)">
            <path d={HUMMUS_SWIRL} fill="none" stroke={sauce.edge} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        ) : (
          <path d="M-10,-5 C-6,-7 -1,-7 3,-6.5" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        )}
        {sauce.specks && (
          <g fill={sauce.specks}>
            <circle cx="-7" cy="-3" r="0.9" />
            <circle cx="2" cy="-5" r="0.8" />
            <circle cx="8" cy="-2" r="0.9" />
            <circle cx="-1" cy="-1.5" r="0.7" />
          </g>
        )}
      </g>
    ) : (
      <path d="M-12,-14 L12,8" stroke="#BDBDBD" strokeWidth="3.2" strokeLinecap="round" />
    )}
  </svg>
);
