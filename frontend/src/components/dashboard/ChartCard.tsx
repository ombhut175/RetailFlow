"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  description?: string;
}

export function ChartCard({ 
  title, 
  icon, 
  children, 
  className, 
  delay = 0,
  description 
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 80,
        damping: 20
      }}
      whileHover={{ 
        y: -4,
        rotateX: 2,
        transition: { duration: 0.2 }
      }}
      className={cn("group", className)}
    >
      <Card className="relative overflow-hidden border border-slate-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 dark:border-slate-700 dark:bg-slate-800">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-blue-50/30 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]" />
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-indigo-400/20 dark:bg-indigo-400/10 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                y: [-10, -20, -10],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
        
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400"
              whileHover={{ 
                rotate: 360,
                scale: 1.1
              }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
            <div className="flex flex-col">
              <span className="text-slate-900 dark:text-slate-100">
                {title}
              </span>
              {description && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
                  {description}
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
            className="relative"
          >
            {children}
          </motion.div>
          
          {/* Bottom glow effect */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </CardContent>
      </Card>
    </motion.div>
  );
}