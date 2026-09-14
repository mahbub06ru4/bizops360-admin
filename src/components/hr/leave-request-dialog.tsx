'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createLeaveRequest, type ActionState } from '@/lib/hr/actions';
import type { LeaveType } from '@/lib/hr/types';
import type { Employee } from '@/lib/organization/types';

const initial: ActionState = { error: null };
const SELF = '__self__';

export function LeaveRequestDialog({ leaveTypes, employees }: { leaveTypes: LeaveType[]; employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(SELF);
  const [leaveTypeId, setLeaveTypeId] = useState(leaveTypes[0] ? String(leaveTypes[0].id) : '');
  const [state, formAction, pending] = useActionState(createLeaveRequest, initial);
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
          <Plus className="h-4 w-4" /> Request leave
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request leave</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {employees.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>For</Label>
              <input type="hidden" name="employee_id" value={employeeId === SELF ? '' : employeeId} />
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELF}>Myself</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {employee.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
            {state.fieldErrors?.leave_type_id && (
              <p className="text-sm text-destructive">{state.fieldErrors.leave_type_id[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" name="start_date" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" name="end_date" type="date" required />
              {state.fieldErrors?.end_date && <p className="text-sm text-destructive">{state.fieldErrors.end_date[0]}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" name="reason" rows={3} />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Submitting…' : 'Submit request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
