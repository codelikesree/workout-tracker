"use client";

import { Lightbulb, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationsProps {
  recommendations: string[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  const hasRecommendations = recommendations.length > 0;

  return (
    <Card className="transition-all hover:shadow-md border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">Actionable Insights</CardTitle>
        </div>
        <CardDescription>Personalized recommendations for your training</CardDescription>
      </CardHeader>
      <CardContent>
        {hasRecommendations ? (
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Keep logging workouts to get personalized recommendations
          </p>
        )}
      </CardContent>
    </Card>
  );
}
