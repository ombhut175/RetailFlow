// Admin API functions for user management

import { apiClient } from './apiClient';
import {
  User,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  QueryUsersRequest,
  UserRole,
} from '@/types/admin';
import { StandardApiResponse } from '@/types/api';
import { AxiosResponse } from 'axios';

const BASE_PATH = 'admin/users';

export const adminApi = {
  /**
   * Get all users with pagination, filtering, and sorting
   */
  getUsers: async (params: QueryUsersRequest = {}): Promise<UserListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.role) searchParams.set('role', params.role);
    if (params.email) searchParams.set('email', params.email);
    if (params.isEmailVerified !== undefined) searchParams.set('isEmailVerified', params.isEmailVerified.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const response: AxiosResponse<StandardApiResponse<UserListResponse>> = await apiClient.get(
      `${BASE_PATH}?${searchParams.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response: AxiosResponse<StandardApiResponse<User>> = await apiClient.get(`${BASE_PATH}/${id}`);
    return response.data.data;
  },

  /**
   * Create new user
   */
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response: AxiosResponse<StandardApiResponse<User>> = await apiClient.post(BASE_PATH, userData);
    return response.data.data;
  },

  /**
   * Update existing user
   */
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    const response: AxiosResponse<StandardApiResponse<User>> = await apiClient.put(`${BASE_PATH}/${id}`, userData);
    return response.data.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response: AxiosResponse<StandardApiResponse<{ message: string }>> = await apiClient.delete(`${BASE_PATH}/${id}`);
    return response.data.data;
  },

  /**
   * Get users by role
   */
  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    const response: AxiosResponse<StandardApiResponse<User[]>> = await apiClient.get(`${BASE_PATH}/role/${role}`);
    return response.data.data;
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<{
    totalUsers: number;
    usersByRole: Record<UserRole, number>;
    verifiedUsers: number;
    unverifiedUsers: number;
  }> => {
    // Get all users to calculate stats (in a real app, this would be a separate endpoint)
    const allUsers = await adminApi.getUsers({ limit: 1000 });
    
    const stats = {
      totalUsers: allUsers.total,
      usersByRole: {
        ADMIN: 0,
        MANAGER: 0,
        STAFF: 0,
      } as Record<UserRole, number>,
      verifiedUsers: 0,
      unverifiedUsers: 0,
    };

    allUsers.users.forEach(user => {
      // Count by role
      if (user.role?.role) {
        stats.usersByRole[user.role.role]++;
      }

      // Count by verification status
      if (user.isEmailVerified) {
        stats.verifiedUsers++;
      } else {
        stats.unverifiedUsers++;
      }
    });

    return stats;
  },
};