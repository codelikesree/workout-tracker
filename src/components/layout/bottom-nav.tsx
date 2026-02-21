"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Dumbbell,
  Plus,
  ListPlus,
  User,
} from "lucide-react";
import { StartWorkoutSheet } from "@/components/workout/start-workout-sheet";

const tabs = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Workouts", href: "/workouts", icon: Dumbbell },
  // Center "Start" button is rendered separately
  { title: "Exercises", href: "/exercises", icon: ListPlus },
  { title: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showStartSheet, setShowStartSheet] = useState(false);

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)] shadow-lg"
        aria-label="Primary navigation"
        role="navigation"
      >
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
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full touch-target transition-all active:scale-95",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.title}
              >
                <tab.icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium">{tab.title}</span>
              </Link>
            );
          })}

          {/* Center Start button - elevated primary action */}
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full touch-target transition-all active:scale-95"
            onClick={() => setShowStartSheet(true)}
            aria-label="Start new workout"
          >
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center -mt-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100 ring-4 ring-background">
              <Plus className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-semibold text-primary">Start</span>
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
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full touch-target transition-all active:scale-95",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.title}
              >
                <tab.icon className="h-5 w-5" aria-hidden="true" />
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
