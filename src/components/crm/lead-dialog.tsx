'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createLead, updateLead, type ActionState } from '@/lib/crm/actions';
import type { Lead } from '@/lib/crm/types';
import type { Employee } from '@/lib/organization/types';

const initial: ActionState = { error: null };
const NONE = '__none__';

export function LeadDialog({ lead, employees }: { lead?: Lead; employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const action = lead ? updateLead.bind(null, lead.id) : createLead;
  const [state, formAction, pending] = useActionState(action, initial);
  const [ownerId, setOwnerId] = useState(lead?.owner_employee_id ? String(lead.owner_employee_id) : NONE);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.error === null) {
      setOpen(false);
    }

    wasPending.current = pending;
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {lead ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${lead.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New lead
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit lead' : 'New lead'}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={lead?.name} required />
            {state.fieldErrors?.name && <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={lead?.company ?? ''} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="source">Source</Label>
              <Input id="source" name="source" defaultValue={lead?.source ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={lead?.email ?? ''} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={lead?.phone ?? ''} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="estimated_value">Estimated value</Label>
            <Input
              id="estimated_value"
              name="estimated_value"
              type="number"
              min={0}
              step="0.01"
              defaultValue={lead?.estimated_value ?? ''}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Owner</Label>
            <input type="hidden" name="owner_employee_id" value={ownerId === NONE ? '' : ownerId} />
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Unassigned</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={lead?.notes ?? ''} />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
