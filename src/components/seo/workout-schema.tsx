"use client";

import Script from "next/script";
import { siteConfig } from "@/lib/seo-config";

interface WorkoutSchemaProps {
  workoutId: string;
  name: string;
  description?: string;
  type: string;
  date: string;
  duration?: number;
  exercises: Array<{
    name: string;
    sets: Array<{
      reps: number;
      weight: number;
      weightUnit: string;
    }>;
  }>;
}

export function WorkoutSchema({
  workoutId,
  name,
  description,
  type,
  date,
  duration,
  exercises,
}: WorkoutSchemaProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Workouts",
        item: `${siteConfig.url}/workouts`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: name,
        item: `${siteConfig.url}/workouts/${workoutId}`,
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Complete ${name} Workout`,
    description: description || `A ${type} workout session with ${exercises.length} exercises`,
    image: `${siteConfig.url}/og-image.png`,
    totalTime: duration ? `PT${duration}M` : undefined,
    step: exercises.map((exercise, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: exercise.name,
      text: `Complete ${exercise.sets.length} sets of ${exercise.name}`,
      itemListElement: exercise.sets.map((set, setIndex) => ({
        "@type": "HowToDirection",
        position: setIndex + 1,
        text: `Set ${setIndex + 1}: ${set.reps} reps${set.weight > 0 ? ` at ${set.weight}${set.weightUnit}` : ""}`,
      })),
    })),
  };

  const exerciseSchema = {
    "@context": "https://schema.org",
    "@type": "ExercisePlan",
    name: name,
    description: description || `${type} workout session`,
    activityDuration: duration ? `PT${duration}M` : undefined,
    exerciseType: type,
    repetitions: exercises.reduce((total, ex) => total + ex.sets.length, 0),
  };

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="exercise-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(exerciseSchema) }}
      />
    </>
  );
}
