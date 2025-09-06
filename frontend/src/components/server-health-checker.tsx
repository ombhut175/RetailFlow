"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/helpers/request";
import hackLog from "@/lib/logger";

interface ServerHealthCheckerProps {
  children: React.ReactNode;
}

const ServerErrorComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
    <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-slate-900 rounded-lg shadow-xl">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Server Unavailable
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Unable to connect to the server. Please check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
      >
        Retry
      </button>
    </div>
  </div>
);

export function ServerHealthChecker({ children }: ServerHealthCheckerProps) {
  const [isServerHealthy, setIsServerHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkServerHealth = async () => {
      hackLog.info('Checking server health on app startup');
      
      try {
        // Make a silent health check request (suppress toast notifications)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5099'}/api/${API_ENDPOINTS.HEALTH.STATUS}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          hackLog.info('Server health check passed');
          setIsServerHealthy(true);
        } else {
          hackLog.error('Server health check failed with status', { status: response.status });
          setIsServerHealthy(false);
        }
      } catch (error) {
        hackLog.error('Server health check failed with error', error);
        setIsServerHealthy(false);
      }
    };

    checkServerHealth();
  }, []);

  // Show loading state while checking
  if (isServerHealthy === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-600 dark:text-slate-300">
          Connecting to server...
        </div>
      </div>
    );
  }

  // Show error component if server is not healthy
  if (!isServerHealthy) {
    return <ServerErrorComponent />;
  }

  // Server is healthy, render children
  return <>{children}</>;
}
