"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EdtechBg } from "@/components/visuals/edtech-bg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
});

type FormValues = z.infer<typeof schema>;

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
    console.log("reset:", values);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={pageVariants}
      className="relative min-h-[calc(100svh-3.5rem)]"
    >
      <EdtechBg />
      <div className="container mx-auto py-12 grid place-items-center relative">
        <div className="w-full max-w-md">
          <div className="fx-glow-border rounded-2xl">
            <Card className="relative z-[1] border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-2xl transition-transform will-change-transform hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-3xl">Forgot password</CardTitle>
                <CardDescription>
                  We’ll send you a secure link to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {!sent ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-6"
                        >
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                                    <Input
                                      id="forgot-email"
                                      type="email"
                                      placeholder=" "
                                      className="pl-9 peer placeholder-transparent transition-shadow focus:shadow-[0_0_0_4px] focus:shadow-primary/10"
                                      {...field}
                                    />

                                    <label
                                      htmlFor="forgot-email"
                                      className="pointer-events-none absolute left-9 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs"
                                    >
                                      Email
                                    </label>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <motion.div
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              type="submit"
                              className="w-full btn-super"
                              disabled={loading}
                            >
                              {loading ? (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                  Sending...
                                </span>
                              ) : (
                                "Send Reset Link"
                              )}
                            </Button>
                          </motion.div>
                          <p className="text-center text-sm text-muted-foreground">
                            Remembered it?{" "}
                            <Link
                              href="/login"
                              className="text-primary link-underline-anim"
                            >
                              Back to login
                            </Link>
                          </p>
                        </form>
                      </Form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="space-y-4 text-center"
                    >
                      <div className="relative w-16 h-16 mx-auto">
                        <motion.span
                          className="absolute inset-0 rounded-full border-2 border-primary/30"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: [0.9, 1.1, 1], opacity: [0, 1, 1] }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          aria-hidden
                        />

                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 220,
                            damping: 16,
                          }}
                          className="relative z-10"
                        >
                          <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
                        </motion.div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold">
                          Check your inbox
                        </h3>
                        <p className="text-muted-foreground">
                          If an account exists for that email, you’ll receive a
                          reset link shortly.
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/login"
                          className="text-sm text-primary link-underline-anim"
                        >
                          Return to login
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
