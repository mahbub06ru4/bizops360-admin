import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/organization/page-header';
import { FollowUpActions } from '@/components/crm/follow-up-actions';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { FollowUp, FollowUpStatus } from '@/lib/crm/types';
import type { Paginated } from '@/lib/api/types';

const STATUS_VARIANT: Record<FollowUpStatus, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  pending: 'outline',
  completed: 'default',
  cancelled: 'secondary',
};

export default async function FollowUpsPage() {
  const token = await getToken();
  const { data: followUps } = await apiFetch<Paginated<FollowUp>>('/follow-ups?per_page=100', { token });

  return (
    <div>
      <PageHeader title="Follow-ups" description="Scheduled outreach across all leads and customers." />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>For</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned to</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {followUps.map((followUp) => (
            <TableRow key={followUp.id}>
              <TableCell className="font-medium">
                {followUp.followupable_type} #{followUp.followupable_id}
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">{followUp.type}</TableCell>
              <TableCell className={followUp.is_overdue ? 'text-destructive' : 'text-muted-foreground'}>
                {followUp.due_at}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[followUp.status]} className="capitalize">
                  {followUp.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{followUp.assigned_employee?.full_name ?? '—'}</TableCell>
              <TableCell>
                <FollowUpActions followUp={followUp} />
              </TableCell>
            </TableRow>
          ))}
          {followUps.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No follow-ups yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
