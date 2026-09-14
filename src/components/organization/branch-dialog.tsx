'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBranch, updateBranch, type ActionState } from '@/lib/organization/actions';
import type { Branch } from '@/lib/organization/types';

const initial: ActionState = { error: null };

export function BranchDialog({ branch }: { branch?: Branch }) {
  const [open, setOpen] = useState(false);
  const action = branch ? updateBranch.bind(null, branch.id) : createBranch;
  const [state, formAction, pending] = useActionState(action, initial);
  const wasPending = useRef(false);

  // Close once a submit that was pending finishes without an error --
  // distinguishes "just saved" from "dialog freshly opened" (both have
  // pending === false), which a plain `!pending` check can't tell apart.
  useEffect(() => {
    if (wasPending.current && !pending && state.error === null) {
      setOpen(false);
    }

    wasPending.current = pending;
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {branch ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${branch.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New branch
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{branch ? 'Edit branch' : 'New branch'}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={branch?.name} required />
            {state.fieldErrors?.name && <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" defaultValue={branch?.code} required />
            {state.fieldErrors?.code && <p className="text-sm text-destructive">{state.fieldErrors.code[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={branch?.address ?? ''} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={branch?.phone ?? ''} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={branch?.email ?? ''} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="is_head_office" name="is_head_office" defaultChecked={branch?.is_head_office} />
            <Label htmlFor="is_head_office">Head office</Label>
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
