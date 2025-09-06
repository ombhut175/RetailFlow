import { apiClient } from './apiClient';
import {
  Category,
  CategoryListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryFilters,
  Product,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  ApiResponse,
  ApiError
} from '@/types/inventory';
import { AxiosResponse } from 'axios';

// Categories API
export class CategoriesApi {
  private static readonly BASE_PATH = 'categories';

  /**
   * Get all categories with optional filtering
   */
  static async getCategories(filters?: CategoryFilters): Promise<CategoryListResponse> {
    try {
      const params = new URLSearchParams();
      
      // Backend expects 'name' parameter for search, not 'search'
      if (filters?.search) params.append('name', filters.search);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
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
   * Get a single category by ID
   */
  static async getCategoryById(id: string): Promise<Category> {
    try {
      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}/${id}`
      );
      
      // Handle nested response structure from backend
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      const response: AxiosResponse<any> = await apiClient.post(
        this.BASE_PATH,
        data
      );
      
      // Handle nested response structure from backend
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing category
   */
  static async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    try {
      const response: AxiosResponse<any> = await apiClient.patch(
        `${this.BASE_PATH}/${id}`,
        data
      );
      
      // Handle nested response structure from backend
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a category (soft delete)
   */
  static async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Search categories by name
   */
  static async searchCategories(searchTerm: string): Promise<Category[]> {
    try {
      // Use the service method directly since there's no dedicated search endpoint
      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}?name=${encodeURIComponent(searchTerm)}&is_active=true`
      );
      
      // Handle nested response structure from backend
      const result = response.data.data || response.data;
      return Array.isArray(result) ? result : result.data || [];
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  private static handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        statusCode: error.response.status,
        error: error.response.data?.error,
        details: error.response.data?.details
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        statusCode: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        statusCode: 0
      };
    }
  }
}

// Products API
export class ProductsApi {
  private static readonly BASE_PATH = 'products';

  /**
   * Get all products with optional filtering
   */
  static async getProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    try {
      const params = new URLSearchParams();
      
      // Backend expects 'name' parameter for search in main endpoint, not 'search'
      if (filters?.search) params.append('name', filters.search);
      if (filters?.category_id) params.append('category_id', filters.category_id);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.min_price) params.append('min_price', filters.min_price.toString());
      if (filters?.max_price) params.append('max_price', filters.max_price.toString());
      if (filters?.min_stock) params.append('min_stock', filters.min_stock.toString());
      if (filters?.has_barcode !== undefined) params.append('has_barcode', filters.has_barcode.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sort_by) params.append('sortBy', filters.sort_by);
      if (filters?.sort_order) params.append('sortOrder', filters.sort_order);

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
   * Get a single product by ID
   */
  static async getProductById(id: string): Promise<Product> {
    try {
      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}/${id}`
      );
      
      // Handle nested response structure from backend
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      const response: AxiosResponse<any> = await apiClient.post(
        this.BASE_PATH,
        data
      );
      
      // Handle nested response structure from backend
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    try {
      const response: AxiosResponse<any> = await apiClient.patch(
        `${this.BASE_PATH}/${id}`,
        data
      );
      
      // Handle nested response structure from backend
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a product (soft delete)
   */
  static async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Search products using dedicated search endpoint
   */
  static async searchProducts(searchTerm: string, limit: number = 10): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', searchTerm);
      params.append('limit', limit.toString());

      const response: AxiosResponse<any> = await apiClient.get(
        `${this.BASE_PATH}/search?${params.toString()}`
      );
      
      // Handle nested response structure from backend
      return response.data.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  private static handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        statusCode: error.response.status,
        error: error.response.data?.error,
        details: error.response.data?.details
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        statusCode: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        statusCode: 0
      };
    }
  }
}

// Export convenience functions
export const categoriesApi = CategoriesApi;
export const productsApi = ProductsApi;