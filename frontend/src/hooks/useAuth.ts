"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/helpers/request";
import hackLog from "@/lib/logger";

interface UseAuthResult {
  isLoggedIn: boolean | null; // null = loading, true = logged in, false = not logged in
  user: { id: string; email: string } | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    hackLog.info('Checking user authentication status');
    
    try {
      setIsLoading(true);
      
      // Call the isLoggedIn endpoint
      const response = await apiRequest.get<{
        isLoggedIn: boolean;
        user: { id: string; email: string } | null;
      }>(API_ENDPOINTS.AUTH.IS_LOGGED_IN, false); // false = don't show success toast
      
      setIsLoggedIn(response.isLoggedIn);
      setUser(response.user);
      
      hackLog.info('Auth status check completed', {
        isLoggedIn: response.isLoggedIn,
        userEmail: response.user?.email || 'none'
      });
      
    } catch (error) {
      hackLog.error('Auth status check failed', error);
      // On error, assume user is not logged in
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    isLoggedIn,
    user,
    isLoading,
    refetch: checkAuthStatus,
  };
}
