"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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

const schema = z
  .object({
    name: z.string().min(2, { message: "Please enter your full name" }),
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(6, { message: "Min 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Min 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    console.log("signup:", values);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={pageVariants}
      className="relative min-h-[calc(100svh-3.5rem)]"
    >
      <EdtechBg />
      <div className="container mx-auto grid place-items-center py-12 relative">
        {/* Form */}
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="fx-glow-border rounded-2xl">
              <Card className="relative z-[1] border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-2xl transition-transform will-change-transform hover:-translate-y-0.5">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-3xl">Create account</CardTitle>
                  <CardDescription>
                    Unlock courses, tracks, and personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Full name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                                <Input
                                  id="name"
                                  placeholder=" "
                                  className="pl-9 peer placeholder-transparent transition-shadow focus:shadow-[0_0_0_4px] focus:shadow-primary/10"
                                  {...field}
                                />

                                <label
                                  htmlFor="name"
                                  className="pointer-events-none absolute left-9 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs"
                                >
                                  Full name
                                </label>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                  id="signup-email"
                                  type="email"
                                  placeholder=" "
                                  className="pl-9 peer placeholder-transparent transition-shadow focus:shadow-[0_0_0_4px] focus:shadow-primary/10"
                                  {...field}
                                />

                                <label
                                  htmlFor="signup-email"
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

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                                <Input
                                  id="signup-password"
                                  type="password"
                                  placeholder=" "
                                  className="pl-9 peer placeholder-transparent transition-shadow focus:shadow-[0_0_0_4px] focus:shadow-primary/10"
                                  {...field}
                                />

                                <label
                                  htmlFor="signup-password"
                                  className="pointer-events-none absolute left-9 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs"
                                >
                                  Password
                                </label>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">
                              Confirm password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                                <Input
                                  id="confirm-password"
                                  type="password"
                                  placeholder=" "
                                  className="pl-9 peer placeholder-transparent transition-shadow focus:shadow-[0_0_0_4px] focus:shadow-primary/10"
                                  {...field}
                                />

                                <label
                                  htmlFor="confirm-password"
                                  className="pointer-events-none absolute left-9 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs"
                                >
                                  Confirm password
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
                              Creating...
                            </span>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </motion.div>

                      <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                          href="/login"
                          className="text-primary link-underline-anim"
                        >
                          Login
                        </Link>
                      </p>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
