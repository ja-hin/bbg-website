import { useState, useEffect } from "react";
import { z } from "zod";

interface ValidationState {
  status: "idle" | "validating" | "valid" | "invalid";
  message: string;
  isValid: boolean;
  showBubble: boolean;
  isFocused: boolean;
}

interface UseRealtimeValidationOptions {
  schema?: z.ZodSchema;
  customValidation?: (value: any) => Promise<string | null> | string | null;
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useRealtimeValidation(
  value: any,
  options: UseRealtimeValidationOptions = {}
) {
  const {
    schema,
    customValidation,
    debounceMs = 300,
    validateOnChange = true,
    validateOnBlur = true
  } = options;

  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
    message: "",
    isValid: false,
    showBubble: false,
    isFocused: false
  });

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const validateValue = async (val: any, immediate = false) => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const runValidation = async () => {
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        setValidation(prev => ({
          ...prev,
          status: "idle",
          message: "",
          isValid: false,
          showBubble: false
        }));
        return;
      }

      setValidation(prev => ({ 
        ...prev, 
        status: "validating",
        showBubble: prev.isFocused
      }));

      try {
        // Schema validation first
        if (schema) {
          schema.parse(val);
        }

        // Custom validation
        if (customValidation) {
          const customResult = await customValidation(val);
          if (customResult) {
            setValidation(prev => ({
              ...prev,
              status: "invalid",
              message: customResult,
              isValid: false,
              showBubble: prev.isFocused
            }));
            return;
          }
        }

        setValidation(prev => ({
          ...prev,
          status: "valid",
          message: "Valid",
          isValid: true,
          showBubble: prev.isFocused
        }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setValidation(prev => ({
            ...prev,
            status: "invalid",
            message: error.errors[0]?.message || "Invalid input",
            isValid: false,
            showBubble: prev.isFocused
          }));
        } else {
          setValidation(prev => ({
            ...prev,
            status: "invalid",
            message: "Validation failed",
            isValid: false,
            showBubble: prev.isFocused
          }));
        }
      }
    };

    if (immediate) {
      await runValidation();
    } else {
      const timer = setTimeout(runValidation, debounceMs);
      setDebounceTimer(timer);
    }
  };

  useEffect(() => {
    if (validateOnChange) {
      validateValue(value);
    }
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [value, schema, customValidation]);

  const validateImmediate = () => validateValue(value, true);

  const handleFocus = () => {
    setValidation(prev => ({ ...prev, isFocused: true, showBubble: true }));
  };

  const handleBlur = () => {
    setValidation(prev => ({ ...prev, isFocused: false, showBubble: false }));
    if (validateOnBlur) {
      validateValue(value, true);
    }
  };

  return {
    validation,
    validateImmediate,
    handleFocus,
    handleBlur,
    isValidating: validation.status === "validating",
    isValid: validation.isValid,
    isInvalid: validation.status === "invalid",
    hasMessage: Boolean(validation.message),
    message: validation.message,
    showBubble: validation.showBubble && Boolean(validation.message)
  };
}

// Pre-built validation schemas for common fields
export const validationSchemas = {
  phone: z.string().regex(/^[6-9]\d{9}$/, "Contact must be 10 digits starting with 6-9"),
  email: z.string().email("Invalid email address"),
  imei: z.string().min(5, "IMEI/Serial must be at least 5 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.string().min(1, "Price is required").regex(/^\d+$/, "Price must be a number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  model: z.string().min(1, "Model is required")
};

// Custom validation functions
export const customValidations = {
  phoneExists: async (phone: string): Promise<string | null> => {
    // Simulate API call to check if phone exists
    await new Promise(resolve => setTimeout(resolve, 500));
    if (phone === "9999999999") {
      return "This phone number is already registered";
    }
    return null;
  },
  
  emailExists: async (email: string): Promise<string | null> => {
    // Simulate API call to check if email exists
    await new Promise(resolve => setTimeout(resolve, 300));
    if (email === "test@example.com") {
      return "This email is already registered";
    }
    return null;
  },

  imeiExists: async (imei: string): Promise<string | null> => {
    // Simulate API call to check if IMEI exists
    await new Promise(resolve => setTimeout(resolve, 400));
    if (imei === "123456789012345") {
      return "This device is already registered";
    }
    return null;
  }
};