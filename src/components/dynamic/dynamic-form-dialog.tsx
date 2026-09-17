'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RelationCombobox } from '@/components/dynamic/relation-combobox';
import { createResourceRecord, updateResourceRecord, type ActionState } from '@/lib/admin-schema/actions';
import { getPath, type RelationOption, type ResourceSchema } from '@/lib/admin-schema/types';

const initial: ActionState = { error: null };
const NONE = '__none__';

export function DynamicFormDialog({
  resource,
  record,
  relationOptions,
  listPath,
  createEndpoint,
  updateEndpoint,
}: {
  resource: Pick<ResourceSchema, 'label' | 'fields'>;
  record?: Record<string, unknown>;
  relationOptions: Record<string, RelationOption[]>;
  listPath: string;
  /** Overrides for a nested (relatedList) resource, whose create/update endpoints differ (parent-scoped list vs. flat row). Default to a top-level resource's own endpoint. */
  createEndpoint: string;
  updateEndpoint: string;
}) {
  const [open, setOpen] = useState(false);
  const action = record
    ? updateResourceRecord.bind(null, updateEndpoint, Number(record.id), resource.fields, listPath)
    : createResourceRecord.bind(null, createEndpoint, resource.fields, listPath);
  const [state, formAction, pending] = useActionState(action, initial);
  const [pickerValues, setPickerValues] = useState<Record<string, string>>(() => {
    const initialValues: Record<string, string> = {};

    for (const field of resource.fields) {
      if (field.type === 'select' || field.type === 'relation') {
        const value = record ? record[field.key] : undefined;
        initialValues[field.key] = value !== undefined && value !== null ? String(value) : NONE;
      }
    }

    return initialValues;
  });
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
        {record ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${resource.label}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> New {resource.label.toLowerCase()}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {record ? `Edit ${resource.label.toLowerCase()}` : `New ${resource.label.toLowerCase()}`}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {resource.fields
            .filter((field) => !(field.onlyOnCreate && record))
            .map((field) => {
            const fieldError = state.fieldErrors?.[field.key]?.[0];

            if (field.type === 'boolean') {
              return (
                <div key={field.key} className="flex items-center gap-2">
                  <Checkbox
                    id={field.key}
                    name={field.key}
                    defaultChecked={record ? Boolean(record[field.key]) : false}
                  />
                  <Label htmlFor={field.key}>{field.label}</Label>
                </div>
              );
            }

            if (field.type === 'relation') {
              const options = field.relation ? (relationOptions[field.relation.resource] ?? []) : [];
              const value = pickerValues[field.key] ?? NONE;

              return (
                <div key={field.key} className="flex flex-col gap-2">
                  <Label>{field.label}</Label>
                  <input type="hidden" name={field.key} value={value === NONE ? '' : value} />
                  <RelationCombobox
                    options={options}
                    value={value === NONE ? '' : value}
                    onChange={(next) => setPickerValues((prev) => ({ ...prev, [field.key]: next || NONE }))}
                    placeholder={`Choose ${field.label.toLowerCase()}`}
                    clearable={!field.required}
                  />
                  {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
                </div>
              );
            }

            if (field.type === 'select') {
              const options = field.options ?? [];
              const value = pickerValues[field.key] ?? NONE;

              return (
                <div key={field.key} className="flex flex-col gap-2">
                  <Label>{field.label}</Label>
                  <input type="hidden" name={field.key} value={value === NONE ? '' : value} />
                  <Select
                    value={value}
                    onValueChange={(next) => setPickerValues((prev) => ({ ...prev, [field.key]: next }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Choose ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {!field.required && <SelectItem value={NONE}>Not set</SelectItem>}
                      {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
                </div>
              );
            }

            if (field.type === 'file') {
              return (
                <div key={field.key} className="flex flex-col gap-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input id={field.key} name={field.key} type="file" required={field.required} />
                  {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
                </div>
              );
            }

            const defaultValue = record ? getPath(record, field.key) : undefined;

            return (
              <div key={field.key} className="flex flex-col gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === 'text' ? (
                  <Textarea
                    id={field.key}
                    name={field.key}
                    rows={3}
                    defaultValue={defaultValue ? String(defaultValue) : ''}
                    required={field.required}
                  />
                ) : (
                  <Input
                    id={field.key}
                    name={field.key}
                    type={
                      field.type === 'number'
                        ? 'number'
                        : field.type === 'date'
                          ? 'date'
                          : field.type === 'time'
                            ? 'time'
                            : field.type === 'password'
                              ? 'password'
                              : 'text'
                    }
                    defaultValue={field.type === 'password' ? '' : defaultValue ? String(defaultValue) : ''}
                    required={field.required}
                    autoComplete={field.type === 'password' ? 'new-password' : undefined}
                  />
                )}
                {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
              </div>
            );
          })}

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
