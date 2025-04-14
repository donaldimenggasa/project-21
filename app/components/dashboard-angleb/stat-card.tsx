import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: any;
  trendValue?: any;
  scoreValue?: any;
  className?: string;
  valueClassName?: string;
  icon?:any;
}


export function StatCard({
  title,
  value,
  trend,
  trendValue,
  scoreValue,
  className,
  valueClassName,
  icon = null
}: StatCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-baseline">
          <p className={cn("text-2xl font-bold", valueClassName)}>
            {value}
          </p>
          {trendValue && (
            <span className="ml-2 text-sm">
              {typeof trendValue === "number" ? `${trendValue}%` : trendValue}
            </span>
          )}
        </div>
        {icon && (
          <div className=" flex flex-col">
            {icon()}
          </div>
          
        )}
      </div>
      {trend && (
        <div className="mt-2">
          <div className={cn("flex items-center text-sm", "text-green-700 dark:text-green-400")}>
         
            <span className=" font-bold text-lg">TOTAL - {trend}</span>
          </div>
          {/**<div
            className={cn(
              "flex items-center text-sm",
              trend === "up" ? "text-green-700 dark:text-green-400" : "text-red-700"
            )}
          >
            {trend === "up" ? (
              <ArrowUp className="mr-1 h-4 w-4" />
            ) : (
              <ArrowDown className="mr-1 h-4 w-4" />
            )}
            <span>{trendValue}%</span>
          </div> */}
        </div>
      )}
    </div>
  );
}