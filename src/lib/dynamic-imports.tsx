/**
 * Dynamic Imports for Code Splitting
 *
 * Lazy-load heavy components to improve initial load time and performance.
 * These components are loaded on-demand when the user navigates to them.
 */

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

/**
 * Loading Fallback Component
 * Shown while dynamic components are being loaded
 */
export function DynamicLoadingFallback({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <span className="sr-only">Loading content</span>
    </div>
  );
}

/**
 * Analytics Page (Heavy: Recharts library ~100KB)
 * Only load when user navigates to /analytics
 */
export const DynamicAnalyticsPage = dynamic(
  () => import("@/app/(dashboard)/analytics/page"),
  {
    loading: () => <DynamicLoadingFallback message="Loading analytics..." />,
    ssr: false, // Charts are client-only
  }
);

/**
 * Import Page (Heavy: AI SDK + large text processing)
 * Only load when user navigates to /import
 */
export const DynamicImportPage = dynamic(
  () => import("@/app/(dashboard)/import/page"),
  {
    loading: () => <DynamicLoadingFallback message="Loading import tool..." />,
    ssr: true, // Can be server-rendered
  }
);

/**
 * Workout Edit Page (Heavy: Form libraries)
 * Only load when editing a workout
 */
export const DynamicWorkoutEditPage = dynamic(
  () => import("@/app/(dashboard)/workouts/[id]/edit/page"),
  {
    loading: () => <DynamicLoadingFallback message="Loading workout editor..." />,
    ssr: true,
  }
);

/**
 * Template Editor (Heavy: Complex form with exercise management)
 * Only load when creating/editing templates
 */
export const DynamicTemplateForm = dynamic(
  () => import("@/components/templates/template-form").then(mod => mod.TemplateForm),
  {
    loading: () => <DynamicLoadingFallback message="Loading template editor..." />,
    ssr: false,
  }
);
