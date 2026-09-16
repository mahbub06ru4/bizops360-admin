'use client';

import { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { exportReportToExcel, exportReportToPdf, type ReportColumn, type ReportRow } from '@/lib/reports/export';

export function ReportTable({
  title,
  filename,
  columns,
  rows,
}: {
  title: string;
  filename: string;
  columns: ReportColumn[];
  rows: ReportRow[];
}) {
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{rows.length} rows</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={exporting !== null || rows.length === 0}
            onClick={async () => {
              setExporting('pdf');

              try {
                await exportReportToPdf(title, columns, rows, filename);
              } catch {
                toast.error('Could not generate the PDF.');
              } finally {
                setExporting(null);
              }
            }}
          >
            <FileText className="h-4 w-4" /> {exporting === 'pdf' ? 'Generating…' : 'Download PDF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={exporting !== null || rows.length === 0}
            onClick={async () => {
              setExporting('excel');

              try {
                await exportReportToExcel(title, columns, rows, filename);
              } catch {
                toast.error('Could not generate the spreadsheet.');
              } finally {
                setExporting(null);
              }
            }}
          >
            <FileSpreadsheet className="h-4 w-4" /> {exporting === 'excel' ? 'Generating…' : 'Download Excel'}
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key}>{row[column.key] ?? '—'}</TableCell>
              ))}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                No data yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
