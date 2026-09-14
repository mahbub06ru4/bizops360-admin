'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateOfficeLocation, type ActionState } from '@/lib/hr/actions';
import type { OfficeLocation } from '@/lib/hr/types';

const initial: ActionState = { error: null };

export function OfficeLocationForm({ location }: { location: OfficeLocation }) {
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await updateOfficeLocation(prev, formData);

    if (result.error === null) {
      toast.success('Office location saved.');
    }

    return result;
  }, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Office location geofence</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" name="label" defaultValue={location.label} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                defaultValue={location.latitude ?? ''}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                defaultValue={location.longitude ?? ''}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="radius_meters">Radius (meters)</Label>
            <Input
              id="radius_meters"
              name="radius_meters"
              type="number"
              min={10}
              max={100000}
              defaultValue={location.radius_meters}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start_time">Start time</Label>
              <Input id="start_time" name="start_time" type="time" defaultValue={location.start_time} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end_time">End time</Label>
              <Input id="end_time" name="end_time" type="time" defaultValue={location.end_time} required />
            </div>
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
