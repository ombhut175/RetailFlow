"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Store, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import hackLog from "@/lib/logger";

// Simplified layout for auth routes: minimal header with back to home button
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    hackLog.componentMount('AuthLayout', {
      timestamp: new Date().toISOString(),
    });
  }, []);

  React.useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (isLoggedIn === true) {
      hackLog.info('User is logged in, redirecting to dashboard from auth layout');
      router.push(ROUTES.DASHBOARD);
    }
  }, [isLoggedIn, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-600 dark:text-slate-300">
          Loading...
        </div>
      </div>
    );
  }

  // If user is logged in, don't render auth form (redirect is happening)
  if (isLoggedIn === true) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-600 dark:text-slate-300">
          Redirecting to dashboard...
        </div>
      </div>
    );
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative min-h-dvh bg-gradient-to-b from-white to-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:from-[#0B1020] dark:to-[#0A0F1D] dark:text-slate-100">
        {/* Background visuals */}
        <BackgroundAura />

        {/* Minimal Header */}
        <Header />

        {/* Page container with subtle entrance */}
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={(typeof window !== "undefined" && window.location.pathname) || "auth"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="px-4 py-10 md:px-6 md:py-14 lg:py-16"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </NextThemesProvider>
  );
}

// Minimal header with just brand and theme toggle
function Header() {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-black/5 bg-white/70 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-[#0B1020]/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        
        {/* Back to Home + Brand */}
        <div className="flex items-center gap-4">
          <Link 
            href={ROUTES.HOME} 
            className="group inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          
          <Link href={ROUTES.HOME} className="group inline-flex items-center gap-2">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-500 shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105 dark:ring-white/10">
              <Store className="h-5 w-5 text-white drop-shadow" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight">RetailFlow</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Retail Platform</span>
            </div>
          </Link>
        </div>

        {/* Just theme toggle - no auth navigation needed since user is already on auth pages */}
        <div className="flex items-center gap-3">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

// Theme toggle with subtle micro-interactions
function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white/70 text-slate-700 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
    >
      <motion.span
        key={isDark ? "dark" : "light"}
        initial={{ y: 8, opacity: 0, rotate: -6 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: -8, opacity: 0, rotate: 6 }}
        transition={{ duration: 0.25 }}
        className="grid place-items-center"
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </motion.span>

      {/* Glow */}
      <span className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(120px_circle_at_var(--x,50%)_var(--y,50%),rgba(16,185,129,0.25),transparent_70%)] group-hover:opacity-100" />
    </motion.button>
  );
}

// Premium background effects with grid, gradient, and glow
function BackgroundAura() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft radial gradient blobs */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 blur-3xl dark:from-emerald-500/20 dark:to-teal-500/10" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-green-400/25 to-emerald-400/20 blur-3xl dark:from-green-500/15 dark:to-emerald-500/10" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(55%_60%_at_50%_40%,black,transparent)] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(100,116,139,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.15) 1px, transparent 1px)",
          backgroundSize: "28px 28px, 28px 28px",
          backgroundPosition: "-1px -1px",
        }}
      />

      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-[64px] h-px bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />
    </div>
  );
}
