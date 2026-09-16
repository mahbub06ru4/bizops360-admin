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
  | 'Home'
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
    label: 'Organization',
    icon: 'Building2',
    items: [
      { label: 'Branches', href: '/organization/branches', icon: 'MapPin', permission: 'branch.view' },
      { label: 'Departments', href: '/organization/departments', icon: 'Building2', permission: 'department.view' },
      { label: 'Designations', href: '/organization/designations', icon: 'ClipboardList', permission: 'designation.view' },
      { label: 'Employees', href: '/organization/employees', icon: 'Users', permission: 'employee.view' },
      { label: 'Teams', href: '/organization/teams', icon: 'Contact', permission: 'team.view' },
      { label: 'Users', href: '/organization/users', icon: 'ShieldCheck', permission: 'user.view' },
      { label: 'Roles', href: '/organization/roles', icon: 'ShieldCheck', permission: 'role.view' },
    ],
  },
  {
    label: 'HR',
    icon: 'Users',
    items: [
      { label: 'Holidays', href: '/hr/holidays', icon: 'CalendarClock', permission: 'holiday.view' },
      { label: 'Leave types', href: '/hr/leave-types', icon: 'FileText', permission: 'leave_type.view' },
      { label: 'Leave requests', href: '/hr/leave-requests', icon: 'ClipboardList', permission: 'leave.view' },
      { label: 'Leave balances', href: '/hr/leave-balances', icon: 'FileBarChart2', permission: 'leave.view' },
      { label: 'Attendance', href: '/hr/attendance', icon: 'CalendarClock', permission: 'attendance.view' },
      {
        label: 'Attendance settings',
        href: '/hr/attendance-settings',
        icon: 'ShieldCheck',
        permission: 'attendance.manage_settings',
      },
      { label: 'Office location', href: '/hr/office-location', icon: 'MapPin', permission: 'attendance.manage' },
      {
        label: 'Employee documents',
        href: '/hr/employee-documents',
        icon: 'FileText',
        permission: 'employee_document.view',
      },
    ],
  },
  {
    label: 'Operations',
    icon: 'ClipboardList',
    items: [
      { label: 'Overview', href: '/operations/overview', icon: 'FileBarChart2', permission: 'operations.view_dashboard' },
      { label: 'Projects', href: '/operations/projects', icon: 'ClipboardList', permission: 'project.view' },
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
      { label: 'Follow-ups', href: '/crm/follow-ups', icon: 'CalendarClock', permission: 'follow_up.view' },
    ],
  },
  {
    label: 'Finance',
    icon: 'Wallet',
    items: [
      { label: 'Reports', href: '/finance/reports', icon: 'FileBarChart2', permission: 'finance.view_reports' },
      { label: 'Income', href: '/finance/incomes', icon: 'Banknote', permission: 'income.view' },
      { label: 'Expenses', href: '/finance/expenses', icon: 'Receipt', permission: 'expense.view' },
      { label: 'Invoices', href: '/finance/invoices', icon: 'FileText', permission: 'invoice.view' },
    ],
  },
  {
    label: 'Reports',
    icon: 'FileBarChart2',
    items: [
      { label: 'All reports', href: '/reports', icon: 'FileBarChart2' },
      { label: 'Employee directory', href: '/reports/employees', icon: 'Users', permission: 'employee.view' },
      { label: 'Attendance log', href: '/reports/attendance', icon: 'CalendarClock', permission: 'attendance.view' },
      { label: 'Leave requests', href: '/reports/leave-requests', icon: 'ClipboardList', permission: 'leave.view' },
      { label: 'Leave balances', href: '/reports/leave-balances', icon: 'FileBarChart2', permission: 'leave.view' },
      { label: 'Projects', href: '/reports/projects', icon: 'ClipboardList', permission: 'project.view' },
      { label: 'Task list', href: '/reports/tasks', icon: 'FileText', permission: 'task.view' },
      { label: 'Sales pipeline', href: '/reports/leads', icon: 'Handshake', permission: 'lead.view' },
      { label: 'Customer list', href: '/reports/customers', icon: 'Contact', permission: 'customer.view' },
      { label: 'Invoices', href: '/reports/invoices', icon: 'FileText', permission: 'invoice.view' },
      { label: 'Expense report', href: '/reports/expenses', icon: 'Receipt', permission: 'expense.view' },
      { label: 'Income report', href: '/reports/income', icon: 'Banknote', permission: 'income.view' },
    ],
  },
  {
    label: 'Real Estate',
    icon: 'Home',
    industry: 'real_estate',
    items: [{ label: 'Projects', href: '/real-estate/projects', icon: 'Building2', permission: 'real_estate_project.view' }],
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
