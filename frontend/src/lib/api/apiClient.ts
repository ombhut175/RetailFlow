import axios from "axios";
import { API_URL_PREFIX } from "@/constants/string-const";
import hackLog from "@/lib/logger";

// Simple function to get environment variable with fallback
function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: Use fallback URL due to Next.js 15 + Turbopack bug
    hackLog.warn('CLIENT] Using fallback API URL due to Turbopack environment variable issue');
    return 'http://localhost:5099';
  } else {
    // Server-side: Try to get the actual environment variable
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      hackLog.info('SERVER] Using environment API URL', { envUrl });
      return envUrl;
    } else {
      hackLog.warn('[SERVER] Environment variable not found, using fallback');
      return 'http://localhost:5099';
    }
  }
}

function createBaseURL(): string {
  const apiUrl = getApiUrl();
  const base = apiUrl.replace(/\/+$/g, '');
  const prefix = API_URL_PREFIX.replace(/^\/+|\/+$/g, '');
  return base ? `${base}/${prefix}` : `/${prefix}`;
}

// Create the axios instance 
export const apiClient = axios.create({
  baseURL: createBaseURL(),
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    config.headers = config.headers || {};
    
    // Normalize URL to respect baseURL: remove leading slash for relative API paths
    if (config.url && typeof config.url === 'string') {
      const urlString = config.url as string;
      const isAbsolute = /^https?:\/\//i.test(urlString);
      if (!isAbsolute && urlString.startsWith('/')) {
        config.url = urlString.replace(/^\/+/, '');
      }
    }
    
    // Let axios set the Content-Type header automatically for FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging while preserving original error shape
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error: any) => {
    // Log and pass through so downstream interceptors/handlers can decide
    if (error.response) {
      console.error("API Error Response:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("API Error No Response:", error.message);
    } else {
      console.error("API Error Setup:", error.message);
    }
    return Promise.reject(error);
  }
);