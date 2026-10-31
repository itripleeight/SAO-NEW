import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, animate, useReducedMotion } from 'framer-motion';
import { IngredientPiece } from './IngredientArt';
import WrappedShawarma from './WrappedShawarma';
import { HeatLayer, SauceLayer } from './SauceArt';
import { BREAD, HOT_SAUCE_COLOR } from './ingredients';
import { closedCurve, seededRandom } from './geometry';

// A hand-stretched flatbread is never a perfect circle.
const BREAD_OUTLINE = (() => {
  const rand = seededRandom(42);
  const points = Array.from({ length: 36 }, (_, i) => {
    const angle = (i / 36) * Math.PI * 2;
    const r = BREAD.r + (rand() - 0.5) * 6;
    return [BREAD.cx + Math.cos(angle) * r, BREAD.cy + Math.sin(angle) * r];
  });
  return closedCurve(points);
})();

const pointOnBread = (rand, reach) => {
  const angle = rand() * Math.PI * 2;
  const distance = Math.sqrt(rand()) * BREAD.r * reach;
  return [BREAD.cx + Math.cos(angle) * distance, BREAD.cy + Math.sin(angle) * distance];
};

const TOAST_SPOTS = (() => {
  const rand = seededRandom(1234);
  return Array.from({ length: 30 }, (_, i) => {
    const [x, y] = pointOnBread(rand, 0.9);
    return {
      key: i,
      x,
      y,
      rx: 3 + rand() * 9,
      ry: 2 + rand() * 5,
      rotate: rand() * 180,
      opacity: 0.16 + rand() * 0.24,
      tone: rand() < 0.5 ? '#B5743A' : '#A0602A',
    };
  });
})();

const CHAR_SPECKS = (() => {
  const rand = seededRandom(77);
  return Array.from({ length: 14 }, (_, i) => {
    const [x, y] = pointOnBread(rand, 0.94);
    return { key: i, x, y, r: 0.8 + rand() * 1.4 };
  });
})();

// The roll runs on one 0 → 1 timeline: the first part rolls the bread up from its bottom edge,
// the rest slides the roll to the centre, where the wrapped shawarma takes over.
const ROLL_SHARE = 0.72;
const END_THICKNESS = 72;
const FINAL = { half: 190, thickness: 92 };

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const rollGeometry = (timeline) => {
  const rolled = easeInOutCubic(Math.min(timeline / ROLL_SHARE, 1));
  const slid = timeline > ROLL_SHARE ? easeOutCubic((timeline - ROLL_SHARE) / (1 - ROLL_SHARE)) : 0;
  const yStart = BREAD.cy + BREAD.r;
  const yEnd = BREAD.cy - BREAD.r + END_THICKNESS / 2;
  const y = yStart + (yEnd - yStart) * rolled;
  const dy = y - BREAD.cy;
  // Once the roll passes the middle it already holds the bread's full width.
  const half = dy <= 0 ? BREAD.r : Math.sqrt(Math.max(BREAD.r ** 2 - dy ** 2, 0));
  const thickness = 16 + (END_THICKNESS - 16) * rolled;

  // Everything above clipY is still lying flat; everything below is inside the roll.
  let clipY = y;
  if (timeline <= 0) clipY = 600;
  if (slid > 0) clipY = 0;

  return {
    clipY,
    y: y + (BREAD.cy - y) * slid,
    half: half + (FINAL.half - half) * slid,
    thickness: thickness + (FINAL.thickness - thickness) * slid,
  };
};

const ROLL_SPOTS = [[0.12, 0.3], [0.2, 0.7], [0.31, 0.45], [0.43, 0.25], [0.52, 0.66], [0.61, 0.38], [0.7, 0.72], [0.79, 0.3], [0.88, 0.55]];

