import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { AuthUser } from '@/lib/api/types';

/** httpOnly, so no client-side JS — including a compromised dependency — can read it. */
export const TOKEN_COOKIE = 'bizops360_token';

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

/**
 * The authenticated user, or null. `cache()` de-dupes this to one backend
 * call per request even when called from a layout and several pages/
 * components in the same render.
 */
export const getSession = cache(async (): Promise<AuthUser | null> => {
  const token = await getToken();

  if (token === null) {
    return null;
  }

  try {
    const { data } = await apiFetch<{ data: AuthUser }>('/auth/me', { token });

    return data;
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      return null;
    }

    throw error;
  }
});

export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (user === null) {
    return false;
  }

  return user.permissions?.includes(permission) ?? false;
}

export function hasRole(user: AuthUser | null, role: string): boolean {
  return user?.roles.includes(role) ?? false;
}
