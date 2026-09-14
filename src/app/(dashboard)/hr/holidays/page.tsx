import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { HolidayDialog } from '@/components/hr/holiday-dialog';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteHoliday } from '@/lib/hr/actions';
import type { Paginated } from '@/lib/api/types';
import type { Holiday } from '@/lib/hr/types';

export default async function HolidaysPage() {
  const token = await getToken();
  const { data: holidays } = await apiFetch<Paginated<Holiday>>('/holidays?per_page=100', { token });

  return (
    <div>
      <PageHeader title="Holidays" description="Tenant-wide holidays that count against leave and attendance." action={<HolidayDialog />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Recurring</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holidays.map((holiday) => (
            <TableRow key={holiday.id}>
              <TableCell className="font-medium">{holiday.name}</TableCell>
              <TableCell className="text-muted-foreground">{holiday.date}</TableCell>
              <TableCell>{holiday.is_recurring && <Badge variant="secondary">Yearly</Badge>}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <HolidayDialog holiday={holiday} />
                <DeleteRowButton
                  label={holiday.name}
                  confirmMessage={`Delete "${holiday.name}"?`}
                  action={deleteHoliday.bind(null, holiday.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {holidays.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No holidays yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
