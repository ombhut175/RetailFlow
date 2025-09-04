"use client";

import React from 'react';
import { SWRConfig } from 'swr';
import { swrFetcher } from '@/helpers/request'; // 🚨 MUST USE helpers/request
import { handleError } from '@/helpers/errors'; // 🚨 MUST USE helpers/errors
import { DEBUG_MESSAGES } from '@/constants/messages';

// Global SWR configuration for hackathon - FOLLOWS RULES
export const swrConfig = {
  fetcher: swrFetcher, // 🚨 Uses helpers/request
  revalidateOnFocus: false, // Don't refetch on window focus (good for demos)
  revalidateOnReconnect: true, // Refetch when internet comes back
  dedupingInterval: 2000, // Prevent duplicate requests for 2 seconds
  errorRetryCount: 2, // Only retry twice on error
  onError: (error: any) => {
    console.log(`❌ [SWR Global] ${DEBUG_MESSAGES.API_REQUEST_FAILED}:`, error);
    // Don't show toast here - let the component handle it or suppress in fetcher
  },
  onSuccess: (data: any) => {
    console.log(`✅ [SWR Global] ${DEBUG_MESSAGES.API_REQUEST_SUCCESS}:`, data);
  }
};

// SWR Provider wrapper
export function SWRProvider({ children }: { children: React.ReactNode }) {
  console.log(`🚀 [SWR] ${DEBUG_MESSAGES.COMPONENT_RENDERED} - Provider initialized`);
  return React.createElement(SWRConfig, { value: swrConfig }, children);
}
