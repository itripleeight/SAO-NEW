import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaExclamationTriangle, FaMagic, FaPen, FaPepperHot, FaRedo, FaSpinner, FaStore } from 'react-icons/fa';
import { IngredientThumb } from './IngredientArt';
import { SauceThumb } from './SauceArt';
import { HOT_SAUCE_COLOR } from './ingredients';
import { formatMoney } from './orderApi';

const Chip = ({ thumb, children }) => (
  <li className="flex items-center gap-2 rounded-full bg-neutral-100 py-1 pl-1 pr-3 text-sm font-medium text-neutral-800">
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">{thumb}</span>
    {children}
  </li>
);

// The finished wrap, where the store is picked and checkout starts.
const OrderSummary = ({
  cardRef,
  protein,
  size,
  veggies,
  sauces,
  heat,
  noSauce,
  total,
  currency,
  store,
  stores,
  onStoreChange,
  checkout,
  onOrder,
  fallbackUrl,
  onEdit,
  onStartOver,
}) => {
  const pending = checkout.status === 'pending';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8"
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-800">
        <FaMagic /> Your wrap is ready
      </p>
      <h2 className="mt-3 text-3xl text-neutral-900">
        {size.id === 'large' ? 'Large ' : ''}
        {protein.wrapName}
      </h2>

      <ul className="mt-5 flex flex-wrap gap-2">
        {[protein, ...veggies].map((item) => (
          <Chip key={item.id} thumb={<IngredientThumb ingredient={item} className="h-6 w-6" />}>
            {item.name}
          </Chip>
        ))}
        {sauces.map((sauce) => (
          <Chip key={sauce.id} thumb={<SauceThumb sauce={sauce} className="h-6 w-6" />}>
            {sauce.name}
          </Chip>
        ))}
        {heat && (
          <Chip thumb={<FaPepperHot size={12} style={{ color: HOT_SAUCE_COLOR }} />}>
            {heat.name} heat
          </Chip>
        )}
        {noSauce && <Chip thumb={<SauceThumb className="h-6 w-6" />}>No sauce</Chip>}
      </ul>
      {!veggies.length && <p className="mt-3 text-sm text-neutral-500">No veggies this time.</p>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <FaStore className="text-neutral-400" />
          Pickup at
          <select
            value={store.squareLocationId}
            onChange={(e) => onStoreChange(e.target.value)}
            disabled={pending}
            className="rounded-lg border border-neutral-200 bg-white py-1 pl-2 pr-7 text-sm font-semibold text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            {Object.values(stores).map((location) => (
              <option key={location.squareLocationId} value={location.squareLocationId}>
                {location.name}
              </option>
            ))}
          </select>
        </label>
        {total !== null && (
          <p className="text-sm text-neutral-600">
            <span className="text-lg font-semibold text-neutral-900">{formatMoney(total, currency)}</span> + tax
          </p>
        )}
      </div>

      {checkout.status === 'failed' && (
        <div role="alert" className="mt-4 flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-900 ring-1 ring-red-200">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <p>
            <span className="font-semibold">We couldn’t open checkout just now.</span> You can still order this wrap
            from our{' '}
            <a href={fallbackUrl} className="font-semibold underline hover:text-red-700">
              online menu
            </a>
            .
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onOrder}
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 font-semibold text-neutral-900 shadow-lg shadow-primary-500/30 transition-colors duration-300 hover:bg-primary-600 disabled:cursor-wait disabled:opacity-80"
        >
          {pending ? (
            <>
              <FaSpinner className="animate-spin" /> Opening checkout…
            </>
          ) : (
            <>
              Order Online <FaArrowRight size={13} />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-neutral-200 px-6 py-3 font-semibold text-neutral-800 transition-colors duration-300 hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-60"
        >
          <FaPen size={13} /> Edit my wrap
        </button>
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        You’ll pay on Square’s secure checkout, then pick it up at our {store.name} store.
      </p>

      <button
        type="button"
        onClick={onStartOver}
        disabled={pending}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-800"
      >
        <FaRedo size={11} /> Start over
      </button>
    </motion.div>
  );
};

export default OrderSummary;
