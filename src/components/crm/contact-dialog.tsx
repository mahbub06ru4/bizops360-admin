'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addContact, type ActionState } from '@/lib/crm/actions';

const initial: ActionState = { error: null };

export function ContactDialog({ parent, parentId }: { parent: 'leads' | 'customers'; parentId: number }) {
  const [open, setOpen] = useState(false);
  const action = addContact.bind(null, parent, parentId);
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
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" /> Add contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add contact</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
            {state.fieldErrors?.name && <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="is_primary" name="is_primary" />
            <Label htmlFor="is_primary">Primary contact</Label>
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
