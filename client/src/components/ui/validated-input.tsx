import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import type { ValidationResult } from "@/lib/validation";

export interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  validator?: (value: string) => ValidationResult;
  onValidate?: (isValid: boolean, error?: string) => void;
  formatValue?: (value: string) => string;
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ className, error, validator, onValidate, formatValue, onChange, onBlur, ...props }, ref) => {
    const [localError, setLocalError] = React.useState<string | undefined>();
    const [touched, setTouched] = React.useState(false);

    const displayError = error || (touched ? localError : undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      if (formatValue) {
        value = formatValue(value);
        e.target.value = value;
      }
      
      if (validator && touched) {
        const result = validator(value);
        setLocalError(result.error);
        onValidate?.(result.isValid, result.error);
      }
      
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      
      if (validator) {
        const result = validator(e.target.value);
        setLocalError(result.error);
        onValidate?.(result.isValid, result.error);
      }
      
      onBlur?.(e);
    };

    return (
      <div className="space-y-1">
        <Input
          ref={ref}
          className={cn(
            displayError && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        />
        {displayError && (
          <p className="text-sm text-red-500">{displayError}</p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";

export { ValidatedInput };
