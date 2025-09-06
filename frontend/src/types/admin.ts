// Admin types based on backend DTOs

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';
export type SortField = 'email' | 'createdAt' | 'role';
export type SortOrder = 'asc' | 'desc';

export interface UserRoleInfo {
  id: string;
  role: UserRole;
  permissions: string[];
  is_active: boolean;
  assigned_by: string;
  created_at: string;
  updated_at: string | null;
}

export interface User {
  id: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role: UserRoleInfo | null;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserRequest {
  email: string;
  isEmailVerified?: boolean;
  role: UserRole;
  permissions?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  isEmailVerified?: boolean;
  role?: UserRole;
  permissions?: string[];
  isRoleActive?: boolean;
}

export interface QueryUsersRequest {
  page?: number;
  limit?: number;
  role?: UserRole;
  email?: string;
  isEmailVerified?: boolean;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export interface AdminTableState {
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export interface AdminFilters extends QueryUsersRequest {}

export interface AdminModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view' | 'delete';
  selectedUser: User | null;
}

// Common permissions that can be assigned to users
export const USER_PERMISSIONS = [
  'READ_PRODUCTS',
  'CREATE_PRODUCTS',
  'UPDATE_PRODUCTS',
  'DELETE_PRODUCTS',
  'READ_CATEGORIES',
  'CREATE_CATEGORIES',
  'UPDATE_CATEGORIES',
  'DELETE_CATEGORIES',
  'READ_STOCK',
  'CREATE_STOCK',
  'UPDATE_STOCK',
  'DELETE_STOCK',
  'READ_PURCHASE_ORDERS',
  'CREATE_PURCHASE_ORDERS',
  'UPDATE_PURCHASE_ORDERS',
  'DELETE_PURCHASE_ORDERS',
  'READ_SUPPLIERS',
  'CREATE_SUPPLIERS',
  'UPDATE_SUPPLIERS',
  'DELETE_SUPPLIERS',
  'READ_USERS',
  'CREATE_USERS',
  'UPDATE_USERS',
  'DELETE_USERS',
  'ADMIN_ACCESS',
] as const;

export type Permission = typeof USER_PERMISSIONS[number];

// Role-based default permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'READ_PRODUCTS', 'CREATE_PRODUCTS', 'UPDATE_PRODUCTS', 'DELETE_PRODUCTS',
    'READ_CATEGORIES', 'CREATE_CATEGORIES', 'UPDATE_CATEGORIES', 'DELETE_CATEGORIES',
    'READ_STOCK', 'CREATE_STOCK', 'UPDATE_STOCK', 'DELETE_STOCK',
    'READ_PURCHASE_ORDERS', 'CREATE_PURCHASE_ORDERS', 'UPDATE_PURCHASE_ORDERS', 'DELETE_PURCHASE_ORDERS',
    'READ_SUPPLIERS', 'CREATE_SUPPLIERS', 'UPDATE_SUPPLIERS', 'DELETE_SUPPLIERS',
    'READ_USERS', 'CREATE_USERS', 'UPDATE_USERS', 'DELETE_USERS',
    'ADMIN_ACCESS',
  ],
  MANAGER: [
    'READ_PRODUCTS', 'CREATE_PRODUCTS', 'UPDATE_PRODUCTS',
    'READ_CATEGORIES', 'CREATE_CATEGORIES', 'UPDATE_CATEGORIES',
    'READ_STOCK', 'CREATE_STOCK', 'UPDATE_STOCK',
    'READ_PURCHASE_ORDERS', 'CREATE_PURCHASE_ORDERS', 'UPDATE_PURCHASE_ORDERS',
    'READ_SUPPLIERS', 'CREATE_SUPPLIERS', 'UPDATE_SUPPLIERS',
    'READ_USERS',
  ],
  STAFF: [
    'READ_PRODUCTS',
    'READ_CATEGORIES',
    'READ_STOCK',
    'READ_PURCHASE_ORDERS',
    'READ_SUPPLIERS',
  ],
};