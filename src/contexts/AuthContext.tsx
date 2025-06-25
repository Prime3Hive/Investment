import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  emailConfirmed: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const initializeAuth = async () => {
      try {
        setError(null);
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user?.email_confirmed_at && mountedRef.current) {
          setSession(currentSession);
          await fetchUserProfile(currentSession.user);
        } else {
          if (mountedRef.current) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mountedRef.current) {
          setError('Failed to initialize authentication');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      try {
        setError(null);
        
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          setSession(session);
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        } else {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (mountedRef.current) {
          setError('Authentication error occurred');
          setIsLoading(false);
        }
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    if (!mountedRef.current) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await createUserProfile(authUser);
          return;
        } else {
          throw error;
        }
      }

      if (data && mountedRef.current) {
        const userData: User = {
          id: data.id,
          name: data.name || 'User',
          email: authUser.email || '',
          balance: parseFloat(data.balance) || 0,
          isAdmin: data.is_admin || false,
          emailConfirmed: !!authUser.email_confirmed_at
        };
        
        setUser(userData);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (mountedRef.current) {
        setError('Failed to load user profile');
        setIsLoading(false);
      }
    }
  };

  const createUserProfile = async (authUser: SupabaseUser) => {
    if (!mountedRef.current) return;
    
    try {
      const profileData = {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        btc_wallet: authUser.user_metadata?.btc_wallet || '',
        usdt_wallet: authUser.user_metadata?.usdt_wallet || '',
        balance: 0,
        is_admin: false
      };

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;

      if (profile && mountedRef.current) {
        const userData: User = {
          id: profile.id,
          name: profile.name || 'User',
          email: authUser.email || '',
          balance: parseFloat(profile.balance) || 0,
          isAdmin: profile.is_admin || false,
          emailConfirmed: !!authUser.email_confirmed_at
        };
        
        setUser(userData);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      if (mountedRef.current) {
        setError('Failed to create user profile');
        setIsLoading(false);
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return false;
      }

      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        setError('Please verify your email before logging in.');
        return false;
      }
      
      return true;
    } catch (error: any) {
      setError(error.message || 'Login failed');
      return false;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            btc_wallet: userData.btcWallet,
            usdt_wallet: userData.usdtWallet
          }
        }
      });

      if (error) {
        setError(error.message);
        return false;
      }

      return !!data.user;
    } catch (error) {
      setError('Registration failed');
      return false;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    login,
    register,
    logout,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};