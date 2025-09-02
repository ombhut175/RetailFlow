"use client";

import * as React from "react";
import AuthCard, { Field, Input, SubmitButton, MutedLink } from "../_components/auth-card";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
    } catch (e) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
      <div className="order-2 md:order-1">
        <AuthCard
          title={sent ? "Check your email" : "Reset your password"}
          subtitle={
            sent
              ? "We've sent a reset link if an account exists for that address."
              : "Enter your email and we'll send you a reset link."
          }
          footer={
            <div className="space-x-1">
              <span>Remembered it?</span>
              <MutedLink href="/quodo/login">Back to login</MutedLink>
            </div>
          }
        >
          {sent ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-slate-600 dark:text-slate-300">
              If you don't see the email in a few minutes, check your spam folder.
            </motion.div>
          ) : (
            <form className="grid gap-4" onSubmit={onSubmit}>
              <Field label="Email" error={error ?? undefined}>
                <Input name="email" type="email" inputMode="email" placeholder="you@school.edu" autoComplete="email" required />
              </Field>

              <SubmitButton type="submit" loading={loading}>
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
