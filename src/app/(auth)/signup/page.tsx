import { Suspense } from "react";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-[500px]" />}>
      <SignupForm />
    </Suspense>
  );
}
