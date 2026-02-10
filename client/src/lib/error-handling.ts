/**
 * Error handling utilities for the application
 */

import { TRPCClientError } from "@trpc/client";

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Known error codes and their user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  UNAUTHORIZED: "Você precisa estar logado para realizar esta ação",
  FORBIDDEN: "Você não tem permissão para realizar esta ação",
  SESSION_EXPIRED: "Sua sessão expirou. Por favor, faça login novamente",
  
  // Validation errors
  BAD_REQUEST: "Dados inválidos. Verifique os campos e tente novamente",
  VALIDATION_ERROR: "Erro de validação. Verifique os campos obrigatórios",
  
  // Resource errors
  NOT_FOUND: "Recurso não encontrado",
  CONFLICT: "Este registro já existe ou está em conflito",
  
  // Server errors
  INTERNAL_SERVER_ERROR: "Erro interno do servidor. Tente novamente mais tarde",
  SERVICE_UNAVAILABLE: "Serviço temporariamente indisponível",
  
  // Database errors
  DATABASE_ERROR: "Erro ao acessar o banco de dados",
  CONNECTION_ERROR: "Erro de conexão. Verifique sua internet",
  
  // Business logic errors
  INSUFFICIENT_STOCK: "Estoque insuficiente para esta operação",
  PAYMENT_REQUIRED: "Pagamento pendente para esta operação",
  BUDGET_EXPIRED: "Este orçamento expirou",
  CONTRACT_INACTIVE: "Este contrato não está ativo",
  
  // Generic
  UNKNOWN: "Ocorreu um erro inesperado. Tente novamente",
};

/**
 * Parses a TRPC error and returns a user-friendly message
 */
export function parseTRPCError(error: unknown): AppError {
  if (error instanceof TRPCClientError) {
    const code = error.data?.code || "UNKNOWN";
    const message = ERROR_MESSAGES[code] || error.message || ERROR_MESSAGES.UNKNOWN;
    
    return {
      code,
      message,
      details: error.data,
    };
  }
  
  if (error instanceof Error) {
    return {
      code: "UNKNOWN",
      message: error.message || ERROR_MESSAGES.UNKNOWN,
    };
  }
  
  return {
    code: "UNKNOWN",
    message: ERROR_MESSAGES.UNKNOWN,
  };
}

/**
 * Gets a user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  const appError = parseTRPCError(error);
  return appError.message;
}

/**
 * Checks if an error is a specific type
 */
export function isErrorCode(error: unknown, code: string): boolean {
  const appError = parseTRPCError(error);
  return appError.code === code;
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const appError = parseTRPCError(error);
  return ["UNAUTHORIZED", "FORBIDDEN", "SESSION_EXPIRED"].includes(appError.code);
}

/**
 * Checks if an error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  const appError = parseTRPCError(error);
  return ["BAD_REQUEST", "VALIDATION_ERROR"].includes(appError.code);
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("fetch") || 
           error.message.includes("network") ||
           error.message.includes("connection");
  }
  return false;
}

/**
 * Logs an error for debugging (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[Error${context ? ` - ${context}` : ""}]:`, error);
  }
}

/**
 * Creates a retry handler for failed operations
 */
export function createRetryHandler(
  operation: () => Promise<void>,
  options: { maxRetries?: number; delay?: number } = {}
): () => Promise<void> {
  const { maxRetries = 3, delay = 1000 } = options;
  
  return async () => {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await operation();
        return;
      } catch (error) {
        lastError = error;
        
        // Don't retry auth or validation errors
        if (isAuthError(error) || isValidationError(error)) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError;
  };
}
