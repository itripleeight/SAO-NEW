// Runs the wrapOrders HTTP function against a fake Square API, to check the requests it makes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEM, LISTS } from './fixtures.js';

process.env.SQUARE_ACCESS_TOKEN = 'test-token';
process.env.SQUARE_ENVIRONMENT = 'sandbox';
process.env.SQUARE_WRAP_ITEM_ID = '';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173,https://shawaramaalley.web.app';
process.env.PICKUP_PREP_MINUTES = '20';

const squareCalls = [];
globalThis.fetch = async (url, { method, headers, body }) => {
  const { pathname } = new URL(url);
  squareCalls.push({ url, method, headers, body: body && JSON.parse(body) });
  const reply = {
    '/v2/catalog/search': { objects: [ITEM], related_objects: LISTS },
    '/v2/locations': { locations: [{ id: 'SANDBOX-LOCATION', status: 'ACTIVE', currency: 'CAD' }] },
    '/v2/online-checkout/payment-links': { payment_link: { url: 'https://sandbox.square.link/u/test' } },
  }[pathname];
  return new Response(JSON.stringify(reply || { errors: [{ code: 'NOT_FOUND', detail: pathname }] }), {
    status: reply ? 200 : 404,
  });
};

const { wrapOrders } = await import('../index.js');

// Just enough of Express's request and response for the function.
const call = (method, path, { origin, body, query = {} } = {}) =>
  new Promise((resolve) => {
    const headers = {};
    const res = {
      statusCode: 200,
      set: (name, value) => {
        headers[name] = value;
        return res;
      },
      status: (code) => {
        res.statusCode = code;
        return res;
      },
      json: (data) => resolve({ status: res.statusCode, headers, data }),
      send: (data) => resolve({ status: res.statusCode, headers, data }),
    };
    const req = { method, path, query, body, headers: { origin }, get: (name) => (name === 'origin' ? origin : undefined) };
    wrapOrders(req, res);
  });

test('creates a sandbox checkout link for a wrap', async () => {
  const { status, data, headers } = await call('POST', '/api/wrap/checkout', {
    origin: 'http://localhost:5173',
    body: { location: 'LHVE0AFQ0EHMQ', size: 'large', protein: 'gyro', veggies: ['tomato'], sauces: ['tahini'], heat: null },
  });

  assert.equal(status, 200);
  assert.deepEqual(data, { url: 'https://sandbox.square.link/u/test' });
  assert.equal(headers['Access-Control-Allow-Origin'], 'http://localhost:5173');

  const link = squareCalls.find(({ url }) => url.endsWith('/v2/online-checkout/payment-links'));
  assert.ok(link.url.startsWith('https://connect.squareupsandbox.com/'));
  assert.equal(link.headers.Authorization, 'Bearer test-token');
  // In the sandbox every order goes to the sandbox's own location, whichever store was picked.
  assert.equal(link.body.order.location_id, 'SANDBOX-LOCATION');
  assert.deepEqual(
    link.body.order.line_items[0].modifiers.map(({ catalog_object_id: id }) => id),
    ['SIZE-1', 'PROTEIN-2', 'TOPPINGS-3', 'SAUCE-9']
  );
  assert.equal(link.body.order.fulfillments[0].pickup_details.prep_time_duration, 'PT20M');
  assert.equal(
    link.body.checkout_options.redirect_url,
    'http://localhost:5173/build-your-shawarma?order=placed&store=LHVE0AFQ0EHMQ'
  );
  assert.ok(link.body.idempotency_key);
});

test('returns option prices for the builder', async () => {
  const { status, data } = await call('GET', '/api/wrap/menu', { query: { location: 'LMF4W6WW67SV9' } });
  assert.equal(status, 200);
  assert.equal(data.currency, 'CAD');
  assert.equal(data.base, 1099);
  assert.equal(data.prices.protein.beef, 149);
});

test('turns away other websites and unknown stores', async () => {
  const foreign = await call('POST', '/api/wrap/checkout', { origin: 'https://example.com', body: {} });
  assert.equal(foreign.status, 403);

  const unknownStore = await call('POST', '/api/wrap/checkout', {
    origin: 'https://shawaramaalley.web.app',
    body: { location: 'SOMEWHERE', protein: 'chicken', noSauce: true },
  });
  assert.equal(unknownStore.status, 400);
});
