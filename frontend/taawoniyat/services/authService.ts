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
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
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
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      throw error;
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

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user');
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

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/exists/email/${email}`);
      return await response.json();
    } catch (error) {
      console.error('Check email exists error:', error);
      throw error;
    }
  },
}; 