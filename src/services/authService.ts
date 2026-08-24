import apiClient from './apiClient';
import { ApiResponse, AuthData, LoginRequest, RegisterRequest } from '../types/models';

/**
 * Service handling all authentication endpoints
 */
export const authService = {
  /**
   * Log in user with email and password
   */
  async login(payload: LoginRequest): Promise<AuthData> {
    const response = await apiClient.post<ApiResponse<AuthData>>('/auth/login', {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Login failed');
  },

  /**
   * Register new user account
   */
  async register(payload: RegisterRequest): Promise<AuthData> {
    const response = await apiClient.post<ApiResponse<AuthData>>('/auth/register', {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role || 'CITIZEN',
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Registration failed');
  },
};

export default authService;
