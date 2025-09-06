"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { toast } from "sonner";
import { ShoppingCart, Package, BarChart3, Sparkles, CheckCircle, ArrowRight, Shield, Users } from "lucide-react";
import AuthCard, { Field, Input, PasswordInput, SubmitButton, MutedLink } from "../_components/auth-card";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useGuestProtection } from "@/components/auth/auth-provider";
import hackLog from "@/lib/logger";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoginLoading, loginError, clearErrors } = useAuthStore();
  const { shouldRender } = useGuestProtection();
  const [formErrors, setFormErrors] = React.useState<{ email?: string; password?: string } | null>(null);

  React.useEffect(() => {
    hackLog.componentMount('LoginPage', {
      hasLoginError: !!loginError,
      isLoading: isLoginLoading
    });

    // Clear any previous errors when component mounts
    clearErrors();
  }, [clearErrors]);

  function validate(form: FormData) {
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const nextErrors: { email?: string; password?: string } = {};
    
    if (!email) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    
    return { email, password, nextErrors };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { email, password, nextErrors } = validate(form);
    
    hackLog.formSubmit('login', {
      email,
      passwordLength: password.length,
      hasValidationErrors: Object.keys(nextErrors).length > 0,
      component: 'LoginPage'
    });

    // Clear previous errors
    setFormErrors(null);
    clearErrors();

    // Check for validation errors
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      hackLog.formValidation('login', nextErrors);
      return;
    }

    try {
      const success = await login({ email, password });
      
      if (success) {
        hackLog.storeAction('loginRedirect', {
          email,
          redirectTo: '/dashboard',
          component: 'LoginPage'
        });
        
        toast.success('Welcome back! Login successful.');
        router.push("/dashboard");
      }
      // If login failed, error is already in loginError from store
    } catch (error: any) {
      hackLog.error('Login submission failed', {
        error: error.message,
        email,
        component: 'LoginPage'
      });
    }
  }

  // Don't render if user is already authenticated
  if (!shouldRender) {
    return null;
  }

  // Display either form validation errors or API errors
  const displayErrors = formErrors || (loginError ? { password: loginError } : null);

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 py-8 md:grid-cols-2 md:gap-16 lg:py-12">
      {/* Premium Hero Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="order-2 md:order-1"
      >
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-sm mb-4"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            Welcome back to RetailFlow
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-foreground via-emerald-600 to-teal-600 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent md:text-5xl dark:via-emerald-300 dark:to-teal-300"
          >
            Access your retail dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-base text-muted-foreground md:text-lg"
          >
            Continue managing your inventory, processing sales, and growing your business with powerful analytics.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AuthCard
            title="Sign in to your account"
            subtitle="Enter your credentials to continue"
            footer={
              <div className="space-x-1 text-center">
                <span className="text-muted-foreground">New to RetailFlow?</span>
                <MutedLink href="/signup">Create an account</MutedLink>
              </div>
            }
          >
            <form className="grid gap-5" onSubmit={onSubmit}>
              <Field label="Email address" error={displayErrors?.email}>
                <Input 
                  name="email" 
                  type="email" 
                  inputMode="email" 
                  placeholder="you@retailstore.com" 
                  autoComplete="email" 
                  required 
                />
              </Field>

              <Field label="Password" error={displayErrors?.password}>
                <PasswordInput 
                  name="password" 
                  placeholder="Enter your password" 
                  autoComplete="current-password" 
                  required 
                />
              </Field>

              <div className="flex items-center justify-between">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <input 
                    type="checkbox" 
                    name="remember" 
                    className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500/20 focus:ring-2" 
                  />
                  <span>Remember me</span>
                </label>
                <MutedLink href="/forgot-password">Forgot password?</MutedLink>
              </div>

              <SubmitButton type="submit" loading={isLoginLoading}>
                {isLoginLoading ? 'Signing in...' : 'Sign in'}
              </SubmitButton>

              <div className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our{' '}
                <Link href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                .
              </div>
            </form>
          </AuthCard>
        </motion.div>
      </motion.div>

      {/* Enhanced Visual Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="order-1 md:order-2"
      >
        <PremiumHeroVisual />
      </motion.div>
    </section>
  );
}

function PremiumHeroVisual() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const features = [
    {
      icon: Package,
      title: "Smart Inventory",
      description: "AI-powered stock management with predictive analytics",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      delay: 0.1
    },
    {
      icon: ShoppingCart,
      title: "Lightning POS",
      description: "Ultra-fast checkout with seamless payment processing",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      delay: 0.2
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights and comprehensive business intelligence",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      delay: 0.3
    }
  ];

  return (
    <div className="relative space-y-8">
      {/* Hero Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
          >
            <Shield className="h-4 w-4" />
            Enterprise-grade security
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent lg:text-4xl"
          >
            Transform your retail operations
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Join thousands of retailers who trust RetailFlow to streamline operations, boost sales, and scale their business with confidence.
          </motion.p>
        </div>

        {/* Interactive 3D Card */}
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
          className="relative cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card to-card/60 p-8 shadow-2xl backdrop-blur-sm">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-xl" />
            
            <div className="relative space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: feature.delay, duration: 0.5 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="group flex items-start gap-4 rounded-xl p-4 transition-all duration-300 hover:bg-card/50"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} backdrop-blur-sm transition-all duration-300 group-hover:shadow-lg`}
                    >
                      <Icon className={`h-6 w-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                    </motion.div>
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative overflow-hidden rounded-xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 p-6 dark:border-emerald-800/50 dark:from-emerald-950/50 dark:to-teal-950/50"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg"
            >
              <CheckCircle className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-foreground">Trusted by 10,000+ retailers</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="h-4 w-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Join the growing community of successful businesses worldwide
              </p>
            </div>
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}