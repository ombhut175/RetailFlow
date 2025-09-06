"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { toast } from "sonner";
import { Rocket, Zap, TrendingUp, Sparkles, CheckCircle, ArrowRight, Crown, Target, Globe } from "lucide-react";
import AuthCard, { Field, Input, PasswordInput, SubmitButton, MutedLink } from "../_components/auth-card";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useGuestProtection } from "@/components/auth/auth-provider";
import hackLog from "@/lib/logger";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isSignupLoading, signupError, clearErrors } = useAuthStore();
  const { shouldRender } = useGuestProtection();
  const [formErrors, setFormErrors] = React.useState<{ firstName?: string; lastName?: string; email?: string; password?: string; confirmPassword?: string } | null>(null);

  React.useEffect(() => {
    hackLog.componentMount('SignupPage', {
      hasSignupError: !!signupError,
      isLoading: isSignupLoading
    });

    // Clear any previous errors when component mounts
    clearErrors();
  }, [clearErrors]);

  function validate(form: FormData) {
    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    const nextErrors: { firstName?: string; lastName?: string; email?: string; password?: string; confirmPassword?: string } = {};
    
    if (!firstName) nextErrors.firstName = "First name is required";
    if (!lastName) nextErrors.lastName = "Last name is required";
    if (!email) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 8) nextErrors.password = "At least 8 characters";
    if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match";
    
    return { firstName, lastName, email, password, confirmPassword, nextErrors };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { firstName, lastName, email, password, nextErrors } = validate(form);
    
    hackLog.formSubmit('signup', {
      firstName,
      lastName,
      email,
      passwordLength: password.length,
      hasValidationErrors: Object.keys(nextErrors).length > 0,
      component: 'SignupPage'
    });

    // Clear previous errors
    setFormErrors(null);
    clearErrors();

    // Check for validation errors
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      hackLog.formValidation('signup', nextErrors);
      return;
    }

    try {
      // Backend signup only needs email and password (name is not in the DTO)
      const success = await signup({ email, password });
      
      if (success) {
        hackLog.storeAction('signupRedirect', {
          email,
          redirectTo: '/login',
          component: 'SignupPage'
        });
        
        toast.success('Account created successfully! Please log in.');
        router.push("/login");
      }
      // If signup failed, error is already in signupError from store
    } catch (error: any) {
      hackLog.error('Signup submission failed', {
        error: error.message,
        email,
        component: 'SignupPage'
      });
    }
  }

  // Display either form validation errors or API errors
  const displayErrors = formErrors || (signupError ? { email: signupError } : null);

  // Don't render if user is already authenticated
  if (!shouldRender) {
    return null;
  }

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
            <Rocket className="h-3.5 w-3.5 text-blue-500" />
            Start your retail journey
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent md:text-5xl dark:via-blue-300 dark:to-purple-300"
          >
            Build your retail empire
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-base text-muted-foreground md:text-lg"
          >
            Join thousands of successful retailers who've transformed their business with RetailFlow's powerful platform.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AuthCard
            title="Create your account"
            subtitle="Start your 14-day free trial today"
            footer={
              <div className="space-x-1 text-center">
                <span className="text-muted-foreground">Already have an account?</span>
                <MutedLink href="/login">Sign in</MutedLink>
              </div>
            }
          >
            <form className="grid gap-5" onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First name" error={displayErrors?.firstName}>
                  <Input 
                    name="firstName" 
                    placeholder="John" 
                    autoComplete="given-name" 
                    required 
                  />
                </Field>
                <Field label="Last name" error={displayErrors?.lastName}>
                  <Input 
                    name="lastName" 
                    placeholder="Doe" 
                    autoComplete="family-name" 
                    required 
                  />
                </Field>
              </div>

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
                  placeholder="Create a strong password" 
                  autoComplete="new-password" 
                  required 
                />
              </Field>

              <Field label="Confirm password" error={displayErrors?.confirmPassword}>
                <PasswordInput 
                  name="confirmPassword" 
                  placeholder="Confirm your password" 
                  autoComplete="new-password" 
                  required 
                />
              </Field>

              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  name="terms" 
                  className="mt-1 h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500/20 focus:ring-2" 
                  required 
                />
                <label className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{' '}
                  <Link href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <SubmitButton type="submit" loading={isSignupLoading}>
                {isSignupLoading ? 'Creating account...' : 'Start free trial'}
              </SubmitButton>

              <div className="text-center text-xs text-muted-foreground">
                No credit card required • Cancel anytime • Full access to all features
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
        <PremiumSignupVisual />
      </motion.div>
    </section>
  );
}

function PremiumSignupVisual() {
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

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const features = [
    {
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      title: "Revenue Growth",
      description: "Average 40% increase in first year",
      metric: "+40%"
    },
    {
      icon: <Target className="h-5 w-5 text-blue-500" />,
      title: "Inventory Accuracy",
      description: "Real-time sync across all locations",
      metric: "99.9%"
    },
    {
      icon: <Globe className="h-5 w-5 text-purple-500" />,
      title: "Multi-Channel Sales",
      description: "Online, in-store, and mobile unified",
      metric: "3x"
    }
  ];

  return (
    <div className="relative mx-auto max-w-lg">
      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 z-10">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
        >
          <Crown className="h-3.5 w-3.5" />
          Premium
        </motion.div>
      </div>

      <motion.div
        className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 p-8 shadow-2xl backdrop-blur-sm"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Gradient Orbs */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-pink-400/20 to-orange-600/20 blur-3xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Trusted by 10,000+ retailers</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Transform your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> retail business</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Join successful retailers who've revolutionized their operations with our comprehensive platform.
            </p>
          </motion.div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/80 shadow-sm">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <span className="text-lg font-bold text-blue-600">{feature.metric}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>14-day free trial • No setup fees • Cancel anytime</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Success Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute -bottom-6 -left-6 z-10"
      >
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          <Zap className="h-4 w-4" />
          <span>Setup in 5 minutes</span>
        </motion.div>
      </motion.div>
    </div>
  );
}