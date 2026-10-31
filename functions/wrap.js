// Turns a wrap built on the website into a Square order, using the "Shawarma Wrap" item and its
// options from the restaurant's Square catalog. Pure functions, so they can be tested offline.

export const WRAP_ITEM_NAME = 'Shawarma Wrap';

// Each builder choice, keyed by the builder's IDs (src/components/wrap-builder/ingredients.js),
// mapped to the option's name on the Square menu. A group is found by the modifier list that
// holds all of its names, so lists can be renamed in Square; renaming an option can't be, and
// fails loudly instead of quietly dropping it from orders.
export const WRAP_MENU = {
  size: { choices: { regular: 'Regular', large: 'Large' } },
  protein: { choices: { chicken: 'Chicken Shawarma', beef: 'Beef Shawarma', gyro: 'Gyro Meat' } },
  veggies: {
    none: 'Naked (no toppings)',
    choices: {
      lettuce: 'Lettuce',
      tomato: 'Tomato',
      onion: 'Onions',
      cucumber: 'Cucumbers',
      pickles: 'Pickles',
      turnips: 'Turnips',
    },
  },
  sauces: {
    none: 'No Sauce',
    choices: {
      garlic: 'Garlic Sauce',
      'spicy-mayo': 'Spicy Mayo',
      tahini: 'Tahini',
      hummus: 'Hummus',
      tzatziki: 'Tazikiti',
    },
  },
  // Hot sauce levels live in the same Square list as the sauces.
  heat: {
    choices: {
      mild: 'Mild (4 drops Hot)',
      'one-line': 'One line Hot Sauce',
      medium: 'Medium (2 lines hot)',
      hot: 'Hot (4 lines hot)',
      'extra-hot': 'Extra hot (6 lines hot)',
      suicide: 'Suicide (8 lines hot)',
    },
  },
};

// The real stores' Square location IDs. Orders can only go to these.
export const STORES = {
  LMF4W6WW67SV9: 'Georgetown',
  L9NN7E9ZHB3ED: 'Guelph',
  LD0BXW3RQ7BYN: 'Milton',
  LHVE0AFQ0EHMQ: 'Brampton',
  LVT5J81X244R5: 'Orangeville',
};

// A problem with what the customer sent, as opposed to Square or our setup.
export class WrapOrderError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WrapOrderError';
  }
}

const norm = (name = '') => name.trim().replace(/\s+/g, ' ').toLowerCase();
const mapValues = (object, fn) => Object.fromEntries(Object.entries(object).map(([key, value]) => [key, fn(value, key)]));
const cents = (money) => Number(money?.amount ?? 0);

// Builds the lookup the order and menu calls use, from a CatalogItem and its related objects.
export const resolveWrapCatalog = (item, relatedObjects = []) => {
  const enabledListIds = new Set(
    (item.item_data?.modifier_list_info || [])
      .filter((info) => info.enabled !== false)
      .map((info) => info.modifier_list_id)
  );
  const lists = relatedObjects.filter((object) => object.type === 'MODIFIER_LIST' && enabledListIds.has(object.id) && !object.is_deleted);
  const modifiersOf = (list) => (list.modifier_list_data?.modifiers || []).filter((modifier) => !modifier.is_deleted);
  const variations = (item.item_data?.variations || []).filter((variation) => !variation.is_deleted);
  if (!variations.length) throw new Error(`"${item.item_data?.name}" has no variations in Square.`);

  const groups = {};
  const missing = [];

  for (const [group, spec] of Object.entries(WRAP_MENU)) {
    const wanted = Object.values(spec.choices).map(norm);
    const list = lists.find((candidate) => {
      const names = new Set(modifiersOf(candidate).map((modifier) => norm(modifier.modifier_data?.name)));
      return wanted.every((name) => names.has(name));
    });

    if (list) {
      const byName = new Map(modifiersOf(list).map((modifier) => [norm(modifier.modifier_data.name), modifier]));
      groups[group] = {
        kind: 'modifier',
        ids: mapValues(spec.choices, (name) => byName.get(norm(name)).id),
        prices: mapValues(spec.choices, (name) => cents(byName.get(norm(name)).modifier_data.price_money)),
        none: spec.none ? byName.get(norm(spec.none))?.id ?? null : null,
      };
      continue;
    }

    // Sizes can also be set up in Square as variations of the item rather than as a modifier list.
    if (group === 'size') {
      const byName = new Map(variations.map((variation) => [norm(variation.item_variation_data?.name), variation]));
      const sizes = mapValues(spec.choices, (name) => byName.get(norm(name)));
      if (Object.values(sizes).every(Boolean)) {
        const regular = cents(sizes.regular.item_variation_data.price_money);
        groups.size = {
          kind: 'variation',
          ids: mapValues(sizes, (variation) => variation.id),
          prices: mapValues(sizes, (variation) => cents(variation.item_variation_data.price_money) - regular),
          none: null,
        };
        continue;
      }
    }

    missing.push(`${group} (${Object.values(spec.choices).join(', ')})`);
  }

  if (missing.length) {
    const available = lists
      .map((list) => `${list.modifier_list_data?.name}: ${modifiersOf(list).map((modifier) => modifier.modifier_data?.name).join(', ')}`)
      .join(' | ');
    throw new Error(`The Square "${item.item_data?.name}" item is missing options for ${missing.join('; ')}. It has: ${available || 'no modifier lists'}.`);
  }

  const baseVariation =
    groups.size.kind === 'variation'
      ? variations.find((variation) => variation.id === groups.size.ids.regular)
      : variations.find((variation) => norm(variation.item_variation_data?.name) === 'regular') || variations[0];
  const baseData = baseVariation.item_variation_data;

  return {
    variationId: baseVariation.id,
    currency: baseData.price_money?.currency || 'CAD',
    base: cents(baseData.price_money),
    locationBase: Object.fromEntries(
      (baseData.location_overrides || [])
        .filter((override) => override.price_money)
        .map((override) => [override.location_id, cents(override.price_money)])
    ),
    groups,
  };
};

