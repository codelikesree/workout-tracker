"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { TrendingUp, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import { ResumeWorkoutBanner } from "@/components/dashboard/resume-workout-banner";
import { StartWorkoutCTA } from "@/components/dashboard/start-workout-cta";
import { RecentTemplates } from "@/components/dashboard/recent-templates";
import { QuickStats } from "@/components/dashboard/quick-stats";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.username || "there";

  return (
    <main className="space-y-8 max-w-2xl mx-auto" role="main">
      <PageHeader
        title={`Hey, ${userName}`}
        description="Ready to train?"
        className="mb-8"
      />

      <section aria-label="Active workout">
        <ResumeWorkoutBanner />
      </section>

      <section aria-label="Start new workout">
        <StartWorkoutCTA />
      </section>

      <section aria-label="Recent templates">
        <RecentTemplates />
      </section>

      <section aria-label="Quick statistics">
        <QuickStats />
      </section>

      <nav aria-label="Quick links">
        <div className="grid grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Link href="/analytics" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" aria-hidden="true" />
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
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-sm">New Template</p>
                  <p className="text-xs text-muted-foreground">Save a routine</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </nav>
    </main>
  );
}
