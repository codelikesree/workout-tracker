"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCustomExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
  type CustomExercise,
} from "@/hooks/use-exercises";
import {
  BODY_PARTS,
  EXERCISES,
  getBodyPartLabel,
  type BodyPart,
} from "@/lib/constants/exercises";

// ─── Add Exercise Form ──────────────────────────────────────────────────

function AddExerciseForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [bodyPart, setBodyPart] = useState<BodyPart | "">("");
  const { mutate: createExercise, isPending } = useCreateExercise();

  const handleSave = () => {
    if (!name.trim() || !bodyPart) return;
    createExercise(
      { name: name.trim(), bodyPart: bodyPart as BodyPart },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="border rounded-xl p-4 bg-muted/30 space-y-3">
      <p className="text-sm font-medium">Add Custom Exercise</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Exercise name…"
          className="flex-1"
          maxLength={100}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />
        <Select
          value={bodyPart}
          onValueChange={(v) => setBodyPart(v as BodyPart)}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Body part" />
          </SelectTrigger>
          <SelectContent>
            {BODY_PARTS.map((bp) => (
              <SelectItem key={bp.value} value={bp.value}>
                {bp.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          <X className="h-3.5 w-3.5 mr-1" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending || !name.trim() || !bodyPart}
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          {isPending ? "Adding…" : "Add Exercise"}
        </Button>
      </div>
    </div>
  );
}

// ─── Exercise Row ───────────────────────────────────────────────────────

function ExerciseRow({ exercise }: { exercise: CustomExercise }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState(exercise.name);
  const [bodyPart, setBodyPart] = useState<BodyPart>(exercise.bodyPart);

  const { mutate: updateExercise, isPending: isUpdating } = useUpdateExercise();
  const { mutate: deleteExercise, isPending: isDeleting } = useDeleteExercise();

  const handleSave = () => {
    if (!name.trim()) return;
    updateExercise(
      { id: exercise._id, data: { name: name.trim(), bodyPart } },
      {
        onSuccess: () => setEditing(false),
        onError: () => {
          // Reset to original on error
          setName(exercise.name);
          setBodyPart(exercise.bodyPart);
          setEditing(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteExercise(exercise._id, { onSuccess: () => setDeleting(false) });
  };

  const handleCancelEdit = () => {
    setName(exercise.name);
    setBodyPart(exercise.bodyPart);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 p-3 border rounded-lg bg-muted/20">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
          maxLength={100}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <Select
          value={bodyPart}
          onValueChange={(v) => setBodyPart(v as BodyPart)}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BODY_PARTS.map((bp) => (
              <SelectItem key={bp.value} value={bp.value}>
                {bp.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancelEdit}
            disabled={isUpdating}
            className="h-9 w-9"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleSave}
            disabled={isUpdating || !name.trim()}
            className="h-9 w-9"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (deleting) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 border border-destructive/30 rounded-lg bg-destructive/5">
        <div className="min-w-0">
          <p className="font-medium truncate">{exercise.name}</p>
          <p className="text-xs text-destructive mt-0.5">
            Delete? Past workouts keep their data.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleting(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <Star className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      <span className="font-medium flex-1 min-w-0 truncate">{exercise.name}</span>
      <Badge variant="secondary" className="text-xs shrink-0">
        {getBodyPartLabel(exercise.bodyPart)}
      </Badge>
      <div className="flex gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => setDeleting(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── System Exercises Section ───────────────────────────────────────────

function SystemExercisesSection() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? EXERCISES.filter((ex) =>
        ex.name.toLowerCase().includes(search.toLowerCase())
      )
    : EXERCISES;

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Built-in Exercises ({EXERCISES.length})
          </span>
          <Badge variant="outline" className="text-xs">
            Read-only
          </Badge>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t">
          <div className="p-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search built-in exercises…"
              className="h-9"
            />
          </div>
          <div className="px-3 pb-3 space-y-1 max-h-80 overflow-y-auto">
            {filtered.map((ex) => (
              <div
                key={ex.name}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm flex-1">{ex.name}</span>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {getBodyPartLabel(ex.bodyPart)}
                </Badge>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No exercises match your search.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const { data, isLoading } = useCustomExercises();
  const customExercises = data?.exercises ?? [];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
          <p className="text-muted-foreground">
            Manage your custom exercises and browse built-in ones
          </p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Exercise
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddExerciseForm onClose={() => setShowAddForm(false)} />
      )}

      {/* Custom exercises */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          My Custom Exercises
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : customExercises.length > 0 ? (
          <div className="space-y-2">
            {customExercises.map((ex) => (
              <ExerciseRow key={ex._id} exercise={ex} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border rounded-xl bg-muted/10">
            <Star className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium mb-1">No custom exercises yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add exercises that aren&apos;t in the built-in list.
            </p>
            {!showAddForm && (
              <Button size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Exercise
              </Button>
            )}
          </div>
        )}
      </div>

      {/* System exercises */}
      <SystemExercisesSection />
    </div>
  );
}
