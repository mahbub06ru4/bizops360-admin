import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/organization/page-header';
import { LeaveBalanceDialog } from '@/components/hr/leave-balance-dialog';
import { apiFetch } from '@/lib/api/client';
import { getSession, getToken, hasPermission } from '@/lib/auth/session';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { LeaveBalance, LeaveType } from '@/lib/hr/types';
import type { Employee } from '@/lib/organization/types';

export default async function LeaveBalancesPage() {
  const [token, me] = await Promise.all([getToken(), getSession()]);
  const canManage = hasPermission(me, 'leave.manage_balance');

  const [{ data: balances }, employees, leaveTypes] = await Promise.all([
    apiFetch<Paginated<LeaveBalance>>('/leave-balances?per_page=100', { token }),
    canManage ? listAll<Employee>('/employees', token ?? '') : Promise.resolve<Employee[]>([]),
    listAll<LeaveType>('/leave-types', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader
        title="Leave balances"
        description={canManage ? 'Entitlements and usage for every employee.' : 'Your leave entitlements and usage.'}
        action={canManage ? <LeaveBalanceDialog employees={employees} leaveTypes={leaveTypes} /> : undefined}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Leave type</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Entitled</TableHead>
            <TableHead>Used</TableHead>
            <TableHead>Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {balances.map((balance) => (
            <TableRow key={balance.id}>
              <TableCell className="font-medium">{balance.employee?.full_name ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{balance.leave_type?.name ?? '—'}</TableCell>
              <TableCell>{balance.year}</TableCell>
              <TableCell>{balance.entitled_days}</TableCell>
              <TableCell>{balance.used_days}</TableCell>
              <TableCell>{balance.remaining_days}</TableCell>
            </TableRow>
          ))}
          {balances.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No leave balances yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
