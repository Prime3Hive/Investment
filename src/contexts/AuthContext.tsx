import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  btcWallet: string;
  usdtWallet: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  btcWallet: string;
  usdtWallet: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const profile = await apiClient.getProfile();
          setUser({
            id: profile._id,
            name: profile.name,
            email: profile.email,
            balance: profile.balance,
            isAdmin: profile.isAdmin,
            btcWallet: profile.btcWallet,
            usdtWallet: profile.usdtWallet,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiClient.login({ email, password });
      
      localStorage.setItem('token', response.token);
      setUser({
        id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        balance: response.user.balance,
        isAdmin: response.user.isAdmin,
        btcWallet: response.user.btcWallet,
        usdtWallet: response.user.usdtWallet,
      });

      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setError(null);
      
      await apiClient.register(userData);
      toast.success('Registration successful! Please log in with your credentials.');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      const updatedProfile = await apiClient.updateProfile({
        name: data.name,
        btcWallet: data.btcWallet,
        usdtWallet: data.usdtWallet,
      });

      setUser({
        ...user,
        name: updatedProfile.name,
        btcWallet: updatedProfile.btcWallet,
        usdtWallet: updatedProfile.usdtWallet,
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      console.error('Update profile error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};