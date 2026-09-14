'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { recordAttendance, type ActionState } from '@/lib/hr/actions';
import { ATTENDANCE_STATUSES } from '@/lib/hr/types';
import type { Employee } from '@/lib/organization/types';

const initial: ActionState = { error: null };
const LABELS: Record<string, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  half_day: 'Half day',
  on_leave: 'On leave',
  holiday: 'Holiday',
};

export function AttendanceRecordDialog({ employees }: { employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(employees[0] ? String(employees[0].id) : '');
  const [status, setStatus] = useState<(typeof ATTENDANCE_STATUSES)[number]>('present');
  const [state, formAction, pending] = useActionState(recordAttendance, initial);
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
          <Plus className="h-4 w-4" /> Record attendance
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record attendance</DialogTitle>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <input type="hidden" name="status" value={status} />
              <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="check_in_at">Check-in</Label>
              <Input id="check_in_at" name="check_in_at" type="datetime-local" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="check_out_at">Check-out</Label>
              <Input id="check_out_at" name="check_out_at" type="datetime-local" />
              {state.fieldErrors?.check_out_at && (
                <p className="text-sm text-destructive">{state.fieldErrors.check_out_at[0]}</p>
              )}
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
