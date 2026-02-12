"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Dumbbell,
  Plus,
  FileText,
  User,
} from "lucide-react";
import { StartWorkoutSheet } from "@/components/workout/start-workout-sheet";

const tabs = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Workouts", href: "/workouts", icon: Dumbbell },
  // Center "Start" button is rendered separately
  { title: "Templates", href: "/templates", icon: FileText },
  { title: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showStartSheet, setShowStartSheet] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {/* First two tabs */}
          {tabs.slice(0, 2).map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full touch-manipulation transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.title}</span>
              </Link>
            );
          })}

          {/* Center Start button */}
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full touch-manipulation"
            onClick={() => setShowStartSheet(true)}
          >
            <div className="h-11 w-11 rounded-full bg-primary flex items-center justify-center -mt-3 shadow-lg">
              <Plus className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-[10px] font-medium text-primary">Start</span>
          </button>

          {/* Last two tabs */}
          {tabs.slice(2).map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full touch-manipulation transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <StartWorkoutSheet
        open={showStartSheet}
        onOpenChange={setShowStartSheet}
      />
    </>
  );
}
