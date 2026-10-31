import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WrapOrderError, buildWrapOrder, menuPrices, resolveWrapCatalog } from '../wrap.js';
import { ITEM, LISTS, money } from './fixtures.js';

const catalog = resolveWrapCatalog(ITEM, LISTS);
const options = { locationId: 'LMF4W6WW67SV9', prepMinutes: 15 };
const modifierIds = (order) => order.line_items[0].modifiers.map(({ catalog_object_id: id }) => id);

test('finds each option in the right modifier list', () => {
  assert.equal(catalog.groups.size.kind, 'modifier');
  assert.equal(catalog.groups.protein.ids.gyro, 'PROTEIN-2');
  assert.equal(catalog.groups.sauces.ids.hummus, 'SAUCE-10');
  assert.equal(catalog.groups.heat.ids.medium, 'SAUCE-5');
  assert.equal(catalog.groups.veggies.none, 'TOPPINGS-0');
});

test('reports prices in cents, with per-store base prices', () => {
  const menu = menuPrices(catalog, 'LMF4W6WW67SV9');
  assert.equal(menu.base, 1099);
  assert.equal(menuPrices(catalog, 'L9NN7E9ZHB3ED').base, 1039);
  assert.equal(menu.prices.size.large, 400);
  assert.equal(menu.prices.protein.beef, 149);
  assert.equal(menu.prices.sauces.tzatziki, 149);
});

test('builds a pickup order with every choice as a modifier', () => {
  const order = buildWrapOrder(
    catalog,
    { size: 'large', protein: 'beef', veggies: ['lettuce', 'turnips'], sauces: ['garlic'], heat: 'medium' },
    options
  );
  assert.equal(order.location_id, 'LMF4W6WW67SV9');
  assert.equal(order.line_items[0].catalog_object_id, 'WRAP-REGULAR');
  assert.deepEqual(modifierIds(order), ['SIZE-1', 'PROTEIN-3', 'TOPPINGS-2', 'TOPPINGS-6', 'SAUCE-1', 'SAUCE-5']);
  assert.deepEqual(order.fulfillments[0].pickup_details, { schedule_type: 'ASAP', prep_time_duration: 'PT15M' });
});

test('says no toppings and no sauce explicitly', () => {
  const order = buildWrapOrder(catalog, { protein: 'chicken', noSauce: true }, options);
  assert.deepEqual(modifierIds(order), ['SIZE-0', 'PROTEIN-0', 'TOPPINGS-0', 'SAUCE-0']);
});

test('rejects incomplete or unknown choices', () => {
  assert.throws(() => buildWrapOrder(catalog, { sauces: ['garlic'] }, options), WrapOrderError);
  assert.throws(() => buildWrapOrder(catalog, { protein: 'chicken' }, options), /sauce/);
  assert.throws(() => buildWrapOrder(catalog, { protein: 'lamb', noSauce: true }, options), /Unknown protein/);
  assert.throws(() => buildWrapOrder(catalog, { protein: 'chicken', veggies: 'lettuce', noSauce: true }, options), WrapOrderError);
});

test('supports sizes set up as item variations', () => {
  const item = {
    ...ITEM,
    item_data: {
      ...ITEM.item_data,
      variations: [
        { type: 'ITEM_VARIATION', id: 'V-REG', item_variation_data: { name: 'Regular', price_money: money(1039) } },
        { type: 'ITEM_VARIATION', id: 'V-LRG', item_variation_data: { name: 'Large', price_money: money(1439) } },
      ],
      modifier_list_info: ITEM.item_data.modifier_list_info.filter(({ modifier_list_id: id }) => id !== 'SIZE'),
    },
  };
  const sized = resolveWrapCatalog(item, LISTS);
  assert.equal(sized.groups.size.kind, 'variation');
  assert.equal(sized.groups.size.prices.large, 400);
  const order = buildWrapOrder(sized, { size: 'large', protein: 'chicken', noSauce: true }, options);
  assert.equal(order.line_items[0].catalog_object_id, 'V-LRG');
});

test('explains what is missing when the Square item does not match', () => {
  const lists = LISTS.filter(({ id }) => id !== 'PROTEIN');
  assert.throws(() => resolveWrapCatalog(ITEM, lists), /missing options for protein \(Chicken Shawarma, Beef Shawarma, Gyro Meat\)/);
});
