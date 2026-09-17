import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { ContactDialog } from '@/components/crm/contact-dialog';
import { FollowUpActions } from '@/components/crm/follow-up-actions';
import { FollowUpDialog } from '@/components/crm/follow-up-dialog';
import { LeadConvertButton } from '@/components/crm/lead-convert-button';
import { LeadDialog } from '@/components/crm/lead-dialog';
import { LeadStageSelect } from '@/components/crm/lead-stage-select';
import { NoteForm } from '@/components/crm/note-form';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteContact } from '@/lib/crm/actions';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Contact, CrmActivity, FollowUp, Lead } from '@/lib/crm/types';
import type { Employee } from '@/lib/organization/types';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const leadId = Number(id);
  const token = await getToken();

  const [{ data: lead }, { data: contacts }, { data: followUps }, { data: activities }, employees] = await Promise.all([
    apiFetch<{ data: Lead }>(`/leads/${leadId}`, { token }),
    apiFetch<Paginated<Contact>>(`/leads/${leadId}/contacts`, { token }),
    apiFetch<Paginated<FollowUp>>(`/leads/${leadId}/follow-ups`, { token }),
    apiFetch<Paginated<CrmActivity>>(`/leads/${leadId}/activities`, { token }),
    listAll<Employee>('/employees', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader
        title={lead.name}
        description={lead.company ?? 'No company'}
        action={
          <div className="flex gap-1">
            {lead.stage !== 'converted' && lead.stage !== 'lost' && <LeadConvertButton leadId={lead.id} />}
            <LeadDialog lead={lead} employees={employees} />
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <LeadStageSelect leadId={lead.id} stage={lead.stage} />
        {lead.estimated_value && <Badge variant="outline">Value: {lead.estimated_value}</Badge>}
        {lead.source && <Badge variant="outline">Source: {lead.source}</Badge>}
        <span className="text-sm text-muted-foreground">Owner: {lead.owner?.full_name ?? 'Unassigned'}</span>
      </div>

      {lead.lost_reason && <p className="mb-6 text-sm text-destructive">Lost: {lead.lost_reason}</p>}
      {lead.notes && <p className="mb-6 whitespace-pre-wrap text-sm text-muted-foreground">{lead.notes}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ContactDialog parent="leads" parentId={lead.id} />
            <div className="flex flex-col gap-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-start justify-between gap-2 border-t pt-2">
                  <div>
                    <p className="text-sm font-medium">
                      {contact.name} {contact.is_primary && <Badge variant="secondary">Primary</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">{[contact.title, contact.email, contact.phone].filter(Boolean).join(' · ')}</p>
                  </div>
                  <DeleteRowButton
                    label={contact.name}
                    confirmMessage={`Delete contact "${contact.name}"?`}
                    action={deleteContact.bind(null, 'leads', lead.id, contact.id)}
                  />
                </div>
              ))}
              {contacts.length === 0 && <p className="text-sm text-muted-foreground">No contacts yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FollowUpDialog parent="leads" parentId={lead.id} employees={employees} />
            <div className="flex flex-col gap-2">
              {followUps.map((followUp) => (
                <div key={followUp.id} className="flex items-start justify-between gap-2 border-t pt-2">
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {followUp.type} — {followUp.due_at}{' '}
                      {followUp.is_overdue && followUp.status === 'pending' && <Badge variant="destructive">Overdue</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {followUp.assigned_employee?.full_name ?? 'Unassigned'} · {followUp.status}
                    </p>
                  </div>
                  <FollowUpActions followUp={followUp} />
                </div>
              ))}
              {followUps.length === 0 && <p className="text-sm text-muted-foreground">No follow-ups yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <NoteForm parent="leads" parentId={lead.id} />
            <div className="flex flex-col gap-2">
              {activities.map((activity) => (
                <div key={activity.id} className="flex justify-between gap-2 border-t pt-2 text-sm">
                  <span>
                    <span className="font-medium">{activity.causer_name ?? 'System'}</span> {activity.description}
                  </span>
                  <span className="text-muted-foreground">{activity.created_at}</span>
                </div>
              ))}
              {activities.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Link href="/admin/leads" className="text-sm text-muted-foreground hover:underline">
          ← Back to leads
        </Link>
      </div>
    </div>
  );
}
