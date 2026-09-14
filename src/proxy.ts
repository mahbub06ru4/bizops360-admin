import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_COOKIE = 'bizops360_token';
const PUBLIC_PATHS = ['/login'];

/**
 * Cheap presence-only check (no network call, no signature verification —
 * middleware runs on the Edge runtime and can't reach bizops360-api's full
 * /auth/me contract efficiently on every request). A stale or revoked
 * token still gets a real 401 from apiFetch inside the page itself, which
 * every protected layout/page treats as "not authenticated" — this layer
 * only exists to stop rendering the shell at all when there's clearly no
 * session.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const hasToken = request.cookies.has(TOKEN_COOKIE);

  if (!isPublic && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && hasToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
