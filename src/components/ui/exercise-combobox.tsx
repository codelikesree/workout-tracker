"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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

  // Group exercises by body part
  const groupedExercises = React.useMemo(() => {
    const groups: Record<BodyPart, typeof EXERCISES> = {} as Record<
      BodyPart,
      typeof EXERCISES
    >;
    EXERCISES.forEach((exercise) => {
      if (!groups[exercise.bodyPart]) {
        groups[exercise.bodyPart] = [];
      }
      groups[exercise.bodyPart].push(exercise);
    });
    return groups;
  }, []);

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
            {BODY_PARTS.map((bodyPart) => {
              const exercises = groupedExercises[bodyPart.value];
              if (!exercises || exercises.length === 0) return null;

              return (
                <CommandGroup
                  key={bodyPart.value}
                  heading={bodyPart.label}
                >
                  {exercises.map((exercise) => (
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
                          value === exercise.name
                            ? "opacity-100"
                            : "opacity-0"
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
