// Supplier Types

// Basic interfaces
export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

// API Request/Response types
export interface CreateSupplierRequest {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  is_active?: boolean;
}

export interface UpdateSupplierRequest {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  is_active?: boolean;
}

export interface SupplierFilters {
  search?: string;
  is_active?: boolean;
  city?: string;
  state?: string;
  country?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SupplierListResponse {
  data: Supplier[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface SupplierStatsResponse {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  suppliersWithOrders: number;
}

// UI State types
export interface SupplierTableState {
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface SupplierModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  selectedItem: Supplier | null;
}
