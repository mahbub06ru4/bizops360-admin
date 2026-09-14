'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLeaveType, updateLeaveType, type ActionState } from '@/lib/hr/actions';
import type { LeaveType } from '@/lib/hr/types';

const initial: ActionState = { error: null };

export function LeaveTypeDialog({ leaveType }: { leaveType?: LeaveType }) {
  const [open, setOpen] = useState(false);
  const action = leaveType ? updateLeaveType.bind(null, leaveType.id) : createLeaveType;
  const [state, formAction, pending] = useActionState(action, initial);
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
        {leaveType ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${leaveType.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New leave type
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{leaveType ? 'Edit leave type' : 'New leave type'}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={leaveType?.name} required />
            {state.fieldErrors?.name && <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" defaultValue={leaveType?.code} required />
            {state.fieldErrors?.code && <p className="text-sm text-destructive">{state.fieldErrors.code[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="default_days_per_year">Default days per year</Label>
            <Input
              id="default_days_per_year"
              name="default_days_per_year"
              type="number"
              min={0}
              defaultValue={leaveType?.default_days_per_year ?? ''}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="is_paid" name="is_paid" defaultChecked={leaveType?.is_paid ?? true} />
            <Label htmlFor="is_paid">Paid</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="requires_approval" name="requires_approval" defaultChecked={leaveType?.requires_approval ?? true} />
            <Label htmlFor="requires_approval">Requires approval</Label>
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
