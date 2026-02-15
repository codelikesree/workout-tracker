import { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/signup-form";
import { generatePageMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMetadata({
  title: "Create Your Free Account",
  description: "Sign up for free to start tracking your workouts, creating custom templates, and analyzing your fitness progress. No credit card required.",
  url: "/signup",
  keywords: [
    "workout tracker signup",
    "free fitness app",
    "create workout account",
    "fitness tracker registration",
    "gym tracker signup",
  ],
});

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-[500px]" />}>
      <SignupForm />
    </Suspense>
  );
}
