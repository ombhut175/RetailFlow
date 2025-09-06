"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Store, ArrowLeft, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import hackLog from "@/lib/logger";

// Premium auth layout with sophisticated design matching the main page
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

  // Show premium loading state while checking auth
  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-background to-muted/40 flex items-center justify-center">
        <BackgroundAura />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-500 shadow-lg">
            <Store className="h-6 w-6 text-white drop-shadow" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"
            />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // If user is logged in, show premium redirect state
  if (isLoggedIn === true) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-background to-muted/40 flex items-center justify-center">
        <BackgroundAura />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-500 shadow-lg">
            <Store className="h-6 w-6 text-white drop-shadow" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">Redirecting to dashboard...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative min-h-screen bg-gradient-to-b from-background to-muted/40 text-foreground antialiased">
        {/* Background visuals */}
        <BackgroundAura />

        {/* Minimal Header */}
        <Header />

        {/* Page container with subtle entrance */}
        <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 md:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={(typeof window !== "undefined" && window.location.pathname) || "auth"}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="w-full"
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
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-card/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        
        {/* Back to Home + Brand */}
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href={ROUTES.HOME} 
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Home
            </Link>
          </motion.div>
          
          <div className="h-4 w-px bg-border" />
          
          <Link href={ROUTES.HOME} className="group inline-flex items-center gap-2">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-500 shadow-sm ring-1 ring-border transition-transform duration-200 group-hover:scale-105">
              <Store className="h-5 w-5 text-white drop-shadow" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight">RetailFlow</span>
              <span className="text-xs text-muted-foreground">Retail Platform</span>
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
  const [mounted, setMounted] = React.useState(false);
  const isDark = (resolvedTheme || theme) === "dark";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl border border-border bg-card" />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-all hover:shadow-md hover:text-foreground"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="grid place-items-center"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.div>
      </AnimatePresence>

      {/* Glow */}
      <span className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(120px_circle_at_var(--x,50%)_var(--y,50%),rgba(16,185,129,0.25),transparent_70%)] group-hover:opacity-100" />
    </motion.button>
  );
}

// Premium background effects with grid, gradient, and glow
function BackgroundAura() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Soft radial gradient blobs with motion */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 blur-3xl dark:from-emerald-500/20 dark:to-teal-500/10" 
      />
      <motion.div 
        animate={{ 
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-green-400/25 to-emerald-400/20 blur-3xl dark:from-green-500/15 dark:to-emerald-500/10" 
      />
      <motion.div 
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-400/10 via-teal-400/5 to-sky-400/10 blur-3xl" 
      />

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
