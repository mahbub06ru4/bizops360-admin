'use client';

import { useState, useTransition } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateTeamMembers } from '@/lib/organization/actions';
import type { Employee, Team } from '@/lib/organization/types';

export function TeamMembersDialog({ team, employees }: { team: Team; employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set(team.members.map((m) => m.id)));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4" /> Members ({team.members_count ?? team.members.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{team.name} — members</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {employees.map((employee) => (
            <label key={employee.id} className="flex items-center gap-2 rounded-md p-2 hover:bg-muted">
              <Checkbox
                checked={selected.has(employee.id)}
                onCheckedChange={(checked) => {
                  setSelected((prev) => {
                    const next = new Set(prev);

                    if (checked) {
                      next.add(employee.id);
                    } else {
                      next.delete(employee.id);
                    }

                    return next;
                  });
                }}
              />
              <Label className="font-normal">{employee.full_name}</Label>
            </label>
          ))}
          {employees.length === 0 && <p className="text-sm text-muted-foreground">No employees to add yet.</p>}
        </div>

        <DialogFooter>
          <Button
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await updateTeamMembers(team.id, Array.from(selected));

                if (result.error) {
                  toast.error(result.error);
                } else {
                  setOpen(false);
                }
              });
            }}
          >
            {pending ? 'Saving…' : 'Save members'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
