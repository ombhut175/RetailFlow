"use client";

import React from 'react';
import { SWRConfig } from 'swr';
import { DEBUG_MESSAGES } from '@/constants/messages';
import { APP_CONFIG } from '@/constants/config';

// Global SWR configuration - NO GLOBAL FETCHER (each hook uses its own)
export const swrConfig = {
  // 🚨 NO GLOBAL FETCHER - Each useSWR call must specify its own fetcher
  revalidateOnFocus: false, // Don't refetch on window focus (good for demos)
  revalidateOnReconnect: true, // Refetch when internet comes back
  dedupingInterval: 2000, // Prevent duplicate requests for 2 seconds
  errorRetryCount: 2, // Only retry twice on error
  refreshInterval: APP_CONFIG.AUTO_REFRESH_INTERVAL, // From constants
  onError: (error: any) => {
    console.log(`❌ [SWR Global] ${DEBUG_MESSAGES.API_REQUEST_FAILED}:`, error);
    // Don't use handleError here as it would show duplicate toasts
    // Individual hooks will handle their own errors
  },
  onSuccess: (data: any) => {
    console.log(`🎯 [SWR Global] ${DEBUG_MESSAGES.API_REQUEST_SUCCESS}:`, 
      typeof data === 'object' ? JSON.stringify(data).substring(0, APP_CONFIG.MAX_CONSOLE_LOG_LENGTH) + '...' : data
    );
  }
};

// SWR Provider wrapper
export function SWRProvider({ children }: { children: React.ReactNode }) {
  console.log(`🚀 [SWR] ${DEBUG_MESSAGES.COMPONENT_RENDERED} - Provider initialized`);
  return React.createElement(SWRConfig, { value: swrConfig }, children);
}
