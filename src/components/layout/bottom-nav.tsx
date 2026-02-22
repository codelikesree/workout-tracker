"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Dumbbell,
  Plus,
  ListPlus,
  MoreHorizontal,
  FileText,
  Calendar,
  BarChart3,
  Upload,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StartWorkoutSheet } from "@/components/workout/start-workout-sheet";

// Primary tabs shown always in the bar
const PRIMARY_TABS = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Workouts", href: "/workouts", icon: Dumbbell },
  // center Start button is rendered inline
  { title: "Exercises", href: "/exercises", icon: ListPlus },
];

// Overflow items shown inside the "More" sheet
const MORE_ITEMS = [
  {
    title: "Templates",
    href: "/templates",
    icon: FileText,
    color: "bg-blue-500/15 text-blue-500",
    description: "Saved workout plans",
  },
  {
    title: "History",
    href: "/history",
    icon: Calendar,
    color: "bg-green-500/15 text-green-500",
    description: "Past workouts",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    color: "bg-violet-500/15 text-violet-500",
    description: "Progress & trends",
  },
  {
    title: "Import",
    href: "/import",
    icon: Upload,
    color: "bg-orange-500/15 text-orange-500",
    description: "Import from CSV",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    color: "bg-rose-500/15 text-rose-500",
    description: "Settings & account",
  },
];

function MoreSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-safe-or-8 pb-8">
        <SheetHeader className="pb-4">
          {session?.user?.name && (
            <p className="text-xs text-muted-foreground text-center -mt-1">
              {session.user.email}
            </p>
          )}
          <SheetTitle className="text-center">Menu</SheetTitle>
        </SheetHeader>

        {/* 2-column grid of nav tiles */}
        <div className="grid grid-cols-2 gap-3 px-1">
          {MORE_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95",
                  isActive
                    ? "border-primary/30 bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    item.color
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-tight",
                      isActive && "text-primary"
                    )}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

      </SheetContent>
    </Sheet>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [showStartSheet, setShowStartSheet] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  // Check if the current page is inside the "More" overflow
  const isMoreActive = MORE_ITEMS.some(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)] shadow-lg"
        aria-label="Primary navigation"
        role="navigation"
      >
        <div className="flex items-center justify-around h-16">
          {/* Primary tabs (first 2) */}
          {PRIMARY_TABS.slice(0, 2).map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-95",
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

          {/* Floating Start button */}
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-95"
            onClick={() => setShowStartSheet(true)}
            aria-label="Start new workout"
          >
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center -mt-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100 ring-4 ring-background">
              <Plus className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-semibold text-primary">Start</span>
          </button>

          {/* Primary tabs (last 1 — Exercises) */}
          {PRIMARY_TABS.slice(2).map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-95",
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

          {/* More tab */}
          <button
            type="button"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-95",
              isMoreActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setShowMoreSheet(true)}
            aria-label="More options"
          >
            <div className="relative">
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              {/* Dot indicator when current page is inside More */}
              {isMoreActive && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      <StartWorkoutSheet
        open={showStartSheet}
        onOpenChange={setShowStartSheet}
      />

      <MoreSheet open={showMoreSheet} onOpenChange={setShowMoreSheet} />
    </>
  );
}
