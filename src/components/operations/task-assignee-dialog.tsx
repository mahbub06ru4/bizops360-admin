'use client';

import { useState, useTransition } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { assignTask } from '@/lib/operations/actions';
import type { Task } from '@/lib/operations/types';
import type { Employee, Team } from '@/lib/organization/types';

const NONE = '__none__';

export function TaskAssigneeDialog({ task, employees, teams }: { task: Task; employees: Employee[]; teams: Team[] }) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(task.assignee_employee_id ? String(task.assignee_employee_id) : NONE);
  const [teamId, setTeamId] = useState(task.assignee_team_id ? String(task.assignee_team_id) : NONE);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Assign ${task.title}`}>
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign task</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Employee</Label>
            <Select
              value={employeeId}
              onValueChange={(value) => {
                setEmployeeId(value);
                if (value !== NONE) setTeamId(NONE);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Unassigned</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Team</Label>
            <Select
              value={teamId}
              onValueChange={(value) => {
                setTeamId(value);
                if (value !== NONE) setEmployeeId(NONE);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No team</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={String(team.id)}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await assignTask(
                  task.id,
                  employeeId === NONE ? null : Number(employeeId),
                  teamId === NONE ? null : Number(teamId),
                );

                if (result.error) {
                  toast.error(result.error);
                } else {
                  setOpen(false);
                }
              });
            }}
          >
            {pending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
