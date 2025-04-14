import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, TicketsPlane } from "lucide-react";


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


export function StatCardSeat({
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
            --
          </p>
          {true && (
            <span className="ml-2 text-sm">
              SEAT AVAILABLE
            </span>
          )}
        </div>
        {icon && (
          <div className=" flex flex-col -mt-6">
            <TicketsPlane className="w-12 h-12  text-teal-500 ml-4 mt-4"/>
          </div>
        )}
      </div>
       
        <div className="mt-2">
          <div className={cn("flex items-center text-xs", "text-yellow-700 dark:text-orange-400")}>
            Hubungi Petugas Posko untuk informasi lebih lanjut
          </div>
          
        </div>
      
    </div>
  );
}