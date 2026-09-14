'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { LoginResponse } from '@/lib/api/types';
import { getToken, TOKEN_COOKIE } from './session';

export interface LoginActionState {
  error: string | null;
}

/**
 * Backs the login form. Same credential exchange the mobile app uses
 * (POST /api/v1/auth/login), the token just ends up in an httpOnly cookie
 * here instead of secure device storage.
 */
export async function loginAction(_prev: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (email === '' || password === '') {
    return { error: 'Email and password are required.' };
  }

  try {
    const { token } = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password, device_name: 'bizops360-admin' },
    });

    const store = await cookies();
    store.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // Matches the mobile app's token lifetime expectations loosely —
      // the backend can revoke it server-side regardless of this ceiling.
      maxAge: 60 * 60 * 24 * 14,
    });
  } catch (error) {
    if (error instanceof ApiError && (error.isUnauthorized || error.status === 422)) {
      return { error: 'Incorrect email or password.' };
    }

    return { error: 'Something went wrong signing in. Try again.' };
  }

  redirect('/');
}

export async function logoutAction(): Promise<void> {
  const token = await getToken();
  const store = await cookies();
  store.delete(TOKEN_COOKIE);

  if (token !== null) {
    // Best-effort — revoke the token server-side too, but the user is
    // signed out locally regardless of whether this call succeeds.
    await apiFetch('/auth/logout', { method: 'POST', token }).catch(() => undefined);
  }

  redirect('/login');
}
