import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { LeaveTypeDialog } from '@/components/hr/leave-type-dialog';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteLeaveType } from '@/lib/hr/actions';
import type { Paginated } from '@/lib/api/types';
import type { LeaveType } from '@/lib/hr/types';

export default async function LeaveTypesPage() {
  const token = await getToken();
  const { data: leaveTypes } = await apiFetch<Paginated<LeaveType>>('/leave-types?per_page=100', { token });

  return (
    <div>
      <PageHeader title="Leave types" description="The kinds of leave staff can request." action={<LeaveTypeDialog />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Days/year</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveTypes.map((leaveType) => (
            <TableRow key={leaveType.id}>
              <TableCell className="font-medium">{leaveType.name}</TableCell>
              <TableCell className="text-muted-foreground">{leaveType.code}</TableCell>
              <TableCell>{leaveType.default_days_per_year ?? '—'}</TableCell>
              <TableCell>{leaveType.is_paid && <Badge variant="secondary">Paid</Badge>}</TableCell>
              <TableCell>{leaveType.requires_approval && <Badge variant="outline">Required</Badge>}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <LeaveTypeDialog leaveType={leaveType} />
                <DeleteRowButton
                  label={leaveType.name}
                  confirmMessage={`Delete "${leaveType.name}"?`}
                  action={deleteLeaveType.bind(null, leaveType.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {leaveTypes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No leave types yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
