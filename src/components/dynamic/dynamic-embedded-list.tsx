import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPath, type EmbeddedListSchema } from '@/lib/admin-schema/types';

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

/** A read-only table for data already embedded in the detail record's own GET response — Invoice's payments/refunds, e.g. — no fetch, no create/edit/delete. */
export function DynamicEmbeddedList({ list, record }: { list: EmbeddedListSchema; record: Record<string, unknown> }) {
  const value = getPath(record, list.path);
  const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{list.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {list.columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={String(row.id ?? index)}>
                {list.columns.map((column) => (
                  <TableCell key={column.key}>{formatCell(getPath(row, column.key))}</TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={list.columns.length} className="text-center text-muted-foreground">
                  Nothing yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
