import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - EduPlatform",
  description: "Sign in or create an account to access your learning dashboard",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
