import Link from 'next/link';
import {
  Banknote,
  CalendarClock,
  ClipboardList,
  Contact,
  FileBarChart2,
  FileText,
  Handshake,
  Receipt,
  UserSquare2,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/organization/page-header';
import { getSession, hasPermission } from '@/lib/auth/session';

const REPORTS = [
  { href: '/reports/employees', label: 'Employee directory', description: 'Everyone on record, org placement included.', icon: Users, permission: 'employee.view' },
  { href: '/reports/attendance', label: 'Attendance log', description: 'Daily check-in/check-out records.', icon: CalendarClock, permission: 'attendance.view' },
  { href: '/reports/leave-requests', label: 'Leave requests', description: 'Every request and its decision.', icon: ClipboardList, permission: 'leave.view' },
  { href: '/reports/leave-balances', label: 'Leave balances', description: 'Entitlement and usage per employee.', icon: FileBarChart2, permission: 'leave.view' },
  { href: '/reports/projects', label: 'Projects', description: 'Every project and its status.', icon: ClipboardList, permission: 'project.view' },
  { href: '/reports/tasks', label: 'Task list', description: 'Every task, status, and assignee.', icon: FileText, permission: 'task.view' },
  { href: '/reports/leads', label: 'Sales pipeline', description: 'Every lead and its pipeline stage.', icon: Handshake, permission: 'lead.view' },
  { href: '/reports/customers', label: 'Customer list', description: 'Every customer on record.', icon: Contact, permission: 'customer.view' },
  { href: '/reports/invoices', label: 'Invoices', description: 'Billing status for every invoice.', icon: FileText, permission: 'invoice.view' },
  { href: '/reports/expenses', label: 'Expense report', description: 'Spend, with approval status.', icon: Receipt, permission: 'expense.view' },
  { href: '/reports/income', label: 'Income report', description: 'Money received outside invoices.', icon: Banknote, permission: 'income.view' },
] as const;

export default async function ReportsHubPage() {
  const user = await getSession();
  const visible = REPORTS.filter((report) => hasPermission(user, report.permission));

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Daily-use reports across the tenant, each downloadable as PDF or Excel."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <report.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{report.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{report.description}</CardContent>
            </Card>
          </Link>
        ))}
        {visible.length === 0 && (
          <div className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
            <UserSquare2 className="h-4 w-4" />
            No reports available for your role.
          </div>
        )}
      </div>
    </div>
  );
}
