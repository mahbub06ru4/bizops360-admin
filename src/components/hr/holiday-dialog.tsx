'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createHoliday, updateHoliday, type ActionState } from '@/lib/hr/actions';
import type { Holiday } from '@/lib/hr/types';

const initial: ActionState = { error: null };

export function HolidayDialog({ holiday }: { holiday?: Holiday }) {
  const [open, setOpen] = useState(false);
  const action = holiday ? updateHoliday.bind(null, holiday.id) : createHoliday;
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
        {holiday ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${holiday.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New holiday
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{holiday ? 'Edit holiday' : 'New holiday'}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={holiday?.name} required />
            {state.fieldErrors?.name && <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" defaultValue={holiday?.date} required />
            {state.fieldErrors?.date && <p className="text-sm text-destructive">{state.fieldErrors.date[0]}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="is_recurring" name="is_recurring" defaultChecked={holiday?.is_recurring} />
            <Label htmlFor="is_recurring">Recurs every year</Label>
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
