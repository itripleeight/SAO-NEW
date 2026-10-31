import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaCheckCircle, FaMagic, FaPepperHot, FaTimes } from 'react-icons/fa';
import WrapStage from '../components/wrap-builder/WrapStage';
import OrderSummary from '../components/wrap-builder/OrderSummary';
import { WrapArtDefs, IngredientThumb } from '../components/wrap-builder/IngredientArt';
import { SauceThumb } from '../components/wrap-builder/SauceArt';
import { HEAT_LEVELS, HOT_SAUCE_COLOR, PROTEINS, SAUCES, SIZES, VEGGIES } from '../components/wrap-builder/ingredients';
import { fetchWrapMenu, formatMoney, startCheckout } from '../components/wrap-builder/orderApi';
import { useLocation as useLocationContext } from '../context/LocationContext';

// The "Shawarma Wrap" item in the Square Online store. If our own checkout can't start, the
// customer can still order there: this link opens the wrap at their store, past Square's picker.
const SQUARE_WRAP_ITEM_ID = 'ZSFS6Y7A54CAST7CU5Q36YBV';

const orderUrlFor = (store) =>
  `https://shawarmaalley.square.site/s/order?location=${store.squareLocationId}&item=${SQUARE_WRAP_ITEM_ID}`;

const THUMB_CLASS = 'h-14 w-14 transition-transform duration-200 group-hover:scale-110 md:h-16 md:w-16';
const NO_SAUCE = { id: 'none', name: 'No sauce' };

const StepHeading = ({ number, title, children }) => (
  <div className="flex items-center justify-between gap-4">
    <h2 className="flex items-center gap-3 font-sans text-base font-semibold text-neutral-900 md:text-lg">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-neutral-900">
        {number}
      </span>
      {title}
    </h2>
    {children}
  </div>
);

const OptionCard = ({ type, group, item, checked, disabled, onChange, detail, price, thumb }) => (
  <label
    className={`group relative flex cursor-pointer select-none flex-col items-center rounded-2xl border-2 px-2 py-3 text-center transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500 has-[:focus-visible]:ring-offset-2 ${
      checked
        ? 'border-primary-500 bg-primary-50 shadow-md'
        : 'border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md'
    } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
  >
    <input
      type={type}
      name={group}
      value={item.id}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="sr-only"
    />
    <span
      className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-200 md:h-[4.5rem] md:w-[4.5rem] ${
        checked ? 'bg-white' : 'bg-[#FBF3E6]'
      }`}
    >
      {thumb || <IngredientThumb ingredient={item} className={THUMB_CLASS} />}
    </span>
    <span className="mt-2 text-sm font-semibold text-neutral-900">{item.name}</span>
    {detail && <span className="mt-0.5 hidden text-[11px] leading-snug text-neutral-500 sm:block">{detail}</span>}
    {price && <span className="mt-0.5 text-xs font-semibold text-secondary-600">{price}</span>}
    <span
      className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-neutral-900 transition-all duration-200 ${
        checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
      }`}
    >
      <FaCheck size={9} />
    </span>
  </label>
);

const PILL_CHECKED = {
  amber: 'border-primary-500 bg-primary-500 text-neutral-900',
  red: 'border-[#C62828] bg-[#C62828] text-white',
  neutral: 'border-neutral-800 bg-neutral-800 text-white',
};

const PillOption = ({ group, value, checked, disabled, onChange, tone = 'amber', children }) => (
  <label
    className={`cursor-pointer select-none rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500 has-[:focus-visible]:ring-offset-2 ${
      checked ? PILL_CHECKED[tone] : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
    } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
  >
    <input
      type="radio"
      name={group}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="sr-only"
    />
    {children}
  </label>
);

