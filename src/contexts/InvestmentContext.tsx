import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';
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
  type: 'deposit' | 'investment' | 'profit' | 'reinvestment' | 'withdrawal';
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
      console.log('Fetching investment plans...');
      const data = await apiClient.getInvestmentPlans();
      console.log('Plans fetched successfully:', data);
      
      setPlans(data.map((plan: any) => ({
        id: plan._id,
        name: plan.name,
        minAmount: plan.minAmount,
        maxAmount: plan.maxAmount,
        roi: plan.roi,
        durationHours: plan.durationHours,
        description: plan.description || '',
        isActive: plan.isActive,
      })));
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load investment plans');
    }
  };

  const fetchUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Fetching user data...');
      
      // Fetch investments
      const investmentData = await apiClient.getUserInvestments();
      console.log('Investments fetched:', investmentData);
      
      setInvestments(investmentData.map((inv: any) => ({
        id: inv._id,
        userId: inv.userId,
        planId: inv.planId._id || inv.planId,
        amount: inv.amount,
        roi: inv.roi,
        startDate: inv.startDate || inv.createdAt,
        endDate: inv.endDate,
        status: inv.status,
        plan: inv.planId && typeof inv.planId === 'object' ? {
          id: inv.planId._id,
          name: inv.planId.name,
          minAmount: inv.planId.minAmount,
          maxAmount: inv.planId.maxAmount,
          roi: inv.planId.roi,
          durationHours: inv.planId.durationHours,
          description: inv.planId.description || '',
          isActive: inv.planId.isActive,
        } : undefined,
      })));

      // Fetch deposit requests
      const depositData = await apiClient.getUserDeposits();
      console.log('Deposits fetched:', depositData);
      
      setDeposits(depositData.map((dep: any) => ({
        id: dep._id,
        userId: dep.userId,
        amount: dep.amount,
        currency: dep.currency,
        walletAddress: dep.walletAddress,
        status: dep.status,
        createdAt: dep.createdAt,
      })));

      // Create mock transactions from investments and deposits for now
      const allTransactions: Transaction[] = [
        ...investmentData.map((inv: any) => ({
          id: `inv-${inv._id}`,
          userId: inv.userId,
          type: 'investment' as const,
          amount: inv.amount,
          status: 'completed' as const,
          description: `Investment in ${inv.planId?.name || 'plan'}`,
          createdAt: inv.createdAt,
        })),
        ...depositData.map((dep: any) => ({
          id: `dep-${dep._id}`,
          userId: dep.userId,
          type: 'deposit' as const,
          amount: dep.amount,
          status: dep.status === 'confirmed' ? 'completed' as const : 
                  dep.status === 'rejected' ? 'failed' as const : 'pending' as const,
          description: `${dep.currency} deposit - $${dep.amount}`,
          createdAt: dep.createdAt,
        }))
      ];

      setTransactions(allTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
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

      await apiClient.createInvestment({ planId, amount });
      toast.success('Investment created successfully!');
      await fetchUserData();
      return true;
    } catch (error: any) {
      console.error('Error creating investment:', error);
      const errorMessage = error.message || 'Failed to create investment';
      toast.error(errorMessage);
      return false;
    }
  };

  const createDepositRequest = async (amount: number, currency: 'BTC' | 'USDT'): Promise<boolean> => {
    if (!user) return false;

    try {
      await apiClient.createDeposit({ amount, currency });
      toast.success('Deposit request submitted! Please wait for admin confirmation.');
      await fetchUserData();
      return true;
    } catch (error: any) {
      console.error('Error creating deposit:', error);
      const errorMessage = error.message || 'Failed to submit deposit request';
      toast.error(errorMessage);
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