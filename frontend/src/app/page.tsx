"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { ROUTES } from "@/constants/routes";
import hackLog from "@/lib/logger";
import {
  Store,
  Rocket,
  BarChart3,
  Package,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  PlayCircle,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

// Motion variants
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } },
};

type Feature = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  points: string[];
};

export default function LandingPage() {
  React.useEffect(() => {
    hackLog.componentMount('LandingPage', {
      timestamp: new Date().toISOString(),
      route: '/',
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-muted/40 text-foreground antialiased">
      <BackgroundAura />
      <Header />

      <main className="relative z-10 px-4 md:px-6">
        <Hero />
        <Highlights />
        <Stats />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-card/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-500 shadow-sm ring-1 ring-border transition-transform duration-200 group-hover:scale-105">
            <Store className="h-5 w-5 text-white drop-shadow" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight">RetailFlow</span>
            <span className="text-[11px] text-muted-foreground">Retail Platform</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <HeaderLink href="#features">Features</HeaderLink>
          <HeaderLink href="#how-it-works">How it works</HeaderLink>
          <HeaderLink href="#pricing">Pricing</HeaderLink>
          <HeaderLink href="/styleguide">Styleguide</HeaderLink>
        </nav>

        <div className="flex items-center gap-2">
          <GhostLink href={ROUTES.AUTH.LOGIN} className="hidden sm:inline-flex">Login</GhostLink>
          <PrimaryLink href={ROUTES.AUTH.SIGNUP}>Get started</PrimaryLink>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href as any}
      className="group relative rounded-md px-3 py-2 text-sm font-medium text-foreground/90 transition-colors hover:text-foreground"
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 -z-0 rounded-md bg-foreground/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 py-14 md:grid-cols-2 md:py-20 lg:py-24">
      <motion.div variants={container} initial="hidden" animate="show" className="order-2 md:order-1">
        <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          Manage inventory with smart automation
        </motion.div>
        <motion.h1 variants={item} className="mt-4 bg-gradient-to-r from-foreground via-emerald-600 to-teal-600 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent md:text-5xl lg:text-6xl dark:via-emerald-300 dark:to-teal-300">
          Streamline your retail business
        </motion.h1>
        <motion.p variants={item} className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
          RetailFlow is the complete POS and inventory management platform. Track stock, process sales, and grow your business with powerful analytics.
        </motion.p>
        <motion.div variants={item} className="mt-6 flex flex-wrap items-center gap-3">
          <PrimaryLink href={ROUTES.AUTH.SIGNUP} className="gap-2">
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </PrimaryLink>
          <GhostLink href={ROUTES.AUTH.LOGIN} className="gap-2">
            <PlayCircle className="h-4 w-4" />
            View demo
          </GhostLink>
        </motion.div>
        <motion.div variants={item} className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" />Trusted by 10k+ retailers</div>
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-500" />Multi-location support</div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="order-1 md:order-2">
        <HeroVisual />
      </motion.div>
    </section>
  );
}

function useTilt() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 150, damping: 16 });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 150, damping: 16 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    mx.set(x);
    my.set(y);
    el.style.setProperty("--x", `${x * 100}%`);
    el.style.setProperty("--y", `${y * 100}%`);
  }
  function onMouseLeave() { mx.set(0.5); my.set(0.5); }
  return { ref, rx, ry, onMouseMove, onMouseLeave } as const;
}

function HeroVisual() {
  const { ref, rx, ry, onMouseMove, onMouseLeave } = useTilt();
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className="group relative will-change-transform"
    >
      {/* Animated gradient frame */}
      <div aria-hidden className="pointer-events-none absolute -inset-[1px] rounded-[22px]">
        <motion.div
          className="absolute inset-0 rounded-[22px] opacity-80"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.35), rgba(236,72,153,0.35), rgba(34,197,94,0.35), rgba(99,102,241,0.35))",
            filter: "blur(10px)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-[20px] border border-border bg-card/80 p-6 shadow-2xl ring-1 ring-border/60 backdrop-blur-md md:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-[20px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(220px 220px at var(--x,50%) var(--y,0%), rgba(99,102,241,0.18), transparent 60%)" }}
        />

        <div className="relative z-10 flex flex-col gap-4" style={{ transform: "translateZ(30px)" }}>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Your retail management hub</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete POS system, inventory tracking, and sales analytics — all integrated for your business success.
            </p>
          </div>
          <ul className="grid gap-3 text-sm">
            <li className="rounded-xl border border-border bg-card/70 p-3 shadow-sm transition-colors">
              <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-emerald-500" /> Complete POS system</div>
            </li>
            <li className="rounded-xl border border-border bg-card/70 p-3 shadow-sm transition-colors">
              <div className="flex items-center gap-2"><Package className="h-4 w-4 text-green-500" /> Real-time inventory tracking</div>
            </li>
            <li className="rounded-xl border border-border bg-card/70 p-3 shadow-sm transition-colors">
              <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-teal-500" /> Advanced sales analytics</div>
            </li>
          </ul>
        </div>

        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
    </motion.div>
  );
}

