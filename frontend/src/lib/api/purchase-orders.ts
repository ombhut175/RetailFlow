import { apiClient } from './apiClient';
import {
  PurchaseOrder,
  PurchaseOrderListResponse,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  UpdatePurchaseOrderItemRequest,
  PurchaseOrderFilters,
  PurchaseOrderStatsResponse,
  CreatePurchaseOrderItemRequest
} from '@/types/purchase-orders';
import { AxiosResponse } from 'axios';
import hackLog from '@/lib/logger';

export class PurchaseOrdersApi {
  private static readonly BASE_PATH = 'purchase-orders';

  /**
   * Get all purchase orders with optional filtering
   */
  static async getPurchaseOrders(filters?: PurchaseOrderFilters): Promise<PurchaseOrderListResponse> {
    try {
      hackLog.apiRequest('GET', `/${this.BASE_PATH}`, {
        filters,
        timestamp: new Date().toISOString()
      });

      const params = new URLSearchParams();
      
      if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.order_number) params.append('order_number', filters.order_number);
      if (filters?.order_date_from) params.append('order_date_from', filters.order_date_from);
      if (filters?.order_date_to) params.append('order_date_to', filters.order_date_to);
      if (filters?.withDeleted !== undefined) params.append('withDeleted', filters.withDeleted.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const response: AxiosResponse<PurchaseOrderListResponse> = await apiClient.get(
        `${this.BASE_PATH}?${params.toString()}`
      );
      
      hackLog.apiSuccess('GET', `/${this.BASE_PATH}`, {
        total: response.data.total,
        page: response.data.page,
        count: response.data.data.length
      });

      return response.data;
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
   * Get a single purchase order by ID
   */
  static async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    try {
      hackLog.apiRequest('GET', `/${this.BASE_PATH}/${id}`, { id });

      const response: AxiosResponse<PurchaseOrder> = await apiClient.get(
        `${this.BASE_PATH}/${id}`
      );
      
      hackLog.apiSuccess('GET', `/${this.BASE_PATH}/${id}`, {
        orderId: response.data.id,
        orderNumber: response.data.order_number,
        status: response.data.status
      });

      return response.data;
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
   * Get purchase orders by supplier
   */
  static async getPurchaseOrdersBySupplier(supplierId: string, filters?: PurchaseOrderFilters): Promise<PurchaseOrderListResponse> {
    try {
      hackLog.apiRequest('GET', `/${this.BASE_PATH}/supplier/${supplierId}`, {
        supplierId,
        filters
      });

      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const response: AxiosResponse<PurchaseOrderListResponse> = await apiClient.get(
        `${this.BASE_PATH}/supplier/${supplierId}?${params.toString()}`
      );
      
      hackLog.apiSuccess('GET', `/${this.BASE_PATH}/supplier/${supplierId}`, {
        supplierId,
        total: response.data.total,
        count: response.data.data.length
      });

      return response.data;
    } catch (error: any) {
      hackLog.apiError('GET', `/${this.BASE_PATH}/supplier/${supplierId}`, {
        error: error.message,
        status: error.response?.status,
        supplierId
      });
      throw this.handleError(error);
    }
  }

  /**
   * Create a new purchase order
   */
  static async createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    try {
      hackLog.apiRequest('POST', `/${this.BASE_PATH}`, {
        supplierI: data.supplier_id,
        orderNumber: data.order_number,
        itemsCount: data.items?.length || 0
      });

      const response: AxiosResponse<PurchaseOrder> = await apiClient.post(
        this.BASE_PATH,
        data
      );
      
      hackLog.apiSuccess('POST', `/${this.BASE_PATH}`, {
        orderId: response.data.id,
        orderNumber: response.data.order_number,
        status: response.data.status
      });

      return response.data;
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
   * Update a purchase order
   */
  static async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    try {
      hackLog.apiRequest('PATCH', `/${this.BASE_PATH}/${id}`, {
        id,
        updates: Object.keys(data)
      });

      const response: AxiosResponse<PurchaseOrder> = await apiClient.patch(
        `${this.BASE_PATH}/${id}`,
        data
      );
      
      hackLog.apiSuccess('PATCH', `/${this.BASE_PATH}/${id}`, {
        orderId: response.data.id,
        orderNumber: response.data.order_number,
        status: response.data.status
      });

      return response.data;
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
   * Mark purchase order as received
   */
  static async receivePurchaseOrder(id: string): Promise<PurchaseOrder> {
    try {
      hackLog.apiRequest('POST', `/${this.BASE_PATH}/${id}/receive`, { id });

      const response: AxiosResponse<PurchaseOrder> = await apiClient.post(
        `${this.BASE_PATH}/${id}/receive`
      );
      
      hackLog.apiSuccess('POST', `/${this.BASE_PATH}/${id}/receive`, {
        orderId: response.data.id,
        orderNumber: response.data.order_number,
        status: response.data.status
      });

      return response.data;
    } catch (error: any) {
      hackLog.apiError('POST', `/${this.BASE_PATH}/${id}/receive`, {
        error: error.message,
        status: error.response?.status,
        id
      });
      throw this.handleError(error);
    }
  }

  /**
   * Delete a purchase order
   */
  static async deletePurchaseOrder(id: string): Promise<void> {
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
   * Add item to purchase order
   */
  static async addItemToPurchaseOrder(id: string, item: CreatePurchaseOrderItemRequest): Promise<PurchaseOrder> {
    try {
      hackLog.apiRequest('POST', `/${this.BASE_PATH}/${id}/items`, {
        orderId: id,
        productId: item.product_id,
        quantity: item.quantity_ordered
      });

      const response: AxiosResponse<PurchaseOrder> = await apiClient.post(
        `${this.BASE_PATH}/${id}/items`,
        item
      );
      
      hackLog.apiSuccess('POST', `/${this.BASE_PATH}/${id}/items`, {
        orderId: response.data.id,
        itemsCount: response.data.items?.length || 0
      });

      return response.data;
    } catch (error: any) {
      hackLog.apiError('POST', `/${this.BASE_PATH}/${id}/items`, {
        error: error.message,
        status: error.response?.status,
        id,
        item
      });
      throw this.handleError(error);
    }
  }

  /**
   * Update purchase order item
   */
  static async updatePurchaseOrderItem(itemId: string, data: UpdatePurchaseOrderItemRequest): Promise<PurchaseOrder> {
    try {
      hackLog.apiRequest('PATCH', `/${this.BASE_PATH}/items/${itemId}`, {
        itemId,
        updates: Object.keys(data)
      });

      const response: AxiosResponse<PurchaseOrder> = await apiClient.patch(
        `${this.BASE_PATH}/items/${itemId}`,
        data
      );
      
      hackLog.apiSuccess('PATCH', `/${this.BASE_PATH}/items/${itemId}`, {
        itemId,
        orderId: response.data.id
      });

      return response.data;
    } catch (error: any) {
      hackLog.apiError('PATCH', `/${this.BASE_PATH}/items/${itemId}`, {
        error: error.message,
        status: error.response?.status,
        itemId,
        data
      });
      throw this.handleError(error);
    }
  }

  /**
   * Delete purchase order item
   */
  static async deletePurchaseOrderItem(itemId: string): Promise<PurchaseOrder> {
    try {
      hackLog.apiRequest('DELETE', `/${this.BASE_PATH}/items/${itemId}`, { itemId });

      const response: AxiosResponse<PurchaseOrder> = await apiClient.delete(
        `${this.BASE_PATH}/items/${itemId}`
      );
      
      hackLog.apiSuccess('DELETE', `/${this.BASE_PATH}/items/${itemId}`, {
        itemId,
        orderId: response.data.id
      });

      return response.data;
    } catch (error: any) {
      hackLog.apiError('DELETE', `/${this.BASE_PATH}/items/${itemId}`, {
        error: error.message,
        status: error.response?.status,
        itemId
      });
      throw this.handleError(error);
    }
  }

  /**
   * Get purchase order statistics
   */
  static async getPurchaseOrderStats(): Promise<PurchaseOrderStatsResponse> {
    try {
      hackLog.apiRequest('GET', `/${this.BASE_PATH}/stats/overview`, {
        timestamp: new Date().toISOString()
      });

      const response: AxiosResponse<PurchaseOrderStatsResponse> = await apiClient.get(
        `${this.BASE_PATH}/stats/overview`
      );
      
      hackLog.apiSuccess('GET', `/${this.BASE_PATH}/stats/overview`, {
        totalOrders: response.data.totalOrders,
        totalValue: response.data.totalValue?.amount
      });

      return response.data;
    } catch (error: any) {
      hackLog.apiError('GET', `/${this.BASE_PATH}/stats/overview`, {
        error: error.message,
        status: error.response?.status
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
export const purchaseOrdersApi = PurchaseOrdersApi;
