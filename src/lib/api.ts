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
      console.log(`API Request to: ${url}`, { method: options.method || 'GET' });
      const response = await fetch(url, config);
      
      // Check if the response is valid before trying to parse JSON
      if (!response) {
        throw new Error(`No response received from ${url}`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (parseError: unknown) {
        const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
        console.error('Failed to parse JSON response:', parseError);
        throw new Error(`Invalid JSON response from ${url}: ${errorMessage}`);
      }

      if (!response.ok) {
        console.error('API error response:', { 
          status: response.status, 
          statusText: response.statusText,
          data 
        });
        throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('API request failed:', { 
        url, 
        method: options.method || 'GET',
        error: errorMessage,
        stack: errorStack
      });
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

  async login({ email, password }: { email: string; password: string }) {
    console.log('Login attempt with:', { email, redactedPassword: '***' });
    
    try {
      const response = await this.request<{
        success: boolean;
        token: string;
        user: any;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response:', { success: response.success });
      
      if (response.success && response.token) {
        this.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Login error in API client:', error);
      throw error;
    }
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