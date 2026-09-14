import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { ContactDialog } from '@/components/crm/contact-dialog';
import { CustomerDialog } from '@/components/crm/customer-dialog';
import { FollowUpActions } from '@/components/crm/follow-up-actions';
import { FollowUpDialog } from '@/components/crm/follow-up-dialog';
import { NoteForm } from '@/components/crm/note-form';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteContact } from '@/lib/crm/actions';
import type { CustomerHistory } from '@/lib/crm/types';
import { listAll } from '@/lib/organization/actions';
import type { Employee } from '@/lib/organization/types';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = Number(id);
  const token = await getToken();

  const [{ data: history }, employees] = await Promise.all([
    apiFetch<{ data: CustomerHistory }>(`/customers/${customerId}/history`, { token }),
    listAll<Employee>('/employees', token ?? ''),
  ]);
  const { customer, source_lead: sourceLead, contacts, follow_ups: followUps, activities } = history;

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={customer.company ?? 'No company'}
        action={<CustomerDialog customer={customer} employees={employees} />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="capitalize">
          {customer.type}
        </Badge>
        {sourceLead && (
          <Link href={`/crm/leads/${sourceLead.id}`} className="text-sm text-muted-foreground hover:underline">
            Converted from lead: {sourceLead.name}
          </Link>
        )}
        <span className="text-sm text-muted-foreground">Owner: {customer.owner?.full_name ?? 'Unassigned'}</span>
      </div>

      {customer.address && <p className="mb-6 text-sm text-muted-foreground">{customer.address}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ContactDialog parent="customers" parentId={customer.id} />
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
                    action={deleteContact.bind(null, 'customers', customer.id, contact.id)}
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
            <FollowUpDialog parent="customers" parentId={customer.id} employees={employees} />
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
            <NoteForm parent="customers" parentId={customer.id} />
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
        <Link href="/crm/customers" className="text-sm text-muted-foreground hover:underline">
          ← Back to customers
        </Link>
      </div>
    </div>
  );
}
