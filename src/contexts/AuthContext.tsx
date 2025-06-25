import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  btcWallet: string;
  usdtWallet: string;
  balance: number;
  isAdmin: boolean;
  createdAt: Date;
  emailConfirmed: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
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
  
  // Use ref to track if component is mounted to prevent memory leaks
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        setError(null);
        
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          if (mountedRef.current) {
            setIsLoading(false);
          }
          return;
        }

        console.log('📋 Current session:', currentSession ? 'Found' : 'None');

        if (currentSession?.user?.email_confirmed_at && mountedRef.current) {
          console.log('✅ User has confirmed session, fetching profile...');
          setSession(currentSession);
          await fetchUserProfile(currentSession.user);
        } else {
          console.log('❌ No confirmed session found');
          if (mountedRef.current) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error);
        if (mountedRef.current) {
          setError('Failed to initialize authentication');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      console.log('🔄 Auth state change:', event, session ? 'Session exists' : 'No session');

      try {
        setError(null);
        
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          console.log('✅ User signed in with confirmed email');
          setSession(session);
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setSession(null);
          setUser(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user?.email_confirmed_at) {
          console.log('🔄 Token refreshed');
          setSession(session);
          if (!user) {
            await fetchUserProfile(session.user);
          } else {
            setIsLoading(false);
          }
        } else {
          console.log('⚠️ Auth event without confirmed email or other condition');
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
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
      console.log('📋 Fetching user profile for:', authUser.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, create it
          console.log('📝 Profile not found, creating...');
          await createUserProfile(authUser);
          return;
        } else {
          throw error;
        }
      }

      if (data && mountedRef.current) {
        console.log('✅ Profile fetched successfully');
        setUserFromProfile(data, authUser);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      if (mountedRef.current) {
        setError('Failed to load user profile');
        setIsLoading(false);
      }
    }
  };

  const createUserProfile = async (authUser: SupabaseUser) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('📝 Creating user profile...');
      
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

      if (error) {
        throw error;
      }

      if (profile && mountedRef.current) {
        console.log('✅ Profile created successfully');
        setUserFromProfile(profile, authUser);
      }
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      if (mountedRef.current) {
        setError('Failed to create user profile');
        setIsLoading(false);
      }
    }
  };

  const setUserFromProfile = (profile: any, authUser: SupabaseUser) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('👤 Setting user from profile...');
      
      const userData: User = {
        id: profile.id,
        name: profile.name || 'User',
        email: authUser.email || '',
        btcWallet: profile.btc_wallet || '',
        usdtWallet: profile.usdt_wallet || '',
        balance: parseFloat(profile.balance) || 0,
        isAdmin: profile.is_admin || false,
        createdAt: new Date(profile.created_at),
        emailConfirmed: !!authUser.email_confirmed_at
      };
      
      setUser(userData);
      setIsLoading(false);
      console.log('✅ User set successfully:', userData.name);
    } catch (error) {
      console.error('❌ Error setting user from profile:', error);
      if (mountedRef.current) {
        setError('Failed to process user data');
        setIsLoading(false);
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        setError(error.message);
        return false;
      }

      if (!data.user?.email_confirmed_at) {
        console.error('❌ Email not confirmed');
        await supabase.auth.signOut();
        setError('Please verify your email before logging in. Check your inbox for a verification link.');
        return false;
      }
      
      console.log('✅ Login successful');
      return true;
    } catch (error: any) {
      console.error('❌ Login exception:', error.message);
      setError(error.message || 'An error occurred during login');
      return false;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
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
        console.error('❌ Registration error:', error.message);
        setError(error.message);
        return false;
      }

      console.log('✅ Registration successful');
      return !!data.user;
    } catch (error) {
      console.error('❌ Registration exception:', error);
      setError('An error occurred during registration');
      return false;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setError(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user || !mountedRef.current) return;

    try {
      console.log('📝 Updating profile...');
      setError(null);
      
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
        throw error;
      }

      if (mountedRef.current) {
        setUser(prev => prev ? { ...prev, ...userData } : null);
        console.log('✅ Profile updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      if (mountedRef.current) {
        setError('Failed to update profile');
      }
    }
  };

  // Cleanup on unmount
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
    updateProfile,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};