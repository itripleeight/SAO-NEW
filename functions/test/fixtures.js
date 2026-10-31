// A catalog shaped like the live "Shawarma Wrap": sizes, protein, toppings and sauces as
// modifier lists, plus an "Extra Sauce" list that also has a Hummus option, to make sure the
// right one is used.
export const money = (amount) => ({ amount, currency: 'CAD' });

const modifierList = (id, name, options) => ({
  type: 'MODIFIER_LIST',
  id,
  modifier_list_data: {
    name,
    modifiers: options.map(([optionName, amount = 0], i) => ({
      type: 'MODIFIER',
      id: `${id}-${i}`,
      modifier_data: { name: optionName, price_money: money(amount) },
    })),
  },
});

export const LISTS = [
  modifierList('SIZE', 'Choose your size', [['Regular'], ['Large', 400]]),
  modifierList('PROTEIN', 'Wrap Protein', [['Chicken Shawarma'], ['Falafel'], ['Gyro Meat', 99], ['Beef Shawarma', 149]]),
  modifierList('TOPPINGS', 'Choose your Toppings', [
    ['Naked (no toppings)'], ['ALL TOPPINGS'], ['Lettuce'], ['Tomato'], ['Onions'], ['Pickles'], ['Turnips'], ['Black Olives'], ['Cucumbers'],
  ]),
  modifierList('SAUCE', 'Choose your Sauce', [
    ['No Sauce'], ['Garlic Sauce'], ['Spicy Mayo'], ['Mild (4 drops Hot)'], ['One line Hot Sauce'], ['Medium (2 lines hot)'],
    ['Hot (4 lines hot)'], ['Extra hot (6 lines hot)'], ['Suicide (8 lines hot)'], ['Tahini'], ['Hummus', 149], ['Tazikiti', 149],
  ]),
  modifierList('EXTRA', 'Extra Sauce', [['Tazikiti', 149], ['Hummus', 149], ['Extra Garlic sauce on side', 99]]),
];

export const ITEM = {
  type: 'ITEM',
  id: 'WRAP',
  item_data: {
    name: 'Shawarma Wrap',
    variations: [
      {
        type: 'ITEM_VARIATION',
        id: 'WRAP-REGULAR',
        item_variation_data: {
          name: 'Regular',
          price_money: money(1039),
          location_overrides: [{ location_id: 'LMF4W6WW67SV9', price_money: money(1099) }],
        },
      },
    ],
    modifier_list_info: LISTS.map(({ id }) => ({ modifier_list_id: id, enabled: true })),
  },
};
