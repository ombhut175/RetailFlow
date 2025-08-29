// Environment Variables
export enum ENV {
  SUPABASE_URL = 'SUPABASE_URL',
  SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY',
  NODE_ENV = 'NODE_ENV',
  PORT = 'PORT',
  SWAGGER_USER = 'SWAGGER_USER',
  SWAGGER_PASSWORD = 'SWAGGER_PASSWORD',
  
  // Database Configuration
  DATABASE_URL = 'DATABASE_URL',
  DATABASE_HOST = 'DATABASE_HOST',
  DATABASE_PORT = 'DATABASE_PORT',
  DATABASE_NAME = 'DATABASE_NAME',
  DATABASE_USER = 'DATABASE_USER',
  DATABASE_PASSWORD = 'DATABASE_PASSWORD',
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
  
  // Supabase
  SUPABASE_CONNECTION_ERROR = 'Failed to connect to database',
  SUPABASE_QUERY_ERROR = 'Database query failed',
}

// API Response Messages
export enum API_MESSAGES {
  USERS_FETCHED = 'Users fetched successfully',
  USER_CREATED = 'User created successfully',
  USER_UPDATED = 'User updated successfully',
  USER_DELETED = 'User deleted successfully',
}

// Table Names (for future use)
export enum TABLES {
  USERS = 'users',
  TASKS = 'tasks',
  PROFILES = 'profiles',
}

// Queue Names (for future BullMQ usage)
export enum QUEUES {
  JOBS = 'jobs',
  EMAILS = 'emails',
  NOTIFICATIONS = 'notifications',
}
