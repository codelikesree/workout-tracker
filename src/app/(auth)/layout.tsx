import { Metadata } from "next";
import { Dumbbell } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Dumbbell className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">Workout Tracker</span>
      </Link>
      {children}
    </div>
  );
}
