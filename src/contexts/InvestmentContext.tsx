import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercent: number;
  durationHours: number;
  isActive: boolean;
}

interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  roiPercent: number;
  createdAt: string;
  endsAt: string;
  isReinvest: boolean;
  status: 'active' | 'completed' | 'cancelled';
  plan?: InvestmentPlan;
}

interface Deposit {
  id: string;
  userId: string;
  amount: number;
  currency: 'BTC' | 'USDT';
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'invest' | 'reinvest' | 'profit';
  amount: number;
  description: string;
  createdAt: string;
}

interface InvestmentContextType {
  plans: InvestmentPlan[];
  investments: Investment[];
  deposits: Deposit[];
  transactions: Transaction[];
  createInvestment: (planId: string, amount: number, isReinvest?: boolean) => Promise<boolean>;
  createDeposit: (amount: number, currency: 'BTC' | 'USDT') => Promise<boolean>;
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

export const InvestmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
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
        roiPercent: plan.roi_percent,
        durationHours: plan.duration_hours,
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
        roiPercent: inv.roi_percent,
        createdAt: inv.created_at,
        endsAt: inv.ends_at,
        isReinvest: inv.is_reinvest,
        status: inv.status,
        plan: inv.investment_plans ? {
          id: inv.investment_plans.id,
          name: inv.investment_plans.name,
          minAmount: inv.investment_plans.min_amount,
          maxAmount: inv.investment_plans.max_amount,
          roiPercent: inv.investment_plans.roi_percent,
          durationHours: inv.investment_plans.duration_hours,
          isActive: inv.investment_plans.is_active,
        } : undefined,
      })));

      // Fetch deposits
      const { data: depositData, error: depositError } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (depositError) throw depositError;

      setDeposits(depositData.map(dep => ({
        id: dep.id,
        userId: dep.user_id,
        amount: dep.amount,
        currency: dep.currency,
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

  const createInvestment = async (planId: string, amount: number, isReinvest = false): Promise<boolean> => {
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

      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + plan.durationHours);

      // Create investment
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          plan_id: planId,
          amount,
          roi_percent: plan.roiPercent,
          ends_at: endsAt.toISOString(),
          is_reinvest: isReinvest,
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
          type: isReinvest ? 'reinvest' : 'invest',
          amount,
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

  const createDeposit = async (amount: number, currency: 'BTC' | 'USDT'): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount,
          currency,
          status: 'pending',
        });

      if (error) throw error;

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
    createDeposit,
    fetchUserData,
    isLoading,
  };

  return <InvestmentContext.Provider value={value}>{children}</InvestmentContext.Provider>;
};