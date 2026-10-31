// Calls the wrapOrders Cloud Function (functions/index.js), which talks to Square.
// Same-origin paths: Firebase Hosting routes them in production, the Vite proxy in development.
const API = '/api/wrap';

const readJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

// Prices of the wrap and its options at a store, in cents. Rejects when checkout isn't set up,
// in which case the builder simply shows no prices.
export const fetchWrapMenu = async (storeId) => {
  const menu = await fetch(`${API}/menu?location=${encodeURIComponent(storeId)}`).then(readJson);
  if (!menu.currency || !Number.isFinite(menu.base)) throw new Error('Prices are unavailable.');
  return menu;
};

// Creates a Square checkout for the wrap and resolves to its URL.
export const startCheckout = async (order) => {
  const { url } = await fetch(`${API}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  }).then(readJson);
  if (!url) throw new Error('Checkout is unavailable.');
  return url;
};

export const formatMoney = (cents, currency) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(cents / 100);
