import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roi: number;
  duration: number; // in hours
  description: string;
  isActive: boolean;
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  roi: number;
  status: 'active' | 'completed' | 'cancelled';
  plan: InvestmentPlan;
}

export interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  currency: 'BTC' | 'USDT';
  walletAddress: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: Date;
  userName: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  currency: 'BTC' | 'USDT';
  walletAddress: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  createdAt: Date;
  userName: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'investment' | 'profit' | 'reinvestment' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  description: string;
}

interface DataContextType {
  investmentPlans: InvestmentPlan[];
  investments: Investment[];
  depositRequests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  transactions: Transaction[];
  walletAddresses: { BTC: string; USDT: string };
  updateInvestmentPlans: (plans: InvestmentPlan[]) => Promise<void>;
  createInvestment: (planId: string, amount: number, userId: string) => Promise<boolean>;
  createDepositRequest: (userId: string, amount: number, currency: 'BTC' | 'USDT', userName: string) => Promise<void>;
  createWithdrawalRequest: (userId: string, amount: number, currency: 'BTC' | 'USDT', walletAddress: string, userName: string) => Promise<void>;
  updateDepositStatus: (depositId: string, status: 'pending' | 'confirmed' | 'rejected', userId?: string) => Promise<void>;
  updateWithdrawalStatus: (withdrawalId: string, status: 'pending' | 'approved' | 'completed' | 'rejected', userId?: string) => Promise<void>;
  getUserInvestments: (userId: string) => Investment[];
  getUserTransactions: (userId: string) => Transaction[];
  getAllUsers: () => Promise<any[]>;
  updateUserBalance: (userId: string, amount: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const walletAddresses = {
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  USDT: '0x742D35Cc6634C0532925a3b8D49D6b5A0e65e8C6'
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = async () => {
    await Promise.all([
      fetchInvestmentPlans(),
      fetchInvestments(),
      fetchDepositRequests(),
      fetchWithdrawalRequests(),
      fetchTransactions()
    ]);
  };

  const fetchInvestmentPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('is_active', true)
        .order('min_amount');

      if (error) {
        console.error('Error fetching investment plans:', error);
        return;
      }

      const plans: InvestmentPlan[] = data.map(plan => ({
        id: plan.id,
        name: plan.name,
        minAmount: plan.min_amount,
        maxAmount: plan.max_amount,
        roi: plan.roi,
        duration: plan.duration_hours,
        description: plan.description,
        isActive: plan.is_active
      }));

      setInvestmentPlans(plans);
    } catch (error) {
      console.error('Error fetching investment plans:', error);
    }
  };

  const fetchInvestments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          investment_plans (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching investments:', error);
        return;
      }

      const userInvestments: Investment[] = data.map(inv => ({
        id: inv.id,
        userId: inv.user_id,
        planId: inv.plan_id,
        amount: inv.amount,
        startDate: new Date(inv.start_date),
        endDate: new Date(inv.end_date),
        roi: inv.roi,
        status: inv.status,
        plan: {
          id: inv.investment_plans.id,
          name: inv.investment_plans.name,
          minAmount: inv.investment_plans.min_amount,
          maxAmount: inv.investment_plans.max_amount,
          roi: inv.investment_plans.roi,
          duration: inv.investment_plans.duration_hours,
          description: inv.investment_plans.description,
          isActive: inv.investment_plans.is_active
        }
      }));

      setInvestments(userInvestments);
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const fetchDepositRequests = async () => {
    if (!user) return;

    try {
      let query = supabase.from('deposit_requests').select(`
        *,
        profiles (name)
      `);

      if (!user.isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deposit requests:', error);
        return;
      }

      const deposits: DepositRequest[] = data.map(deposit => ({
        id: deposit.id,
        userId: deposit.user_id,
        amount: deposit.amount,
        currency: deposit.currency,
        walletAddress: deposit.wallet_address,
        status: deposit.status,
        createdAt: new Date(deposit.created_at),
        userName: deposit.profiles?.name || 'Unknown'
      }));

      setDepositRequests(deposits);
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
    }
  };

  const fetchWithdrawalRequests = async () => {
    if (!user) return;

    try {
      let query = supabase.from('withdrawal_requests').select(`
        *,
        profiles (name)
      `);

      if (!user.isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching withdrawal requests:', error);
        return;
      }

      const withdrawals: WithdrawalRequest[] = data.map(withdrawal => ({
        id: withdrawal.id,
        userId: withdrawal.user_id,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        walletAddress: withdrawal.wallet_address,
        status: withdrawal.status,
        createdAt: new Date(withdrawal.created_at),
        userName: withdrawal.profiles?.name || 'Unknown'
      }));

      setWithdrawalRequests(withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      let query = supabase.from('transactions').select('*');

      if (!user.isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      const userTransactions: Transaction[] = data.map(transaction => ({
        id: transaction.id,
        userId: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: new Date(transaction.created_at),
        description: transaction.description
      }));

      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const updateInvestmentPlans = async (plans: InvestmentPlan[]) => {
    // This would be implemented for admin functionality
    setInvestmentPlans(plans);
  };

  const createInvestment = async (planId: string, amount: number, userId: string): Promise<boolean> => {
    try {
      const plan = investmentPlans.find(p => p.id === planId);
      if (!plan || amount < plan.minAmount || amount > plan.maxAmount) {
        return false;
      }

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + plan.duration * 60 * 60 * 1000);

      // Create investment
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          plan_id: planId,
          amount,
          end_date: endDate.toISOString(),
          roi: plan.roi
        });

      if (investmentError) {
        console.error('Error creating investment:', investmentError);
        return false;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'investment',
          amount,
          status: 'completed',
          description: `Investment in ${plan.name} plan`
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      }

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: supabase.sql`balance - ${amount}` })
        .eq('id', userId);

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        return false;
      }

