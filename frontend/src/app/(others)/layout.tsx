"use client";

import * as React from "react";
import { AppNavigation } from "@/components/app-navigation";
import { Toaster } from "@/components/ui/toaster";
import hackLog from "@/lib/logger";

interface OtherLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for main application pages with navigation
 * Includes the AppNavigation component and common UI elements
 */
export default function OtherLayout({ children }: OtherLayoutProps) {
  React.useEffect(() => {
    hackLog.componentMount('OtherLayout', {
      timestamp: new Date().toISOString(),
      mode: 'demo-with-navigation'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      {/* App Navigation */}
      <AppNavigation />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}