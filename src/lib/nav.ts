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
  {
    label: 'Organization',
    items: [
      { label: 'Branches', href: '/organization/branches', permission: 'branch.view' },
      { label: 'Departments', href: '/organization/departments', permission: 'department.view' },
      { label: 'Designations', href: '/organization/designations', permission: 'designation.view' },
      { label: 'Employees', href: '/organization/employees', permission: 'employee.view' },
      { label: 'Teams', href: '/organization/teams', permission: 'team.view' },
      { label: 'Users', href: '/organization/users', permission: 'user.view' },
      { label: 'Roles', href: '/organization/roles', permission: 'role.view' },
    ],
  },
  {
    label: 'HR',
    items: [
      { label: 'Holidays', href: '/hr/holidays', permission: 'holiday.view' },
      { label: 'Leave types', href: '/hr/leave-types', permission: 'leave_type.view' },
      { label: 'Leave requests', href: '/hr/leave-requests', permission: 'leave.view' },
      { label: 'Leave balances', href: '/hr/leave-balances', permission: 'leave.view' },
      { label: 'Attendance', href: '/hr/attendance', permission: 'attendance.view' },
      { label: 'Attendance settings', href: '/hr/attendance-settings', permission: 'attendance.manage_settings' },
      { label: 'Office location', href: '/hr/office-location', permission: 'attendance.manage' },
      { label: 'Employee documents', href: '/hr/employee-documents', permission: 'employee_document.view' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Overview', href: '/operations/overview', permission: 'operations.view_dashboard' },
      { label: 'Projects', href: '/operations/projects', permission: 'project.view' },
      { label: 'Tasks', href: '/operations/tasks', permission: 'task.view' },
    ],
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
