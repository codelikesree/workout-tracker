"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { TrendingUp, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ResumeWorkoutBanner } from "@/components/dashboard/resume-workout-banner";
import { StartWorkoutCTA } from "@/components/dashboard/start-workout-cta";
import { RecentTemplates } from "@/components/dashboard/recent-templates";
import { QuickStats } from "@/components/dashboard/quick-stats";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hey, {session?.user?.name || session?.user?.username || "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Ready to train?
        </p>
      </div>

      {/* Resume banner (shows only if active session exists) */}
      <ResumeWorkoutBanner />

      {/* Primary CTA */}
      <StartWorkoutCTA />

      {/* Quick start from template */}
      <RecentTemplates />

      {/* Stats */}
      <QuickStats />

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link href="/analytics" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Analytics</p>
                <p className="text-xs text-muted-foreground">View progress</p>
              </div>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link href="/templates/new" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">New Template</p>
                <p className="text-xs text-muted-foreground">Save a routine</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
