"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Download, 
  RefreshCw, 
  Settings,
  Sparkles,
  Activity
} from "lucide-react";

export function DashboardHeader() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="relative"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-2xl blur-3xl" />
      
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Monitor your key metrics and performance indicators
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 dark:border-green-400/20">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse mr-2" />
              Live Data
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Calendar className="h-3 w-3 mr-1" />
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <div className="h-8 w-px bg-border/50" />
          
          <ThemeToggle />
        </motion.div>
      </div>
    </motion.div>
  );
}