import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  createDepositRequest: (userId: string, amount: number, currency: 'BTC' | 'USDT') => Promise<void>;
  createWithdrawalRequest: (userId: string, amount: number, currency: 'BTC' | 'USDT', walletAddress: string) => Promise<void>;
  updateDepositStatus: (depositId: string, status: 'pending' | 'confirmed' | 'rejected', userId: string) => Promise<void>;
  updateWithdrawalStatus: (withdrawalId: string, status: 'pending' | 'approved' | 'completed' | 'rejected', userId: string) => Promise<void>;
  getUserInvestments: (userId: string) => Investment[];
  getUserTransactions: (userId: string) => Transaction[];
  getAllUsers: () => Promise<any[]>;
  updateUserBalance: (userId: string, amount: number) => Promise<void>;
  updateUserStatus: (userId: string, status: 'active' | 'deactivated' | 'banned') => Promise<void>;
  refreshData: (specificData?: string[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if component is mounted
  const mountedRef = useRef(true);

  // Cache to prevent unnecessary refetches
  const [dataCache, setDataCache] = useState<{
    investmentPlans?: number;
    investments?: number;
    deposits?: number;
    withdrawals?: number;
    transactions?: number;
  }>({});
  const CACHE_DURATION = 60000; // 60 seconds

  // Helper function for retry logic with exponential backoff
  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3, delay = 1000) => {
    let retries = 0;
    let lastError;
    
    while (retries < maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        console.log(`Retry ${retries + 1}/${maxRetries} failed: ${error.message || 'Unknown error'}`);
        
        // If we're rate limited (429), wait much longer
        const waitTime = error?.status === 429 
          ? delay * Math.pow(3, retries) + Math.random() * 2000 // More aggressive exponential backoff with jitter
          : delay * Math.pow(1.5, retries) + Math.random() * 500; // Still add some backoff for other errors
        
        console.log(`Waiting ${Math.round(waitTime/1000)} seconds before retry ${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        retries++;
      }
    }
    
    console.error(`All ${maxRetries} retries failed`);
    throw lastError || new Error('Operation failed after retries');
  };
  
  // Initialize data when component mounts or user changes
  useEffect(() => {
    mountedRef.current = true;
    let loadingTimer: ReturnType<typeof setTimeout>;
    
    const initializeData = async () => {
      if (!mountedRef.current) return;
      
      try {
        console.log('🔄 Initializing data context...');
        setIsLoading(true);
        setError(null);
        
        const now = Date.now();
        
        // Set a minimum loading time to prevent flickering
        loadingTimer = setTimeout(() => {
          if (mountedRef.current) setIsLoading(false);
        }, 1000);
        
        // Initialize empty arrays to prevent rendering errors
        setInvestmentPlans([]);
        setInvestments([]);
        setTransactions([]);
        setDepositRequests([]);
        setWithdrawalRequests([]);
        
        // Step 1: Always fetch investment plans (public data) first
        try {
          if (!dataCache.investmentPlans || (now - (dataCache.investmentPlans || 0) > CACHE_DURATION)) {
            await retryOperation(() => fetchInvestmentPlans(), 3, 1000);
            if (mountedRef.current) {
              setDataCache(prev => ({ ...prev, investmentPlans: now }));
            }
          }
        } catch (err) {
          console.error('Failed to fetch investment plans:', err);
          // Don't throw, continue with other data
        }
        
        // Only fetch user-specific data if logged in
        if (user && mountedRef.current) {
          console.log('👤 User found, fetching user-specific data...');
          
          // Step 2: Fetch critical data first - investments
          try {
            if (!dataCache.investments || (now - (dataCache.investments || 0) > CACHE_DURATION)) {
              await retryOperation(() => fetchInvestments(), 3, 1000);
              if (mountedRef.current) {
                setDataCache(prev => ({ ...prev, investments: now }));
              }
            }
          } catch (err) {
            console.error('Failed to fetch investments:', err);
          }
          
          // Step 3: Fetch transactions with a small delay
          try {
            if (!dataCache.transactions || (now - (dataCache.transactions || 0) > CACHE_DURATION)) {
              await new Promise(resolve => setTimeout(resolve, 300));
              if (mountedRef.current) {
                await retryOperation(() => fetchTransactions(), 3, 1000);
                setDataCache(prev => ({ ...prev, transactions: now }));
              }
            }
          } catch (err) {
            console.error('Failed to fetch transactions:', err);
          }
          
          // Step 4: Fetch remaining data with delays between calls
          try {
            if (!dataCache.deposits || (now - (dataCache.deposits || 0) > CACHE_DURATION)) {
              await new Promise(resolve => setTimeout(resolve, 300));
              if (mountedRef.current) {
                await retryOperation(() => fetchDepositRequests(), 3, 1000);
                setDataCache(prev => ({ ...prev, deposits: now }));
              }
            }
          } catch (err) {
            console.error('Failed to fetch deposits:', err);
          }
          
          try {
            if (!dataCache.withdrawals || (now - (dataCache.withdrawals || 0) > CACHE_DURATION)) {
              await new Promise(resolve => setTimeout(resolve, 300));
              if (mountedRef.current) {
                await retryOperation(() => fetchWithdrawalRequests(), 3, 1000);
                setDataCache(prev => ({ ...prev, withdrawals: now }));
              }
            }
          } catch (err) {
            console.error('Failed to fetch withdrawals:', err);
          }
        }
        
        console.log('✅ Data initialization complete');
      } catch (error) {
        console.error('❌ Error initializing data:', error);
        if (mountedRef.current) {
          setError('Failed to load data. Please refresh the page.');
        }
      } finally {
        // Clear the loading timer if it hasn't fired yet
        if (loadingTimer) clearTimeout(loadingTimer);
        if (mountedRef.current) setIsLoading(false);
      }
    };
    
    initializeData();
    
    return () => {
      mountedRef.current = false;
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [user?.id]); // Only depend on user ID to prevent unnecessary refetches

  const refreshData = async (specificData?: string[]) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('🔄 Refreshing data...', specificData || 'all');
      setIsLoading(true);
      setError(null);
      
      const now = Date.now();
      
      // If specific data types are requested, only refresh those
      if (specificData && specificData.length > 0) {
        // Stagger API calls to avoid rate limiting
        for (const dataType of specificData) {
          if (!mountedRef.current) break;
          
          try {
            switch (dataType) {
              case 'investmentPlans':
                await retryOperation(() => fetchInvestmentPlans(), 3, 1000);
                if (mountedRef.current) {
                  setDataCache(prev => ({ ...prev, investmentPlans: now }));
                }
                break;
              case 'investments':
                await retryOperation(() => fetchInvestments(), 3, 1000);
                if (mountedRef.current) {
                  setDataCache(prev => ({ ...prev, investments: now }));
                }
                break;
              case 'deposits':
                await retryOperation(() => fetchDepositRequests(), 3, 1000);
                if (mountedRef.current) {
                  setDataCache(prev => ({ ...prev, deposits: now }));
                }
                break;
              case 'withdrawals':
                await retryOperation(() => fetchWithdrawalRequests(), 3, 1000);
                if (mountedRef.current) {
                  setDataCache(prev => ({ ...prev, withdrawals: now }));
                }
                break;
              case 'transactions':
                await retryOperation(() => fetchTransactions(), 3, 1000);
                if (mountedRef.current) {
                  setDataCache(prev => ({ ...prev, transactions: now }));
                }
                break;
              default:
                break;
            }
          } catch (err) {
            console.error(`Failed to refresh ${dataType}:`, err);
            // Continue with other data types even if one fails
          }
          
          // Add a delay between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        // Refresh all data by re-running initialization
        const initializeData = async () => {
          const now = Date.now();
          
          // Reset cache to force refresh
          setDataCache({});
          
          try {
            await retryOperation(() => fetchInvestmentPlans(), 3, 1000);
            if (mountedRef.current) {
              setDataCache(prev => ({ ...prev, investmentPlans: now }));
            }
          } catch (err) {
            console.error('Failed to refresh investment plans:', err);
          }
          
          if (user && mountedRef.current) {
            try {
              await retryOperation(() => fetchInvestments(), 3, 1000);
              if (mountedRef.current) {
                setDataCache(prev => ({ ...prev, investments: now }));
              }
            } catch (err) {
              console.error('Failed to refresh investments:', err);
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            try {
              await retryOperation(() => fetchTransactions(), 3, 1000);
              if (mountedRef.current) {
                setDataCache(prev => ({ ...prev, transactions: now }));
              }
            } catch (err) {
              console.error('Failed to refresh transactions:', err);
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            try {
              await retryOperation(() => fetchDepositRequests(), 3, 1000);
              if (mountedRef.current) {
                setDataCache(prev => ({ ...prev, deposits: now }));
              }
            } catch (err) {
              console.error('Failed to refresh deposits:', err);
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            try {
              await retryOperation(() => fetchWithdrawalRequests(), 3, 1000);
              if (mountedRef.current) {
                setDataCache(prev => ({ ...prev, withdrawals: now }));
              }
            } catch (err) {
              console.error('Failed to refresh withdrawals:', err);
            }
          }
        };
        
        await initializeData();
      }
      
      console.log('✅ Data refresh complete');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      if (mountedRef.current) {
        setError('Failed to refresh data. Please try again.');
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  const fetchInvestmentPlans = async () => {
    try {
      console.log('📋 Fetching investment plans...');
      const { data, error } = await supabase
        .from('investment_plans')
        .select('id, name, min_amount, max_amount, roi, duration_hours, description, is_active')
        .eq('is_active', true)
        .order('min_amount');

      if (error) throw error;

      const plans: InvestmentPlan[] = data.map(plan => ({
        id: plan.id,
        name: plan.name,
        minAmount: parseFloat(plan.min_amount),
        maxAmount: parseFloat(plan.max_amount),
        roi: parseFloat(plan.roi),
        duration: plan.duration_hours,
        description: plan.description,
        isActive: plan.is_active
      }));

      if (mountedRef.current) {
        setInvestmentPlans(plans);
        console.log('✅ Investment plans fetched:', plans.length);
      }
    } catch (error) {
      console.error('❌ Error fetching investment plans:', error);
      throw error;
    }
  };

  const fetchInvestments = async () => {
    if (!user) return;

    try {
      console.log('📋 Fetching investments...');
      const { data, error } = await supabase
        .from('investments')
        .select(`
          id, user_id, plan_id, amount, start_date, end_date, roi, status,
          investment_plans (id, name, min_amount, max_amount, roi, duration_hours, is_active)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const userInvestments: Investment[] = data.map((inv: any) => ({
        id: inv.id,
        userId: inv.user_id,
        planId: inv.plan_id,
        amount: parseFloat(inv.amount),
        startDate: new Date(inv.start_date),
        endDate: new Date(inv.end_date),
        roi: parseFloat(inv.roi),
        status: inv.status,
        plan: {
          id: inv.investment_plans.id,
          name: inv.investment_plans.name,
          minAmount: parseFloat(inv.investment_plans.min_amount),
          maxAmount: parseFloat(inv.investment_plans.max_amount),
          roi: parseFloat(inv.investment_plans.roi),
          duration: inv.investment_plans.duration_hours,
          description: inv.investment_plans.description || '',
          isActive: inv.investment_plans.is_active
        }
      }));

      if (mountedRef.current) {
        setInvestments(userInvestments);
        console.log('✅ Investments fetched:', userInvestments.length);
      }
    } catch (error) {
      console.error('❌ Error fetching investments:', error);
      throw error;
    }
  };

  const fetchDepositRequests = async () => {
    if (!user) return;

    try {
      console.log('📋 Fetching deposit requests...');
      let query;
      
      if (user.isAdmin) {
        query = supabase
          .from('deposit_requests')
          .select(`
            id, user_id, amount, currency, wallet_address, status, created_at,
            profiles (name)
          `)
          .order('created_at', { ascending: false })
          .limit(50);
      } else {
        query = supabase
          .from('deposit_requests')
          .select('id, user_id, amount, currency, wallet_address, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
      }

      const { data, error } = await query;

      if (error) throw error;

      const deposits: DepositRequest[] = data.map((deposit: any) => ({
        id: deposit.id,
        userId: deposit.user_id,
        amount: parseFloat(deposit.amount),
        currency: deposit.currency,
        walletAddress: deposit.wallet_address,
        status: deposit.status,
        createdAt: new Date(deposit.created_at),
        userName: user.isAdmin ? (deposit.profiles?.name || 'Unknown') : user.name || 'Unknown'
      }));

      if (mountedRef.current) {
        setDepositRequests(deposits);
        console.log('✅ Deposit requests fetched:', deposits.length);
      }
    } catch (error) {
      console.error('❌ Error fetching deposit requests:', error);
      throw error;
    }
  };

  const fetchWithdrawalRequests = async () => {
    if (!user) return;

    try {
      console.log('📋 Fetching withdrawal requests...');
      let query;
      
      if (user.isAdmin) {
        query = supabase
          .from('withdrawal_requests')
          .select(`
            id, user_id, amount, currency, wallet_address, status, created_at,
            profiles (name)
          `)
          .order('created_at', { ascending: false })
          .limit(50);
      } else {
        query = supabase
          .from('withdrawal_requests')
          .select('id, user_id, amount, currency, wallet_address, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
      }

      const { data, error } = await query;

      if (error) throw error;

      const withdrawals: WithdrawalRequest[] = data.map((withdrawal: any) => ({
        id: withdrawal.id,
        userId: withdrawal.user_id,
        amount: parseFloat(withdrawal.amount),
        currency: withdrawal.currency,
        walletAddress: withdrawal.wallet_address,
        status: withdrawal.status,
        createdAt: new Date(withdrawal.created_at),
        userName: user.isAdmin ? (withdrawal.profiles?.name || 'Unknown') : user.name || 'Unknown'
      }));

      if (mountedRef.current) {
        setWithdrawalRequests(withdrawals);
        console.log('✅ Withdrawal requests fetched:', withdrawals.length);
      }
    } catch (error) {
      console.error('❌ Error fetching withdrawal requests:', error);
      throw error;
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      console.log('📋 Fetching transactions...');
      let query = supabase
        .from('transactions')
        .select('id, user_id, type, amount, status, created_at, description');

      if (!user.isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const userTransactions: Transaction[] = data.map((transaction: any) => ({
        id: transaction.id,
        userId: transaction.user_id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        status: transaction.status,
        createdAt: new Date(transaction.created_at),
        description: transaction.description
      }));

      if (mountedRef.current) {
        setTransactions(userTransactions);
        console.log('✅ Transactions fetched:', userTransactions.length);
      }
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      throw error;
    }
  };

  const updateInvestmentPlans = async (plans: InvestmentPlan[]) => {
    if (mountedRef.current) {
      setInvestmentPlans(plans);
    }
  };

  const createInvestment = async (planId: string, amount: number, userId: string): Promise<boolean> => {
    try {
      console.log('💰 Creating investment...');
      const plan = investmentPlans.find(p => p.id === planId);
      if (!plan || amount < plan.minAmount || amount > plan.maxAmount) {
        throw new Error('Invalid plan or amount');
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

      if (investmentError) throw investmentError;

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
        console.error('❌ Error creating transaction:', transactionError);
      }

      // Update user balance using SQL function to prevent race conditions
      const { error: balanceError } = await supabase.rpc('update_user_balance', {
        user_id: userId,
        amount_change: -amount
      });

      if (balanceError) throw balanceError;

      await refreshData();
      console.log('✅ Investment created successfully');
      return true;
    } catch (error) {
      console.error('❌ Error creating investment:', error);
      return false;
    }
  };

  const createDepositRequest = async (userId: string, amount: number, currency: 'BTC' | 'USDT') => {
    try {
      console.log('💳 Creating deposit request...');
      const { error: depositError } = await supabase
        .from('deposit_requests')
        .insert({
          user_id: userId,
          amount,
          currency,
          wallet_address: walletAddresses[currency]
        });

      if (depositError) throw depositError;

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
        console.error('❌ Error creating transaction:', transactionError);
      }

      await refreshData();
      console.log('✅ Deposit request created successfully');
    } catch (error) {
      console.error('❌ Error creating deposit request:', error);
      throw error;
    }
  };

  const createWithdrawalRequest = async (userId: string, amount: number, currency: 'BTC' | 'USDT', walletAddress: string) => {
    try {
      console.log('💸 Creating withdrawal request...');
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: userId,
          amount,
          currency,
          wallet_address: walletAddress
        });

      if (withdrawalError) throw withdrawalError;

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
        console.error('❌ Error creating transaction:', transactionError);
      }

      await refreshData();
      console.log('✅ Withdrawal request created successfully');
    } catch (error) {
      console.error('❌ Error creating withdrawal request:', error);
      throw error;
    }
  };

  const updateDepositStatus = async (depositId: string, status: 'pending' | 'confirmed' | 'rejected', userId: string) => {
    try {
      console.log('📝 Updating deposit status...');
      // Update deposit status
      const { error: updateError } = await supabase
        .from('deposit_requests')
        .update({ status })
        .eq('id', depositId);

      if (updateError) throw updateError;

      // If confirmed and userId provided, update user balance
      if (status === 'confirmed' && userId) {
        const { data: deposit, error: fetchError } = await supabase
          .from('deposit_requests')
          .select('amount')
          .eq('id', depositId)
          .single();

        if (!fetchError && deposit) {
          const { error: balanceError } = await supabase.rpc('update_user_balance', {
            user_id: userId,
            amount_change: parseFloat(deposit.amount)
          });

          if (balanceError) {
            console.error('❌ Error updating balance:', balanceError);
          }

          // Update transaction status
          const { error: transactionError } = await supabase
            .from('transactions')
            .update({ status: status === 'confirmed' ? 'completed' : 'failed' })
            .eq('user_id', userId)
            .eq('type', 'deposit')
            .eq('status', 'pending')
            .eq('amount', parseFloat(deposit.amount));

          if (transactionError) {
            console.error('❌ Error updating transaction:', transactionError);
          }
        }
      }

      await refreshData();
      console.log('✅ Deposit status updated successfully');
    } catch (error) {
      console.error('❌ Error updating deposit status:', error);
      throw error;
    }
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: 'pending' | 'approved' | 'completed' | 'rejected', userId: string) => {
    try {
      console.log('📝 Updating withdrawal status...');
      // Update withdrawal status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({ status })
        .eq('id', withdrawalId);

      if (updateError) throw updateError;

      // If approved and userId provided, deduct from user balance
      if (status === 'approved' && userId) {
        const { data: withdrawal, error: fetchError } = await supabase
          .from('withdrawal_requests')
          .select('amount')
          .eq('id', withdrawalId)
          .single();

        if (!fetchError && withdrawal) {
          const { error: balanceError } = await supabase.rpc('update_user_balance', {
            user_id: userId,
            amount_change: -parseFloat(withdrawal.amount)
          });

          if (balanceError) {
            console.error('❌ Error updating balance:', balanceError);
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
          console.error('❌ Error updating transaction:', transactionError);
        }
      }

      await refreshData();
      console.log('✅ Withdrawal status updated successfully');
    } catch (error) {
      console.error('❌ Error updating withdrawal status:', error);
      throw error;
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
      console.log('👥 Fetching all users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      console.log('✅ All users fetched:', data.length);
      return data.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: '', // Email is not stored in profiles table
        btcWallet: profile.btc_wallet,
        usdtWallet: profile.usdt_wallet,
        balance: parseFloat(profile.balance),
        isAdmin: profile.is_admin,
        status: profile.status || 'active',
        createdAt: new Date(profile.created_at)
      }));
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }
  };

  const updateUserBalance = async (userId: string, amount: number) => {
    try {
      console.log('💰 Updating user balance...');
      const { error } = await supabase.rpc('update_user_balance', {
        user_id: userId,
        amount_change: amount
      });

      if (error) throw error;
      console.log('✅ User balance updated successfully');
    } catch (error) {
      console.error('❌ Error updating user balance:', error);
      throw error;
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'deactivated' | 'banned') => {
    try {
      console.log('📝 Updating user status...');
      const { error } = await supabase.rpc('update_user_status', {
        user_id: userId,
        new_status: status
      });

      if (error) throw error;
      
      // Refresh user data after status change
      await refreshData();
      console.log('✅ User status updated successfully');
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      throw error;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
    updateUserStatus,
    refreshData,
    isLoading,
    error
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};