import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { LeadConvertButton } from '@/components/crm/lead-convert-button';
import { LeadDialog } from '@/components/crm/lead-dialog';
import { LeadStageSelect } from '@/components/crm/lead-stage-select';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteLead } from '@/lib/crm/actions';
import type { Lead, LeadStage } from '@/lib/crm/types';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Employee } from '@/lib/organization/types';

const STAGE_VARIANT: Record<LeadStage, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  new: 'outline',
  contacted: 'outline',
  interested: 'default',
  follow_up: 'default',
  negotiation: 'default',
  converted: 'secondary',
  lost: 'destructive',
};

export default async function LeadsPage() {
  const token = await getToken();
  const [{ data: leads }, employees] = await Promise.all([
    apiFetch<Paginated<Lead>>('/leads?per_page=100', { token }),
    listAll<Employee>('/employees', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader title="Leads" description="The sales pipeline." action={<LeadDialog employees={employees} />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="w-52 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">
                <Link href={`/crm/leads/${lead.id}`} className="hover:underline">
                  {lead.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{lead.company ?? '—'}</TableCell>
              <TableCell>
                {lead.stage === 'converted' ? (
                  <Badge variant={STAGE_VARIANT[lead.stage]} className="capitalize">
                    Converted
                  </Badge>
                ) : (
                  <LeadStageSelect leadId={lead.id} stage={lead.stage} />
                )}
              </TableCell>
              <TableCell>{lead.estimated_value ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{lead.owner?.full_name ?? '—'}</TableCell>
              <TableCell className="flex justify-end gap-1">
                {lead.stage !== 'converted' && lead.stage !== 'lost' && <LeadConvertButton leadId={lead.id} />}
                <LeadDialog lead={lead} employees={employees} />
                <DeleteRowButton
                  label={lead.name}
                  confirmMessage={`Delete "${lead.name}"?`}
                  action={deleteLead.bind(null, lead.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {leads.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No leads yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
