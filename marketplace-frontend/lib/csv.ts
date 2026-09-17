/**
 * Shared CSV export — originally written for the admin list pages, moved
 * here so vendor-facing pages (like billing history) can use the same
 * escaping-safe, empty-list-safe implementation instead of a second copy.
 */

/** Wraps a value so commas, quotes and newlines survive a round trip. */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

/**
 * Builds a CSV from `rows` and triggers a download.
 *
 * Returns `false` without downloading when there is nothing to export, so the
 * caller can show a message instead of handing the user an empty file.
 */
export function exportToCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): boolean {
  if (!rows || rows.length === 0) return false;

  const lines = [
    columns.map((c) => escapeCell(c.header)).join(','),
    ...rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(',')),
  ];

  // The BOM makes Excel read the file as UTF-8 rather than the local codepage.
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
