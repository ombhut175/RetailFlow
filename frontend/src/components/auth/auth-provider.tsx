/**
 * Auth Provider - Initializes and manages authentication state
 * Checks auth status on app startup and provides auth context to components
 */

"use client";

import * as React from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 * Initializes auth state on mount and provides loading state during auth check
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuthStatus, isLoading } = useAuthStore();
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      hackLog.componentMount('AuthProvider', {
        trigger: 'app_initialization'
      });

      try {
        await checkAuthStatus();
      } catch (error: any) {
        hackLog.error('Auth initialization failed', {
          error: error.message,
          component: 'AuthProvider'
        });
      } finally {
        if (isMounted) {
          setInitialized(true);
          hackLog.storeAction('authInitialized', {
            component: 'AuthProvider'
          });
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuthStatus]);

  // Show loading state while initializing auth
  if (!initialized && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to protect routes that require authentication
 * Redirects to login if not authenticated
 */
export function useAuthProtection(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && typeof window !== 'undefined') {
      hackLog.storeAction('authProtectionRedirect', {
        redirectTo,
        reason: 'not_authenticated',
        currentPath: window.location.pathname
      });
      
      // Use window.location for client-side redirect to avoid hook issues
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
    shouldRender: isAuthenticated && !isLoading
  };
}

/**
 * Hook to redirect authenticated users away from auth pages
 * Redirects to dashboard if already authenticated
 */
export function useGuestProtection(redirectTo: string = ROUTES.DASHBOARD) {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && typeof window !== 'undefined') {
      hackLog.storeAction('guestProtectionRedirect', {
        redirectTo,
        reason: 'already_authenticated',
        currentPath: window.location.pathname
      });
      
      // Use window.location for client-side redirect to avoid hook issues
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
    shouldRender: !isAuthenticated && !isLoading
  };
}
