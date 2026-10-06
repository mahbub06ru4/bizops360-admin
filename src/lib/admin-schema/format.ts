const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

const DATETIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Formats a cell value for display across every generic table/card: tables
 * in /admin/[resource], relatedLists, embeddedLists, and the Reports
 * exports. An ISO 8601 datetime string (date + time, e.g. check-in/out
 * timestamps, task due dates) renders as "17 Sep 2026, 15:15" instead of
 * the raw "2026-09-17T15:15:02+00:00" the API returns — a plain date
 * ("2026-09-17", no time component) is left as-is, already readable.
 */
export function formatCellValue(value: unknown, options?: { link?: boolean }): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (options?.link) {
    return 'Download';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'string' && ISO_DATETIME.test(value)) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return DATETIME_FORMAT.format(date);
    }
  }

  return String(value);
}
