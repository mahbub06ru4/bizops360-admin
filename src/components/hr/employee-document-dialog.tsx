'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadEmployeeDocument, type ActionState } from '@/lib/hr/actions';
import { EMPLOYEE_DOCUMENT_CATEGORIES } from '@/lib/hr/types';
import type { Employee } from '@/lib/organization/types';

const initial: ActionState = { error: null };
const LABELS: Record<string, string> = {
  nid: 'National ID',
  passport: 'Passport',
  contract: 'Contract',
  offer_letter: 'Offer letter',
  certificate: 'Certificate',
  other: 'Other',
};

export function EmployeeDocumentDialog({ employees }: { employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(employees[0] ? String(employees[0].id) : '');
  const [category, setCategory] = useState<(typeof EMPLOYEE_DOCUMENT_CATEGORIES)[number]>('other');
  const [state, formAction, pending] = useActionState(uploadEmployeeDocument, initial);
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
        <Button>
          <Plus className="h-4 w-4" /> Upload document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Employee</Label>
            <input type="hidden" name="employee_id" value={employeeId} />
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.employee_id && (
              <p className="text-sm text-destructive">{state.fieldErrors.employee_id[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <input type="hidden" name="category" value={category} />
            <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_DOCUMENT_CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
            {state.fieldErrors?.title && <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expires_at">Expires on</Label>
            <Input id="expires_at" name="expires_at" type="date" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required />
            {state.fieldErrors?.file && <p className="text-sm text-destructive">{state.fieldErrors.file[0]}</p>}
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Uploading…' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
