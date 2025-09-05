"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  description: string;
  className?: string;
  delay?: number;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  description, 
  className,
  delay = 0 
}: MetricCardProps) {
  const isPositive = trend === "up";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn("group cursor-pointer", className)}
    >
        <Card className="relative overflow-hidden bg-card/80 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-border/50">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating orb effect */}
        <div className="absolute -top-4 -right-4 h-24 w-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />
        
        <CardContent className="relative p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                  {title}
                </p>
                <Badge 
                  variant={isPositive ? "default" : "destructive"} 
                  className="text-xs px-2 py-0.5 animate-pulse"
                >
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {change}
                </Badge>
              </div>
              
              <motion.p 
                className="text-3xl font-bold text-foreground"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.3 }}
              >
                {value}
              </motion.p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <motion.div
                  animate={{ 
                    rotate: isPositive ? [0, 5, 0] : [0, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    delay: delay + 0.5
                  }}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                  )}
                </motion.div>
                <span className="font-medium">{description}</span>
              </div>
            </div>
            
            <motion.div 
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 text-primary group-hover:bg-muted/70 transition-all duration-300"
              whileHover={{ 
                rotate: [0, -10, 10, 0],
                scale: 1.1
              }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
          </div>
          
          {/* Progress indicator */}
          <div className="relative h-1 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                isPositive 
                  ? "bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300" 
                  : "bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-400 dark:to-orange-300"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.abs(parseFloat(change))}%` }}
              transition={{ delay: delay + 0.8, duration: 1, ease: "easeOut" }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}