import 'server-only';

import { env } from '@/lib/env';
import { ApiError } from './errors';
import type { ApiErrorBody } from './types';

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  token?: string | null;
  body?: unknown;
  /** Skip Next.js's fetch cache — use for anything mutating or per-user. */
  noStore?: boolean;
}

/**
 * The only place in this app that talks to bizops360-api. Server-only by
 * import (`server-only` throws if this ever ends up in a client bundle) —
 * the Sanctum token never reaches the browser; every page, layout, and
 * Server Action calls through here instead.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, body, noStore = true, headers, ...rest } = options;

  const response = await fetch(`${env.apiBaseUrl}/api/v1${path}`, {
    ...rest,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: noStore ? 'no-store' : rest.cache,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const json: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, json as ApiErrorBody | null);
  }

  return json as T;
}
