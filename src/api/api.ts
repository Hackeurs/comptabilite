const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}

interface AuthResponse {
  id: number;
  username: string;
  email?: string;
  role: 'ADMIN' | 'EMPLOYEE';
  businessName?: string;
  token: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email?: string;
  password: string;
  businessName?: string;
}

class ApiService {
  private token: string | null = null;
  private inMemoryToken: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = this.inMemoryToken;
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      this.token = token;
      this.inMemoryToken = token;
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async removeToken() {
    try {
      this.token = null;
      this.inMemoryToken = null;
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return { success: false, message: data.message || 'Une erreur est survenue' };
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await this.handleResponse<AuthResponse>(response);
      if (result.success && result.data?.token) {
        await this.saveToken(result.data.token);
      }
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await this.handleResponse<AuthResponse>(response);
      if (result.success && result.data?.token) {
        await this.saveToken(result.data.token);
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }

  async logout() {
    await this.removeToken();
  }

  async getMe(): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('GetMe error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const api = new ApiService();
