import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          btc_wallet: string;
          usdt_wallet: string;
          balance: number;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          btc_wallet: string;
          usdt_wallet: string;
          balance?: number;
          is_admin?: boolean;
        };
        Update: {
          name?: string;
          btc_wallet?: string;
          usdt_wallet?: string;
          balance?: number;
          is_admin?: boolean;
        };
      };
      investment_plans: {
        Row: {
          id: string;
          name: string;
          min_amount: number;
          max_amount: number;
          roi_percent: number;
          duration_hours: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          min_amount: number;
          max_amount: number;
          roi_percent: number;
          duration_hours: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          min_amount?: number;
          max_amount?: number;
          roi_percent?: number;
          duration_hours?: number;
          is_active?: boolean;
        };
      };
      investments: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          amount: number;
          roi_percent: number;
          created_at: string;
          ends_at: string;
          is_reinvest: boolean;
          status: 'active' | 'completed' | 'cancelled';
        };
        Insert: {
          user_id: string;
          plan_id: string;
          amount: number;
          roi_percent: number;
          ends_at: string;
          is_reinvest?: boolean;
          status?: 'active' | 'completed' | 'cancelled';
        };
        Update: {
          status?: 'active' | 'completed' | 'cancelled';
        };
      };
      deposits: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: 'BTC' | 'USDT';
          status: 'pending' | 'confirmed' | 'rejected';
          created_at: string;
        };
        Insert: {
          user_id: string;
          amount: number;
          currency: 'BTC' | 'USDT';
          status?: 'pending' | 'confirmed' | 'rejected';
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'rejected';
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'deposit' | 'invest' | 'reinvest' | 'profit';
          amount: number;
          description: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: 'deposit' | 'invest' | 'reinvest' | 'profit';
          amount: number;
          description: string;
        };
      };
    };
  };
}