const RolledBread = ({ y, half, thickness }) => {
  const width = Math.max(half * 2, thickness);
  const left = BREAD.cx - width / 2;
  const top = y - thickness / 2;
  const curl = (x, direction) =>
    `M${x},${top + thickness * 0.18} q${direction * thickness * 0.2},${thickness * 0.32} 0,${thickness * 0.64}`;

  return (
    <g>
      <ellipse cx={BREAD.cx} cy={y + thickness * 0.55} rx={width / 2 + 4} ry={thickness * 0.3} fill="#120a05" opacity="0.5" filter="url(#wb-blur)" />
      <rect x={left} y={top} width={width} height={thickness} rx={thickness / 2} fill="url(#wb-roll)" />
      {width > 80 &&
        ROLL_SPOTS.map(([fx, fy]) => (
          <ellipse
            key={fx}
            cx={left + width * fx}
            cy={top + thickness * fy}
            rx={5 + thickness * 0.06}
            ry={2 + thickness * 0.03}
            fill="#A0602A"
            opacity="0.2"
          />
        ))}
      {thickness > 26 && (
        <g fill="none" stroke="#B57D41" strokeWidth="1.5" strokeLinecap="round" opacity="0.65">
          <path d={curl(left + thickness * 0.45, -1)} />
          <path d={curl(left + width - thickness * 0.45, 1)} />
        </g>
      )}
    </g>
  );
};

// Owns the roll progress so the 60fps updates only re-render the roll, not every filling.
const RollLayer = ({ mode, reduceMotion, onRolled, onUnrolled }) => {
  const [timeline, setTimeline] = useState(0);

  useEffect(() => {
    if (mode === 'build') setTimeline(0);
    if (mode !== 'rolling' && mode !== 'unrolling') return undefined;

    const rolling = mode === 'rolling';
    const controls = animate(rolling ? 0 : 1, rolling ? 1 : 0, {
      duration: reduceMotion ? 0.01 : 2.3,
      // When unrolling, let the wrapped shawarma fade out first.
      delay: rolling || reduceMotion ? 0 : 0.3,
      ease: 'linear',
      onUpdate: setTimeline,
      onComplete: rolling ? onRolled : onUnrolled,
    });
    return () => controls.stop();
  }, [mode, reduceMotion, onRolled, onUnrolled]);

  const geometry = rollGeometry(timeline);

  return (
    <>
      <defs>
        <clipPath id="wb-roll-clip">
          <rect x="-100" y="-100" width="700" height={geometry.clipY + 100} />
        </clipPath>
      </defs>
      {timeline > 0.001 && mode !== 'done' && <RolledBread {...geometry} />}
    </>
  );
};

const pieceVariants = {
  hidden: { opacity: 0, scale: 1.9, y: -52 },
  shown: (delay) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 19, mass: 0.8, delay },
  }),
  gone: (delay) => ({
    opacity: 0,
    scale: 1.35,
    y: -28,
    transition: { duration: 0.22, delay: delay * 0.35 },
  }),
};

// One ingredient's pieces. They drop onto the bread in a sweep and lift off when removed.
const FillingLayer = ({ ingredient, delay, reduceMotion }) => (
  <motion.g initial={reduceMotion ? false : 'hidden'} animate="shown" exit="gone">
    <g filter="url(#wb-piece-shadow)">
      {ingredient.layout.map((piece) => (
        <g key={piece.key} transform={`translate(${piece.x.toFixed(1)} ${piece.y.toFixed(1)})`}>
          <motion.g variants={pieceVariants} custom={delay + piece.delay}>
            <g transform={`rotate(${piece.rotate.toFixed(1)}) scale(${piece.scale.toFixed(2)})`}>
              <IngredientPiece id={ingredient.id} variant={piece.variant} />
            </g>
          </motion.g>
        </g>
      ))}
    </g>
  </motion.g>
);

const STEAM_PATH = 'M0,0 C-7,-9 7,-17 0,-27 C-7,-37 6,-45 0,-54';

const Steam = ({ x, y, spread }) => (
  <motion.g
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    filter="url(#wb-steam)"
    pointerEvents="none"
  >
    {[-1, 0, 1].map((offset, i) => (
      <g key={offset} transform={`translate(${x + (offset * spread) / 2} ${y})`}>
        <motion.path
          d={STEAM_PATH}
          fill="none"
          stroke="#FFF8EC"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 0.55, 0], y: [10, -8, -30] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.9, ease: 'easeOut' }}
        />
      </g>
    ))}
  </motion.g>
);

const SPARKLE = 'M0,-8 C1,-2 2,-1 8,0 C2,1 1,2 0,8 C-1,2 -2,1 -8,0 C-2,-1 -1,-2 0,-8 Z';
const FILLING_AREA = { x: 90, y: 170, width: 320, height: 160 };
const WRAP_AREA = { x: 70, y: 120, width: 380, height: 250 };

