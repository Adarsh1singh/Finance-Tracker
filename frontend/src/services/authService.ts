import { apiService, type ApiResponse } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data!;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', credentials);
    
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data!;
  }

  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await apiService.get('/auth/validate');
      return response.success;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<{ user: User }>('/auth/profile');
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    }
    throw new Error('Failed to get profile');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();
