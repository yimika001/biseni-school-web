import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
    loading: true, // Added this
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('bss_token');
    const savedUser = localStorage.getItem('bss_user');
    if (savedToken && savedUser) {
      setAuthState({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
        token: savedToken,
        loading: false, // Set to false when done
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('bss_token', token);
    localStorage.setItem('bss_user', JSON.stringify(userData));
    setAuthState({
      user: userData,
      isAuthenticated: true,
      token: token,
      loading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('bss_token');
    localStorage.removeItem('bss_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      token: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};