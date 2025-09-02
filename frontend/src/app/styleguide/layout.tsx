import type React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";
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
          <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
            <div className="container mx-auto flex h-14 items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <div className="size-6 rounded-md bg-gradient-to-br from-primary/80 to-primary/40" />

                <span className="hidden sm:inline">Theme Reference</span>
              </Link>
              <nav className="flex items-center gap-2">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Signup
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>;
}