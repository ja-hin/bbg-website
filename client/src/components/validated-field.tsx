import { forwardRef, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ValidationBubble } from "./validation-bubble";
import { useRealtimeValidation, validationSchemas, customValidations } from "@/hooks/useRealtimeValidation";
import { cn } from "@/lib/utils";

interface ValidatedFieldProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  className?: string;
  validationType?: keyof typeof validationSchemas;
  customValidation?: keyof typeof customValidations;
  children?: ReactNode;
  fieldType?: "input" | "select";
  disabled?: boolean;
}

export const ValidatedField = forwardRef<HTMLInputElement, ValidatedFieldProps>(
  ({
    value,
    onChange,
    onBlur,
    placeholder,
    type = "text",
    className,
    validationType,
    customValidation,
    children,
    fieldType = "input",
    disabled,
    ...props
  }, ref) => {
    const schema = validationType ? validationSchemas[validationType] : undefined;
    const customValidator = customValidation ? customValidations[customValidation] : undefined;

    const {
      validation,
      isValidating,
      isValid,
      isInvalid,
      hasMessage
    } = useRealtimeValidation(value, {
      schema,
      customValidation: customValidator,
      debounceMs: 300,
      validateOnChange: true
    });

    const showBubble = hasMessage && value && value.toString().trim() !== '';

    const getBubbleType = () => {
      if (isValidating) return "loading";
      if (isValid) return "success";
      if (isInvalid) return "error";
      return "info";
    };

    const fieldClasses = cn(
      "transition-all duration-200",
      isValid && "border-green-500 focus:border-green-600",
      isInvalid && "border-red-500 focus:border-red-600",
      isValidating && "border-blue-500",
      className
    );

    return (
      <div className="relative">
        {fieldType === "select" ? (
          <div className={fieldClasses}>
            {children}
          </div>
        ) : (
          <Input
            ref={ref}
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            className={fieldClasses}
            disabled={disabled}
            {...props}
          />
        )}
        
        <ValidationBubble
          type={getBubbleType()}
          message={validation.message}
          show={showBubble}
          position="right"
          className="whitespace-nowrap max-w-xs"
        />
      </div>
    );
  }
);

ValidatedField.displayName = "ValidatedField";