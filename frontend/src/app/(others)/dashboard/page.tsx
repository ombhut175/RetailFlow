"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BarChart3, 
  Package, 
  FolderOpen, 
  Warehouse, 
  ShoppingCart,
  Shield,
  TrendingUp,
  Activity,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";

export default function DashboardPage() {
  React.useEffect(() => {
    hackLog.componentMount('DashboardPage', {
      authRemoved: true
    });
  }, []);

  const features = [
    {
      title: "Analytics Dashboard",
      description: "View comprehensive analytics, charts, and key performance metrics",
      icon: BarChart3,
      href: ROUTES.ANALYTICS,
      color: "bg-blue-500",
      stats: "15+ Charts",
      isHighlighted: true
    },
    {
      title: "Categories",
      description: "Manage product categories with full CRUD operations",
      icon: FolderOpen,
      href: ROUTES.CATEGORIES,
      color: "bg-purple-500",
      stats: "Organized"
    },
    {
      title: "Products",
      description: "Complete product inventory management system",
      icon: Package,
      href: ROUTES.PRODUCTS,
      color: "bg-green-500",
      stats: "Inventory"
    },
    {
      title: "Stock Management",
      description: "Track stock levels, adjustments, and reservations",
      icon: Warehouse,
      href: ROUTES.STOCK,
      color: "bg-orange-500",
      stats: "Real-time"
    },
    {
      title: "Purchase Orders",
      description: "Manage purchase orders and supplier relationships",
      icon: ShoppingCart,
      href: ROUTES.PURCHASE_ORDERS,
      color: "bg-red-500",
      stats: "Automated"
    },
    {
      title: "Admin Panel",
      description: "Manage users, roles, and system permissions",
      icon: Shield,
      href: ROUTES.ADMIN,
      color: "bg-indigo-500",
      stats: "Secure"
    }
  ];

  const stats = [
    { label: "Total Features", value: "5+", icon: Zap, color: "text-blue-600" },
    { label: "Pages Built", value: "12+", icon: Activity, color: "text-green-600" },
    { label: "Components", value: "50+", icon: Package, color: "text-purple-600" },
    { label: "Last Updated", value: "Today", icon: Calendar, color: "text-orange-600" }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Welcome to Quodo Dashboard 🚀
            </h1>
            <p className="mt-3 text-xl text-muted-foreground">
              Your complete inventory and analytics platform
            </p>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Features */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Main Features
              </h2>
              <Badge variant="secondary" className="px-3 py-1">
                <TrendingUp className="mr-1 h-3 w-3" />
                All Features Active
              </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    feature.isHighlighted ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.color} text-white`}>
                          <feature.icon className="h-6 w-6" />
                        </div>
                        {feature.isHighlighted && (
                          <Badge variant="default" className="bg-blue-500">
                            <Star className="mr-1 h-3 w-3 fill-current" />
                            Featured
                          </Badge>
                        )}
                        {!feature.isHighlighted && (
                          <Badge variant="outline">
                            {feature.stats}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mt-4 text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full group-hover:bg-primary/90">
                        <Link href={feature.href}>
                          Explore Feature
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Start Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Get started with the most important features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Setup Categories</h4>
                    <p className="text-sm text-muted-foreground">
                      Start by organizing your product categories
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Add Products</h4>
                    <p className="text-sm text-muted-foreground">
                      Create your product inventory with details
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Monitor Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Track performance with comprehensive analytics
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}
