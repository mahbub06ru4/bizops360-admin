import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/organization/page-header';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { DepartmentPerformance, EmployeeWorkload, OperationsOverview } from '@/lib/operations/types';

export default async function OperationsOverviewPage() {
  const token = await getToken();
  const [{ data: overview }, { data: workload }, { data: departments }] = await Promise.all([
    apiFetch<{ data: OperationsOverview }>('/operations/overview', { token }),
    apiFetch<{ data: EmployeeWorkload[] }>('/operations/workload', { token }),
    apiFetch<{ data: DepartmentPerformance[] }>('/operations/department-performance', { token }),
  ]);

  return (
    <div>
      <PageHeader title="Operations overview" description="Tenant-wide task and project health." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Open tasks</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.tasks.open}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-destructive">{overview.tasks.overdue}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Due today</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.tasks.due_today}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Unassigned</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.tasks.unassigned}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Completed this week</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.tasks.completed_this_week}</CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(overview.tasks.by_status).map(([status, count]) => (
              <Badge key={status} variant="outline" className="capitalize">
                {status.replace('_', ' ')}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Projects by status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(overview.projects.by_status).map(([status, count]) => (
              <Badge key={status} variant="outline" className="capitalize">
                {status.replace('_', ' ')}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-medium">Workload by employee</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Open</TableHead>
              <TableHead>Overdue</TableHead>
              <TableHead>Due today</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workload.map((row) => (
              <TableRow key={row.employee_id}>
                <TableCell className="font-medium">{row.employee_name ?? '—'}</TableCell>
                <TableCell>{row.open_tasks}</TableCell>
                <TableCell className={row.overdue_tasks > 0 ? 'text-destructive' : undefined}>{row.overdue_tasks}</TableCell>
                <TableCell>{row.due_today}</TableCell>
              </TableRow>
            ))}
            {workload.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No assigned tasks yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Department performance</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Total tasks</TableHead>
              <TableHead>Open</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Overdue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((row) => (
              <TableRow key={row.department_id}>
                <TableCell className="font-medium">{row.department_name ?? '—'}</TableCell>
                <TableCell>{row.projects}</TableCell>
                <TableCell>{row.total_tasks}</TableCell>
                <TableCell>{row.open_tasks}</TableCell>
                <TableCell>{row.completed_tasks}</TableCell>
                <TableCell className={row.overdue_tasks > 0 ? 'text-destructive' : undefined}>{row.overdue_tasks}</TableCell>
              </TableRow>
            ))}
            {departments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No department data yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
