const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService(API_BASE_URL);

// Transaction API
export const transactionAPI = {
  getAll: (params?: any) => apiService.get(`/transactions${params ? `?${new URLSearchParams(params)}` : ''}`),
  getById: (id: number) => apiService.get(`/transactions/${id}`),
  create: (data: any) => apiService.post('/transactions', data),
  update: (id: number, data: any) => apiService.put(`/transactions/${id}`, data),
  delete: (id: number) => apiService.delete(`/transactions/${id}`)
};

// Category API
export const categoryAPI = {
  getAll: (type?: string) => apiService.get(`/categories${type ? `?type=${type}` : ''}`),
  create: (data: any) => apiService.post('/categories', data),
  update: (id: number, data: any) => apiService.put(`/categories/${id}`, data),
  delete: (id: number) => apiService.delete(`/categories/${id}`),
  createDefaults: () => apiService.post('/categories/create-defaults', {})
};

// Budget API
export const budgetAPI = {
  getAll: (params?: any) => {
    const queryParams = new URLSearchParams(params || {});
    return apiService.get(`/budgets?${queryParams}`);
  },
  getById: (id: number) => apiService.get(`/budgets/${id}`),
  create: (data: any) => apiService.post('/budgets', data),
  update: (id: number, data: any) => apiService.put(`/budgets/${id}`, data),
  delete: (id: number) => apiService.delete(`/budgets/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (period?: string) => apiService.get(`/analytics/dashboard${period ? `?period=${period}` : ''}`),
  getExpensesByCategory: (period?: string) => apiService.get(`/analytics/expenses-by-category${period ? `?period=${period}` : ''}`),
  getMonthlyTrends: (months?: number) => apiService.get(`/analytics/monthly-trends${months ? `?months=${months}` : ''}`),
  getTopSpendingCategories: (period?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (limit) params.append('limit', limit.toString());
    return apiService.get(`/analytics/top-spending-categories?${params}`);
  },
  getCumulativeBalance: (period?: string) => apiService.get(`/analytics/cumulative-balance${period ? `?period=${period}` : ''}`),
  exportData: (format?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (format) params.append('format', format);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiService.get(`/analytics/export?${params}`);
  }
};


