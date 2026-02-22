"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Dumbbell,
  FileText,
  Calendar,
  BarChart3,
  Upload,
  User,
  ListPlus,
} from "lucide-react";

const navSections = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Workouts", href: "/workouts", icon: Dumbbell },
    ],
  },
  {
    label: "Library",
    items: [
      { title: "Templates", href: "/templates", icon: FileText },
      { title: "Exercises", href: "/exercises", icon: ListPlus },
      { title: "History", href: "/history", icon: Calendar },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Import", href: "/import", icon: Upload },
      { title: "Profile", href: "/profile", icon: User },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand */}
        <div className="flex items-center h-14 flex-shrink-0 px-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Dumbbell className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Workout Tracker</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-0.5">
              {section.label && (
                <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase select-none">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground/70 group-hover:text-foreground"
                      )}
                    />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
