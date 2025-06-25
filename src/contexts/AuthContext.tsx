import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Track user activity
  useEffect(() => {
    if (!user) return; // Only track activity when user is logged in
    
    // Update last activity timestamp on user interactions
    const updateActivity = () => setLastActivity(Date.now());
    
    // Events to track for activity
    const events = ['mousedown', 'keypress', 'scroll', 'mousemove', 'touchstart'];
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });
    
    // Check for inactivity every minute
    const inactivityCheck = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        console.log('⏰ User inactive for 5 minutes, logging out');
        logout();
      }
    }, 60000); // Check every minute
    
    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityCheck);
    };
  }, [user, lastActivity]); // Re-run when user or lastActivity changes

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        setError(null);
        
        // Get current session first
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('📋 Current session:', currentSession ? 'Found' : 'None');

        if (currentSession?.user?.email_confirmed_at) {
          console.log('✅ User has confirmed session, fetching profile...');
          setSession(currentSession);
          await fetchUserProfile(currentSession.user);
        } else {
          console.log('❌ No confirmed session found');
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error);
        setError('Failed to initialize authentication');
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes with proper cleanup
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

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
        setError('Authentication error occurred');
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('📋 Fetching user profile for:', authUser.id);
      
      // Add retry logic for profile fetching
      let retries = 3;
      let profile = null;
      
      while (retries > 0 && !profile) {
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
            retries--;
            if (retries === 0) {
              throw error;
            }
            console.log(`⚠️ Profile fetch failed, retrying... (${retries} left)`);
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          profile = data;
          console.log('✅ Profile fetched successfully');
        }
      }

      if (profile) {
        setUserFromProfile(profile, authUser);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setError('Failed to load user profile');
      setIsLoading(false);
    }
  };

  const createUserProfile = async (authUser: SupabaseUser) => {
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

      console.log('✅ Profile created successfully');
      setUserFromProfile(profile, authUser);
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      setError('Failed to create user profile');
      setIsLoading(false);
    }
  };

  const setUserFromProfile = (profile: any, authUser: SupabaseUser) => {
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
      setError('Failed to process user data');
      setIsLoading(false);
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
      
      // Check if user is banned or deactivated
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError.message);
        setError('Failed to verify account status');
        return false;
      }
      
      // If user is banned or deactivated, sign them out and return error
      if (profile?.status === 'banned' || profile?.status === 'deactivated') {
        await supabase.auth.signOut();
        setError(profile.status === 'banned' 
          ? 'Your account has been banned. Please contact support.'
          : 'Your account has been deactivated. Please contact support.');
        return false;
      }
      
      console.log('✅ Login successful');
      return true;
    } catch (error: any) {
      console.error('❌ Login exception:', error.message);
      setError(error.message || 'An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
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
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setError(null);
      // Reset last activity when logging out
      setLastActivity(Date.now());
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;

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

      setUser(prev => prev ? { ...prev, ...userData } : null);
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setError('Failed to update profile');
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
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};