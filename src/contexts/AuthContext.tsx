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
  emailConfirmed: boolean;
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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing authentication...');
        
        // Clear any stale auth state first
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError && !signOutError.message?.includes('not signed in')) {
          console.warn('⚠️ Warning during sign out:', signOutError);
        }

        // Get fresh session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) setIsLoading(false);
          return;
        }

        if (session?.user?.email_confirmed_at) {
          console.log('✅ Found authenticated user:', session.user.id);
          await fetchUserProfile(session.user);
        } else {
          console.log('ℹ️ No authenticated user found');
          if (mounted) setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error);
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        console.log('✅ User signed in with confirmed email');
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user?.email_confirmed_at) {
        console.log('🔄 Token refreshed');
        if (!user) {
          await fetchUserProfile(session.user);
        } else {
          setIsLoading(false);
        }
      } else {
        console.log('ℹ️ Auth state change but no action needed');
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
      console.log('📋 Fetching profile for user:', authUser.id);
      
      // Wait a moment for database to be ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found, creating...');
          await createUserProfile(authUser);
          return;
        } else {
          console.error('❌ Error fetching profile:', error);
          setIsLoading(false);
          return;
        }
      }

      if (profile) {
        console.log('✅ Profile found:', profile);
        setUserFromProfile(profile, authUser);
      }
      
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
      setIsLoading(false);
    }
  };

  const createUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('🆕 Creating profile for user:', authUser.id);
      
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
        console.error('❌ Error creating profile:', error);
        
        // Try the manual function as fallback
        try {
          await supabase.rpc('create_missing_profile', {
            user_id: authUser.id,
            user_email: authUser.email || '',
            user_name: authUser.user_metadata?.name || null,
            btc_wallet: authUser.user_metadata?.btc_wallet || '',
            usdt_wallet: authUser.user_metadata?.usdt_wallet || ''
          });

          // Fetch the created profile
          const { data: createdProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (fetchError || !createdProfile) {
            console.error('❌ Failed to fetch created profile:', fetchError);
            setIsLoading(false);
            return;
          }

          setUserFromProfile(createdProfile, authUser);
        } catch (fallbackError) {
          console.error('❌ Fallback profile creation failed:', fallbackError);
          setIsLoading(false);
        }
        return;
      }

      console.log('✅ Profile created successfully:', profile);
      setUserFromProfile(profile, authUser);
      
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      setIsLoading(false);
    }
  };

  const setUserFromProfile = (profile: any, authUser: SupabaseUser) => {
    try {
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
      
      console.log('✅ Setting user state:', userData);
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error setting user from profile:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Starting login process for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error);
        return false;
      }

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.id);
        
        if (!data.user.email_confirmed_at) {
          console.log('⚠️ Email not confirmed');
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
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
        console.error('❌ Registration error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        console.log('✅ Registration successful for user:', data.user.id);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('❌ Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('👋 Logging out user');
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
        console.error('❌ Error updating profile:', error);
        return;
      }

      setUser(prev => prev ? { ...prev, ...userData } : null);
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
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