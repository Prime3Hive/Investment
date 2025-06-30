// API functions disabled - backend server removed
// All API calls will return mock data or throw errors

const API_BASE_URL = 'http://localhost:5000/api';

// Mock user for development
const mockUser = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
  balance: 10000,
  totalInvested: 5000,
  totalEarnings: 750
};

export const api = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    console.warn('Backend server removed - using mock authentication');
    return { user: mockUser, token: 'mock-token' };
  },

  register: async (email: string, password: string, name: string) => {
    console.warn('Backend server removed - using mock registration');
    return { user: mockUser, token: 'mock-token' };
  },

  logout: async () => {
    console.warn('Backend server removed - mock logout');
    return { success: true };
  },

  // User endpoints
  getProfile: async () => {
    console.warn('Backend server removed - returning mock profile');
    return mockUser;
  },

  updateProfile: async (data: any) => {
    console.warn('Backend server removed - mock profile update');
    return { ...mockUser, ...data };
  },

  // Investment endpoints
  getInvestments: async () => {
    console.warn('Backend server removed - returning mock investments');
    return [
      {
        id: '1',
        planName: 'Basic Plan',
        amount: 1000,
        expectedReturn: 1200,
        duration: 30,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
  },

  createInvestment: async (data: any) => {
    console.warn('Backend server removed - mock investment creation');
    return {
      id: Date.now().toString(),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  },

  // Deposit endpoints
  getDeposits: async () => {
    console.warn('Backend server removed - returning mock deposits');
    return [
      {
        id: '1',
        amount: 1000,
        status: 'completed',
        createdAt: new Date().toISOString()
      }
    ];
  },

  createDeposit: async (data: any) => {
    console.warn('Backend server removed - mock deposit creation');
    return {
      id: Date.now().toString(),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  },

  // Investment plans
  getInvestmentPlans: async () => {
    console.warn('Backend server removed - returning mock investment plans');
    return [
      {
        id: '1',
        name: 'Basic Plan',
        minAmount: 100,
        maxAmount: 5000,
        returnRate: 20,
        duration: 30,
        description: 'Low risk, steady returns'
      },
      {
        id: '2',
        name: 'Premium Plan',
        minAmount: 1000,
        maxAmount: 25000,
        returnRate: 35,
        duration: 60,
        description: 'Medium risk, higher returns'
      },
      {
        id: '3',
        name: 'Elite Plan',
        minAmount: 5000,
        maxAmount: 100000,
        returnRate: 50,
        duration: 90,
        description: 'High risk, maximum returns'
      }
    ];
  }
};

export default api;