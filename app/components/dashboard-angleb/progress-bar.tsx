import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  color?: string;
}

export function ProgressBar({ value, className, color }: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full", color || "bg-blue-500")}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="mt-1 text-sm font-medium">{value}%</div>
    </div>
  );
}