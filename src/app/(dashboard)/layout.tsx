"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActiveWorkout = pathname === "/workout/active";

  // Full-screen mode for active workout — no sidebar or header
  if (isActiveWorkout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
