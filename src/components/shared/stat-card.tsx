import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
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
    <Card className={cn("transition-all hover:shadow-sm", className)}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-medium truncate">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-2" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums tracking-tight mt-1.5">
                  {value}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {unit && (
                    <p className="text-xs text-muted-foreground">{unit}</p>
                  )}
                  {trend !== undefined && trend !== 0 && (
                    <Badge
                      variant={trend > 0 ? "default" : "secondary"}
                      className={cn(
                        "text-xs font-medium px-1.5",
                        trend > 0 &&
                          "bg-success/15 text-success border-success/20 hover:bg-success/20",
                        trend < 0 && "bg-muted text-muted-foreground"
                      )}
                    >
                      {trend > 0 ? "+" : ""}
                      {trend}%
                    </Badge>
                  )}
                </div>
                {description && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
