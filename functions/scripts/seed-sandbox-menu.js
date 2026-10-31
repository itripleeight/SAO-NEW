// Creates a "Shawarma Wrap" item with the same options as the real Square menu in a Square
// SANDBOX account, so the wrap builder can be tried end to end without touching real orders.
// It only ever talks to the sandbox. Run from the project folder:
//
//   npm --prefix functions run seed:sandbox
//
// It reads the sandbox access token from functions/.secret.local (see SQUARE_SETUP.md).
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createSquareClient } from '../square.js';
import { WRAP_ITEM_NAME, WRAP_MENU } from '../wrap.js';

const tokenFromFile = () => {
  try {
    const line = readFileSync(new URL('../.secret.local', import.meta.url), 'utf8')
      .split(/\r?\n/)
      .find((entry) => entry.startsWith('SQUARE_ACCESS_TOKEN='));
    return line?.slice('SQUARE_ACCESS_TOKEN='.length).trim();
  } catch {
    return undefined;
  }
};

const token = process.env.SQUARE_ACCESS_TOKEN || tokenFromFile();
if (!token) {
  console.error('Add your Square sandbox access token to functions/.secret.local first (see SQUARE_SETUP.md).');
  process.exit(1);
}

const square = createSquareClient({ token, environment: 'sandbox' });

const { locations = [] } = await square.listLocations();
const location = locations.find(({ status }) => status === 'ACTIVE');
if (!location) {
  console.error('This sandbox account has no active location.');
  process.exit(1);
}

const { objects = [] } = await square.searchItemsByName(WRAP_ITEM_NAME);
if (objects.length) {
  console.log(`"${WRAP_ITEM_NAME}" is already in the sandbox catalog (${objects[0].id}). Nothing to do.`);
  process.exit(0);
}

// Upcharges as they appear on the live menu, in cents. Everything else is free.
const UPCHARGES = { Large: 400, 'Beef Shawarma': 149, 'Gyro Meat': 99, Hummus: 149, Tazikiti: 149 };
const { currency } = location;

const LISTS = [
  { id: '#size', name: 'Choose your size', selection: 'SINGLE', names: Object.values(WRAP_MENU.size.choices) },
  { id: '#protein', name: 'Wrap Protein', selection: 'SINGLE', names: Object.values(WRAP_MENU.protein.choices) },
  {
    id: '#toppings',
    name: 'Choose your Toppings',
    selection: 'MULTIPLE',
    names: [WRAP_MENU.veggies.none, ...Object.values(WRAP_MENU.veggies.choices)],
  },
  {
    id: '#sauce',
    name: 'Choose your Sauce',
    selection: 'MULTIPLE',
    names: [WRAP_MENU.sauces.none, ...Object.values(WRAP_MENU.sauces.choices), ...Object.values(WRAP_MENU.heat.choices)],
  },
];

const modifierList = ({ id, name, selection, names }) => ({
  type: 'MODIFIER_LIST',
  id,
  present_at_all_locations: true,
  modifier_list_data: {
    name,
    selection_type: selection,
    modifiers: names.map((modifierName, i) => ({
      type: 'MODIFIER',
      id: `${id}-${i}`,
      present_at_all_locations: true,
      modifier_data: { name: modifierName, price_money: { amount: UPCHARGES[modifierName] || 0, currency } },
    })),
  },
});

const wrap = {
  type: 'ITEM',
  id: '#wrap',
  present_at_all_locations: true,
  item_data: {
    name: WRAP_ITEM_NAME,
    description: 'Sandbox copy of the Shawarma Wrap, for testing the website wrap builder.',
    variations: [
      {
        type: 'ITEM_VARIATION',
        id: '#wrap-regular',
        present_at_all_locations: true,
        item_variation_data: {
          item_id: '#wrap',
          name: 'Regular',
          pricing_type: 'FIXED_PRICING',
          price_money: { amount: 1039, currency },
        },
      },
    ],
    modifier_list_info: LISTS.map(({ id }) => ({ modifier_list_id: id, enabled: true })),
  },
};

const { id_mappings: idMappings = [] } = await square.batchUpsertCatalog({
  idempotency_key: randomUUID(),
  batches: [{ objects: [...LISTS.map(modifierList), wrap] }],
});
const itemId = idMappings.find(({ client_object_id: clientId }) => clientId === '#wrap')?.object_id;

console.log(`Created "${WRAP_ITEM_NAME}" (${itemId}) in the sandbox, priced in ${currency}.`);
console.log(`Sandbox test orders will go to the "${location.name}" location (${location.id}).`);
