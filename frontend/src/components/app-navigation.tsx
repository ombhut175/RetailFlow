"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES, NAV_ITEMS } from "@/constants/routes";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { GraduationCap } from "lucide-react";
import hackLog from "@/lib/logger";

export function AppNavigation() {
  const pathname = usePathname();

  React.useEffect(() => {
    hackLog.componentMount('AppNavigation', {
      currentPath: pathname,
      authRemoved: true
    });
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href={ROUTES.HOME} className="mr-6 flex items-center space-x-2">
            <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 ring-1 ring-border">
              <GraduationCap className="h-4 w-4 text-white" />
            </span>
            <span className="font-bold">Quodo</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href ? "text-foreground" : "text-foreground/60"
              )}
              onClick={() => {
                if (pathname !== item.href) {
                  hackLog.routeChange(pathname, item.href);
                }
              }}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          
          {/* Simplified navigation without auth state */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Demo Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
}
