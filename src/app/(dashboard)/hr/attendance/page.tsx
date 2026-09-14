import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/organization/page-header';
import { AttendanceRecordDialog } from '@/components/hr/attendance-record-dialog';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getSession, getToken, hasPermission } from '@/lib/auth/session';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Attendance, AttendanceSummary } from '@/lib/hr/types';
import type { Employee } from '@/lib/organization/types';

async function safeSummary(token: string | null): Promise<AttendanceSummary | null> {
  try {
    const response = await apiFetch<{ data: AttendanceSummary }>('/attendance/summary', { token });

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }

    throw error;
  }
}

const STATUS_VARIANT: Record<Attendance['status'], 'secondary' | 'default' | 'destructive' | 'outline'> = {
  present: 'default',
  late: 'outline',
  absent: 'destructive',
  half_day: 'outline',
  on_leave: 'secondary',
  holiday: 'secondary',
};

export default async function AttendancePage() {
  const [token, me] = await Promise.all([getToken(), getSession()]);
  const canRecord = hasPermission(me, 'attendance.record');
  const canViewAll = hasPermission(me, 'attendance.view_all');

  const [{ data: attendance }, summary, employees] = await Promise.all([
    apiFetch<Paginated<Attendance>>('/attendance?per_page=100', { token }),
    safeSummary(token),
    canRecord ? listAll<Employee>('/employees', token ?? '') : Promise.resolve<Employee[]>([]),
  ]);

  return (
    <div>
      <PageHeader
        title="Attendance"
        description={canViewAll ? 'Attendance records across the tenant.' : 'Your attendance record.'}
        action={canRecord ? <AttendanceRecordDialog employees={employees} /> : undefined}
      />

      {summary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>This month ({summary.month})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm">
            <span>Present: {summary.present}</span>
            <span>Late: {summary.late}</span>
            <span>Absent: {summary.absent}</span>
            <span>Half day: {summary.half_day}</span>
            <span>On leave: {summary.on_leave}</span>
            <span>Holiday: {summary.holiday}</span>
            <span>Worked minutes: {summary.worked_minutes}</span>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {canViewAll && <TableHead>Employee</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Worked (min)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendance.map((row) => (
            <TableRow key={row.id}>
              {canViewAll && <TableCell className="font-medium">{row.employee?.full_name ?? '—'}</TableCell>}
              <TableCell className="text-muted-foreground">{row.date}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[row.status]} className="capitalize">
                  {row.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.check_in_at ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{row.check_out_at ?? '—'}</TableCell>
              <TableCell>{row.worked_minutes ?? '—'}</TableCell>
            </TableRow>
          ))}
          {attendance.length === 0 && (
            <TableRow>
              <TableCell colSpan={canViewAll ? 6 : 5} className="text-center text-muted-foreground">
                No attendance records yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
