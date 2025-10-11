import * as SecureStore from 'expo-secure-store';
import { apiClient } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export class AuthService {
  async login(email: string, password: string) {
    try {
      const response = await apiClient.login(email, password);

      if (response.success && response.data) {
        await this.saveToken(response.data.token);
        await this.saveUser(response.data.user);
        apiClient.setToken(response.data.token);
        return response.data;
      }

      throw new Error('Login failed');
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await apiClient.logout();
    } catch (error) {
      // Continue with local logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      await this.clearToken();
      await this.clearUser();
      apiClient.clearToken();
    }
  }

  async authenticateWithGmail(accessToken: string, profile: any) {
    try {
      // Create payload for Gmail authentication
      const authPayload = {
        accessToken,
        provider: 'google',
        profile: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
        }
      };

      const response = await apiClient.authenticateWithGmail(authPayload);

      if (response.success && response.data) {
        await this.saveToken(response.data.token);
        await this.saveUser(response.data.user);
        apiClient.setToken(response.data.token);
        return response.data;
      }

      throw new Error('Gmail authentication failed');
    } catch (error) {
      console.error('Gmail authentication error:', error);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await apiClient.refreshToken();

      if (response.success && response.data) {
        await this.saveToken(response.data.token);
        apiClient.setToken(response.data.token);
        return response.data.token;
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      await this.logout();
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async saveToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  async clearToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  async getUser(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async saveUser(user: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async clearUser(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  }

  async initializeAuth(): Promise<boolean> {
    try {
      const token = await this.getToken();

      if (token) {
        apiClient.setToken(token);
        // Optionally verify token with API
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error initializing auth:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
