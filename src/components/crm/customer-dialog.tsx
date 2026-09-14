'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCustomer, updateCustomer, type ActionState } from '@/lib/crm/actions';
import { CRM_PARTY_TYPES, type Customer } from '@/lib/crm/types';
import type { Employee } from '@/lib/organization/types';

const initial: ActionState = { error: null };
const NONE = '__none__';

export function CustomerDialog({ customer, employees }: { customer?: Customer; employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const action = customer ? updateCustomer.bind(null, customer.id) : createCustomer;
  const [state, formAction, pending] = useActionState(action, initial);
  const [ownerId, setOwnerId] = useState(customer?.owner_employee_id ? String(customer.owner_employee_id) : NONE);
  const [type, setType] = useState(customer?.type ?? 'individual');
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
        {customer ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${customer.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit customer' : 'New customer'}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={customer?.name} required />
            {state.fieldErrors?.name && <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <input type="hidden" name="type" value={type} />
            <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRM_PARTY_TYPES.map((value) => (
                  <SelectItem key={value} value={value} className="capitalize">
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" defaultValue={customer?.company ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={customer?.email ?? ''} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={customer?.phone ?? ''} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={customer?.address ?? ''} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Owner</Label>
            <input type="hidden" name="owner_employee_id" value={ownerId === NONE ? '' : ownerId} />
            <Select value={ownerId} onValueChange={setOwnerId}>
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
