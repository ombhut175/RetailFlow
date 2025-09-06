"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChartNoAxesCombined, 
  TrendingUp, 
  DollarSign, 
  Settings,
  Users,
  Activity,
  Eye,
  Target,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  Clock,
  Star,
  Award,
  Flame
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts";

// Import custom components
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AnimatedProgress } from "@/components/dashboard/AnimatedProgress";

// Enhanced mock data
const revenueData = [
  { month: "Jan", revenue: 45000, target: 40000, growth: 12.5 },
  { month: "Feb", revenue: 52000, target: 45000, growth: 15.6 },
  { month: "Mar", revenue: 48000, target: 50000, growth: -7.7 },
  { month: "Apr", revenue: 61000, target: 55000, growth: 27.1 },
  { month: "May", revenue: 55000, target: 60000, growth: -9.8 },
  { month: "Jun", revenue: 67000, target: 65000, growth: 21.8 },
];

const userGrowthData = [
  { month: "Jan", users: 1200, newUsers: 120, retention: 85 },
  { month: "Feb", users: 1450, newUsers: 250, retention: 87 },
  { month: "Mar", users: 1680, newUsers: 230, retention: 89 },
  { month: "Apr", users: 1920, newUsers: 240, retention: 91 },
  { month: "May", users: 2150, newUsers: 230, retention: 88 },
  { month: "Jun", users: 2400, newUsers: 250, retention: 92 },
];

const performanceData = [
  { name: "Page Load Speed", value: 92, color: "hsl(var(--chart-1))", target: 95 },
  { name: "API Response Time", value: 88, color: "hsl(var(--chart-2))", target: 90 },
  { name: "User Experience", value: 94, color: "hsl(var(--chart-3))", target: 85 },
  { name: "Conversion Rate", value: 76, color: "hsl(var(--chart-4))", target: 80 },
  { name: "Mobile Performance", value: 85, color: "hsl(var(--chart-5))", target: 90 },
];

const trafficData = [
  { source: "Direct", visitors: 3200, percentage: 35, growth: "+12%" },
  { source: "Organic Search", visitors: 2800, percentage: 30, growth: "+8%" },
  { source: "Social Media", visitors: 1800, percentage: 20, growth: "+15%" },
  { source: "Referral", visitors: 900, percentage: 10, growth: "+5%" },
  { source: "Email Campaign", visitors: 450, percentage: 5, growth: "+22%" },
];

const deviceData = [
  { device: "Desktop", users: 4200, percentage: 45 },
  { device: "Mobile", users: 3800, percentage: 41 },
  { device: "Tablet", users: 1300, percentage: 14 },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  target: { label: "Target", color: "hsl(var(--chart-2))" },
  users: { label: "Total Users", color: "hsl(var(--chart-3))" },
  newUsers: { label: "New Users", color: "hsl(var(--chart-4))" },
  retention: { label: "Retention", color: "hsl(var(--chart-5))" },
};

