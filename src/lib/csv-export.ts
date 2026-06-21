// Utilitário simples de exportação CSV no client.
// Sem dependências externas — gera o arquivo e dispara o download.

type Primitive = string | number | boolean | null | undefined;

function escapeCell(value: Primitive | unknown): string {
  if (value === null || value === undefined) return "";
  let str: string;
  if (value instanceof Date) {
    str = value.toISOString();
  } else if (typeof value === "object") {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }
  if (/[",;\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => Primitive | unknown;
};

export function exportToCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]) {
  const headerLine = columns.map((c) => escapeCell(c.header)).join(";");
  const bodyLines = rows.map((row) =>
    columns.map((c) => escapeCell(c.accessor(row))).join(";"),
  );
  const csv = "\ufeff" + [headerLine, ...bodyLines].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