// Prices for the builder, in cents.
export const menuPrices = (catalog, locationId) => ({
  currency: catalog.currency,
  base: catalog.locationBase[locationId] ?? catalog.base,
  prices: mapValues(catalog.groups, (group) => group.prices),
});

const idList = (value, label) => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 12 || value.some((id) => typeof id !== 'string')) {
    throw new WrapOrderError(`"${label}" must be a list of options.`);
  }
  return [...new Set(value)];
};

// The Square order for one wrap, picked up as soon as it's ready.
export const buildWrapOrder = (catalog, choices, { locationId, prepMinutes }) => {
  const { size = 'regular', protein, heat = null, noSauce = false } = choices || {};
  const veggies = idList(choices?.veggies, 'veggies');
  const sauces = idList(choices?.sauces, 'sauces');

  const pick = (group, id) => {
    const modifierId = typeof id === 'string' ? catalog.groups[group].ids[id] : undefined;
    if (!modifierId) throw new WrapOrderError(`Unknown ${group} choice "${id}".`);
    return modifierId;
  };

  if (!protein) throw new WrapOrderError('Choose a protein.');
  if (!sauces.length && !heat && !noSauce) throw new WrapOrderError('Choose a sauce, or no sauce.');

  const modifiers = [];
  let variationId = catalog.variationId;
  if (catalog.groups.size.kind === 'variation') variationId = pick('size', size);
  else modifiers.push(pick('size', size));

  modifiers.push(pick('protein', protein));

  // Say "no toppings" and "no sauce" out loud, so the kitchen knows it wasn't forgotten.
  if (veggies.length) veggies.forEach((id) => modifiers.push(pick('veggies', id)));
  else if (catalog.groups.veggies.none) modifiers.push(catalog.groups.veggies.none);

  sauces.forEach((id) => modifiers.push(pick('sauces', id)));
  if (heat) modifiers.push(pick('heat', heat));
  if (!sauces.length && !heat && catalog.groups.sauces.none) modifiers.push(catalog.groups.sauces.none);

  return {
    location_id: locationId,
    line_items: [
      {
        catalog_object_id: variationId,
        quantity: '1',
        modifiers: modifiers.map((id) => ({ catalog_object_id: id })),
      },
    ],
    fulfillments: [
      {
        type: 'PICKUP',
        pickup_details: { schedule_type: 'ASAP', prep_time_duration: `PT${prepMinutes}M` },
      },
    ],
  };
};

// Finds the wrap in the catalog: by ID when one is configured (production), otherwise by name.
export const loadWrapCatalog = async (square, itemId) => {
  if (itemId) {
    const { object, related_objects: related } = await square.retrieveObject(itemId);
    return resolveWrapCatalog(object, related);
  }
  const { objects = [], related_objects: related } = await square.searchItemsByName(WRAP_ITEM_NAME);
  const item = objects.find((object) => object.type === 'ITEM' && !object.is_deleted);
  if (!item) throw new Error(`There is no "${WRAP_ITEM_NAME}" item in this Square account's catalog.`);
  return resolveWrapCatalog(item, related);
};
