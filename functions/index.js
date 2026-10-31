// Square checkout for the website's wrap builder (src/pages/BuildYourShawarma.jsx).
//
//   GET  /api/wrap/menu?location=<id>  prices of the wrap's options, from the Square catalog
//   POST /api/wrap/checkout            creates a Square checkout link for the wrap and returns its URL
//
// Firebase Hosting sends /api/wrap/** here (firebase.json); in development the Vite dev server
// proxies it to the Functions emulator. Setup steps are in SQUARE_SETUP.md.
import { randomUUID } from 'node:crypto';
import { onRequest } from 'firebase-functions/v2/https';
import { defineInt, defineSecret, defineString } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { createSquareClient } from './square.js';
import { STORES, WrapOrderError, buildWrapOrder, loadWrapCatalog, menuPrices } from './wrap.js';

const squareAccessToken = defineSecret('SQUARE_ACCESS_TOKEN');
const squareEnvironment = defineString('SQUARE_ENVIRONMENT', {
  default: 'sandbox',
  description: '"sandbox" for test orders, "production" for real ones.',
});
const squareWrapItemId = defineString('SQUARE_WRAP_ITEM_ID', {
  default: '',
  description: 'Catalog ID of the Shawarma Wrap item. Empty means find it by name.',
});
const allowedOrigins = defineString('ALLOWED_ORIGINS', {
  default: 'http://localhost:5173',
  description: 'Comma-separated site addresses allowed to start a checkout.',
});
const pickupPrepMinutes = defineInt('PICKUP_PREP_MINUTES', {
  default: 15,
  description: 'Minutes until a pickup order should be ready.',
});

// The catalog rarely changes, so keep it per server instance for a few minutes.
const CATALOG_TTL_MS = 10 * 60 * 1000;
let cachedCatalog = null;

const getCatalog = async (square) => {
  const key = `${square.environment}:${squareWrapItemId.value()}`;
  if (cachedCatalog?.key === key && Date.now() - cachedCatalog.loadedAt < CATALOG_TTL_MS) {
    return cachedCatalog.catalog;
  }
  const catalog = await loadWrapCatalog(square, squareWrapItemId.value());
  cachedCatalog = { key, loadedAt: Date.now(), catalog };
  return catalog;
};

// Real orders go to the store the customer picked. The sandbox only has its own test location,
// so every test order goes there.
let sandboxLocationId = null;

const locationFor = async (square, storeId) => {
  if (!STORES[storeId]) throw new WrapOrderError('Choose one of our stores for pickup.');
  if (square.environment === 'production') return storeId;
  if (!sandboxLocationId) {
    const { locations = [] } = await square.listLocations();
    sandboxLocationId = locations.find((location) => location.status === 'ACTIVE')?.id;
  }
  if (!sandboxLocationId) throw new Error('The Square sandbox account has no active location.');
  return sandboxLocationId;
};

export const wrapOrders = onRequest({ secrets: [squareAccessToken], maxInstances: 5 }, async (req, res) => {
  const origin = req.get('origin');
  const origins = allowedOrigins
    .value()
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (origin && origins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }
  if (origin && !origins.includes(origin)) {
    res.status(403).json({ error: 'This site is not allowed to start a checkout.' });
    return;
  }

  const token = squareAccessToken.value();
  if (!token) {
    res.status(503).json({ error: 'Online checkout is not set up yet.' });
    return;
  }

  try {
    const square = createSquareClient({ token, environment: squareEnvironment.value() });
    const catalog = await getCatalog(square);

    if (req.method === 'GET' && req.path.endsWith('/menu')) {
      res.set('Cache-Control', 'public, max-age=300');
      res.json(menuPrices(catalog, String(req.query.location || '')));
      return;
    }

    if (req.method === 'POST' && req.path.endsWith('/checkout')) {
      const storeId = String(req.body?.location || '');
      const locationId = await locationFor(square, storeId);
      // Bring the customer back to the builder, on whichever of our sites they came from.
      const site = origins.includes(origin) ? origin : origins.find((value) => value.startsWith('https://')) || origins[0];
      const { payment_link: link } = await square.createPaymentLink({
        idempotency_key: randomUUID(),
        order: buildWrapOrder(catalog, req.body, { locationId, prepMinutes: pickupPrepMinutes.value() }),
        checkout_options: {
          redirect_url: `${site}/build-your-shawarma?order=placed&store=${storeId}`,
        },
        payment_note: 'Built with the wrap builder on the website',
      });
      res.json({ url: link.url });
      return;
    }

    res.status(404).json({ error: 'Not found.' });
  } catch (error) {
    if (error instanceof WrapOrderError) {
      res.status(400).json({ error: error.message });
      return;
    }
    logger.error('Wrap checkout failed', error);
    res.status(502).json({ error: 'Square checkout is unavailable right now.' });
  }
});
