import { Badge } from '@/components/ui/badge';
import { visibleNavSections } from '@/lib/nav';
import type { AuthUser } from '@/lib/api/types';
import { MobileNav } from './mobile-nav';
import { SidebarNav } from './sidebar-nav';
import { UserMenu } from './user-menu';

export function AppShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const sections = visibleNavSections(user);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-muted/30 p-4 lg:flex lg:flex-col">
        <div className="px-3 py-2 text-lg font-semibold">BizOps 360</div>
        <div className="mt-4">
          <SidebarNav sections={sections} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b px-4">
          <div className="flex items-center gap-2">
            <MobileNav sections={sections} />
            <span className="text-sm font-medium lg:hidden">BizOps 360</span>
          </div>

          <div className="flex items-center gap-3">
            {user.tenant && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {user.tenant.name}
              </Badge>
            )}
            {user.is_platform_admin && <Badge className="hidden sm:inline-flex">Platform admin</Badge>}
            <UserMenu user={user} />
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
