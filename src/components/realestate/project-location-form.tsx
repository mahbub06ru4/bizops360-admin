'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { setProjectLocation, type ActionState } from '@/lib/realestate/actions';
import type { ProjectLocation } from '@/lib/realestate/types';

const initial: ActionState = { error: null };

export function ProjectLocationForm({ projectId, location }: { projectId: number; location?: ProjectLocation }) {
  const action = setProjectLocation.bind(null, projectId);
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);

    if (result.error === null) {
      toast.success('Location saved.');
    }

    return result;
  }, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="division">Division</Label>
          <Input id="division" name="division" defaultValue={location?.division ?? ''} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="district">District</Label>
          <Input id="district" name="district" defaultValue={location?.district ?? ''} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="area">Area</Label>
          <Input id="area" name="area" defaultValue={location?.area ?? ''} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sector">Sector</Label>
          <Input id="sector" name="sector" defaultValue={location?.sector ?? ''} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="road">Road</Label>
          <Input id="road" name="road" defaultValue={location?.road ?? ''} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="landmark">Landmark</Label>
          <Input id="landmark" name="landmark" defaultValue={location?.landmark ?? ''} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" type="number" step="any" defaultValue={location?.latitude ?? ''} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" type="number" step="any" defaultValue={location?.longitude ?? ''} />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Saving…' : 'Save location'}
        </Button>
      </div>
    </form>
  );
}
