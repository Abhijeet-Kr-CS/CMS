'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/utils/api';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'driver' | 'admin';
  phone_number: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { username?: string; phone_number?: string; password: string }) => Promise<void>;
  register: (userData: {
    username: string;
    password: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

interface RegisterResponse {
  access: string;
  refresh: string;
  user: User;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      const userData = JSON.parse(storedUser);
      // Add name property for backward compatibility
      if (userData && !userData.name) {
        userData.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      }
      setToken(storedToken);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { username?: string; phone_number?: string; password: string }) => {
    try {
      const response = await authAPI.login(credentials) as LoginResponse;
      
      // Add name property for backward compatibility
      const userData = response.user;
      if (!userData.name) {
        userData.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      }
      
      setToken(response.access);
      setUser(userData);
      
      localStorage.setItem('token', response.access);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect based on user role using Next.js router
      if (userData.role === 'admin') {
        router.push('/admin');
      } else if (userData.role === 'driver') {
        router.push('/driver');
      } else {
        router.push('/user/book');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    password: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    role?: string;
  }) => {
    try {
      const response = await authAPI.register(userData) as RegisterResponse;
      
      // Add name property for backward compatibility
      const user = response.user;
      if (!user.name) {
        user.name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      }
      
      setToken(response.access);
      setUser(user);
      
      localStorage.setItem('token', response.access);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect based on user role using Next.js router
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'driver') {
        router.push('/driver');
      } else {
        router.push('/user/book');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isLoading: loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 