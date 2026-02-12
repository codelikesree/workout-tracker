"use client";

import { useRef, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  decimal?: boolean;
}

export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  label,
  size = "md",
  decimal = false,
}: NumberStepperProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clamp = useCallback(
    (v: number) => Math.max(min, Math.min(max, v)),
    [min, max]
  );

  const format = (v: number) => (decimal ? v.toFixed(1) : String(v));

  const increment = useCallback(() => {
    onChange(clamp(value + step));
  }, [onChange, clamp, value, step]);

  const decrement = useCallback(() => {
    onChange(clamp(value - step));
  }, [onChange, clamp, value, step]);

  const startHold = useCallback(
    (action: () => void) => {
      // First trigger
      action();
      // Start repeating after 400ms, then every 80ms
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(action, 80);
      }, 400);
    },
    []
  );

  const stopHold = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const buttonSize = size === "lg" ? "h-12 w-12" : size === "md" ? "h-10 w-10" : "h-8 w-8";
  const iconSize = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3 w-3";
  const valueSize = size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-base";

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(buttonSize, "rounded-full shrink-0 touch-manipulation")}
          onPointerDown={() => startHold(decrement)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Minus className={iconSize} />
        </Button>
        <span
          className={cn(
            valueSize,
            "font-bold tabular-nums min-w-[3ch] text-center select-none"
          )}
        >
          {format(value)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(buttonSize, "rounded-full shrink-0 touch-manipulation")}
          onPointerDown={() => startHold(increment)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Plus className={iconSize} />
        </Button>
      </div>
    </div>
  );
}
