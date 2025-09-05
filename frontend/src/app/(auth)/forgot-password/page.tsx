"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AuthCard, { Field, Input, SubmitButton, MutedLink } from "../_components/auth-card";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    hackLog.componentMount('ForgotPasswordPage', {
      authRemoved: true
    });
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    
    hackLog.formSubmit('forgotPassword', {
      email,
      component: 'ForgotPasswordPage'
    });

    // Clear previous errors
    setFormError(null);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Enter a valid email address");
      hackLog.formValidation('forgotPassword', { email: 'Invalid email' });
      return;
    }

    try {
      // Demo: simulate sending password reset email
      hackLog.storeAction('forgotPasswordSuccess', {
        email,
        component: 'ForgotPasswordPage'
      });
      
      setSent(true);
      toast.success('Demo mode: Password reset email simulation sent!');
    } catch (error: any) {
      hackLog.error('Forgot password submission failed', {
        error: error.message,
        email,
        component: 'ForgotPasswordPage'
      });
    }
  }

  // Display form validation error
  const displayError = formError;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
      <div className="order-2 md:order-1">
        <AuthCard
          title={sent ? "Check your email (Demo)" : "Reset your password (Demo)"}
          subtitle={
            sent
              ? "Demo: We've simulated sending a reset link."
              : "Demo reset page - no actual email will be sent."
          }
          footer={
            <div className="space-x-1">
              <span>Remembered it?</span>
              <MutedLink href={ROUTES.AUTH.LOGIN}>Back to login</MutedLink>
            </div>
          }
        >
          {sent ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-slate-600 dark:text-slate-300">
              This is demo mode - no actual email was sent.
            </motion.div>
          ) : (
            <form className="grid gap-4" onSubmit={onSubmit}>
              <Field label="Email" error={displayError ?? undefined}>
                <Input name="email" type="email" inputMode="email" placeholder="you@school.edu" autoComplete="email" required />
              </Field>

              <SubmitButton type="submit" loading={false}>
                Send reset link
              </SubmitButton>
            </form>
          )}
        </AuthCard>
      </div>

      <div className="order-1 md:order-2">
        <AsidePanel />
      </div>
    </div>
  );
}

function AsidePanel() {
  return (
    <div className="relative mx-auto max-w-md md:max-w-none">
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-purple-500/15 p-6 shadow-2xl backdrop-blur-sm dark:border-white/10">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">We got your back</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Secure account recovery ensures your learning never stops.
        </p>
        <div className="mt-4 grid gap-3 text-sm">
          <div className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/60">
            One-click reset from your email
          </div>
          <div className="rounded-xl border border-black/10 bg-white/50 p-3 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/60">
            Strong security with token-based links
          </div>
        </div>
      </div>
    </div>
  );
}
