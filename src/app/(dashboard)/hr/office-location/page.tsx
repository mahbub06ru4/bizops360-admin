import { PageHeader } from '@/components/organization/page-header';
import { OfficeLocationForm } from '@/components/hr/office-location-form';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { OfficeLocation } from '@/lib/hr/types';

export default async function OfficeLocationPage() {
  const token = await getToken();
  const { data: location } = await apiFetch<{ data: OfficeLocation }>('/office-location', { token });

  return (
    <div>
      <PageHeader title="Office location" description="The geofence staff must be inside to check in." />
      <OfficeLocationForm location={location} />
    </div>
  );
}
