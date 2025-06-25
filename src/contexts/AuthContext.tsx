import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
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
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          await createUserProfile(authUser);
          return;
        }
        throw error;
      }

      setUser({
        id: data.id,
        name: data.name,
        email: authUser.email || '',
        balance: data.balance,
        isAdmin: data.is_admin,
        btcWallet: data.btc_wallet,
        usdtWallet: data.usdt_wallet,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const createUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          name: authUser.user_metadata?.name || 'User',
          btc_wallet: authUser.user_metadata?.btc_wallet || '',
          usdt_wallet: authUser.user_metadata?.usdt_wallet || '',
          balance: 0,
          is_admin: false,
        })
        .select()
        .single();

      if (error) throw error;

      setUser({
        id: data.id,
        name: data.name,
        email: authUser.email || '',
        balance: data.balance,
        isAdmin: data.is_admin,
        btcWallet: data.btc_wallet,
        usdtWallet: data.usdt_wallet,
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return false;
      }

      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            btc_wallet: userData.btcWallet,
            usdt_wallet: userData.usdtWallet,
          },
        },
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return false;
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      return true;
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setError(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          btc_wallet: data.btcWallet,
          usdt_wallet: data.usdtWallet,
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...data });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
      console.error('Update profile error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};