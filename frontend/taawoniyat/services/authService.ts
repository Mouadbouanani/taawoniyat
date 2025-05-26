import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8080/api/users';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  city: string;
  region: string;
  address: string;
  phone: string;
  businessName?: string; // Optional for sellers
  products?: Product[]; // Optional for sellers
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  sellerId: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and tokens in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        return data;
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      throw error;
    }
  },

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) return false;

      // Check if token is valid
      const response = await fetch(`${API_BASE_URL}/validate-token`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        return refreshed;
      }

      return true;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  },

  async registerClient(userData: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    region: string;
    city: string;
    address: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/register/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async registerSeller(userData: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    region: string;
    city: string;
    address: string;
    businessName: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/register/seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/exists/email/${email}`);
      return await response.json();
    } catch (error) {
      console.error('Check email exists error:', error);
      throw error;
    }
  },

  async getUserDetails(): Promise<User> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await response.json();
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Get user details error:', error);
      throw error;
    }
  },

  async getSellerProducts(): Promise<Product[]> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${API_BASE_URL}/seller/products`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch seller products');
      }

      return await response.json();
    } catch (error) {
      console.error('Get seller products error:', error);
      throw error;
    }
  },
}; 