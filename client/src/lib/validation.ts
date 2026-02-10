/**
 * Validation utilities for form fields
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => ValidationResult;
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === "") {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Email inválido" };
  }
  
  return { isValid: true };
}

/**
 * Validates a phone number (Brazilian format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === "") {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  // Remove non-digits
  const digits = phone.replace(/\D/g, "");
  
  if (digits.length < 10 || digits.length > 11) {
    return { isValid: false, error: "Telefone deve ter 10 ou 11 dígitos" };
  }
  
  return { isValid: true };
}

/**
 * Validates a CPF (Brazilian individual taxpayer ID)
 */
export function validateCPF(cpf: string): ValidationResult {
  if (!cpf || cpf.trim() === "") {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const digits = cpf.replace(/\D/g, "");
  
  if (digits.length !== 11) {
    return { isValid: false, error: "CPF deve ter 11 dígitos" };
  }
  
  // Check for known invalid CPFs
  if (/^(\d)\1+$/.test(digits)) {
    return { isValid: false, error: "CPF inválido" };
  }
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) {
    return { isValid: false, error: "CPF inválido" };
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10])) {
    return { isValid: false, error: "CPF inválido" };
  }
  
  return { isValid: true };
}

/**
 * Validates a CNPJ (Brazilian company taxpayer ID)
 */
export function validateCNPJ(cnpj: string): ValidationResult {
  if (!cnpj || cnpj.trim() === "") {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const digits = cnpj.replace(/\D/g, "");
  
  if (digits.length !== 14) {
    return { isValid: false, error: "CNPJ deve ter 14 dígitos" };
  }
  
  // Check for known invalid CNPJs
  if (/^(\d)\1+$/.test(digits)) {
    return { isValid: false, error: "CNPJ inválido" };
  }
  
  // Validate check digits
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(digits[12])) {
    return { isValid: false, error: "CNPJ inválido" };
  }
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(digits[13])) {
    return { isValid: false, error: "CNPJ inválido" };
  }
  
  return { isValid: true };
}

/**
 * Validates a document (CPF or CNPJ)
 */
export function validateDocument(document: string): ValidationResult {
  if (!document || document.trim() === "") {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const digits = document.replace(/\D/g, "");
  
  if (digits.length === 11) {
    return validateCPF(document);
  } else if (digits.length === 14) {
    return validateCNPJ(document);
  }
  
  return { isValid: false, error: "Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)" };
}

/**
 * Validates a CEP (Brazilian postal code)
 */
export function validateCEP(cep: string): ValidationResult {
  if (!cep || cep.trim() === "") {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const digits = cep.replace(/\D/g, "");
  
  if (digits.length !== 8) {
    return { isValid: false, error: "CEP deve ter 8 dígitos" };
  }
  
  return { isValid: true };
}

/**
 * Validates a required field
 */
export function validateRequired(value: string, fieldName: string = "Campo"): ValidationResult {
  if (!value || value.trim() === "") {
    return { isValid: false, error: `${fieldName} é obrigatório` };
  }
  
  return { isValid: true };
}

/**
 * Validates a numeric value
 */
export function validateNumber(value: string, options?: { min?: number; max?: number; allowNegative?: boolean }): ValidationResult {
  if (!value || value.trim() === "") {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: "Valor deve ser numérico" };
  }
  
  if (!options?.allowNegative && num < 0) {
    return { isValid: false, error: "Valor não pode ser negativo" };
  }
  
  if (options?.min !== undefined && num < options.min) {
    return { isValid: false, error: `Valor mínimo é ${options.min}` };
  }
  
  if (options?.max !== undefined && num > options.max) {
    return { isValid: false, error: `Valor máximo é ${options.max}` };
  }
  
  return { isValid: true };
}

/**
 * Validates a date
 */
export function validateDate(value: string, options?: { minDate?: Date; maxDate?: Date }): ValidationResult {
  if (!value || value.trim() === "") {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, error: "Data inválida" };
  }
  
  if (options?.minDate && date < options.minDate) {
    return { isValid: false, error: `Data mínima é ${options.minDate.toLocaleDateString("pt-BR")}` };
  }
  
  if (options?.maxDate && date > options.maxDate) {
    return { isValid: false, error: `Data máxima é ${options.maxDate.toLocaleDateString("pt-BR")}` };
  }
  
  return { isValid: true };
}

/**
 * Validates a string length
 */
export function validateLength(value: string, options: { min?: number; max?: number }): ValidationResult {
  if (!value) {
    return { isValid: true }; // Empty is valid (optional field)
  }
  
  if (options.min !== undefined && value.length < options.min) {
    return { isValid: false, error: `Mínimo de ${options.min} caracteres` };
  }
  
  if (options.max !== undefined && value.length > options.max) {
    return { isValid: false, error: `Máximo de ${options.max} caracteres` };
  }
  
  return { isValid: true };
}

/**
 * Formats a phone number
 */
export function formatPhone(phone: string): string {
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
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  
  return cpf;
}

/**
 * Formats a CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
  
  return cnpj;
}

/**
 * Formats a CEP
 */
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, "");
  
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  
  return cep;
}

/**
 * Formats currency (BRL)
 */
export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return "R$ 0,00";
  }
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

/**
 * Parses currency string to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}
