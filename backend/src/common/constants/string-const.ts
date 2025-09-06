// Environment Variables
export enum ENV {
  SUPABASE_URL = 'SUPABASE_URL',
  SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY',
  NODE_ENV = 'NODE_ENV',
  PORT = 'PORT',
  SWAGGER_USER = 'SWAGGER_USER',
  SWAGGER_PASSWORD = 'SWAGGER_PASSWORD',
  SWAGGER_ENABLED = 'SWAGGER_ENABLED',
  SWAGGER_UI_DEEP_LINKING = 'SWAGGER_UI_DEEP_LINKING',
  SWAGGER_UI_DOC_EXPANSION = 'SWAGGER_UI_DOC_EXPANSION',
  SWAGGER_UI_FILTER = 'SWAGGER_UI_FILTER',
  FRONTEND_URL = 'FRONTEND_URL',
  REDIRECT_TO_FRONTEND_URL = 'REDIRECT_TO_FRONTEND_URL',
  COOKIE_DOMAIN = 'COOKIE_DOMAIN',
  
  // Database Configuration
  DATABASE_URL = 'DATABASE_URL',
  DATABASE_HOST = 'DATABASE_HOST',
  DATABASE_PORT = 'DATABASE_PORT',
  DATABASE_NAME = 'DATABASE_NAME',
  DATABASE_USER = 'DATABASE_USER',
  DATABASE_PASSWORD = 'DATABASE_PASSWORD',
  
  // AI Services
  GEMINI_API_KEY = 'GEMINI_API_KEY',
}

// Common Messages
export enum MESSAGES {
  // Generic
  SUCCESS = 'Success',
  CREATED = 'Created',
  UPDATED = 'Updated',
  DELETED = 'Deleted',
  
  // Errors
  UNEXPECTED_ERROR = 'Unexpected error occurred',
  VALIDATION_ERROR = 'Validation error',
  NOT_FOUND = 'Resource not found',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  
  // Auth
  INVALID_TOKEN = 'Invalid token',
  TOKEN_EXPIRED = 'Token expired',
  USER_NOT_FOUND = 'User not found',
  TASK_NOT_FOUND = 'Task not found',
  
  // Categories
  CATEGORY_NOT_FOUND = 'Category not found',
  CATEGORY_NAME_EXISTS = 'Category name already exists',
  
  // Products
  PRODUCT_NOT_FOUND = 'Product not found',
  PRODUCT_SKU_EXISTS = 'Product SKU already exists',
  PRODUCT_BARCODE_EXISTS = 'Product barcode already exists',
  
  // Suppliers
  SUPPLIER_NOT_FOUND = 'Supplier not found',
  SUPPLIER_NAME_EXISTS = 'Supplier name already exists',
  SUPPLIER_EMAIL_EXISTS = 'Supplier email already exists',
  
  // Purchase Orders
  PURCHASE_ORDER_NOT_FOUND = 'Purchase order not found',
  PURCHASE_ORDER_NUMBER_EXISTS = 'Purchase order number already exists',
  PURCHASE_ORDER_ITEM_NOT_FOUND = 'Purchase order item not found',
  
  LOGIN_SUCCESSFUL = 'Login successful',
  SIGNUP_SUCCESSFUL = 'Account created successfully',
  PASSWORD_RESET_SENT = 'Password reset email sent',
  INVALID_CREDENTIALS = 'Invalid email or password',
  EMAIL_ALREADY_EXISTS = 'Email already exists',
  WEAK_PASSWORD = 'Password is too weak',
  INVALID_EMAIL = 'Invalid email format',
  
  // Supabase
  SUPABASE_CONNECTION_ERROR = 'Failed to connect to database',
  SUPABASE_QUERY_ERROR = 'Database query failed',
  
  // AI Services
  GEMINI_API_KEY_MISSING = 'Gemini API key is required',
  GEMINI_REQUEST_FAILED = 'Failed to communicate with Gemini API',
  GEMINI_API_ERROR = 'Gemini API error',
  GEMINI_GENERATION_FAILED = 'AI content generation failed',
  GEMINI_JSON_PARSE_FAILED = 'Failed to parse JSON from AI response',
  INVALID_JSON_RESPONSE = 'Invalid JSON response from AI service',
  JSON_PARSING_ERROR = 'Failed to parse JSON from text response',
}

// API Response Messages
export enum API_MESSAGES {
  USERS_FETCHED = 'Users fetched successfully',
  USER_CREATED = 'User created successfully',
  USER_UPDATED = 'User updated successfully',
  USER_DELETED = 'User deleted successfully',
  
  // Categories
  CATEGORIES_FETCHED = 'Categories fetched successfully',
  CATEGORY_CREATED = 'Category created successfully',
  CATEGORY_UPDATED = 'Category updated successfully',
  CATEGORY_DELETED = 'Category deleted successfully',
  
  // Products
  PRODUCTS_FETCHED = 'Products fetched successfully',
  PRODUCT_CREATED = 'Product created successfully',
  PRODUCT_UPDATED = 'Product updated successfully',
  PRODUCT_DELETED = 'Product deleted successfully',
  
  // Suppliers
  SUPPLIERS_FETCHED = 'Suppliers fetched successfully',
  SUPPLIER_CREATED = 'Supplier created successfully',
  SUPPLIER_UPDATED = 'Supplier updated successfully',
  SUPPLIER_DELETED = 'Supplier deleted successfully',
  
  // Purchase Orders
  PURCHASE_ORDERS_FETCHED = 'Purchase orders fetched successfully',
  PURCHASE_ORDER_CREATED = 'Purchase order created successfully',
  PURCHASE_ORDER_UPDATED = 'Purchase order updated successfully',
  PURCHASE_ORDER_DELETED = 'Purchase order deleted successfully',
  PURCHASE_ORDER_ITEM_ADDED = 'Purchase order item added successfully',
  PURCHASE_ORDER_ITEM_UPDATED = 'Purchase order item updated successfully',
  PURCHASE_ORDER_ITEM_DELETED = 'Purchase order item deleted successfully',
}

// Table Names (for future use)
export enum TABLES {
  USERS = 'users',
  TASKS = 'tasks',
  PROFILES = 'profiles',
  CATEGORIES = 'categories',
  PRODUCTS = 'products',
  SUPPLIERS = 'suppliers',
}

// Queue Names (for future BullMQ usage)
export enum QUEUES {
  JOBS = 'jobs',
  EMAILS = 'emails',
  NOTIFICATIONS = 'notifications',
}

// Cookie Keys
export enum COOKIES {
  AUTH_TOKEN = 'auth_token',
}
