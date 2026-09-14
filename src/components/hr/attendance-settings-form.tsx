'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateAttendanceSettings, type ActionState } from '@/lib/hr/actions';
import type { AttendanceSetting } from '@/lib/hr/types';

const initial: ActionState = { error: null };

export function AttendanceSettingsForm({ settings }: { settings: AttendanceSetting }) {
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await updateAttendanceSettings(prev, formData);

    if (result.error === null) {
      toast.success('Attendance settings saved.');
    }

    return result;
  }, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work hours</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="work_starts_at">Starts at</Label>
              <Input id="work_starts_at" name="work_starts_at" type="time" defaultValue={settings.work_starts_at} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="work_ends_at">Ends at</Label>
              <Input id="work_ends_at" name="work_ends_at" type="time" defaultValue={settings.work_ends_at} required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="grace_minutes">Grace period (minutes)</Label>
            <Input
              id="grace_minutes"
              name="grace_minutes"
              type="number"
              min={0}
              max={240}
              defaultValue={settings.grace_minutes}
              required
            />
          </div>

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
