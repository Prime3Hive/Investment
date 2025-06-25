import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roi: number;
  durationHours: number;
  description: string;
  isActive: boolean;
}

interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  roi: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  plan?: InvestmentPlan;
}

interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  currency: 'BTC' | 'USDT';
  walletAddress: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'investment' | 'profit' | 'reinvestment';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

interface InvestmentContextType {
  plans: InvestmentPlan[];
  investments: Investment[];
  deposits: DepositRequest[];
  transactions: Transaction[];
  createInvestment: (planId: string, amount: number) => Promise<boolean>;
  createDepositRequest: (amount: number, currency: 'BTC' | 'USDT') => Promise<boolean>;
  fetchUserData: () => Promise<void>;
  isLoading: boolean;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestment must be used within an InvestmentProvider');
  }
  return context;
};

// Static wallet addresses for deposits
const WALLET_ADDRESSES = {
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  USDT: '0x742D35Cc6634C0532925a3b8D49D6b5A0e65e8C6'
};

export const InvestmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('is_active', true)
        .order('min_amount');

      if (error) throw error;

      setPlans(data.map(plan => ({
        id: plan.id,
        name: plan.name,
        minAmount: plan.min_amount,
        maxAmount: plan.max_amount,
        roi: plan.roi,
        durationHours: plan.duration_hours,
        description: plan.description || '',
        isActive: plan.is_active,
      })));
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch investments
      const { data: investmentData, error: investmentError } = await supabase
        .from('investments')
        .select(`
          *,
          investment_plans (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (investmentError) throw investmentError;

      setInvestments(investmentData.map(inv => ({
        id: inv.id,
        userId: inv.user_id,
        planId: inv.plan_id,
        amount: inv.amount,
        roi: inv.roi,
        startDate: inv.start_date,
        endDate: inv.end_date,
        status: inv.status,
        plan: inv.investment_plans ? {
          id: inv.investment_plans.id,
          name: inv.investment_plans.name,
          minAmount: inv.investment_plans.min_amount,
          maxAmount: inv.investment_plans.max_amount,
          roi: inv.investment_plans.roi,
          durationHours: inv.investment_plans.duration_hours,
          description: inv.investment_plans.description || '',
          isActive: inv.investment_plans.is_active,
        } : undefined,
      })));

      // Fetch deposit requests
      const { data: depositData, error: depositError } = await supabase
        .from('deposit_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (depositError) throw depositError;

      setDeposits(depositData.map(dep => ({
        id: dep.id,
        userId: dep.user_id,
        amount: dep.amount,
        currency: dep.currency,
        walletAddress: dep.wallet_address,
        status: dep.status,
        createdAt: dep.created_at,
      })));

      // Fetch transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionError) throw transactionError;

      setTransactions(transactionData.map(tx => ({
        id: tx.id,
        userId: tx.user_id,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        description: tx.description,
        createdAt: tx.created_at,
      })));
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const createInvestment = async (planId: string, amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        toast.error('Invalid investment plan');
        return false;
      }

      if (amount < plan.minAmount || amount > plan.maxAmount) {
        toast.error(`Amount must be between $${plan.minAmount} and $${plan.maxAmount}`);
        return false;
      }

      if (amount > user.balance) {
        toast.error('Insufficient balance');
        return false;
      }

      const endDate = new Date();
      endDate.setHours(endDate.getHours() + plan.durationHours);

      // Create investment
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          plan_id: planId,
          amount,
          end_date: endDate.toISOString(),
          roi: plan.roi,
          status: 'active',
        });

      if (investmentError) throw investmentError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: user.balance - amount })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'investment',
          amount,
          status: 'completed',
          description: `Investment in ${plan.name} plan`,
        });

      toast.success('Investment created successfully!');
      await fetchUserData();
      return true;
    } catch (error: any) {
      console.error('Error creating investment:', error);
      toast.error('Failed to create investment');
      return false;
    }
  };

  const createDepositRequest = async (amount: number, currency: 'BTC' | 'USDT'): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('deposit_requests')
        .insert({
          user_id: user.id,
          amount,
          currency,
          wallet_address: WALLET_ADDRESSES[currency],
          status: 'pending',
        });

      if (error) throw error;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount,
          status: 'pending',
          description: `${currency} deposit request`,
        });

      toast.success('Deposit request submitted! Please wait for admin confirmation.');
      await fetchUserData();
      return true;
    } catch (error: any) {
      console.error('Error creating deposit:', error);
      toast.error('Failed to submit deposit request');
      return false;
    }
  };

  const value: InvestmentContextType = {
    plans,
    investments,
    deposits,
    transactions,
    createInvestment,
    createDepositRequest,
    fetchUserData,
    isLoading,
  };

  return <InvestmentContext.Provider value={value}>{children}</InvestmentContext.Provider>;
};