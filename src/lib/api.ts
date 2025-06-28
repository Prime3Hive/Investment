const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    btcWallet: string;
    usdtWallet: string;
  }) {
    const response = await this.request<{
      success: boolean;
      token: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getProfile() {
    return this.request<{
      success: boolean;
      user: any;
    }>('/auth/profile');
  }

  async updateProfile(data: {
    name?: string;
    btcWallet?: string;
    usdtWallet?: string;
  }) {
    return this.request<{
      success: boolean;
      user: any;
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Investment endpoints
  async getInvestmentPlans() {
    return this.request<{
      success: boolean;
      data: any[];
    }>('/investments/plans');
  }

  async createInvestment(planId: string, amount: number) {
    return this.request<{
      success: boolean;
      data: any;
    }>('/investments', {
      method: 'POST',
      body: JSON.stringify({ planId, amount }),
    });
  }

  async getUserInvestments() {
    return this.request<{
      success: boolean;
      data: any[];
    }>('/investments');
  }

  async getInvestmentById(id: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/investments/${id}`);
  }

  // Deposit endpoints
  async createDepositRequest(amount: number, currency: 'BTC' | 'USDT') {
    return this.request<{
      success: boolean;
      data: any;
    }>('/deposits', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }

  async getUserDepositRequests() {
    return this.request<{
      success: boolean;
      data: any[];
    }>('/deposits');
  }

  // Admin endpoints
  async getAllDepositRequests(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<{
      success: boolean;
      data: any[];
      pagination: any;
    }>(`/deposits/admin/all${queryString ? `?${queryString}` : ''}`);
  }

  async processDepositRequest(
    id: string,
    data: {
      status: 'confirmed' | 'rejected';
      adminNotes?: string;
      transactionHash?: string;
    }
  ) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/deposits/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return this.request<{
      success: boolean;
      message: string;
      timestamp: string;
    }>('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;