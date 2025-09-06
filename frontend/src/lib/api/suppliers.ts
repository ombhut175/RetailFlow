import { apiClient } from './apiClient';
import {
  Supplier,
  SupplierListResponse,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierFilters,
  SupplierStatsResponse
} from '@/types/suppliers';
import { AxiosResponse } from 'axios';
import hackLog from '@/lib/logger';

export class SuppliersApi {
  private static readonly BASE_PATH = 'suppliers';

  /**
   * Get all suppliers with optional filtering
   */
  static async getSuppliers(filters?: SupplierFilters): Promise<SupplierListResponse> {
    try {
      hackLog.apiRequest('GET', `/${this.BASE_PATH}`, {
        filters,
        timestamp: new Date().toISOString()
      });

      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.city) params.append('city', filters.city);
      if (filters?.state) params.append('state', filters.state);
      if (filters?.country) params.append('country', filters.country);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}?${params.toString()}`
      );
      
      // Handle nested response structure from backend
      const data = response.data.data || response.data;
      
      hackLog.apiSuccess('GET', `/${this.BASE_PATH}`, {
        total: data.total || data.length,
        page: data.page || 1,
        count: data.data?.length || data.length
      });

      return data;
    } catch (error: any) {
      hackLog.apiError('GET', `/${this.BASE_PATH}`, {
        error: error.message,
        status: error.response?.status,
        filters
      });
      throw this.handleError(error);
    }
  }

  /**
   * Get active suppliers (simplified list for dropdowns)
   */
  static async getActiveSuppliers(): Promise<Supplier[]> {
    try {
      hackLog.apiRequest('GET', `/${this.BASE_PATH}/active/list`, {
        timestamp: new Date().toISOString()
      });

      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}/active/list`
      );
      
      const data = response.data.data || response.data;
      
      hackLog.apiSuccess('GET', `/${this.BASE_PATH}/active/list`, {
        count: data.length
      });

      return data;
    } catch (error: any) {
      hackLog.apiError('GET', `/${this.BASE_PATH}/active/list`, {
        error: error.message,
        status: error.response?.status
      });
      throw this.handleError(error);
    }
  }

  /**
   * Get a single supplier by ID
   */
  static async getSupplierById(id: string): Promise<Supplier> {
    try {
      hackLog.apiRequest('GET', `/${this.BASE_PATH}/${id}`, { id });

      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}/${id}`
      );
      
      const data = response.data.data || response.data;
      
      hackLog.apiSuccess('GET', `/${this.BASE_PATH}/${id}`, {
        supplierId: data.id,
        name: data.name,
        isActive: data.is_active
      });

      return data;
    } catch (error: any) {
      hackLog.apiError('GET', `/${this.BASE_PATH}/${id}`, {
        error: error.message,
        status: error.response?.status,
        id
      });
      throw this.handleError(error);
    }
  }

  /**
   * Create a new supplier
   */
  static async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
    try {
      hackLog.apiRequest('POST', `/${this.BASE_PATH}`, {
        name: data.name,
        email: data.email,
        phone: data.phone
      });

      const response: AxiosResponse<any> = await apiClient.post(
        this.BASE_PATH,
        data
      );
      
      const supplierData = response.data.data || response.data;
      
      hackLog.apiSuccess('POST', `/${this.BASE_PATH}`, {
        supplierId: supplierData.id,
        name: supplierData.name,
        isActive: supplierData.is_active
      });

      return supplierData;
    } catch (error: any) {
      hackLog.apiError('POST', `/${this.BASE_PATH}`, {
        error: error.message,
        status: error.response?.status,
        data
      });
      throw this.handleError(error);
    }
  }

  /**
   * Update a supplier
   */
  static async updateSupplier(id: string, data: UpdateSupplierRequest): Promise<Supplier> {
    try {
      hackLog.apiRequest('PATCH', `/${this.BASE_PATH}/${id}`, {
        id,
        updates: Object.keys(data)
      });

      const response: AxiosResponse<any> = await apiClient.patch(
        `${this.BASE_PATH}/${id}`,
        data
      );
      
      const supplierData = response.data.data || response.data;
      
      hackLog.apiSuccess('PATCH', `/${this.BASE_PATH}/${id}`, {
        supplierId: supplierData.id,
        name: supplierData.name,
        isActive: supplierData.is_active
      });

      return supplierData;
    } catch (error: any) {
      hackLog.apiError('PATCH', `/${this.BASE_PATH}/${id}`, {
        error: error.message,
        status: error.response?.status,
        id,
        data
      });
      throw this.handleError(error);
    }
  }

  /**
   * Delete a supplier (soft delete)
   */
  static async deleteSupplier(id: string): Promise<void> {
    try {
      hackLog.apiRequest('DELETE', `/${this.BASE_PATH}/${id}`, { id });

      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      
      hackLog.apiSuccess('DELETE', `/${this.BASE_PATH}/${id}`, { id });
    } catch (error: any) {
      hackLog.apiError('DELETE', `/${this.BASE_PATH}/${id}`, {
        error: error.message,
        status: error.response?.status,
        id
      });
      throw this.handleError(error);
    }
  }

  /**
   * Restore a supplier (undelete)
   */
  static async restoreSupplier(id: string): Promise<Supplier> {
    try {
      hackLog.apiRequest('POST', `/${this.BASE_PATH}/${id}/restore`, { id });

      const response: AxiosResponse<any> = await apiClient.post(
        `${this.BASE_PATH}/${id}/restore`
      );
      
      const supplierData = response.data.data || response.data;
      
      hackLog.apiSuccess('POST', `/${this.BASE_PATH}/${id}/restore`, {
        supplierId: supplierData.id,
        name: supplierData.name
      });

      return supplierData;
    } catch (error: any) {
      hackLog.apiError('POST', `/${this.BASE_PATH}/${id}/restore`, {
        error: error.message,
        status: error.response?.status,
        id
      });
      throw this.handleError(error);
    }
  }

  /**
   * Get supplier statistics
   */
  static async getSupplierStats(): Promise<SupplierStatsResponse> {
    try {
      hackLog.apiRequest('GET', `/${this.BASE_PATH}/stats/overview`, {
        timestamp: new Date().toISOString()
      });

      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}/stats/overview`
      );
      
      const data = response.data.data || response.data;
      
      hackLog.apiSuccess('GET', `/${this.BASE_PATH}/stats/overview`, {
        totalSuppliers: data.totalSuppliers,
        activeSuppliers: data.activeSuppliers
      });

      return data;
    } catch (error: any) {
      hackLog.apiError('GET', `/${this.BASE_PATH}/stats/overview`, {
        error: error.message,
        status: error.response?.status
      });
      throw this.handleError(error);
    }
  }

  /**
   * Search suppliers by query
   */
  static async searchSuppliers(query: string, filters?: SupplierFilters): Promise<SupplierListResponse> {
    try {
      hackLog.apiRequest('GET', `/${this.BASE_PATH}/search/query`, {
        query,
        filters
      });

      const params = new URLSearchParams();
      params.append('query', query);
      
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}/search/query?${params.toString()}`
      );
      
      const data = response.data.data || response.data;
      
      hackLog.apiSuccess('GET', `/${this.BASE_PATH}/search/query`, {
        query,
        count: data.data?.length || data.length
      });

      return data;
    } catch (error: any) {
      hackLog.apiError('GET', `/${this.BASE_PATH}/search/query`, {
        error: error.message,
        status: error.response?.status,
        query
      });
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  private static handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }
}

// Export the API instance for easy importing
export const suppliersApi = SuppliersApi;
