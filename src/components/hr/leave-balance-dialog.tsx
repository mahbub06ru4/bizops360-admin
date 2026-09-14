'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { upsertLeaveBalance, type ActionState } from '@/lib/hr/actions';
import type { LeaveType } from '@/lib/hr/types';
import type { Employee } from '@/lib/organization/types';

const initial: ActionState = { error: null };

export function LeaveBalanceDialog({ employees, leaveTypes }: { employees: Employee[]; leaveTypes: LeaveType[] }) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(employees[0] ? String(employees[0].id) : '');
  const [leaveTypeId, setLeaveTypeId] = useState(leaveTypes[0] ? String(leaveTypes[0].id) : '');
  const [state, formAction, pending] = useActionState(upsertLeaveBalance, initial);
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
          <Plus className="h-4 w-4" /> Set balance
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set leave balance</DialogTitle>
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
            <Label>Leave type</Label>
            <input type="hidden" name="leave_type_id" value={leaveTypeId} />
            <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((leaveType) => (
                  <SelectItem key={leaveType.id} value={String(leaveType.id)}>
                    {leaveType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" defaultValue={new Date().getFullYear()} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="entitled_days">Entitled days</Label>
              <Input id="entitled_days" name="entitled_days" type="number" min={0} required />
            </div>
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
