import type { AuthUser } from '@/lib/api/types';
import { hasPermission } from '@/lib/auth/session';

export interface NavItem {
  label: string;
  href: string;
  /** Gate on a specific permission (checked against `user.permissions`). */
  permission?: string;
  /** Gate on `user.is_platform_admin` instead of a tenant permission. */
  platformOnly?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * The single nav config every user sees a filtered slice of — same
 * "adapt, never fork" principle the Flutter app follows. Each module
 * phase appends its own section here rather than branching the layout.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/' }],
  },
];

export function visibleNavSections(user: AuthUser | null): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
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
  })).filter((section) => section.items.length > 0);
}
