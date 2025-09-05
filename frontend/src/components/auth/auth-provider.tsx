/**
 * Auth Provider - Simplified provider without auth checks
 * No longer checks auth status or manages authentication state
 */

"use client";

import * as React from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 * Simplified component that just renders children without any auth logic
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}

/**
 * Hook that was used to protect routes - now always allows access
 */
export function useAuthProtection() {
  return {
    isAuthenticated: true,
    isLoading: false,
    shouldRender: true
  };
}

/**
 * Hook that was used to redirect authenticated users - now always allows rendering
 */
export function useGuestProtection() {
  return {
    isAuthenticated: false,
    isLoading: false,
    shouldRender: true
  };
}
