import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/organization/page-header';
import { LeaveDecisionActions } from '@/components/hr/leave-decision-actions';
import { LeaveRequestDialog } from '@/components/hr/leave-request-dialog';
import { apiFetch } from '@/lib/api/client';
import { getSession, getToken, hasPermission } from '@/lib/auth/session';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { LeaveRequest, LeaveType } from '@/lib/hr/types';
import type { Employee } from '@/lib/organization/types';

const STATUS_VARIANT: Record<LeaveRequest['status'], 'secondary' | 'default' | 'destructive' | 'outline'> = {
  pending: 'outline',
  approved: 'default',
  rejected: 'destructive',
  cancelled: 'secondary',
};

export default async function LeaveRequestsPage() {
  const [token, me] = await Promise.all([getToken(), getSession()]);
  const canDecide = hasPermission(me, 'leave.approve');

  const [{ data: leaveRequests }, employees, leaveTypes] = await Promise.all([
    apiFetch<Paginated<LeaveRequest>>('/leave-requests?per_page=100', { token }),
    listAll<Employee>('/employees', token ?? ''),
    listAll<LeaveType>('/leave-types', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader
        title="Leave requests"
        description={canDecide ? 'All leave requests across the tenant.' : 'Your leave requests.'}
        action={<LeaveRequestDialog leaveTypes={leaveTypes} employees={canDecide ? employees : []} />}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveRequests.map((leaveRequest) => (
            <TableRow key={leaveRequest.id}>
              <TableCell className="font-medium">{leaveRequest.employee?.full_name ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{leaveRequest.leave_type?.name ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">
                {leaveRequest.start_date} — {leaveRequest.end_date}
              </TableCell>
              <TableCell>{leaveRequest.days}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[leaveRequest.status]} className="capitalize">
                  {leaveRequest.status}
                </Badge>
              </TableCell>
              <TableCell>
                <LeaveDecisionActions leaveRequest={leaveRequest} canDecide={canDecide} />
              </TableCell>
            </TableRow>
          ))}
          {leaveRequests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No leave requests yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
