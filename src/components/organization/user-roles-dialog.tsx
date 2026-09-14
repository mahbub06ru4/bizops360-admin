'use client';

import { useState, useTransition } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateUserRoles } from '@/lib/organization/actions';
import type { OrgUser } from '@/lib/organization/types';

const ROLES = ['owner', 'admin', 'manager', 'staff'];

export function UserRolesDialog({ user }: { user: OrgUser }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(user.roles));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Edit roles for ${user.name}`}>
          <Shield className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.name} — roles</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {ROLES.map((role) => (
            <label key={role} className="flex items-center gap-2">
              <Checkbox
                checked={selected.has(role)}
                onCheckedChange={(checked) => {
                  setSelected((prev) => {
                    const next = new Set(prev);

                    if (checked) {
                      next.add(role);
                    } else {
                      next.delete(role);
                    }

                    return next;
                  });
                }}
              />
              <Label className="font-normal capitalize">{role}</Label>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await updateUserRoles(user.id, Array.from(selected));

                if (result.error) {
                  toast.error(result.error);
                } else {
                  setOpen(false);
                }
              });
            }}
          >
            {pending ? 'Saving…' : 'Save roles'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
