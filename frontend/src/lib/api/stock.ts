import { apiClient } from './apiClient';
import {
  StockResponse,
  StockTransactionResponse,
  StockListResponse,
  StockTransactionListResponse,
  CreateStockRequest,
  UpdateStockRequest,
  AdjustStockRequest,
  ReserveStockRequest,
  ReleaseStockRequest,
  CreateStockTransactionRequest,
  StockFilters,
  StockTransactionFilters,
  ApiError
} from '@/types/stock';
import { AxiosResponse } from 'axios';

// Stock API
export class StockApi {
  private static readonly BASE_PATH = 'stock';

  /**
   * Get all stock items with optional filtering
   */
  static async getStock(filters?: StockFilters): Promise<StockListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.product_id) params.append('product_id', filters.product_id);
      if (filters?.category_id) params.append('category_id', filters.category_id);
      if (filters?.low_stock_threshold) params.append('low_stock_threshold', filters.low_stock_threshold.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}?${params.toString()}`
      );
      
      // Handle nested response structure from backend
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get stock for a specific product
   */
  static async getStockByProductId(productId: string): Promise<StockResponse> {
    try {
      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}/product/${productId}`
      );
      
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get low stock items
   */
  static async getLowStock(threshold?: number): Promise<StockListResponse> {
    try {
      const params = new URLSearchParams();
      if (threshold) params.append('threshold', threshold.toString());

      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}/low-stock?${params.toString()}`
      );
      
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new stock entry
   */
  static async createStock(data: CreateStockRequest): Promise<StockResponse> {
    try {
      const response: AxiosResponse<any> = await apiClient.post(
        this.BASE_PATH,
        data
      );
      
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update stock quantities
   */
  static async updateStock(productId: string, data: UpdateStockRequest): Promise<StockResponse> {
    try {
      const response: AxiosResponse<any> = await apiClient.patch(
        `${this.BASE_PATH}/product/${productId}`,
        data
      );
      
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Adjust stock quantity (increase or decrease)
   */
  static async adjustStock(productId: string, data: AdjustStockRequest): Promise<StockResponse> {
    try {
      const response: AxiosResponse<any> = await apiClient.patch(
        `${this.BASE_PATH}/product/${productId}/adjust`,
        data
      );
      
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Reserve stock quantity
   */
  static async reserveStock(productId: string, data: ReserveStockRequest): Promise<StockResponse> {
    try {
      const response: AxiosResponse<any> = await apiClient.patch(
        `${this.BASE_PATH}/product/${productId}/reserve`,
        data
      );
      
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Release reserved stock quantity
   */
  static async releaseStock(productId: string, data: ReleaseStockRequest): Promise<StockResponse> {
    try {
      const response: AxiosResponse<any> = await apiClient.patch(
        `${this.BASE_PATH}/product/${productId}/release`,
        data
      );
      
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete stock entry
   */
  static async deleteStock(productId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/product/${productId}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): ApiError {
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'Stock operation failed',
        errors: error.response.data.errors
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error occurred'
    };
  }
}

// Stock Transactions API
export class StockTransactionsApi {
  private static readonly BASE_PATH = 'stock/transactions';

  /**
   * Get all stock transactions with optional filtering
   */
  static async getTransactions(filters?: StockTransactionFilters): Promise<StockTransactionListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.product_id) params.append('product_id', filters.product_id);
      if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters?.reference_type) params.append('reference_type', filters.reference_type);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}?${params.toString()}`
      );
      
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get transactions for a specific product
   */
  static async getTransactionsByProductId(productId: string, filters?: Omit<StockTransactionFilters, 'product_id'>): Promise<StockTransactionListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters?.reference_type) params.append('reference_type', filters.reference_type);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}/product/${productId}?${params.toString()}`
      );
      
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new stock transaction
   */
  static async createTransaction(data: CreateStockTransactionRequest): Promise<StockTransactionResponse> {
    try {
      const response: AxiosResponse<any> = await apiClient.post(
        this.BASE_PATH,
        data
      );
      
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): ApiError {
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'Stock transaction operation failed',
        errors: error.response.data.errors
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error occurred'
    };
  }
}

// Export instances for easy importing
export const stockApi = StockApi;
export const stockTransactionsApi = StockTransactionsApi;