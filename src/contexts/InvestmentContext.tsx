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

interface InvestmentContextType {
  plans: InvestmentPlan[];
  investments: Investment[];
  deposits: DepositRequest[];
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const data = await apiClient.getInvestmentPlans();
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
    }
  };

  const fetchUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch investments
      const investmentData = await apiClient.getUserInvestments();
      setInvestments(investmentData.map((inv: any) => ({
        id: inv._id,
        userId: inv.userId,
        planId: inv.planId,
        amount: inv.amount,
        roi: inv.roi,
        startDate: inv.createdAt,
        endDate: inv.endsAt,
        status: inv.status,
        plan: inv.plan ? {
          id: inv.plan._id,
          name: inv.plan.name,
          minAmount: inv.plan.minAmount,
          maxAmount: inv.plan.maxAmount,
          roi: inv.plan.roi,
          durationHours: inv.plan.durationHours,
          description: inv.plan.description || '',
          isActive: inv.plan.isActive,
        } : undefined,
      })));

      // Fetch deposit requests
      const depositData = await apiClient.getUserDeposits();
      setDeposits(depositData.map((dep: any) => ({
        id: dep._id,
        userId: dep.userId,
        amount: dep.amount,
        currency: dep.currency,
        walletAddress: dep.walletAddress,
        status: dep.status,
        createdAt: dep.createdAt,
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

      await apiClient.createInvestment({ planId, amount });
      toast.success('Investment created successfully!');
      await fetchUserData();
      return true;
    } catch (error: any) {
      console.error('Error creating investment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create investment';
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
      const errorMessage = error.response?.data?.message || 'Failed to submit deposit request';
      toast.error(errorMessage);
      return false;
    }
  };

  const value: InvestmentContextType = {
    plans,
    investments,
    deposits,
    createInvestment,
    createDepositRequest,
    fetchUserData,
    isLoading,
  };

  return <InvestmentContext.Provider value={value}>{children}</InvestmentContext.Provider>;
};