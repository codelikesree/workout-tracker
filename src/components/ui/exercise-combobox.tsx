"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  EXERCISES,
  BODY_PARTS,
  getBodyPartLabel,
  type BodyPart,
} from "@/lib/constants/exercises";
import { useCustomExercises } from "@/hooks/use-exercises";

interface ExerciseComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ExerciseCombobox({
  value,
  onChange,
  placeholder = "Select exercise...",
  disabled = false,
}: ExerciseComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const { data: customData } = useCustomExercises();
  const customExercises = customData?.exercises ?? [];

  // Merge system + custom exercises grouped by body part.
  // Custom exercises appear at the top of their body part group.
  const groupedExercises = React.useMemo(() => {
    const groups: Record<BodyPart, Array<{ name: string; isCustom: boolean }>> =
      {} as Record<BodyPart, Array<{ name: string; isCustom: boolean }>>;

    // Add custom exercises first (so they appear at the top of their group)
    customExercises.forEach((ex) => {
      if (!groups[ex.bodyPart]) groups[ex.bodyPart] = [];
      groups[ex.bodyPart].push({ name: ex.name, isCustom: true });
    });

    // Add system exercises after
    EXERCISES.forEach((ex) => {
      if (!groups[ex.bodyPart]) groups[ex.bodyPart] = [];
      groups[ex.bodyPart].push({ name: ex.name, isCustom: false });
    });

    return groups;
  }, [customExercises]);

  // If the current value is a custom exercise name, build a "Custom" group at the top
  // so it's easy to find. Otherwise render normally by body part.
  const hasCustom = customExercises.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search exercises..." />
          <CommandList>
            <CommandEmpty>No exercise found.</CommandEmpty>

            {/* Custom exercises section (only shown when user has custom exercises) */}
            {hasCustom && (
              <CommandGroup heading="My Custom Exercises">
                {customExercises.map((ex) => (
                  <CommandItem
                    key={`custom-${ex._id}`}
                    value={ex.name}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === ex.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Star className="mr-1.5 h-3 w-3 text-amber-500 shrink-0" />
                    {ex.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {getBodyPartLabel(ex.bodyPart)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* System exercises grouped by body part */}
            {BODY_PARTS.map((bodyPart) => {
              const exercises = groupedExercises[bodyPart.value];
              // Filter to only system exercises for this group
              const systemExercises = exercises?.filter((e) => !e.isCustom);
              if (!systemExercises || systemExercises.length === 0) return null;

              return (
                <CommandGroup key={bodyPart.value} heading={bodyPart.label}>
                  {systemExercises.map((exercise) => (
                    <CommandItem
                      key={exercise.name}
                      value={exercise.name}
                      onSelect={(currentValue) => {
                        onChange(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === exercise.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {exercise.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
