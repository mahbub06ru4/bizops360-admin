'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateSingletonRecord, type ActionState } from '@/lib/admin-schema/actions';
import { getPath, type ResourceSchema } from '@/lib/admin-schema/types';

const initial: ActionState = { error: null };

export function DynamicSingletonForm({ resource, record }: { resource: ResourceSchema; record: Record<string, unknown> }) {
  const action = updateSingletonRecord.bind(null, resource.endpoint, resource.fields, `/admin/${resource.key}`);
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);

    if (result.error === null) {
      toast.success('Saved.');
    }

    return result;
  }, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{resource.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {resource.fields.map((field) => {
            const fieldError = state.fieldErrors?.[field.key]?.[0];
            const defaultValue = getPath(record, field.key);

            if (field.type === 'boolean') {
              return (
                <div key={field.key} className="flex items-center gap-2">
                  <Checkbox id={field.key} name={field.key} defaultChecked={Boolean(defaultValue)} />
                  <Label htmlFor={field.key}>{field.label}</Label>
                </div>
              );
            }

            return (
              <div key={field.key} className="flex flex-col gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  name={field.key}
                  type={field.type === 'number' ? 'number' : field.type === 'time' ? 'time' : field.type === 'date' ? 'date' : 'text'}
                  step={field.type === 'number' ? 'any' : undefined}
                  defaultValue={defaultValue !== null && defaultValue !== undefined ? String(defaultValue) : ''}
                  required={field.required}
                />
                {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
              </div>
            );
          })}

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <div>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
