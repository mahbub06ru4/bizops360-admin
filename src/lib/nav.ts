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
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    icon: 'LayoutDashboard',
    items: [{ label: 'Dashboard', href: '/', icon: 'LayoutDashboard' }],
  },
  {
    label: 'HR',
    icon: 'Users',
    items: [{ label: 'Leave balances', href: '/hr/leave-balances', icon: 'FileBarChart2', permission: 'leave.view' }],
  },
  {
    label: 'Operations',
    icon: 'ClipboardList',
    items: [
      { label: 'Overview', href: '/operations/overview', icon: 'FileBarChart2', permission: 'operations.view_dashboard' },
      { label: 'Tasks', href: '/operations/tasks', icon: 'FileText', permission: 'task.view' },
    ],
  },
  {
    label: 'CRM',
    icon: 'Handshake',
    items: [
      { label: 'Reports', href: '/crm/reports', icon: 'FileBarChart2', permission: 'crm.view_dashboard' },
      { label: 'Leads', href: '/crm/leads', icon: 'Handshake', permission: 'lead.view' },
      { label: 'Customers', href: '/crm/customers', icon: 'Contact', permission: 'customer.view' },
    ],
  },
  {
    label: 'Finance',
    icon: 'Wallet',
    items: [
      { label: 'Reports', href: '/finance/reports', icon: 'FileBarChart2', permission: 'finance.view_reports' },
      { label: 'Invoices', href: '/finance/invoices', icon: 'FileText', permission: 'invoice.view' },
    ],
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
