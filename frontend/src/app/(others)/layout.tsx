import * as React from "react";

interface OtherLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for routes that don't require authentication
 * Simplified layout without auth checks
 */
export default function OtherLayout({ children }: OtherLayoutProps) {
  return <>{children}</>;
}