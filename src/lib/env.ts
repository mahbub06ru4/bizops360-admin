/**
 * Server-only env access. `API_BASE_URL` is the bizops360-api origin
 * (no trailing slash, no `/api/v1` — that prefix is added by the API
 * client). Never exposed to the client bundle — every request to
 * bizops360-api is proxied through this server, so the browser never
 * needs to know the backend's address.
 */
export const env = {
  apiBaseUrl: (process.env.API_BASE_URL ?? 'http://localhost').replace(/\/+$/, ''),
} as const;
