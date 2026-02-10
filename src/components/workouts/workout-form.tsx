"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WORKOUT_TYPES, WEIGHT_UNITS } from "@/lib/constants/workout-types";
import { ExerciseCombobox } from "@/components/ui/exercise-combobox";
import { useCreateWorkout, useUpdateWorkout } from "@/hooks/use-workouts";
import { useTemplates, useTemplateForWorkout } from "@/hooks/use-templates";

const exerciseSetSchema = z.object({
  setNumber: z.number().int().positive(),
  reps: z.number().int().min(0, "Reps must be 0 or more"),
  weight: z.number().min(0, "Weight must be 0 or more"),
  weightUnit: z.enum(["kg", "lbs"]),
});

const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.array(exerciseSetSchema).min(1, "At least one set is required"),
});

const workoutFormSchema = z.object({
  workoutName: z.string().min(1, "Workout name is required"),
  type: z.enum(["strength", "cardio", "flexibility", "hiit", "sports", "other"]),
  date: z.date(),
  exercises: z.array(exerciseSchema).min(1, "At least one exercise is required"),
  duration: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type WorkoutFormData = z.infer<typeof workoutFormSchema>;

interface Exercise {
  name: string;
  sets: Array<{
    setNumber: number;
    reps: number;
    weight: number;
    weightUnit: "kg" | "lbs";
  }>;
}

interface WorkoutFormProps {
  initialData?: {
    _id?: string;
    workoutName: string;
    type: string;
    date: string | Date;
    exercises: Exercise[];
    duration?: number;
    notes?: string;
  };
  mode?: "create" | "edit";
}

export function WorkoutForm({ initialData, mode = "create" }: WorkoutFormProps) {
  const router = useRouter();
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const { data: templatesData } = useTemplates();
  const loadTemplate = useTemplateForWorkout();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: initialData
      ? {
          workoutName: initialData.workoutName,
          type: initialData.type as WorkoutFormData["type"],
          date: new Date(initialData.date),
          exercises: initialData.exercises,
          duration: initialData.duration || undefined,
          notes: initialData.notes || "",
        }
      : {
          workoutName: "",
          type: "strength",
          date: new Date(),
          exercises: [
            {
              name: "",
              sets: [{ setNumber: 1, reps: 10, weight: 0, weightUnit: "kg" as const }],
            },
          ],
          duration: undefined,
          notes: "",
        },
  });

  const {
    fields: exerciseFields,
    append: appendExercise,
    remove: removeExercise,
  } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const onSubmit = async (data: WorkoutFormData) => {
    if (mode === "edit" && initialData?._id) {
      await updateWorkout.mutateAsync({ id: initialData._id, data });
    } else {
      await createWorkout.mutateAsync(data);
    }
    router.push("/workouts");
  };

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const payload = await loadTemplate.mutateAsync(templateId);
    form.setValue("workoutName", payload.workoutName);
    form.setValue("type", payload.type as WorkoutFormData["type"]);
    form.setValue("exercises", payload.exercises);
    if (payload.duration) {
      form.setValue("duration", payload.duration);
    }
  };

  const isLoading = createWorkout.isPending || updateWorkout.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Selection */}
        {mode === "create" && templatesData?.templates?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Use Template</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {templatesData.templates.map(
                    (template: { _id: string; name: string }) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workout Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workoutName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Push Day" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WORKOUT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 60"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Exercises */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Exercises</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendExercise({
                  name: "",
                  sets: [{ setNumber: 1, reps: 10, weight: 0, weightUnit: "kg" }],
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {exerciseFields.map((exercise, exerciseIndex) => (
              <ExerciseField
                key={exercise.id}
                exerciseIndex={exerciseIndex}
                control={form.control}
                onRemove={() => removeExercise(exerciseIndex)}
                canRemove={exerciseFields.length > 1}
              />
            ))}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this workout..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? mode === "edit"
                ? "Updating..."
                : "Saving..."
              : mode === "edit"
              ? "Update Workout"
              : "Log Workout"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface ExerciseFieldProps {
  exerciseIndex: number;
  control: ReturnType<typeof useForm<WorkoutFormData>>["control"];
  onRemove: () => void;
  canRemove: boolean;
}

function ExerciseField({
  exerciseIndex,
  control,
  onRemove,
  canRemove,
}: ExerciseFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <FormField
          control={control}
          name={`exercises.${exerciseIndex}.name`}
          render={({ field }) => (
            <FormItem className="flex-1 mr-4">
              <FormLabel>Exercise Name</FormLabel>
              <FormControl>
                <ExerciseCombobox
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select exercise..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive mt-6"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
          <div className="col-span-2">Set</div>
          <div className="col-span-3">Reps</div>
          <div className="col-span-4">Weight</div>
          <div className="col-span-2">Unit</div>
          <div className="col-span-1"></div>
        </div>
        {fields.map((set, setIndex) => (
          <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2 text-center font-medium">
              {setIndex + 1}
            </div>
            <FormField
              control={control}
              name={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
              render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}
              render={({ field }) => (
                <FormItem className="col-span-4">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`exercises.${exerciseIndex}.sets.${setIndex}.weightUnit`}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WEIGHT_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <div className="col-span-1">
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => remove(setIndex)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            append({
              setNumber: fields.length + 1,
              reps: 10,
              weight: 0,
              weightUnit: "kg",
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </div>
    </div>
  );
}
