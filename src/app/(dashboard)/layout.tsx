import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getSession } from '@/lib/auth/session';

/**
 * middleware.ts already redirects an unauthenticated request before it gets
 * here (cookie presence only); this is the real check — a stale/revoked
 * token still fails here with a live 401 from bizops360-api.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  if (user === null) {
    redirect('/login');
  }

  return <AppShell user={user}>{children}</AppShell>;
}
