import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const initializeAuth = () => {
      let savedToken = localStorage.getItem('bss_token');
      const savedUser = localStorage.getItem('bss_user');

      // SANITIZATION: Clean the token of any accidental wrapping quotes
      if (savedToken && savedToken.startsWith('"') && savedToken.endsWith('"')) {
        savedToken = savedToken.slice(1, -1);
      }

      if (savedToken && savedUser) {
        try {
          setAuthState({
            user: JSON.parse(savedUser),
            isAuthenticated: true,
            token: savedToken,
            loading: false,
          });
        } catch (e) {
          // If JSON.parse fails, clear corrupted data
          console.error("Auth initialization failed, clearing storage");
          logout();
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User, token: string) => {
    // Save cleanly without extra quotes
    localStorage.setItem('bss_token', token);
    localStorage.setItem('bss_user', JSON.stringify(userData));
    setAuthState({ user: userData, isAuthenticated: true, token, loading: false });
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('bss_user', JSON.stringify(userData));
    setAuthState(prev => ({ ...prev, user: userData }));
  };

  const logout = () => {
    localStorage.removeItem('bss_token');
    localStorage.removeItem('bss_user');
    setAuthState({ user: null, isAuthenticated: false, token: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};