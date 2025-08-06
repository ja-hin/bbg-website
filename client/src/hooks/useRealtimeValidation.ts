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
    try {
      // Check if IMEI already exists in regular customers table
      const response = await fetch('/api/check-device-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: imei })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          return "This device is already registered";
        }
      }
      
      // For Acer registrations, validate against Acer IMEI database
      const acerResponse = await fetch('/api/validate-acer-imei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imei })
      });
      
      if (acerResponse.ok) {
        const acerData = await acerResponse.json();
        if (!acerData.valid) {
          return acerData.message || "IMEI not found in Acer database";
        }
      }
      
      return null;
    } catch (error) {
      console.error('IMEI validation error:', error);
      return null; // Don't fail validation on network errors
    }
  },

  acerImeiValidation: async (imei: string): Promise<string | null> => {
    if (!imei || imei.length < 5) {
      return null; // Let the schema handle basic validation
    }

    try {
      // Check if device already registered in customers table first
      const existsResponse = await fetch('/api/check-device-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: imei })
      });
      
      if (existsResponse.ok) {
        const existsData = await existsResponse.json();
        if (existsData.exists) {
          return "This device is already registered";
        }
      }

      // Validate IMEI against Acer database using absolute URL to avoid routing issues
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/validate-acer-imei`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ imei })
      });
      
      if (!response.ok) {
        return "Unable to validate IMEI at this time";
      }
      
      const data = await response.json();
      
      if (!data.valid) {
        return data.message || "IMEI not found in Acer database. Please verify the serial number.";
      }
      
      // IMEI is valid
      return null;
    } catch (error) {
      console.error('Acer IMEI validation error:', error);
      return "Unable to validate IMEI. Please check your connection.";
    }
  }
};