import type React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/components/auth/auth-provider";
import LoggerInit from "@/components/logger-init";
import { Toaster } from "sonner";
import hackLog from "@/lib/logger";
import "./globals.css";
import { ServerHealthChecker } from "@/components/server-health-checker";
import { DevTools } from "@/components/dev-tools";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorManagerProvider } from "@/components/error-manager";

// Initialize logger on app start
if (typeof window === 'undefined') {
  hackLog.info('Application starting - Server Side', { 
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}

export const metadata: Metadata = {
  title: "Quodo - Learning Platform",
  description: "Accelerate your learning journey with personalized courses and expert mentorship",
  generator: "v0.app"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased overflow-x-hidden ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <ErrorManagerProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="quodo-theme">
              <ServerHealthChecker>
                <AuthProvider>
                  <LoggerInit />
                  {children}
                  <DevTools />
                  <Toaster 
                    richColors 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                    }}
                  />
                </AuthProvider>
              </ServerHealthChecker>
            </ThemeProvider>
          </ErrorManagerProvider>
        </ErrorBoundary>
      </body>
    </html>;
}