import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number; // Percentage change (+12 = 12% increase)
  loading?: boolean;
  className?: string;
  description?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  loading,
  className,
  description,
}: StatCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            {label}
          </CardDescription>
          <div className="rounded-full bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold tabular-nums tracking-tight">
              {value}
            </div>
            <div className="mt-1 flex items-center gap-2">
              {unit && (
                <p className="text-xs text-muted-foreground">{unit}</p>
              )}
              {trend !== undefined && trend !== 0 && (
                <Badge
                  variant={trend > 0 ? "default" : "secondary"}
                  className={cn(
                    "text-xs font-medium",
                    trend > 0 && "bg-success text-success-foreground hover:bg-success/90",
                    trend < 0 && "bg-muted text-muted-foreground"
                  )}
                >
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </Badge>
              )}
            </div>
            {description && (
              <p className="mt-2 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
