import type { AuthUser } from '@/lib/api/types';
import { hasPermission } from '@/lib/auth/session';

/**
 * Names of the lucide-react icons used in the nav — kept as string keys
 * (resolved to components in the client-side SidebarNav) rather than
 * component references, since NAV_SECTIONS is read by a Server Component and
 * React component values can't cross that boundary as plain prop data.
 */
export type NavIconName =
  | 'Banknote'
  | 'Building2'
  | 'CalendarClock'
  | 'ClipboardList'
  | 'Contact'
  | 'FileBarChart2'
  | 'FileText'
  | 'Handshake'
  | 'LayoutDashboard'
  | 'MapPin'
  | 'Receipt'
  | 'ShieldCheck'
  | 'Users'
  | 'Wallet';

export interface NavItem {
  label: string;
  href: string;
  icon?: NavIconName;
  /** Gate on a specific permission (checked against `user.permissions`). */
  permission?: string;
  /** Gate on `user.is_platform_admin` instead of a tenant permission. */
  platformOnly?: boolean;
}

export interface NavSection {
  label: string;
  icon: NavIconName;
  items: NavItem[];
  /** Gate the whole section on `user.tenant.industry` matching this value. */
  industry?: string;
}

/**
 * The single nav config every user sees a filtered slice of — same
 * "adapt, never fork" principle the Flutter app follows. Each module
 * phase appends its own section here rather than branching the layout.
 */
/**
 * Every module-specific screen is now either schema-driven (rendered under
 * `/admin/[resource]`, linked from the "(Dynamic)" nav sections built in
 * `admin-schema/fetch.ts`) or one of the bespoke dashboards in the backend
 * schema's `dashboards` array (also linked from the "(Dynamic)" sections,
 * via `schema.dashboards`) — so only the plain Overview/Dashboard link is
 * hand-written here.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    icon: 'LayoutDashboard',
    items: [{ label: 'Dashboard', href: '/', icon: 'LayoutDashboard' }],
  },
];

export function visibleNavSections(user: AuthUser | null): NavSection[] {
  return NAV_SECTIONS.filter((section) => !section.industry || user?.tenant?.industry === section.industry)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.platformOnly) {
          return user?.is_platform_admin ?? false;
        }

        if (item.permission) {
          return hasPermission(user, item.permission);
        }

        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);
}
