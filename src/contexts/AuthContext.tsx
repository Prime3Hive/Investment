import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  btcWallet: string;
  usdtWallet: string;
  balance: number;
  isAdmin: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Initial session found, fetching profile...');
          await fetchUserProfile(session.user);
        } else {
          console.log('No initial session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, fetching profile...');
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('Token refreshed, updating profile...');
        await fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('Fetching profile for user:', authUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          await createUserProfile(authUser);
          return;
        }
        
        setIsLoading(false);
        return;
      }

      if (profile) {
        console.log('Profile fetched successfully:', profile);
        setUser({
          id: profile.id,
          name: profile.name,
          email: authUser.email || '',
          btcWallet: profile.btc_wallet,
          usdtWallet: profile.usdt_wallet,
          balance: parseFloat(profile.balance) || 0,
          isAdmin: profile.is_admin || false,
          createdAt: new Date(profile.created_at)
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('Creating profile for user:', authUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          btc_wallet: authUser.user_metadata?.btc_wallet || '',
          usdt_wallet: authUser.user_metadata?.usdt_wallet || '',
          balance: 0,
          is_admin: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setIsLoading(false);
        return;
      }

      if (profile) {
        console.log('Profile created successfully:', profile);
        setUser({
          id: profile.id,
          name: profile.name,
          email: authUser.email || '',
          btcWallet: profile.btc_wallet,
          usdtWallet: profile.usdt_wallet,
          balance: parseFloat(profile.balance) || 0,
          isAdmin: profile.is_admin || false,
          createdAt: new Date(profile.created_at)
        });
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        console.log('Login successful, user:', data.user.id);
        // Profile will be fetched by the auth state change listener
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting registration for:', userData.email);
      
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
        console.error('Registration error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        console.log('Registration successful, user:', data.user.id);
        // Profile will be created by the trigger or auth state change listener
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (userData.name) updateData.name = userData.name;
      if (userData.btcWallet) updateData.btc_wallet = userData.btcWallet;
      if (userData.usdtWallet) updateData.usdt_wallet = userData.usdtWallet;
      if (userData.balance !== undefined) updateData.balance = userData.balance;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};