import { useState, useEffect, useCallback } from 'react';

interface CustomerAuth {
  isAuthenticated: boolean;
  customerPhone: string | null;
  isLoading: boolean;
  login: (phone: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export function useCustomerAuth(): CustomerAuth {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPhone = sessionStorage.getItem('customerPhone');
    const savedAuth = sessionStorage.getItem('customerAuthenticated');
    
    if (savedPhone && savedAuth === 'true') {
      setCustomerPhone(savedPhone);
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback((phone: string) => {
    sessionStorage.setItem('customerPhone', phone);
    sessionStorage.setItem('customerAuthenticated', 'true');
    setCustomerPhone(phone);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('customerPhone');
    sessionStorage.removeItem('customerAuthenticated');
    setCustomerPhone(null);
    setIsAuthenticated(false);
  }, []);

  const checkAuth = useCallback(() => {
    const savedPhone = sessionStorage.getItem('customerPhone');
    const savedAuth = sessionStorage.getItem('customerAuthenticated');
    return !!(savedPhone && savedAuth === 'true');
  }, []);

  return {
    isAuthenticated,
    customerPhone,
    isLoading,
    login,
    logout,
    checkAuth
  };
}