const BuildYourShawarma = () => {
  const [proteinId, setProteinId] = useState(null);
  const [sizeId, setSizeId] = useState('regular');
  // Veggies and sauces in the order they went on, so the newest lands on top.
  const [picked, setPicked] = useState([]);
  const [sauceIds, setSauceIds] = useState([]);
  // Hot sauce is a level rather than one more sauce, like on the Square menu.
  const [heatId, setHeatId] = useState(null);
  const [noSauce, setNoSauce] = useState(false);
  const [mode, setMode] = useState('build');
  const [event, setEvent] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  // Option prices from Square. Stays null when checkout isn't set up, which hides prices.
  const [menu, setMenu] = useState(null);
  const [checkout, setCheckout] = useState({ status: 'idle' });
  const [placed, setPlaced] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const eventCount = useRef(0);
  const stageRef = useRef(null);
  const { currentLocation, setCurrentLocation, locations } = useLocationContext();

  useEffect(() => {
    let ignore = false;
    fetchWrapMenu(currentLocation.squareLocationId)
      .then((prices) => !ignore && setMenu(prices))
      .catch(() => !ignore && setMenu(null));
    return () => {
      ignore = true;
    };
  }, [currentLocation.squareLocationId]);

  // Square sends customers back here once they've paid.
  useEffect(() => {
    if (searchParams.get('order') !== 'placed') return;
    const storeId = searchParams.get('store');
    setPlaced({ store: Object.values(locations).find(({ squareLocationId }) => squareLocationId === storeId) });
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, locations]);

  // Going Back from Square's checkout can restore this page as it was left, mid-"Opening checkout".
  useEffect(() => {
    const resetCheckout = (e) => e.persisted && setCheckout({ status: 'idle' });
    window.addEventListener('pageshow', resetCheckout);
    return () => window.removeEventListener('pageshow', resetCheckout);
  }, []);

  // The summary is shorter than the picker it replaces, so it can mount out of sight: under the
  // sticky stage on phones, or above the fold on desktop. On phones, line it up just below the
  // stage so the Order button is on screen; on desktop, only scroll if its top is cut off.
  const revealSummary = useCallback((card) => {
    if (!card) return;
    requestAnimationFrame(() => {
      const stage = stageRef.current;
      const stacked = !window.matchMedia('(min-width: 1024px)').matches;
      // Where the stage's bottom edge sits once it is stuck, not where it is right now.
      const clearance = stacked ? parseFloat(getComputedStyle(stage).top) + stage.offsetHeight + 8 : 112;
      // Measure the column, which the card's entrance animation doesn't move.
      const offset = card.parentElement.getBoundingClientRect().top - clearance;
      if (stacked ? Math.abs(offset) > 4 : offset < 0) {
        window.scrollBy({ top: offset, behavior: 'smooth' });
      }
    });
  }, []);

  const protein = PROTEINS.find((item) => item.id === proteinId) || null;
  const size = SIZES.find((item) => item.id === sizeId);
  const veggies = picked.map(({ id, delay }) => ({ ingredient: VEGGIES.find((item) => item.id === id), delay }));
  const sauces = sauceIds.map((id) => SAUCES.find((item) => item.id === id));
  const heat = HEAT_LEVELS.find((level) => level.id === heatId) || null;
  const sauceChosen = sauces.length > 0 || heat !== null || noSauce;
  const isBuilding = mode === 'build';
  const allPicked = picked.length === VEGGIES.length;

  const upcharge = (group, id) => menu?.prices?.[group]?.[id] ?? 0;
  const priceLabel = (group, id) => (upcharge(group, id) > 0 ? `+${formatMoney(upcharge(group, id), menu.currency)}` : null);
  const total =
    menu && protein
      ? menu.base +
        upcharge('size', sizeId) +
        upcharge('protein', proteinId) +
        picked.reduce((sum, { id }) => sum + upcharge('veggies', id), 0) +
        sauceIds.reduce((sum, id) => sum + upcharge('sauces', id), 0) +
        (heatId ? upcharge('heat', heatId) : 0)
      : null;

  const wrapHint = () => {
    if (!protein) return 'Choose a protein to wrap it up.';
    if (!sauceChosen) return 'Pick a sauce, or No sauce, to wrap it up.';
    if (total !== null) return `${formatMoney(total, menu.currency)} plus tax`;
    return 'We’ll roll it up for you.';
  };

  const announce = (kind, text, spoken, color) => {
    eventCount.current += 1;
    setEvent({ id: eventCount.current, kind, text, spoken, color });
  };

  const chooseProtein = (item) => {
    if (!isBuilding || item.id === proteinId) return;
    if (protein) {
      announce('add', `Switched to ${item.name}`, `Switched to ${item.name}`, item.color);
    } else {
      announce('add', `+ ${item.name}`, `${item.name} added`, item.color);
    }
    setProteinId(item.id);
  };

  const chooseSize = (item) => {
    if (!isBuilding) return;
    setSizeId(item.id);
    announce('size', `${item.name} wrap`, `${item.name} size`, '#FFC107');
  };

  const toggleVeggie = (item) => {
    if (!isBuilding) return;
    const isOn = picked.some(({ id }) => id === item.id);
    if (isOn) {
      setPicked(picked.filter(({ id }) => id !== item.id));
      announce('remove', `${item.name} removed`, `${item.name} removed`, item.color);
    } else {
      setPicked([...picked, { id: item.id, delay: 0 }]);
      announce('add', `+ ${item.name}`, `${item.name} added`, item.color);
    }
  };

  const addAllVeggies = () => {
    const missing = VEGGIES.filter((item) => !picked.some(({ id }) => id === item.id));
    // Stagger a batch so each veggie still gets its own moment.
    setPicked([...picked, ...missing.map((item, i) => ({ id: item.id, delay: i * 0.16 }))]);
    announce('add', '+ All the veggies', 'All veggies added', '#8BC34A');
  };

  const clearVeggies = () => {
    setPicked([]);
    announce('remove', 'Veggies cleared', 'Veggies cleared', '#BDBDBD');
  };

  const toggleSauce = (item) => {
    if (!isBuilding) return;
    const isOn = sauceIds.includes(item.id);
    setNoSauce(false);
    if (isOn) {
      setSauceIds(sauceIds.filter((id) => id !== item.id));
      announce('remove', `${item.name} removed`, `${item.name} removed`, item.edge);
    } else {
      setSauceIds([...sauceIds, item.id]);
      announce('add', `+ ${item.name}`, `${item.name} added`, item.edge);
    }
  };

  const toggleNoSauce = () => {
    if (!isBuilding) return;
    if (noSauce) {
      setNoSauce(false);
      return;
    }
    setSauceIds([]);
    setHeatId(null);
    setNoSauce(true);
    announce('remove', 'No sauce', 'No sauce', '#BDBDBD');
  };

  const chooseHeat = (level) => {
    if (!isBuilding) return;
    setHeatId(level?.id ?? null);
    if (level) {
      setNoSauce(false);
      announce('add', `${level.name} heat`, `${level.name} hot sauce added`, HOT_SAUCE_COLOR);
    } else {
      announce('remove', 'No hot sauce', 'Hot sauce removed', '#BDBDBD');
    }
  };

  const chooseStore = (storeId) => {
    setCurrentLocation(Object.values(locations).find(({ squareLocationId }) => squareLocationId === storeId));
    setCheckout({ status: 'idle' });
  };

  const placeOrder = async () => {
    setCheckout({ status: 'pending' });
    try {
      const url = await startCheckout({
        location: currentLocation.squareLocationId,
        size: sizeId,
        protein: proteinId,
        veggies: picked.map(({ id }) => id),
        sauces: sauceIds,
        heat: heatId,
        noSauce,
      });
      window.location.assign(url);
    } catch (error) {
      setCheckout({ status: 'failed', message: error.message });
    }
  };

  const handleRolled = useCallback(() => setMode('done'), []);
  const handleUnrolled = useCallback(() => setMode('build'), []);

  const editWrap = () => {
    setCheckout({ status: 'idle' });
    setMode('unrolling');
  };

  const startOver = () => {
    setProteinId(null);
    setSizeId('regular');
    setPicked([]);
    setSauceIds([]);
    setHeatId(null);
    setNoSauce(false);
    setEvent(null);
    setCheckout({ status: 'idle' });
    setMode('build');
    setResetKey((key) => key + 1);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 pt-20 md:pt-24 lg:pb-24 lg:pt-28">
      <WrapArtDefs />
      <p className="sr-only" aria-live="polite">
        {event?.spoken}
      </p>

      <div className="container mx-auto px-4 md:px-8">
        <AnimatePresence>
          {placed && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 flex items-start gap-3 rounded-2xl bg-accent-50 p-4 text-accent-900 ring-1 ring-accent-200"
            >
              <FaCheckCircle className="mt-0.5 shrink-0 text-accent-700" size={20} />
              <p className="flex-1">
                <span className="font-semibold">Thanks, your order is in!</span>{' '}
                {placed.store
                  ? `We’ll have it ready for pickup at our ${placed.store.name} store.`
                  : 'We’ll have it ready for pickup soon.'}
              </p>
              <button
                type="button"
                onClick={() => setPlaced(null)}
                aria-label="Dismiss"
                className="text-accent-800 transition-colors hover:text-accent-900"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-x-12 xl:gap-x-16">
          <div className="mb-4 lg:col-start-2 lg:row-start-1 lg:mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-800">Wrap Builder</p>
            <h1 className="mt-2 text-3xl text-neutral-900 md:text-4xl lg:text-5xl">Build Your Shawarma</h1>
            <p className="mt-3 max-w-xl text-neutral-600">
              Pick your protein, pile on the veggies and watch your wrap come together.
            </p>
          </div>

          {/* Sticky on phones too, so the wrap stays in view while scrolling the options. */}
          <div
            ref={stageRef}
            className="sticky top-16 z-20 -mx-4 bg-neutral-50 px-4 pb-4 pt-2 md:top-20 md:-mx-8 md:px-8 lg:top-28 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:self-start lg:px-0 lg:pb-0 lg:pt-0"
          >
            <WrapStage
              protein={protein}
              veggies={veggies}
              sauces={sauces}
              heat={heat}
              size={sizeId}
              mode={mode}
              event={event}
              resetKey={resetKey}
              onRolled={handleRolled}
              onUnrolled={handleUnrolled}
              className="h-[min(46vh,calc(100vw-2rem))] lg:aspect-square lg:h-auto lg:max-h-[calc(100vh-9rem)]"
            />
          </div>

          <div className="lg:col-start-2 lg:row-start-2">
            <AnimatePresence mode="wait" initial={false}>
              {mode === 'done' ? (
                <OrderSummary
                  key="summary"
                  cardRef={revealSummary}
                  protein={protein}
                  size={size}
                  veggies={veggies.map(({ ingredient }) => ingredient)}
                  sauces={sauces}
                  heat={heat}
                  noSauce={noSauce}
                  total={total}
                  currency={menu?.currency}
                  store={currentLocation}
                  stores={locations}
                  onStoreChange={chooseStore}
                  checkout={checkout}
                  onOrder={placeOrder}
                  fallbackUrl={orderUrlFor(currentLocation)}
                  onEdit={editWrap}
                  onStartOver={startOver}
                />
              ) : (
                <motion.div
                  key="picker"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-7"
                >
                  <section>
                    <StepHeading number={1} title="Choose your protein">
                      <span className="text-xs font-medium text-neutral-500">Pick one</span>
                    </StepHeading>
                    <div role="radiogroup" aria-label="Protein" className="mt-4 grid grid-cols-3 gap-3">
                      {PROTEINS.map((item) => (
                        <OptionCard
                          key={item.id}
                          type="radio"
                          group="protein"
                          item={item}
                          detail={item.description}
                          price={priceLabel('protein', item.id)}
                          checked={item.id === proteinId}
                          disabled={!isBuilding}
                          onChange={() => chooseProtein(item)}
                        />
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-neutral-800">Size</span>
                      <div role="radiogroup" aria-label="Size" className="flex gap-2">
                        {SIZES.map((item) => (
                          <PillOption
                            key={item.id}
                            group="size"
                            value={item.id}
                            checked={item.id === sizeId}
                            disabled={!isBuilding}
                            onChange={() => chooseSize(item)}
                          >
                            {item.name}
                            {priceLabel('size', item.id) && (
                              <span className="ml-1 text-xs font-normal">{priceLabel('size', item.id)}</span>
                            )}
                          </PillOption>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section>
                    <StepHeading number={2} title="Add your veggies">
                      <div className="flex gap-4 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={addAllVeggies}
                          disabled={allPicked || !isBuilding}
                          className="text-primary-900 transition-colors hover:text-secondary-700 disabled:text-neutral-300"
                        >
                          Add all
                        </button>
                        <button
                          type="button"
                          onClick={clearVeggies}
                          disabled={!picked.length || !isBuilding}
                          className="text-neutral-600 transition-colors hover:text-neutral-900 disabled:text-neutral-300"
                        >
                          Clear
                        </button>
                      </div>
                    </StepHeading>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {VEGGIES.map((item) => (
                        <OptionCard
                          key={item.id}
                          type="checkbox"
                          group="veggies"
                          item={item}
                          checked={picked.some(({ id }) => id === item.id)}
                          disabled={!isBuilding}
                          onChange={() => toggleVeggie(item)}
                        />
                      ))}
                    </div>
                  </section>

                  <section>
                    <StepHeading number={3} title="Pick your sauce">
                      <span className="text-xs font-medium text-neutral-500">Mix and match</span>
                    </StepHeading>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {SAUCES.map((item) => (
                        <OptionCard
                          key={item.id}
                          type="checkbox"
                          group="sauces"
                          item={item}
                          thumb={<SauceThumb sauce={item} className={THUMB_CLASS} />}
                          price={priceLabel('sauces', item.id)}
                          checked={sauceIds.includes(item.id)}
                          disabled={!isBuilding}
                          onChange={() => toggleSauce(item)}
                        />
                      ))}
                      <OptionCard
                        type="checkbox"
                        group="sauces"
                        item={NO_SAUCE}
                        thumb={<SauceThumb className={THUMB_CLASS} />}
                        checked={noSauce}
                        disabled={!isBuilding}
                        onChange={toggleNoSauce}
                      />
                    </div>
                    <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-neutral-800">
                      <FaPepperHot style={{ color: HOT_SAUCE_COLOR }} /> Make it hot
                    </p>
                    <div role="radiogroup" aria-label="Hot sauce" className="mt-3 flex flex-wrap gap-2">
                      <PillOption
                        group="heat"
                        value="none"
                        tone="neutral"
                        checked={!heatId}
                        disabled={!isBuilding}
                        onChange={() => chooseHeat(null)}
                      >
                        No heat
                      </PillOption>
                      {HEAT_LEVELS.map((level) => (
                        <PillOption
                          key={level.id}
                          group="heat"
                          value={level.id}
                          tone="red"
                          checked={level.id === heatId}
                          disabled={!isBuilding}
                          onChange={() => chooseHeat(level)}
                        >
                          {level.name}
                          <span className={`ml-1 text-xs font-normal ${level.id === heatId ? 'text-white/80' : 'text-neutral-400'}`}>
                            {level.detail}
                          </span>
                        </PillOption>
                      ))}
                    </div>
                  </section>

                  <div className="border-t border-neutral-100 pt-6">
                    <button
                      type="button"
                      onClick={() => setMode('rolling')}
                      disabled={!protein || !sauceChosen || !isBuilding}
                      className="group flex w-full items-center justify-center gap-3 rounded-full bg-primary-500 px-8 py-4 text-lg font-semibold text-neutral-900 shadow-lg shadow-primary-500/30 transition-colors duration-300 hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none"
                    >
                      <FaMagic className="transition-transform duration-300 group-hover:rotate-12" />
                      {mode === 'rolling' ? 'Wrapping…' : 'Wrap it up'}
                    </button>
                    <p className="mt-2 text-center text-xs text-neutral-500">{wrapHint()}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildYourShawarma;
