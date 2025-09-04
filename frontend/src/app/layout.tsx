import type React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import LoggerInit from "@/components/logger-init";
import hackLog from "@/lib/logger";
import "./globals.css";

// Initialize logger on app start
if (typeof window === 'undefined') {
  hackLog.info('Application starting - Server Side', { 
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}

export const metadata: Metadata = {
  title: "Theme Reference System",
  description: "Comprehensive theme reference for design systems",
  generator: "v0.app"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased overflow-x-hidden ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="theme-reference-theme">
          <LoggerInit />
          {children}
        </ThemeProvider>
      </body>
    </html>;
}