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
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-blue-50/50 rounded-2xl blur-3xl dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />
      
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800/80">
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg dark:bg-indigo-500">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
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
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse mr-2" />
              Live Data
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
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
            className="bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-300 dark:bg-slate-800/50 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-300 dark:bg-slate-800/50 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-300 dark:bg-slate-800/50 dark:hover:bg-slate-800"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />
          
          <ThemeToggle />
        </motion.div>
      </div>
    </motion.div>
  );
}