// Category Types
export interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface CategoryListResponse {
  data: Category[];
  total: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Product Types
export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  category_id: string | null;
  category: ProductCategory | null;
  description: string | null;
  unit_price: string;
  cost_price: string | null;
  minimum_stock_level: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  barcode?: string;
  category_id?: string;
  description?: string;
  unit_price: number;
  cost_price?: number;
  minimum_stock_level: number;
  is_active?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  barcode?: string;
  category_id?: string;
  description?: string;
  unit_price?: number;
  cost_price?: number;
  minimum_stock_level?: number;
  is_active?: boolean;
}

// Filter and Search Types
export interface ProductFilters {
  search?: string;
  category_id?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
  min_stock?: number;
  has_barcode?: boolean;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CategoryFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

// Form State Types
export interface CategoryFormData {
  name: string;
  description: string;
  is_active: boolean;
}

export interface ProductFormData {
  name: string;
  sku: string;
  barcode: string;
  category_id: string;
  description: string;
  unit_price: string;
  cost_price: string;
  minimum_stock_level: number;
  is_active: boolean;
}

// UI State Types
export interface TableState {
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view' | 'delete';
  selectedItem: Category | Product | null;
}

export type FormMode = 'create' | 'edit' | 'view' | 'delete';