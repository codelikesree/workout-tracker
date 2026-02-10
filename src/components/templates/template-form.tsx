"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WORKOUT_TYPES, WEIGHT_UNITS } from "@/lib/constants/workout-types";
import { ExerciseCombobox } from "@/components/ui/exercise-combobox";
import { useCreateTemplate, useUpdateTemplate } from "@/hooks/use-templates";

const templateExerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  targetSets: z.number().int().positive("Must be at least 1"),
  targetReps: z.number().int().positive("Must be at least 1"),
  targetWeight: z.number().min(0).optional(),
  weightUnit: z.enum(["kg", "lbs"]),
  restTime: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const templateFormSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  type: z.enum(["strength", "cardio", "flexibility", "hiit", "sports", "other"]),
  exercises: z
    .array(templateExerciseSchema)
    .min(1, "At least one exercise is required"),
  estimatedDuration: z.number().min(0).optional(),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface TemplateExercise {
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  weightUnit: "kg" | "lbs";
  restTime?: number;
  notes?: string;
}

interface TemplateFormProps {
  initialData?: {
    _id?: string;
    name: string;
    description?: string;
    type: string;
    exercises: TemplateExercise[];
    estimatedDuration?: number;
  };
  mode?: "create" | "edit";
}

export function TemplateForm({ initialData, mode = "create" }: TemplateFormProps) {
  const router = useRouter();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          type: initialData.type as TemplateFormData["type"],
          exercises: initialData.exercises,
          estimatedDuration: initialData.estimatedDuration || undefined,
        }
      : {
          name: "",
          description: "",
          type: "strength",
          exercises: [
            {
              name: "",
              targetSets: 3,
              targetReps: 10,
              targetWeight: 0,
              weightUnit: "kg" as const,
            },
          ],
          estimatedDuration: undefined,
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

  const onSubmit = async (data: TemplateFormData) => {
    if (mode === "edit" && initialData?._id) {
      await updateTemplate.mutateAsync({ id: initialData._id, data });
    } else {
      await createTemplate.mutateAsync(data);
    }
    router.push("/templates");
  };

  const isLoading = createTemplate.isPending || updateTemplate.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this template..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 60"
                      className="w-40"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  targetSets: 3,
                  targetReps: 10,
                  targetWeight: 0,
                  weightUnit: "kg",
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {exerciseFields.map((exercise, exerciseIndex) => (
              <div
                key={exercise.id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
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
                  {exerciseFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive mt-6"
                      onClick={() => removeExercise(exerciseIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name={`exercises.${exerciseIndex}.targetSets`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sets</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`exercises.${exerciseIndex}.targetReps`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reps</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`exercises.${exerciseIndex}.targetWeight`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`exercises.${exerciseIndex}.weightUnit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`exercises.${exerciseIndex}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Any notes for this exercise..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
              ? "Update Template"
              : "Create Template"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
