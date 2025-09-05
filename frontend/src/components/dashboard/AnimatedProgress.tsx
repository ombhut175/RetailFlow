"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number;
  label: string;
  color?: string;
  delay?: number;
  className?: string;
  showPercentage?: boolean;
}

export function AnimatedProgress({ 
  value, 
  label, 
  color = "hsl(var(--primary))",
  delay = 0,
  className,
  showPercentage = true
}: AnimatedProgressProps) {
  const [animatedValue, setAnimatedValue] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={cn("space-y-3", className)}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
        {showPercentage && (
          <motion.span 
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.5, type: "spring", stiffness: 200 }}
          >
            {animatedValue}%
          </motion.span>
        )}
      </div>
      
      <div className="relative">
        <Progress 
          value={animatedValue} 
          className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner" 
        />
        
        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)`,
            filter: "blur(4px)",
          }}
          animate={{
            x: [-100, 100],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            delay: delay + 1,
          }}
        />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-slate-100/20"
            animate={{
              x: [-32, 200],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: delay + 0.8,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}