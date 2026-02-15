import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  disabled?: boolean;
  className?: string;
  size?: "default" | "lg";
  showLabel?: boolean;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  disabled = false,
  className,
  size = "default",
  showLabel = true,
}: NumberStepperProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        handleIncrement();
        break;
      case "ArrowDown":
        e.preventDefault();
        handleDecrement();
        break;
      case "Home":
        e.preventDefault();
        onChange(min);
        break;
      case "End":
        e.preventDefault();
        onChange(max);
        break;
      case "PageUp":
        e.preventDefault();
        onChange(Math.min(max, value + step * 10));
        break;
      case "PageDown":
        e.preventDefault();
        onChange(Math.max(min, value - step * 10));
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const buttonSize = size === "lg" ? "icon-lg" : "icon";
  const inputSize = size === "lg" ? "text-lg h-11" : "text-base h-10";

  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      role="group"
      aria-labelledby={`stepper-label-${label}`}
    >
      {showLabel && (
        <label
          id={`stepper-label-${label}`}
          className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
        >
          {label}
        </label>
      )}

      <div
        className="flex items-center gap-2"
        onKeyDown={handleKeyDown}
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
        tabIndex={disabled ? -1 : 0}
      >
        <Button
          type="button"
          variant="outline"
          size={buttonSize}
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label}`}
          className={cn(
            "touch-target-lg shrink-0",
            size === "lg" && "h-11 w-11"
          )}
        >
          <Minus className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
        </Button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={cn(
            "w-20 rounded-md border border-input bg-background px-3 text-center font-semibold tabular-nums transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            inputSize
          )}
          aria-label={label}
        />

        <Button
          type="button"
          variant="outline"
          size={buttonSize}
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label}`}
          className={cn(
            "touch-target-lg shrink-0",
            size === "lg" && "h-11 w-11"
          )}
        >
          <Plus className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
        </Button>
      </div>
    </div>
  );
}