// A little gold twinkle when something lands, after the "magical world" in the logo.
const SparkleBurst = ({ seed, area }) => {
  const sparkles = useMemo(() => {
    const rand = seededRandom(seed);
    return Array.from({ length: 7 }, (_, i) => ({
      key: i,
      x: area.x + rand() * area.width,
      y: area.y + rand() * area.height,
      scale: 0.6 + rand() * 0.8,
      delay: 0.2 + rand() * 0.45,
    }));
  }, [seed, area]);

  return (
    <g filter="url(#wb-glow)" pointerEvents="none">
      {sparkles.map((sparkle) => (
        <g key={sparkle.key} transform={`translate(${sparkle.x.toFixed(1)} ${sparkle.y.toFixed(1)})`}>
          <motion.path
            d={SPARKLE}
            fill="#FFE082"
            initial={{ scale: 0, opacity: 0, rotate: 0 }}
            animate={{ scale: [0, sparkle.scale, 0], opacity: [0, 1, 0], rotate: 90 }}
            transition={{ duration: 0.9, delay: sparkle.delay, ease: 'easeOut' }}
          />
        </g>
      ))}
    </g>
  );
};

const EmptyHint = () => (
  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
    <motion.rect
      x="82"
      y="198"
      width="336"
      height="108"
      rx="54"
      fill="none"
      stroke="#B4823F"
      strokeWidth="2.5"
      strokeDasharray="8 10"
      strokeLinecap="round"
      opacity="0.7"
      animate={{ strokeDashoffset: [0, -36] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
    />
    <text x="250" y="258" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="17" fontWeight="600" fill="#8A5A2B">
      Choose a protein to start
    </text>
  </motion.g>
);

const StageDefs = () => (
  <defs>
    <radialGradient id="wb-bread" cx="0.46" cy="0.42" r="0.62">
      <stop offset="0" stopColor="#FAEBC8" />
      <stop offset="0.68" stopColor="#F1D7A2" />
      <stop offset="0.9" stopColor="#E4BF80" />
      <stop offset="1" stopColor="#D3A465" />
    </radialGradient>
    <radialGradient id="wb-halo">
      <stop offset="0.8" stopColor="#FFB300" stopOpacity="0" />
      <stop offset="0.9" stopColor="#FFB300" stopOpacity="0.2" />
      <stop offset="1" stopColor="#FFB300" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="wb-roll" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#BE8243" />
      <stop offset="0.14" stopColor="#DDAE6C" />
      <stop offset="0.34" stopColor="#F6E0B2" />
      <stop offset="0.58" stopColor="#E8C287" />
      <stop offset="0.86" stopColor="#C68F51" />
      <stop offset="1" stopColor="#9E6731" />
    </linearGradient>
    <linearGradient id="wb-paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#E4DCCD" />
      <stop offset="0.22" stopColor="#FFFFFF" />
      <stop offset="0.6" stopColor="#F6F1E8" />
      <stop offset="1" stopColor="#D5CABA" />
    </linearGradient>
    <filter id="wb-soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.6" />
    </filter>
    <filter id="wb-blur" x="-20%" y="-60%" width="140%" height="220%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    <filter id="wb-steam" x="-200%" y="-20%" width="500%" height="140%">
      <feGaussianBlur stdDeviation="2.2" />
    </filter>
    <filter id="wb-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="2.2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

const describe = (protein, veggies, sauces, heat, mode) => {
  if (mode === 'done') return `${protein.wrapName}, rolled and wrapped in paper`;
  const names = [protein, ...veggies.map(({ ingredient }) => ingredient), ...sauces]
    .filter(Boolean)
    .map(({ name }) => name.toLowerCase());
  if (heat) names.push(`${heat.name.toLowerCase()} hot sauce`);
  if (!names.length) return 'An empty flatbread, ready for fillings';
  return `Open flatbread topped with ${names.join(', ')}`;
};

const captionFor = (protein, veggies, sauces, heat) => {
  const extras = [
    ...veggies.map(({ ingredient }) => ingredient.name),
    ...sauces.map(({ name }) => name),
    ...(heat ? [`${heat.name} heat`] : []),
  ];
  if (extras.length) return extras.join(' · ');
  return protein ? 'No veggies yet' : 'Start with a protein';
};

const WrapStage = ({
  protein,
  veggies,
  sauces,
  heat,
  size,
  mode,
  event,
  resetKey,
  onRolled,
  onUnrolled,
  className = '',
}) => {
  const reduceMotion = useReducedMotion();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!event) return undefined;
    setToast(event);
    const timer = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(timer);
  }, [event]);

  const isBuilding = mode === 'build';
  const isEmpty = !protein && !veggies.length && !sauces.length && !heat;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl shadow-xl ${className}`}
      style={{ background: 'radial-gradient(120% 95% at 50% 42%, #5B3B27 0%, #2F1D13 58%, #1D120B 100%)' }}
    >
      <svg viewBox="0 0 500 500" className="h-full w-full" role="img" aria-label={describe(protein, veggies, sauces, heat, mode)}>
        <StageDefs />
        {/* The glow belongs to the open bread; without it the ring would float around nothing. */}
        <motion.circle
          cx={BREAD.cx}
          cy={BREAD.cy}
          r="236"
          fill="url(#wb-halo)"
          animate={{ opacity: isBuilding ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        />

        <g clipPath="url(#wb-roll-clip)">
          <motion.g
            key={`bread-${resetKey}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <ellipse cx={BREAD.cx} cy={BREAD.cy + 12} rx={BREAD.r} ry={BREAD.r - 6} fill="#0D0704" opacity="0.55" filter="url(#wb-blur)" />
            <path d={BREAD_OUTLINE} fill="url(#wb-bread)" stroke="#C99A5B" strokeWidth="3" />
            <g filter="url(#wb-soft)">
              {TOAST_SPOTS.map((spot) => (
                <ellipse
                  key={spot.key}
                  cx={spot.x}
                  cy={spot.y}
                  rx={spot.rx}
                  ry={spot.ry}
                  transform={`rotate(${spot.rotate} ${spot.x} ${spot.y})`}
                  fill={spot.tone}
                  opacity={spot.opacity}
                />
              ))}
            </g>
            {CHAR_SPECKS.map((speck) => (
              <circle key={speck.key} cx={speck.x} cy={speck.y} r={speck.r} fill="#7A4A1E" opacity="0.35" />
            ))}
          </motion.g>

          <AnimatePresence>{isEmpty && isBuilding && <EmptyHint key="hint" />}</AnimatePresence>

          {/* Keyed so "Start over" clears the old fillings at once instead of lifting them off. */}
          <g key={`fillings-${resetKey}`}>
            <AnimatePresence>
              {protein && <FillingLayer key={protein.id} ingredient={protein} delay={0} reduceMotion={reduceMotion} />}
              {veggies.map(({ ingredient, delay }) => (
                <FillingLayer key={ingredient.id} ingredient={ingredient} delay={delay} reduceMotion={reduceMotion} />
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {sauces.map((sauce) => (
                <SauceLayer key={sauce.id} sauce={sauce} />
              ))}
              {heat && <HeatLayer key={heat.id} level={heat} />}
            </AnimatePresence>
          </g>
        </g>

        {!reduceMotion && (
          <AnimatePresence>
            {protein && isBuilding && <Steam key="steam" x={250} y={236} spread={150} />}
            {mode === 'done' && <Steam key="wrap-steam" x={424} y={170} spread={40} />}
          </AnimatePresence>
        )}

        {!reduceMotion && event?.kind === 'add' && isBuilding && (
          <SparkleBurst key={event.id} seed={event.id} area={FILLING_AREA} />
        )}

        <RollLayer mode={mode} reduceMotion={reduceMotion} onRolled={onRolled} onUnrolled={onUnrolled} />

        <AnimatePresence>
          {mode === 'done' && (
            <WrappedShawarma
              key="wrap"
              protein={protein}
              veggies={veggies.map(({ ingredient }) => ingredient)}
              sauceColors={[...sauces.map(({ color }) => color), ...(heat ? [HOT_SAUCE_COLOR] : [])]}
              reduceMotion={reduceMotion}
            />
          )}
        </AnimatePresence>

        {!reduceMotion && mode === 'done' && <SparkleBurst key="done" seed={2018} area={WRAP_AREA} />}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
              className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 text-sm font-semibold text-neutral-900 shadow-lg"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: toast.color }} />
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pb-4 pt-12 md:px-6 md:pb-5">
        <p className="font-serif text-lg text-white md:text-xl">
          {protein ? `${size === 'large' ? 'Large ' : ''}${protein.wrapName}` : 'Your Shawarma'}
        </p>
        <p className="mt-0.5 truncate text-xs text-primary-100 md:text-sm">{captionFor(protein, veggies, sauces, heat)}</p>
      </div>
    </div>
  );
};

export default WrapStage;
