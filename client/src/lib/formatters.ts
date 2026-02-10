/**
 * Data formatting utilities for the application
 */

/**
 * Formats a number as Brazilian currency (BRL)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) return "R$ 0,00";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

/**
 * Formats a number with Brazilian locale
 */
export function formatNumber(value: number | string | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "0";
  
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) return "0";
  
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Formats a percentage
 */
export function formatPercent(value: number | string | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "0%";
  
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) return "0%";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100);
}

/**
 * Formats a date in Brazilian format (DD/MM/YYYY)
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "-";
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a date with time in Brazilian format (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "-";
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Formats a time (HH:mm)
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "-";
  
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Formats a relative date (e.g., "há 2 dias", "em 3 horas")
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "-";
  
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  
  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, "day");
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, "hour");
  } else {
    return rtf.format(diffMinutes, "minute");
  }
}

/**
 * Formats a phone number in Brazilian format
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "-";
  
  const digits = phone.replace(/\D/g, "");
  
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  
  return phone;
}

/**
 * Formats a CPF
 */
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return "-";
  
  const digits = cpf.replace(/\D/g, "");
  
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  
  return cpf;
}

/**
 * Formats a CNPJ
 */
export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return "-";
  
  const digits = cnpj.replace(/\D/g, "");
  
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
  
  return cnpj;
}

/**
 * Formats a document (CPF or CNPJ)
 */
export function formatDocument(document: string | null | undefined): string {
  if (!document) return "-";
  
  const digits = document.replace(/\D/g, "");
  
  if (digits.length === 11) {
    return formatCPF(document);
  } else if (digits.length === 14) {
    return formatCNPJ(document);
  }
  
  return document;
}

/**
 * Formats a CEP
 */
export function formatCEP(cep: string | null | undefined): string {
  if (!cep) return "-";
  
  const digits = cep.replace(/\D/g, "");
  
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  
  return cep;
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncates text with ellipsis
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  
  if (text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Capitalizes the first letter of each word
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Formats a duration in hours and minutes
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}min`;
}

/**
 * Formats hours worked (decimal to hours:minutes)
 */
export function formatHoursWorked(hours: number | string | null | undefined): string {
  if (hours === null || hours === undefined) return "0h";
  
  const num = typeof hours === "string" ? parseFloat(hours) : hours;
  
  if (isNaN(num)) return "0h";
  
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  
  if (m === 0) {
    return `${h}h`;
  }
  
  return `${h}h ${m}min`;
}

/**
 * Gets initials from a name
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  
  const words = name.trim().split(" ");
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Formats an order/budget number
 */
export function formatOrderNumber(number: string | null | undefined): string {
  if (!number) return "-";
  return number;
}

/**
 * Parses a Brazilian currency string to number
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  
  const cleaned = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  
  return parseFloat(cleaned) || 0;
}

/**
 * Parses a Brazilian date string to Date object
 */
export function parseDate(value: string): Date | null {
  if (!value) return null;
  
  // Try DD/MM/YYYY format
  const parts = value.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Try ISO format
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
}

/**
 * Gets the status color class based on status type
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Order status
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    in_production: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    
    // Payment status
    paid: "bg-green-100 text-green-800",
    received: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    
    // Project status
    project: "bg-gray-100 text-gray-800",
    development: "bg-blue-100 text-blue-800",
    design: "bg-purple-100 text-purple-800",
    review: "bg-yellow-100 text-yellow-800",
    launched: "bg-green-100 text-green-800",
    
    // Task status
    todo: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    done: "bg-green-100 text-green-800",
    
    // Lead status
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    qualified: "bg-purple-100 text-purple-800",
    proposal: "bg-indigo-100 text-indigo-800",
    negotiation: "bg-orange-100 text-orange-800",
    won: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800",
    
    // Contract status
    active: "bg-green-100 text-green-800",
    suspended: "bg-yellow-100 text-yellow-800",
    expired: "bg-gray-100 text-gray-800",
    
    // Ticket status
    open: "bg-blue-100 text-blue-800",
    waiting_customer: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
    
    // Budget status
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    converted: "bg-green-100 text-green-800",
  };
  
  return colors[status] || "bg-gray-100 text-gray-800";
}

/**
 * Gets the priority color class
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };
  
  return colors[priority] || "bg-gray-100 text-gray-800";
}
