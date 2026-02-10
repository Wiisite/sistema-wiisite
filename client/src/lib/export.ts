/**
 * Data export utilities for CSV and Excel formats
 */

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  formatter?: (value: unknown, row: T) => string;
}

/**
 * Escapes a value for CSV format
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If the value contains comma, newline, or quote, wrap in quotes
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Converts data to CSV format
 */
export function toCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[]
): string {
  if (data.length === 0) {
    return columns.map((col) => col.header).join(",");
  }

  // Header row
  const header = columns.map((col) => escapeCSVValue(col.header)).join(",");

  // Data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const key = col.key as keyof T;
        const value = key.toString().includes(".")
          ? getNestedValue(row, key.toString())
          : row[key];

        if (col.formatter) {
          return escapeCSVValue(col.formatter(value, row));
        }

        return escapeCSVValue(value);
      })
      .join(",");
  });

  return [header, ...rows].join("\n");
}

/**
 * Gets a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((current: unknown, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Downloads a file with the given content
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(["\ufeff" + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports data to CSV and downloads it
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const csv = toCSV(data, columns);
  const filenameWithExt = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  downloadFile(csv, filenameWithExt, "text/csv");
}

/**
 * Converts data to a simple HTML table for Excel export
 */
export function toExcelHTML<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  title?: string
): string {
  const headerRow = columns.map((col) => `<th>${col.header}</th>`).join("");

  const dataRows = data
    .map((row) => {
      const cells = columns
        .map((col) => {
          const key = col.key as keyof T;
          const value = key.toString().includes(".")
            ? getNestedValue(row, key.toString())
            : row[key];

          const formattedValue = col.formatter ? col.formatter(value, row) : String(value ?? "");

          return `<td>${formattedValue}</td>`;
        })
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${title || "Dados"}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
      </style>
    </head>
    <body>
      ${title ? `<h1>${title}</h1>` : ""}
      <table>
        <thead><tr>${headerRow}</tr></thead>
        <tbody>${dataRows}</tbody>
      </table>
    </body>
    </html>
  `;
}

/**
 * Exports data to Excel (XLS) format and downloads it
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  title?: string
): void {
  const html = toExcelHTML(data, columns, title);
  const filenameWithExt = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  downloadFile(html, filenameWithExt, "application/vnd.ms-excel");
}

/**
 * Preset column configurations for common entities
 */
export const exportPresets = {
  customers: [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Telefone" },
    { key: "document", header: "CPF/CNPJ" },
    { key: "city", header: "Cidade" },
    { key: "state", header: "Estado" },
  ],

  orders: [
    { key: "orderNumber", header: "Número do Pedido" },
    { key: "customer.name", header: "Cliente" },
    { key: "totalAmount", header: "Valor Total", formatter: (v: unknown) => formatCurrencyForExport(v) },
    { key: "status", header: "Status", formatter: (v: unknown) => translateStatus(v as string) },
    { key: "orderDate", header: "Data", formatter: (v: unknown) => formatDateForExport(v) },
  ],

  accountsPayable: [
    { key: "description", header: "Descrição" },
    { key: "supplier.name", header: "Fornecedor" },
    { key: "amount", header: "Valor", formatter: (v: unknown) => formatCurrencyForExport(v) },
    { key: "dueDate", header: "Vencimento", formatter: (v: unknown) => formatDateForExport(v) },
    { key: "status", header: "Status", formatter: (v: unknown) => translateStatus(v as string) },
  ],

  accountsReceivable: [
    { key: "description", header: "Descrição" },
    { key: "customer.name", header: "Cliente" },
    { key: "amount", header: "Valor", formatter: (v: unknown) => formatCurrencyForExport(v) },
    { key: "dueDate", header: "Vencimento", formatter: (v: unknown) => formatDateForExport(v) },
    { key: "status", header: "Status", formatter: (v: unknown) => translateStatus(v as string) },
  ],

  projects: [
    { key: "name", header: "Nome" },
    { key: "customer.name", header: "Cliente" },
    { key: "value", header: "Valor", formatter: (v: unknown) => formatCurrencyForExport(v) },
    { key: "progress", header: "Progresso", formatter: (v: unknown) => `${v}%` },
    { key: "status", header: "Status", formatter: (v: unknown) => translateStatus(v as string) },
    { key: "deadline", header: "Prazo", formatter: (v: unknown) => formatDateForExport(v) },
  ],

  budgets: [
    { key: "budgetNumber", header: "Número" },
    { key: "title", header: "Título" },
    { key: "customer.name", header: "Cliente" },
    { key: "finalPrice", header: "Valor Final", formatter: (v: unknown) => formatCurrencyForExport(v) },
    { key: "status", header: "Status", formatter: (v: unknown) => translateStatus(v as string) },
    { key: "createdAt", header: "Data", formatter: (v: unknown) => formatDateForExport(v) },
  ],
};

/**
 * Helper function to format currency for export
 */
function formatCurrencyForExport(value: unknown): string {
  if (value === null || value === undefined) return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(num)) return "R$ 0,00";
  return `R$ ${num.toFixed(2).replace(".", ",")}`;
}

/**
 * Helper function to format date for export
 */
function formatDateForExport(value: unknown): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(String(value));
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

/**
 * Helper function to translate status values
 */
function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    // Order status
    pending: "Pendente",
    approved: "Aprovado",
    in_production: "Em Produção",
    completed: "Concluído",
    cancelled: "Cancelado",

    // Payment status
    paid: "Pago",
    received: "Recebido",
    overdue: "Vencido",

    // Project status
    project: "Projeto",
    development: "Desenvolvimento",
    design: "Design",
    review: "Revisão",
    launched: "Lançado",

    // Task status
    todo: "A Fazer",
    in_progress: "Em Andamento",
    done: "Concluído",

    // Lead status
    new: "Novo",
    contacted: "Contatado",
    qualified: "Qualificado",
    proposal: "Proposta",
    negotiation: "Negociação",
    won: "Ganho",
    lost: "Perdido",

    // Contract status
    active: "Ativo",
    suspended: "Suspenso",
    expired: "Expirado",

    // Budget status
    draft: "Rascunho",
    sent: "Enviado",
    rejected: "Rejeitado",
    converted: "Convertido",
  };

  return translations[status] || status;
}

/**
 * Generates a filename with current date
 */
export function generateExportFilename(prefix: string, extension: "csv" | "xls" = "csv"): string {
  const date = new Date().toISOString().split("T")[0];
  return `${prefix}_${date}.${extension}`;
}
