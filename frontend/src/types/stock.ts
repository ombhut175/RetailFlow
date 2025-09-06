// Stock Management Types

// Enums matching backend
export enum StockTransactionType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  RESERVED = 'RESERVED',
  RELEASED = 'RELEASED'
}

export enum StockReferenceType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN'
}

export enum StockStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  IN_STOCK = 'IN_STOCK',
  RESERVED = 'RESERVED',
}

// Base Stock Entity
export interface Stock {
  id: string;
  product_id: string;
  quantity_available: number;
  quantity_reserved: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  // Product info (populated from join)
  product?: {
    id: string;
    name: string;
    sku: string;
    category_name?: string;
  };
}

// Stock Transaction Entity
export interface StockTransaction {
  id: string;
  product_id: string;
  transaction_type: StockTransactionType;
  quantity: number;
  reference_type: StockReferenceType;
  reference_id?: string;
  notes?: string;
  created_at: string;
  created_by: string;
  // Product info (populated from join)
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

// Request DTOs
export interface CreateStockRequest {
  product_id: string;
  quantity_available: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  location?: string;
  notes?: string;
  created_by: string;
}

export interface UpdateStockRequest {
  quantity_available?: number;
  quantity_reserved?: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  location?: string;
  notes?: string;
  updated_by: string;
}

export interface AdjustStockRequest {
  quantity_change: number;
  notes?: string;
  updated_by: string;
}

export interface ReserveStockRequest {
  quantity: number;
  notes?: string;
  updated_by: string;
}

export interface ReleaseStockRequest {
  quantity: number;
  notes?: string;
  updated_by: string;
}

export interface CreateStockTransactionRequest {
  product_id: string;
  transaction_type: StockTransactionType;
  quantity: number;
  reference_type: StockReferenceType;
  reference_id?: string;
  reason?: string;
  notes?: string;
  created_by: string;
}

// Alias for backward compatibility
export interface StockTransactionCreateRequest extends CreateStockTransactionRequest {}

// Response DTOs
export interface StockResponse {
  id: string;
  product_id: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_total: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category_name?: string;
  };
}

export interface StockSummary {
  product_id: string;
  product_name: string;
  product_sku: string;
  category_name?: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_total: number;
  last_updated: string;
}

export interface StockTransactionResponse {
  id: string;
  product_id: string;
  transaction_type: StockTransactionType;
  quantity: number;
  reference_type: StockReferenceType;
  reference_id?: string;
  reason?: string;
  notes?: string;
  created_at: string;
  created_by: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

// Filter and Pagination Types
export interface StockFilters {
  page?: number;
  limit?: number;
  sort_by?: 'product_name' | 'quantity_available' | 'quantity_reserved' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  search?: string;
  product_id?: string;
  category_id?: string;
  low_stock_threshold?: number;
  status?: StockStatus;
  location?: string;
  low_stock?: boolean;
  out_of_stock?: boolean;
  has_reserved?: boolean;
  category?: string;
  supplier?: string;
  min_quantity?: number;
  max_quantity?: number;
}

export interface StockTransactionFilters {
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'quantity' | 'product_name';
  sort_order?: 'asc' | 'desc';
  product_id?: string;
  transaction_type?: StockTransactionType;
  reference_type?: StockReferenceType;
  date_from?: string;
  date_to?: string;
}

// API Response Types
export interface StockListResponse {
  data: StockResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface StockTransactionListResponse {
  data: StockTransactionResponse[];
  total: number;
  page: number;
  limit: number;
}

// Table and UI State Types
export interface StockTableState {
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface StockModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view' | 'adjust' | 'reserve' | 'release';
  selectedItem: StockResponse | null;
}

// Form Types
export interface StockFormData {
  product_id: string;
  quantity_available: number;
  quantity_reserved: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  location?: string;
  notes?: string;
}

export interface StockAdjustmentFormData {
  quantity_change: number;
  transaction_type: StockTransactionType;
  notes: string;
}

export interface StockReservationFormData {
  quantity: number;
  notes: string;
}

// API Error Type
export interface ApiError {
  success?: false;
  message: string;
  statusCode?: number;
  error?: string;
  details?: any;
  errors?: Record<string, string[]>;
}

// All types are exported individually above