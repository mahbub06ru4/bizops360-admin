'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { scheduleFollowUp, type ActionState } from '@/lib/crm/actions';
import { FOLLOW_UP_TYPES } from '@/lib/crm/types';
import type { Employee } from '@/lib/organization/types';

const initial: ActionState = { error: null };
const NONE = '__none__';
const LABELS: Record<string, string> = { call: 'Call', email: 'Email', meeting: 'Meeting', task: 'Task' };

export function FollowUpDialog({
  parent,
  parentId,
  employees,
}: {
  parent: 'leads' | 'customers';
  parentId: number;
  employees: Employee[];
}) {
  const [open, setOpen] = useState(false);
  const action = scheduleFollowUp.bind(null, parent, parentId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [type, setType] = useState<(typeof FOLLOW_UP_TYPES)[number]>('call');
  const [assignedId, setAssignedId] = useState(NONE);
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
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" /> Schedule follow-up
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule follow-up</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <input type="hidden" name="type" value={type} />
              <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOW_UP_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="due_at">Due</Label>
              <Input id="due_at" name="due_at" type="datetime-local" required />
              {state.fieldErrors?.due_at && <p className="text-sm text-destructive">{state.fieldErrors.due_at[0]}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Assigned to</Label>
            <input type="hidden" name="assigned_employee_id" value={assignedId === NONE ? '' : assignedId} />
            <Select value={assignedId} onValueChange={setAssignedId}>
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
            <Textarea id="notes" name="notes" rows={2} />
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
