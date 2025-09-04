"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LogOut, User, Mail, Calendar, Shield } from "lucide-react";
import { useAuthStore, useAuthUser } from "@/hooks/use-auth-store";
import { useAuthProtection } from "@/components/auth/auth-provider";
import hackLog from "@/lib/logger";

export default function DashboardPage() {
  const { logout, isLogoutLoading } = useAuthStore();
  const user = useAuthUser();
  const { shouldRender } = useAuthProtection();
  const router = useRouter();

  React.useEffect(() => {
    hackLog.componentMount('DashboardPage', {
      hasUser: !!user,
      userId: user?.id,
      isEmailVerified: user?.isEmailVerified
    });
  }, [user]);

  const handleLogout = async () => {
    hackLog.storeAction('userLogout', {
      userId: user?.id,
      trigger: 'user_action',
      component: 'DashboardPage'
    });

    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error: any) {
      hackLog.error('Logout failed', {
        error: error.message,
        component: 'DashboardPage'
      });
    }
  };

  // Don't render if user is not authenticated
  if (!shouldRender || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Shield className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Dashboard
              </h1>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {isLogoutLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {isLogoutLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

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
              Welcome back! 👋
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Here's your account information and quick actions.
            </p>
          </div>

          {/* User Info Card */}
          <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <User className="h-5 w-5 text-indigo-600" />
                Account Information
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">User ID</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{user.id}</p>
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
                      {new Date(user.created_at).toLocaleDateString('en-US', {
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
                    user.isEmailVerified 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Email Status</p>
                    <p className={`text-sm ${
                      user.isEmailVerified 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {user.isEmailVerified ? 'Verified ✓' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Last updated: {new Date(user.updated_at).toLocaleString()}
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
