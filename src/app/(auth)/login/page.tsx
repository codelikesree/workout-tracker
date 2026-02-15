import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { generatePageMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMetadata({
  title: "Sign In to Your Account",
  description: "Sign in to track your workouts, view your fitness progress, and access your custom workout templates.",
  url: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-[400px]" />}>
      <LoginForm />
    </Suspense>
  );
}
