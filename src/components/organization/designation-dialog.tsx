'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createDesignation, updateDesignation, type ActionState } from '@/lib/organization/actions';
import type { Department, Designation } from '@/lib/organization/types';

const initial: ActionState = { error: null };
const NONE = '__none__';

export function DesignationDialog({ designation, departments }: { designation?: Designation; departments: Department[] }) {
  const [open, setOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState(designation?.department_id ? String(designation.department_id) : NONE);
  const action = designation ? updateDesignation.bind(null, designation.id) : createDesignation;
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
        {designation ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${designation.title}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New designation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{designation ? 'Edit designation' : 'New designation'}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={designation?.title} required />
            {state.fieldErrors?.title && <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="department_id">Department</Label>
            <input type="hidden" name="department_id" value={departmentId === NONE ? '' : departmentId} />
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger id="department_id" className="w-full">
                <SelectValue placeholder="No department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No department</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={String(department.id)}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="rank">Rank</Label>
            <Input id="rank" name="rank" type="number" min={0} defaultValue={designation?.rank ?? ''} />
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
