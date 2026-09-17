'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RelationCombobox } from '@/components/dynamic/relation-combobox';
import { toast } from 'sonner';
import { fetchResourceDetail, invokeResourceAction, type ActionState } from '@/lib/admin-schema/actions';
import { getPath, type ActionSchema, type RelationOption } from '@/lib/admin-schema/types';

const initial: ActionState = { error: null };
const NONE = '__none__';

function prefillValue(record: Record<string, unknown> | undefined, path: string | undefined): unknown {
  if (!record || !path) {
    return undefined;
  }

  return getPath(record, path);
}

/** Normalizes a prefilled value into an array of ids/strings for a multi-value field. */
function toMultiValues(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => {
    if (entry && typeof entry === 'object' && 'id' in entry) {
      return String((entry as { id: unknown }).id);
    }

    return String(entry);
  });
}

/**
 * Owns the field state itself, so mounting it fresh (via a `key` on the
 * caller) is what re-seeds prefilled values from a newly-fetched `record` —
 * `DynamicActionButton` itself mounts once per row, well before an
 * `fetchDetail` action's dialog ever opens, so hooks declared there would
 * only ever see the list row, never the fetched detail.
 */
function ActionFields({
  action,
  record,
  relationOptions,
  state,
}: {
  action: ActionSchema;
  record: Record<string, unknown>;
  relationOptions: Record<string, RelationOption[]>;
  state: ActionState;
}) {
  const [pickerValues, setPickerValues] = useState<Record<string, string>>(() => {
    const initialValues: Record<string, string> = {};

    for (const field of action.fields) {
      if (field.type === 'select' || field.type === 'relation') {
        const value = prefillValue(record, field.prefillFrom);
        initialValues[field.key] = value !== undefined && value !== null ? String(value) : NONE;
      }
    }

    return initialValues;
  });
  const [multiValues, setMultiValues] = useState<Record<string, string[]>>(() => {
    const initialValues: Record<string, string[]> = {};

    for (const field of action.fields) {
      if (field.type === 'multiselect' || field.type === 'relation-multi') {
        initialValues[field.key] = toMultiValues(prefillValue(record, field.prefillFrom));
      }
    }

    return initialValues;
  });
  const [multiSearch, setMultiSearch] = useState<Record<string, string>>({});

  return (
    <>
      {action.fields.map((field) => {
        const fieldError = state.fieldErrors?.[field.key]?.[0];

        if (field.type === 'boolean') {
          return (
            <div key={field.key} className="flex items-center gap-2">
              <Checkbox id={field.key} name={field.key} defaultChecked={Boolean(prefillValue(record, field.prefillFrom))} />
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
              <Select value={value} onValueChange={(next) => setPickerValues((prev) => ({ ...prev, [field.key]: next }))}>
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

        if (field.type === 'multiselect' || field.type === 'relation-multi') {
          const allOptions =
            field.type === 'relation-multi' && field.relation
              ? (relationOptions[field.relation.resource] ?? []).map((option) => ({
                  value: String(option.id),
                  label: option.label,
                  search: option.search,
                }))
              : (field.options ?? []).map((option) => ({ ...option, search: option.label.toLowerCase() }));
          const selected = multiValues[field.key] ?? [];
          const query = (multiSearch[field.key] ?? '').trim().toLowerCase();
          const options = query.length === 0 ? allOptions : allOptions.filter((option) => option.search.includes(query));

          return (
            <div key={field.key} className="flex flex-col gap-2">
              <Label>{field.label}</Label>
              {allOptions.length > 6 && (
                <Input
                  placeholder="Search by name, mobile, or staff id…"
                  value={multiSearch[field.key] ?? ''}
                  onChange={(event) => setMultiSearch((prev) => ({ ...prev, [field.key]: event.target.value }))}
                />
              )}
              <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border p-3">
                {options.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`${field.key}-${option.value}`}
                      checked={selected.includes(option.value)}
                      onCheckedChange={(checked) =>
                        setMultiValues((prev) => ({
                          ...prev,
                          [field.key]: checked
                            ? [...(prev[field.key] ?? []), option.value]
                            : (prev[field.key] ?? []).filter((value) => value !== option.value),
                        }))
                      }
                    />
                    <Label htmlFor={`${field.key}-${option.value}`} className="font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
                {options.length === 0 && (
                  <p className="text-sm text-muted-foreground">{query ? 'No matches.' : 'No options.'}</p>
                )}
              </div>
              {selected.map((value) => (
                <input key={value} type="hidden" name={field.key} value={value} />
              ))}
              {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
            </div>
          );
        }

        const defaultValue = prefillValue(record, field.prefillFrom);

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
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
                defaultValue={defaultValue ? String(defaultValue) : ''}
                required={field.required}
              />
            )}
            {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
          </div>
        );
      })}
    </>
  );
}

export function DynamicActionButton({
  action,
  resourceEndpoint,
  row,
  relationOptions,
  listPath,
}: {
  action: ActionSchema;
  resourceEndpoint: string;
  /** Empty object for a `scope: 'resource'` action — there's no row to prefill from. */
  row: Record<string, unknown>;
  relationOptions: Record<string, RelationOption[]>;
  listPath: string;
}) {
  const id = action.scope === 'resource' ? null : Number(row.id);
  const boundAction = invokeResourceAction.bind(null, action.method, action.endpoint, id, action.fields, listPath);
  const [state, formAction, pending] = useActionState(boundAction, initial);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | undefined>(undefined);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmPending, startConfirmTransition] = useTransition();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.error === null) {
      setOpen(false);
    }

    wasPending.current = pending;
  }, [pending, state]);

  const record = detail ?? row;
  const style = action.style ?? 'default';
  const buttonVariant = style === 'destructive' ? 'destructive' : style === 'secondary' ? 'secondary' : 'outline';

  if (action.fields.length === 0) {
    return (
      <Button
        type="button"
        variant={buttonVariant}
        size="sm"
        disabled={confirmPending}
        onClick={() => {
          if (action.confirm && !window.confirm(action.confirm)) {
            return;
          }

          startConfirmTransition(async () => {
            const result = await invokeResourceAction(action.method, action.endpoint, id, [], listPath, initial, new FormData());

            if (result.error) {
              toast.error(result.error);
            }
          });
        }}
      >
        {confirmPending ? `${action.label}…` : action.label}
      </Button>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (next && action.fetchDetail && !detail && id !== null) {
          setLoadingDetail(true);
          fetchResourceDetail(resourceEndpoint, id)
            .then((fetched) => {
              if (fetched) {
                setDetail(fetched);
              }
            })
            .finally(() => setLoadingDetail(false));
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant={buttonVariant} size="sm">
          {action.label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{action.label}</DialogTitle>
        </DialogHeader>
        {loadingDetail ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <ActionFields action={action} record={record} relationOptions={relationOptions} state={state} />

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : action.label}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
