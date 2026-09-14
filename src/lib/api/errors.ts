import type { ApiErrorBody } from './types';

/**
 * Thrown by {@link apiFetch} for any non-2xx response. Carries the parsed
 * body (validation `errors` map, when present) so callers can render
 * field-level messages instead of a generic failure.
 */
export class ApiError extends Error {
  readonly status: number;

  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get validationErrors(): Record<string, string[]> {
    return this.body?.errors ?? {};
  }
}
