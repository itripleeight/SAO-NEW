import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { IngredientPiece } from './IngredientArt';
import { BREAD } from './ingredients';
import { seededRandom } from './geometry';

// The finished wrap is drawn lying flat around (0, 0), with the same footprint the rolled bread
// ends on, then tilted into place. The open end on the right shows the chosen fillings.
const BODY = 'M-144,-46 H180 A18,46 0 0 1 180,46 H-144 A46,46 0 0 1 -144,-46 Z';
const PAPER = 'M-150,-56 H54 L30,56 H-150 A56,56 0 0 1 -150,-56 Z';
const GRILL_MARKS = [-118, -88, -58, -28, 2, 32, 62, 92, 122, 152, 182];
const PAPER_FOLDS = ['M-112,-56 L-128,56', 'M-52,-56 L-70,56', 'M2,-56 L-14,56'];

// Pieces of each chosen filling poking out of the open end.
const endFillings = (protein, veggies) => {
  const rand = seededRandom(17 + veggies.length * 13);
  const items = [protein, protein, protein, protein, ...veggies.flatMap((veggie) => [veggie, veggie])];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  const pieces = items.map((item, i) => {
    const angle = -64 + (128 * (i + 0.5)) / items.length + (rand() - 0.5) * 8;
    const rad = (angle * Math.PI) / 180;
    const isProtein = item === protein;
    return {
      key: i,
      id: item.id,
      isProtein,
      x: 180 + Math.cos(rad) * (10 + rand() * 12),
      y: Math.sin(rad) * 36,
      rotate: angle * 0.6 + (rand() - 0.5) * 50,
      scale: (isProtein ? 0.66 : 0.78) + rand() * 0.14,
      variant: Math.floor(rand() * 9),
    };
  });

  // Meat goes in first so the veggies sit on top of it.
  return [...pieces.filter((piece) => piece.isProtein), ...pieces.filter((piece) => !piece.isProtein)];
};

// Coloured specks for the cut face, weighted toward the protein.
const faceCrumbs = (protein, veggies, sauceColors) => {
  const rand = seededRandom(5 + veggies.length);
  const colors = [protein.color, protein.color, ...veggies.map((veggie) => veggie.color), ...sauceColors];
  return Array.from({ length: 18 }, (_, i) => ({
    key: i,
    x: 181 + (rand() - 0.5) * 20,
    y: (rand() - 0.5) * 74,
    r: 3 + rand() * 3.5,
    color: colors[i % colors.length],
  }));
};

const WrappedShawarma = ({ protein, veggies, sauceColors, reduceMotion }) => {
  const pieces = useMemo(() => endFillings(protein, veggies), [protein, veggies]);
  const crumbs = useMemo(() => faceCrumbs(protein, veggies, sauceColors), [protein, veggies, sauceColors]);

  return (
    <motion.g exit={{ opacity: 0, transition: { duration: 0.3 } }}>
      <defs>
        <clipPath id="wb-wrap-body">
          <path d={BODY} />
        </clipPath>
        <clipPath id="wb-wrap-face">
          <ellipse cx="181" rx="13.5" ry="40" />
        </clipPath>
        <clipPath id="wb-paper-shape">
          <path d={PAPER} />
        </clipPath>
        <clipPath id="wb-paper-reveal">
          <motion.rect
            x="-212"
            y="-70"
            height="140"
            initial={{ width: reduceMotion ? 272 : 0 }}
            animate={{ width: 272 }}
            transition={{ duration: 0.6, delay: 0.25, ease: 'easeInOut' }}
          />
        </clipPath>
      </defs>

      <g transform={`translate(${BREAD.cx} ${BREAD.cy})`}>
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: -14 }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 12 }}
        >
          <ellipse cy="62" rx="200" ry="15" fill="#120a05" opacity="0.5" filter="url(#wb-blur)" />

          {/* Grilled bread */}
          <path d={BODY} fill="url(#wb-roll)" />
          <g clipPath="url(#wb-wrap-body)" stroke="#8A5524" strokeWidth="7" strokeLinecap="round" opacity="0.26">
            {GRILL_MARKS.map((x) => (
              <path key={x} d={`M${x},-52 L${x - 26},52`} />
            ))}
          </g>

          {/* Open end */}
          <ellipse cx="180" rx="18" ry="46" fill="#EDCF96" stroke="#C89650" strokeWidth="2" />
          <ellipse cx="181" rx="13.5" ry="40" fill="#4A2A15" />
          <g clipPath="url(#wb-wrap-face)">
            {crumbs.map((crumb) => (
              <circle key={crumb.key} cx={crumb.x} cy={crumb.y} r={crumb.r} fill={crumb.color} />
            ))}
          </g>
          <g filter="url(#wb-piece-shadow)">
            {pieces.map((piece, i) => (
              <g key={piece.key} transform={`translate(${piece.x.toFixed(1)} ${piece.y.toFixed(1)})`}>
                <motion.g
                  initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.45 + i * 0.04 }}
                >
                  <g transform={`rotate(${piece.rotate.toFixed(1)}) scale(${piece.scale.toFixed(2)})`}>
                    <IngredientPiece id={piece.id} variant={piece.variant} />
                  </g>
                </motion.g>
              </g>
            ))}
          </g>

          {/* Branded paper, wrapped on from the left */}
          <g clipPath="url(#wb-paper-reveal)">
            <path d={PAPER} fill="url(#wb-paper)" stroke="#D2C6B4" strokeWidth="1" />
            <g clipPath="url(#wb-paper-shape)" fill="none" stroke="#E2D8C8" strokeWidth="1.4">
              {PAPER_FOLDS.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <path d="M38,-56 H50 L26,56 H14 Z" fill="#FFC107" />
            <path d="M33,-56 L9,56" stroke="#4E342E" strokeWidth="2.2" />
            <path d="M54,-56 L30,56" stroke="#CFC3B0" strokeWidth="1.5" />
            <image href={`${import.meta.env.BASE_URL}shawarma-alley-logo.png`} x="-110" y="-47" width="54" height="47" />
            <text
              x="-83"
              y="24"
              textAnchor="middle"
              fontFamily="'Playfair Display', serif"
              fontWeight="700"
              fontSize="12"
              letterSpacing="2.2"
              fill="#4E342E"
            >
              SHAWARMA ALLEY
            </text>
          </g>
        </motion.g>
      </g>
    </motion.g>
  );
};

export default WrappedShawarma;
