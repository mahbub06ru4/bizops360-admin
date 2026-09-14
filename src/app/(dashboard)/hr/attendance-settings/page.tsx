import { PageHeader } from '@/components/organization/page-header';
import { AttendanceSettingsForm } from '@/components/hr/attendance-settings-form';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import type { AttendanceSetting } from '@/lib/hr/types';

export default async function AttendanceSettingsPage() {
  const token = await getToken();
  const { data: settings } = await apiFetch<{ data: AttendanceSetting }>('/attendance-settings', { token });

  return (
    <div>
      <PageHeader title="Attendance settings" description="Standard work hours and late-arrival grace period." />
      <AttendanceSettingsForm settings={settings} />
    </div>
  );
}
