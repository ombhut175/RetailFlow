"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield, BookOpen, TrendingUp, Clock, Award } from "lucide-react";
import { AppNavigation } from "@/components/app-navigation";
import hackLog from "@/lib/logger";

export default function DashboardPage() {
  React.useEffect(() => {
    hackLog.componentMount('DashboardPage', {
      authRemoved: true
    });
  }, []);

  // Mock user data for demonstration
  const mockUser = {
    email: "user@example.com",
    id: "demo-user-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isEmailVerified: true
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      {/* App Navigation */}
      <AppNavigation />

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
              Welcome to Dashboard! 👋
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Demo dashboard without authentication requirements.
            </p>
          </div>

          {/* User Info Card */}
          <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <User className="h-5 w-5 text-indigo-600" />
                Demo Account Information
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Email</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{mockUser.email}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">User ID</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{mockUser.id}</p>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Member Since</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(mockUser.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Email Verification Status */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    mockUser.isEmailVerified 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Email Status</p>
                    <p className={`text-sm ${
                      mockUser.isEmailVerified 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {mockUser.isEmailVerified ? 'Verified ✓' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Last updated: {new Date(mockUser.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Profile Settings</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Update your account information and preferences.
              </p>
              <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Manage Profile →
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Security</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Change your password and manage security settings.
              </p>
              <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Security Settings →
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Help & Support</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Get help with your account or contact support.
              </p>
              <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Get Help →
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
