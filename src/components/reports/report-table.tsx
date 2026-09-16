'use client';

import { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { exportReportToExcel, exportReportToPdf, type ReportColumn, type ReportRow } from '@/lib/reports/export';

const PAGE_SIZE = 15;

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
  const [page, setPage] = useState(1);

  const lastPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const from = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = rows.slice(from, from + PAGE_SIZE);

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
          {visibleRows.map((row, index) => (
            <TableRow key={from + index}>
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

      {lastPage > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {from + 1}–{Math.min(from + PAGE_SIZE, rows.length)} of {rows.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              Previous
            </Button>
            <span className="flex items-center px-2 text-sm text-muted-foreground">
              Page {currentPage} of {lastPage}
            </span>
            <Button variant="outline" size="sm" disabled={currentPage >= lastPage} onClick={() => setPage(currentPage + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