function Highlights() {
  return (
    <section id="features" className="mx-auto max-w-6xl py-10 md:py-14 lg:py-16">
      <div className="mx-auto mb-8 max-w-2xl text-center md:mb-12">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Everything you need to run your retail business</h2>
        <p className="mt-2 text-muted-foreground">Professional tools designed for modern retailers and inventory managers.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <motion.div key={f.title as string} whileHover={{ y: -4 }} whileTap={{ scale: 0.995 }} className="h-full">
            <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm transition-all hover:shadow-xl">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500/20 via-green-500/20 to-teal-500/20 ring-1 ring-border">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold leading-tight tracking-tight">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
                <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const features: Feature[] = [
  {
    title: "Smart POS System",
    desc: "Complete point-of-sale with payment processing and receipts.",
    icon: <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    points: ["Multiple payment methods", "Digital receipts", "Tax calculations"],
  },
  {
    title: "Inventory Management",
    desc: "Real-time stock tracking with automated reorder alerts.",
    icon: <Package className="h-5 w-5 text-green-600 dark:text-green-400" />,
    points: ["Stock level monitoring", "Barcode scanning", "Supplier management"],
  },
  {
    title: "Sales Analytics",
    desc: "Comprehensive reports and insights to grow your business.",
    icon: <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
    points: ["Daily sales reports", "Product performance", "Customer insights"],
  },
];

function Stats() {
  return (
    <section className="mx-auto max-w-6xl py-10 md:py-14 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 rounded-3xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur-sm md:grid-cols-4"
      >
        {[
          { label: "Active retailers", value: "5k+" },
          { label: "Uptime guarantee", value: "99.9%" },
          { label: "Transactions processed", value: "2M+" },
          { label: "Customer satisfaction", value: "4.9/5" },
        ].map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <div className="text-3xl font-semibold tracking-tight">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function CTA() {
  return (
    <section id="pricing" className="relative mx-auto max-w-6xl py-12 md:py-16 lg:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-emerald-500/15 via-green-500/10 to-teal-500/15 p-8 shadow-2xl backdrop-blur-sm"
      >
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">Start selling smarter — it's free to try</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your account in seconds. Process your first sales free. Upgrade anytime to unlock advanced analytics and integrations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <PrimaryLink href={ROUTES.AUTH.SIGNUP} className="gap-2">
              Create free account
              <ArrowRight className="h-4 w-4" />
            </PrimaryLink>
            <GhostLink href={ROUTES.AUTH.LOGIN}>I already have an account</GhostLink>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto mt-10 max-w-6xl border-t border-border py-8 text-sm text-muted-foreground">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2 text-foreground">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-500 ring-1 ring-border">
            <Store className="h-4 w-4 text-white" />
          </span>
          <span className="font-medium">RetailFlow</span>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href={ROUTES.AUTH.LOGIN} className="link-underline-anim">Login</Link>
          <Link href={ROUTES.AUTH.SIGNUP} className="link-underline-anim">Sign up</Link>
          <Link href={ROUTES.STYLEGUIDE} className="link-underline-anim">Styleguide</Link>
        </div>
      </div>
    </footer>
  );
}

function BackgroundAura() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft radial gradient blobs */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 blur-3xl dark:from-emerald-500/20 dark:to-teal-500/10" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-green-400/25 to-emerald-400/20 blur-3xl dark:from-green-500/15 dark:to-emerald-500/10" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(55%_60%_at_50%_40%,black,transparent)] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(100,116,139,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.15) 1px, transparent 1px)",
          backgroundSize: "28px 28px, 28px 28px",
          backgroundPosition: "-1px -1px",
        }}
      />

      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-[64px] h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </div>
  );
}

// Styled anchor buttons (no invalid nested button inside Link)
function PrimaryLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href as any}
      className={[
        "group relative inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white",
        "shadow-lg shadow-indigo-600/20 ring-1 ring-white/15",
        "transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
        "btn-super",
        className,
      ].filter(Boolean).join(" ")}
      style={{ backgroundImage: "linear-gradient(135deg,#10b981,#059669,#0d9488)" }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          backgroundSize: "200% 100%",
          mixBlendMode: "overlay",
        }}
      />
    </Link>
  );
}

function GhostLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href as any}
      className={[
        "relative inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold",
        "border border-border bg-card/60 text-foreground/90 hover:text-foreground",
        "transition-all shadow-sm hover:shadow-md",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </Link>
  );
}
