import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '../services/api';

interface RegistrationData {
  email?: string;
  firstName?: string;
  lastName?: string;
  birthYear?: string;
  phoneNumber?: string;
  password?: string;
}

interface AuthContextType {
  registrationData: RegistrationData;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkEmailExists: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [registrationData, setRegistrationData] = useState<RegistrationData>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({
      ...prev,
      ...data
    }));
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    const response = await authApi.checkEmail(email);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data?.exists || false;
  };

  const login = async (email: string, password: string) => {
    // TODO: Implement actual login logic
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRegistrationData({});
  };

  return (
    <AuthContext.Provider
      value={{
        registrationData,
        updateRegistrationData,
        isAuthenticated,
        login,
        logout,
        checkEmailExists
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 