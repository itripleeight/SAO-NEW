// Minimal Square API client: just the calls the wrap builder needs.
// https://developer.squareup.com/reference/square

const BASE_URLS = {
  production: 'https://connect.squareup.com',
  sandbox: 'https://connect.squareupsandbox.com',
};

// Pinned so a Square API change can't alter request or response shapes underneath us.
const SQUARE_VERSION = '2026-09-16';

export class SquareApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'SquareApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const createSquareClient = ({ token, environment }) => {
  const baseUrl = BASE_URLS[environment];
  if (!baseUrl) throw new Error(`SQUARE_ENVIRONMENT must be "sandbox" or "production", not "${environment}".`);

  const call = async (method, path, body) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Square-Version': SQUARE_VERSION,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data.errors?.map(({ code, detail: text }) => `${code}: ${text}`).join('; ') || response.statusText;
      throw new SquareApiError(`${method} ${path} failed (${response.status}): ${detail}`, response.status, data.errors);
    }
    return data;
  };

  return {
    environment,
    retrieveObject: (id) => call('GET', `/v2/catalog/object/${encodeURIComponent(id)}?include_related_objects=true`),
    searchItemsByName: (name) =>
      call('POST', '/v2/catalog/search', {
        object_types: ['ITEM'],
        include_related_objects: true,
        query: { exact_query: { attribute_name: 'name', attribute_value: name } },
      }),
    batchUpsertCatalog: (body) => call('POST', '/v2/catalog/batch-upsert', body),
    listLocations: () => call('GET', '/v2/locations'),
    createPaymentLink: (body) => call('POST', '/v2/online-checkout/payment-links', body),
  };
};
