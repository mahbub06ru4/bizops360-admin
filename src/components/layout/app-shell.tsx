import { Building2 } from 'lucide-react';
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
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-14 items-center gap-2.5 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary">
            <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight">BizOps 360</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav sections={sections} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/85 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <MobileNav sections={sections} />
            <span className="text-sm font-semibold lg:hidden">BizOps 360</span>
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

        <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
