import { useState, useCallback } from "react";
import type { ValidationResult } from "@/lib/validation";

export interface FieldConfig {
  name: string;
  validator: (value: string) => ValidationResult;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface UseFormValidationReturn {
  errors: FormErrors;
  validateField: (name: string, value: string, validator: (value: string) => ValidationResult) => boolean;
  validateForm: (fields: FieldConfig[], values: Record<string, string>) => boolean;
  clearError: (name: string) => void;
  clearAllErrors: () => void;
  setError: (name: string, error: string) => void;
  hasErrors: boolean;
}

/**
 * Custom hook for form validation
 */
export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback(
    (name: string, value: string, validator: (value: string) => ValidationResult): boolean => {
      const result = validator(value);
      
      setErrors((prev) => ({
        ...prev,
        [name]: result.error,
      }));
      
      return result.isValid;
    },
    []
  );

  const validateForm = useCallback(
    (fields: FieldConfig[], values: Record<string, string>): boolean => {
      const newErrors: FormErrors = {};
      let isValid = true;

      for (const field of fields) {
        const value = values[field.name] || "";
        const result = field.validator(value);
        
        if (!result.isValid) {
          newErrors[field.name] = result.error;
          isValid = false;
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    []
  );

  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const hasErrors = Object.values(errors).some((error) => error !== undefined);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    setError,
    hasErrors,
  };
}
