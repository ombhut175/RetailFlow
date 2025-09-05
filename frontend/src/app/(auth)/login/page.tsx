"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AuthCard, { Field, Input, PasswordInput, SubmitButton, MutedLink } from "../_components/auth-card";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";

export default function LoginPage() {
  const router = useRouter();
  const [formErrors, setFormErrors] = React.useState<{ email?: string; password?: string } | null>(null);

  React.useEffect(() => {
    hackLog.componentMount('LoginPage', {
      authRemoved: true
    });
  }, []);

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

    // Check for validation errors
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      hackLog.formValidation('login', nextErrors);
      return;
    }

    try {
      // Demo: simulate successful login without actual authentication
      hackLog.storeAction('loginRedirect', {
        email,
        redirectTo: ROUTES.DASHBOARD,
        component: 'LoginPage'
      });
      
      toast.success('Demo mode: Login simulation successful.');
      router.push(ROUTES.DASHBOARD);
    } catch (error: any) {
      hackLog.error('Login submission failed', {
        error: error.message,
        email,
        component: 'LoginPage'
      });
    }
  }

  // Display form validation errors
  const displayErrors = formErrors;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="order-2 md:order-1"
      >
        <AuthCard
          title="Welcome back (Demo)"
          subtitle="Demo login page - no authentication required"
          footer={
            <div className="space-x-1">
              <span>New to Quodo?</span>
              <MutedLink href={ROUTES.AUTH.SIGNUP}>Create an account</MutedLink>
            </div>
          }
        >
          <form className="grid gap-4" onSubmit={onSubmit}>
            <Field label="Email" error={displayErrors?.email}>
              <Input name="email" type="email" inputMode="email" placeholder="you@school.edu" autoComplete="email" required />
            </Field>

            <Field label="Password" error={displayErrors?.password}>
              <PasswordInput name="password" placeholder="••••••••" autoComplete="current-password" required />
            </Field>

            <div className="flex items-center justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input type="checkbox" name="remember" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span>Remember me</span>
              </label>
              <MutedLink href={ROUTES.AUTH.FORGOT_PASSWORD}>Forgot password?</MutedLink>
            </div>

            <SubmitButton type="submit" loading={false}>
              Continue
            </SubmitButton>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              By continuing, you agree to our
              <Link href="#" className="mx-1 underline underline-offset-2 hover:text-slate-700 dark:hover:text-white">Terms</Link>
              and
              <Link href="#" className="ml-1 underline underline-offset-2 hover:text-slate-700 dark:hover:text-white">Privacy Policy</Link>.
            </div>
          </form>
        </AuthCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="order-1 md:order-2"
      >
        <HeroAside />
      </motion.div>
    </div>
  );
}

function HeroAside() {
  return (
    <div className="relative mx-auto max-w-md md:max-w-none">
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-fuchsia-500/15 p-6 shadow-2xl backdrop-blur-sm dark:border-white/10">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Level up your learning</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Quodo adapts to your pace with interactive modules, progress tracking, and AI-guided study paths.
          </p>
        </div>
        <ul className="grid gap-3 text-sm">
          <li className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/60">
            Personalized roadmaps and micro-goals
          </li>
          <li className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/60">
            Rich media lessons and live sessions
          </li>
          <li className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/60">
            Certificates that matter in the real world
          </li>
        </ul>
      </div>
    </div>
  );
}
