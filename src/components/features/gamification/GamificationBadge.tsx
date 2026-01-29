import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GamificationBadgeProps {
  variant: "desktop" | "mobile";
  points?: number;
  showBeta?: boolean;
  isLoading?: boolean;
}

export function GamificationBadge({ variant, points, showBeta = false, isLoading = false }: GamificationBadgeProps) {
  const pointsValue = points ?? null;
  const prevPointsRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = variant === "mobile";

  useEffect(() => {
    if (pointsValue !== null && prevPointsRef.current !== null && pointsValue > prevPointsRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
    prevPointsRef.current = pointsValue;
  }, [pointsValue]);

  if (isLoading) {
    return (
      <Skeleton
        className={isMobile ? "h-8 w-full rounded-full" : "h-8 w-20 rounded-full"}
        data-test-id={isMobile ? "header-points-skeleton-mobile" : "header-points-skeleton"}
      />
    );
  }

  if (pointsValue === null) {
    return null;
  }

  if (isMobile) {
    return (
      <div
        className="flex flex-col items-center gap-1 py-1 px-4 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800"
        data-test-id="header-points-badge-mobile"
      >
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
          <span className="text-base font-medium text-amber-700 dark:text-amber-300">{pointsValue} punktów</span>
          {showBeta && (
            <span className="text-[7px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 border border-amber-400 dark:border-amber-500 rounded-sm px-1 py-0.5">
              beta
            </span>
          )}
        </div>
        <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Punkty za analizy bez błędów</p>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "points-badge shadow-xs flex items-center gap-2 border rounded-full h-8 px-3 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 cursor-pointer",
            isAnimating && "animate-scale"
          )}
          data-test-id="header-points-badge"
        >
          <Trophy className="size-4 text-amber-600 dark:text-amber-400" />
          <span className="text-base font-medium text-amber-700 dark:text-amber-300">{pointsValue}</span>
          {showBeta && (
            <span className="text-[7px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 border border-amber-400 dark:border-amber-500 rounded-sm px-1 py-0.5">
              beta
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-center">
        Zdobywasz punkty za każdą analizę tekstu bez błędów. Im więcej punktów, tym lepiej opanowujesz język!
      </TooltipContent>
    </Tooltip>
  );
}
