// Purchase Orders Types

// Enums
export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

// Basic interfaces
export interface PurchaseOrderSupplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
}

export interface PurchaseOrderProduct {
  id: string;
  name: string;
  sku: string;
  unit_price: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product: PurchaseOrderProduct;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: string;
  total_cost: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: PurchaseOrderSupplier;
  order_number: string;
  status: PurchaseOrderStatus;
  order_date: string | null;
  expected_delivery_date: string | null;
  total_amount: string | null;
  notes: string | null;
  items?: PurchaseOrderItem[];
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

// API Request/Response types
export interface CreatePurchaseOrderItemRequest {
  product_id: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_cost: number;
  total_cost: number;
}

export interface CreatePurchaseOrderRequest {
  supplier_id: string;
  order_number: string;
  order_date?: string;
  expected_delivery_date?: string;
  notes?: string;
  items?: CreatePurchaseOrderItemRequest[];
}

export interface UpdatePurchaseOrderRequest {
  supplier_id?: string;
  order_number?: string;
  status?: PurchaseOrderStatus;
  order_date?: string;
  expected_delivery_date?: string;
  notes?: string;
}

export interface UpdatePurchaseOrderItemRequest {
  product_id?: string;
  quantity_ordered?: number;
  quantity_received?: number;
  unit_cost?: number;
  total_cost?: number;
}

export interface PurchaseOrderFilters {
  supplier_id?: string;
  status?: PurchaseOrderStatus;
  order_number?: string;
  order_date_from?: string;
  order_date_to?: string;
  withDeleted?: boolean;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface PurchaseOrderStatsResponse {
  totalOrders: number;
  byStatus: Record<PurchaseOrderStatus, number>;
  totalValue: {
    amount: string;
    currency: string;
  };
  recentOrders: number;
}

// UI State types
export interface PurchaseOrderTableState {
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PurchaseOrderModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  selectedItem: PurchaseOrder | null;
}

// Form types
export interface PurchaseOrderFormData {
  supplier_id: string;
  order_number: string;
  order_date: string;
  expected_delivery_date: string;
  notes: string;
  items: PurchaseOrderItemFormData[];
}

export interface PurchaseOrderItemFormData {
  id?: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
}

// Validation types
export interface PurchaseOrderFormErrors {
  supplier_id?: string;
  order_number?: string;
  order_date?: string;
  expected_delivery_date?: string;
  notes?: string;
  items?: PurchaseOrderItemFormErrors[];
}

export interface PurchaseOrderItemFormErrors {
  product_id?: string;
  quantity_ordered?: string;
  quantity_received?: string;
  unit_cost?: string;
  total_cost?: string;
}
