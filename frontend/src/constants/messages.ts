// User-facing messages for the application

// Success Messages  
export const SUCCESS_MESSAGES = {
  // API/Data operations
  DATA_LOADED: '✅ Data loaded successfully!',
  API_CONNECTED: '✅ API connection successful!',
  REFRESH_SUCCESS: '✅ Data refreshed successfully!',
  
  // Testing/Debug operations
  TEST_DATA_ADDED: '🧪 Test data added successfully!',
  DATA_RESET: '🧹 Data reset successfully!',
  STATE_CLEARED: '🗑️ State cleared successfully!',
  
  // General operations
  OPERATION_SUCCESS: '✅ Operation completed successfully!',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Network/API errors
  NETWORK_ERROR: '🌐 Network error occurred. Please check your connection.',
  API_ERROR: '🔌 API connection failed. Please try again.',
  SERVER_ERROR: '🖥️ Server error occurred. Please try again later.',
  TIMEOUT_ERROR: '⏰ Request timed out. Please try again.',
  
  // Data/Loading errors
  DATA_LOAD_FAILED: '📊 Failed to load data. Please refresh and try again.',
  NO_DATA_AVAILABLE: '📭 No data available. Click refresh to load data.',
  INVALID_RESPONSE: '📄 Invalid response from server.',
  
  // Generic errors
  SOMETHING_WENT_WRONG: '❌ Something went wrong. Please try again.',
  UNKNOWN_ERROR: '❓ An unknown error occurred.',
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  LOADING_DATA: '📡 Loading data...',
  CONNECTING: '🔗 Connecting to API...',
  REFRESHING: '🔄 Refreshing data...',
  PROCESSING: '⚙️ Processing...',
} as const;

// Info Messages
export const INFO_MESSAGES = {
  // System status
  SYSTEM_HEALTHY: '💚 All systems operational',
  SYSTEM_WARNING: '⚠️ System warning - check console for details',
  SYSTEM_ERROR: '🔴 System error - check console for details',
  
  // User guidance
  CLICK_REFRESH: '🔄 Click refresh to load data',
  CHECK_CONSOLE: '🔍 Check console for more details',
  DEMO_MODE: '🎪 Demo mode active',
  DEVELOPMENT_MODE: '🧪 Development mode - debug tools available',
} as const;

// Debug Messages (for console logging)
export const DEBUG_MESSAGES = {
  COMPONENT_RENDERED: '🚀 Component rendered',
  API_REQUEST_STARTED: '📡 API request started',
  API_REQUEST_SUCCESS: '✅ API request successful',
  API_REQUEST_FAILED: '❌ API request failed',
  STATE_UPDATED: '📊 State updated',
  HOOK_EXECUTED: '🪝 Hook executed',
  STORE_ACTION: '🏪 Store action dispatched',
} as const;
