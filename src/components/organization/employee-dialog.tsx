'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createEmployee, type ActionState } from '@/lib/organization/actions';
import type { Branch, Department, Designation } from '@/lib/organization/types';

const initial: ActionState = { error: null };
const NONE = '__none__';

function NullableSelect({
  name,
  value,
  onChange,
  placeholder,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { id: number; label: string }[];
}) {
  return (
    <>
      <input type="hidden" name={name} value={value === NONE ? '' : value} />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export function EmployeeDialog({
  branches,
  departments,
  designations,
}: {
  branches: Branch[];
  departments: Department[];
  designations: Designation[];
}) {
  const [open, setOpen] = useState(false);
  const [branchId, setBranchId] = useState(NONE);
  const [departmentId, setDepartmentId] = useState(NONE);
  const [designationId, setDesignationId] = useState(NONE);
  const [employmentStatus, setEmploymentStatus] = useState('active');
  const [state, formAction, pending] = useActionState(createEmployee, initial);
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
          <Plus className="h-4 w-4" /> New employee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New employee</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" name="first_name" required />
              {state.fieldErrors?.first_name && <p className="text-sm text-destructive">{state.fieldErrors.first_name[0]}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" name="last_name" required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="employee_code">Employee code</Label>
            <Input id="employee_code" name="employee_code" required />
            {state.fieldErrors?.employee_code && (
              <p className="text-sm text-destructive">{state.fieldErrors.employee_code[0]}</p>
            )}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="hire_date">Hire date</Label>
              <Input id="hire_date" name="hire_date" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="employment_status">Status</Label>
              <input type="hidden" name="employment_status" value={employmentStatus} />
              <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                <SelectTrigger id="employment_status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="probation">Probation</SelectItem>
                  <SelectItem value="on_leave">On leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Branch</Label>
            <NullableSelect
              name="branch_id"
              value={branchId}
              onChange={setBranchId}
              placeholder="No branch"
              options={branches.map((b) => ({ id: b.id, label: b.name }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Department</Label>
            <NullableSelect
              name="department_id"
              value={departmentId}
              onChange={setDepartmentId}
              placeholder="No department"
              options={departments.map((d) => ({ id: d.id, label: d.name }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Designation</Label>
            <NullableSelect
              name="designation_id"
              value={designationId}
              onChange={setDesignationId}
              placeholder="No designation"
              options={designations.map((d) => ({ id: d.id, label: d.title }))}
            />
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
