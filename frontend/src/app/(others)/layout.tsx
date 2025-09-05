"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";

interface OtherLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for routes that require authentication
 * Redirects unauthenticated users to login
 */
export default function OtherLayout({ children }: OtherLayoutProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    hackLog.componentMount('OtherLayout', {
      timestamp: new Date().toISOString(),
    });
  }, []);

  React.useEffect(() => {
    // If user is not logged in, redirect to login
    if (isLoggedIn === false) {
      hackLog.info('User is not logged in, redirecting to login from protected route');
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [isLoggedIn, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-600 dark:text-slate-300">
          Verifying authentication...
        </div>
      </div>
    );
  }

  // If user is not logged in, don't render protected content (redirect is happening)
  if (isLoggedIn === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-600 dark:text-slate-300">
          Redirecting to login...
        </div>
      </div>
    );
  }

  // User is logged in, render the protected content
  return <>{children}</>;
}