      await refreshData();
      return true;
    } catch (error) {
      console.error('Error creating investment:', error);
      return false;
    }
  };

  const createDepositRequest = async (userId: string, amount: number, currency: 'BTC' | 'USDT', userName: string) => {
    try {
      const { error: depositError } = await supabase
        .from('deposit_requests')
        .insert({
          user_id: userId,
          amount,
          currency,
          wallet_address: walletAddresses[currency]
        });

      if (depositError) {
        console.error('Error creating deposit request:', depositError);
        return;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          amount,
          status: 'pending',
          description: `${currency} deposit request`
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      }

      await refreshData();
    } catch (error) {
      console.error('Error creating deposit request:', error);
    }
  };

  const createWithdrawalRequest = async (userId: string, amount: number, currency: 'BTC' | 'USDT', walletAddress: string, userName: string) => {
    try {
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: userId,
          amount,
          currency,
          wallet_address: walletAddress
        });

      if (withdrawalError) {
        console.error('Error creating withdrawal request:', withdrawalError);
        return;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'withdrawal',
          amount,
          status: 'pending',
          description: `${currency} withdrawal request`
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      }

      await refreshData();
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
    }
  };

  const updateDepositStatus = async (depositId: string, status: 'pending' | 'confirmed' | 'rejected', userId?: string) => {
    try {
      // Update deposit status
      const { error: updateError } = await supabase
        .from('deposit_requests')
        .update({ status })
        .eq('id', depositId);

      if (updateError) {
        console.error('Error updating deposit:', updateError);
        return;
      }

      // If confirmed and userId provided, update user balance
      if (status === 'confirmed' && userId) {
        const { data: deposit, error: fetchError } = await supabase
          .from('deposit_requests')
          .select('amount')
          .eq('id', depositId)
          .single();

        if (!fetchError && deposit) {
          const { error: balanceError } = await supabase
            .from('profiles')
            .update({ balance: supabase.sql`balance + ${deposit.amount}` })
            .eq('id', userId);

          if (balanceError) {
            console.error('Error updating balance:', balanceError);
          }

          // Update transaction status
          const { error: transactionError } = await supabase
            .from('transactions')
            .update({ status: status === 'confirmed' ? 'completed' : 'failed' })
            .eq('user_id', userId)
            .eq('type', 'deposit')
            .eq('status', 'pending');

          if (transactionError) {
            console.error('Error updating transaction:', transactionError);
          }
        }
      }

      await refreshData();
    } catch (error) {
      console.error('Error updating deposit status:', error);
    }
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: 'pending' | 'approved' | 'completed' | 'rejected', userId?: string) => {
    try {
      // Update withdrawal status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({ status })
        .eq('id', withdrawalId);

      if (updateError) {
        console.error('Error updating withdrawal:', updateError);
        return;
      }

      // If approved and userId provided, deduct from user balance
      if (status === 'approved' && userId) {
        const { data: withdrawal, error: fetchError } = await supabase
          .from('withdrawal_requests')
          .select('amount')
          .eq('id', withdrawalId)
          .single();

        if (!fetchError && withdrawal) {
          const { error: balanceError } = await supabase
            .from('profiles')
            .update({ balance: supabase.sql`balance - ${withdrawal.amount}` })
            .eq('id', userId);

          if (balanceError) {
            console.error('Error updating balance:', balanceError);
          }
        }
      }

      // Update transaction status
      if (userId) {
        let transactionStatus = 'pending';
        if (status === 'completed') transactionStatus = 'completed';
        if (status === 'rejected') transactionStatus = 'failed';

        const { error: transactionError } = await supabase
          .from('transactions')
          .update({ status: transactionStatus })
          .eq('user_id', userId)
          .eq('type', 'withdrawal')
          .eq('status', 'pending');

        if (transactionError) {
          console.error('Error updating transaction:', transactionError);
        }
      }

      await refreshData();
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
    }
  };

  const getUserInvestments = (userId: string): Investment[] => {
    return investments.filter(investment => investment.userId === userId);
  };

  const getUserTransactions = (userId: string): Transaction[] => {
    return transactions.filter(transaction => transaction.userId === userId);
  };

  const getAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: '', // Email is not stored in profiles table
        btcWallet: profile.btc_wallet,
        usdtWallet: profile.usdt_wallet,
        balance: profile.balance,
        isAdmin: profile.is_admin,
        createdAt: new Date(profile.created_at)
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const updateUserBalance = async (userId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ balance: supabase.sql`balance + ${amount}` })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user balance:', error);
      }
    } catch (error) {
      console.error('Error updating user balance:', error);
    }
  };

  const value: DataContextType = {
    investmentPlans,
    investments,
    depositRequests,
    withdrawalRequests,
    transactions,
    walletAddresses,
    updateInvestmentPlans,
    createInvestment,
    createDepositRequest,
    createWithdrawalRequest,
    updateDepositStatus,
    updateWithdrawalStatus,
    getUserInvestments,
    getUserTransactions,
    getAllUsers,
    updateUserBalance,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};