export default function KombaiDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Enhanced Header */}
          <DashboardHeader />

          {/* Key Metrics Cards with staggered animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <MetricCard
              title="Total Revenue"
              value="$67,000"
              change="+12.5%"
              trend="up"
              icon={<DollarSign className="h-6 w-6" />}
              description="vs last month"
              delay={0.1}
            />
            <MetricCard
              title="Active Users"
              value="2,400"
              change="+8.2%"
              trend="up"
              icon={<Users className="h-6 w-6" />}
              description="vs last month"
              delay={0.2}
            />
            <MetricCard
              title="Page Views"
              value="45,210"
              change="+15.3%"
              trend="up"
              icon={<Eye className="h-6 w-6" />}
              description="vs last month"
              delay={0.3}
            />
            <MetricCard
              title="Conversion Rate"
              value="3.24%"
              change="-2.1%"
              trend="down"
              icon={<Target className="h-6 w-6" />}
              description="vs last month"
              delay={0.4}
            />
          </motion.div>

          {/* Enhanced Charts Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            <ChartCard
              title="Revenue Analytics"
              description="Track revenue performance against targets"
              icon={<ChartNoAxesCombined className="h-5 w-5" />}
              delay={0.5}
            >
              <ChartContainer config={chartConfig} className="h-80 w-full">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "5 5" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--chart-2))"
                    fill="url(#targetGradient)"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    fill="url(#revenueGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard
              title="User Growth Metrics"
              description="Monitor user acquisition and retention"
              icon={<TrendingUp className="h-5 w-5" />}
              delay={0.6}
            >
              <ChartContainer config={chartConfig} className="h-80 w-full">
                <BarChart data={userGrowthData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="users" 
                    fill="hsl(var(--chart-3))" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Bar 
                    dataKey="newUsers" 
                    fill="hsl(var(--chart-4))" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.9}
                  />
                </BarChart>
              </ChartContainer>
            </ChartCard>
          </div>

          {/* Performance and Traffic Section */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Enhanced Performance Metrics */}
            <ChartCard
              title="Performance Metrics"
              description="System performance indicators"
              icon={<Zap className="h-5 w-5" />}
              delay={0.7}
              className="lg:col-span-1"
            >
              <div className="space-y-6">
                {performanceData.map((item, index) => (
                  <div key={item.name} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </div>
                      <Badge variant={item.value >= item.target ? "default" : "destructive"} className="text-xs">
                        {item.value}%
                      </Badge>
                    </div>
                    <AnimatedProgress
                      value={item.value}
                      label=""
                      color={item.color}
                      delay={0.8 + index * 0.1}
                      showPercentage={false}
                    />
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Enhanced Traffic Sources */}
            <ChartCard
              title="Traffic Analytics"
              description="Visitor source breakdown"
              icon={<Globe className="h-5 w-5" />}
              delay={0.8}
              className="lg:col-span-2"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  {trafficData.map((item, index) => (
                    <motion.div
                      key={item.source}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full shadow-sm"
                          style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                        />
                        <div>
                          <span className="text-sm font-medium text-foreground">{item.source}</span>
                          <div className="text-xs text-muted-foreground">{item.percentage}% of total</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">{item.visitors.toLocaleString()}</div>
                        <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                          {item.growth}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex items-center justify-center">
                  <ChartContainer config={chartConfig} className="h-64 w-64">
                    <PieChart>
                      <Pie
                        data={trafficData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="visitors"
                      >
                        {trafficData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Enhanced Detailed Analytics Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Card className="border-border bg-card shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-card-foreground">Detailed Analytics</span>
                  <Badge variant="secondary" className="ml-auto">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4 bg-muted">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                      <Monitor className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-background">
                      <Users className="h-4 w-4 mr-2" />
                      Users
                    </TabsTrigger>
                    <TabsTrigger value="revenue" className="data-[state=active]:bg-background">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Revenue
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="data-[state=active]:bg-background">
                      <Zap className="h-4 w-4 mr-2" />
                      Performance
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      {[
                        { title: "Total Sessions", value: "12,345", change: "+5.2%", icon: Activity },
                        { title: "Bounce Rate", value: "42.3%", change: "-2.1%", icon: Target },
                        { title: "Avg. Session Duration", value: "3m 24s", change: "+12s", icon: Clock },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 + index * 0.1 }}
                          className="p-6 rounded-2xl bg-muted/50 border border-border"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                              <stat.icon className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="font-medium text-sm text-foreground">{stat.title}</h4>
                          </div>
                          <p className="text-2xl font-bold mb-1 text-foreground">{stat.value}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            {stat.change} from last week
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="users" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                          <Users className="h-4 w-4" />
                          User Segmentation
                        </h4>
                        <div className="space-y-4">
                          <AnimatedProgress value={65} label="New Users" delay={1.2} />
                          <AnimatedProgress value={35} label="Returning Users" delay={1.3} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                          <Smartphone className="h-4 w-4" />
                          Device Breakdown
                        </h4>
                        <div className="space-y-3">
                          {deviceData.map((device, index) => (
                            <div key={device.device} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                              <span className="text-sm font-medium text-foreground">{device.device}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{device.users.toLocaleString()}</span>
                                <Badge variant="outline">{device.percentage}%</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="revenue" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                          <DollarSign className="h-4 w-4" />
                          Revenue Streams
                        </h4>
                        <div className="space-y-3">
                          {[
                            { name: "Product Sales", amount: "$45,200", percentage: 67 },
                            { name: "Subscriptions", amount: "$18,500", percentage: 28 },
                            { name: "Services", amount: "$3,300", percentage: 5 },
                          ].map((item, index) => (
                            <div key={item.name} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                              <span className="text-sm font-medium text-foreground">{item.name}</span>
                              <div className="text-right">
                                <div className="text-sm font-bold text-foreground">{item.amount}</div>
                                <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                          <Award className="h-4 w-4" />
                          Key Metrics
                        </h4>
                        <div className="p-6 rounded-2xl bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Flame className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-foreground">Monthly Recurring Revenue</span>
                          </div>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">$18,500</p>
                          <p className="text-sm text-green-600/80 dark:text-green-400/80">+8.3% from last month</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="performance" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                          <Zap className="h-4 w-4" />
                          Core Web Vitals
                        </h4>
                        <div className="space-y-3">
                          {[
                            { metric: "Largest Contentful Paint", value: "1.2s", status: "good" },
                            { metric: "First Input Delay", value: "45ms", status: "good" },
                            { metric: "Cumulative Layout Shift", value: "0.08", status: "needs-improvement" },
                          ].map((vital) => (
                            <div key={vital.metric} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                              <span className="text-sm font-medium text-foreground">{vital.metric}</span>
                              <Badge variant={vital.status === "good" ? "default" : "destructive"}>
                                {vital.value}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                          <Wifi className="h-4 w-4" />
                          System Health
                        </h4>
                        <div className="space-y-3">
                          <AnimatedProgress value={99.9} label="Uptime" delay={1.5} />
                          <AnimatedProgress value={0.12} label="4xx Error Rate" delay={1.6} />
                          <AnimatedProgress value={0.03} label="5xx Error Rate" delay={1.7} />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}