'use client';

export interface ReportColumn {
  key: string;
  label: string;
}

export type ReportRow = Record<string, string | number | null>;

function cellText(value: string | number | null): string {
  return value === null || value === undefined ? '' : String(value);
}

export async function exportReportToPdf(
  title: string,
  columns: ReportColumn[],
  rows: ReportRow[],
  filename: string,
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait' });

  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [columns.map((column) => column.label)],
    body: rows.map((row) => columns.map((column) => cellText(row[column.key]))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [71, 85, 191] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
}

export async function exportReportToExcel(
  title: string,
  columns: ReportColumn[],
  rows: ReportRow[],
  filename: string,
): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BizOps 360';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title.slice(0, 31) || 'Report');
  sheet.columns = columns.map((column) => ({ header: column.label, key: column.key, width: 22 }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EAF6' } };

  for (const row of rows) {
    sheet.addRow(columns.reduce<Record<string, string>>((acc, column) => {
      acc[column.key] = cellText(row[column.key]);

      return acc;
    }, {}));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
