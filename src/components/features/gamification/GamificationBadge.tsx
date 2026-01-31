import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GamificationBadgeProps {
  points?: number;
  showBeta?: boolean;
  isLoading?: boolean;
}

export function GamificationBadge({ points, showBeta = false, isLoading = false }: GamificationBadgeProps) {
  const pointsValue = points ?? null;
  const prevPointsRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  useEffect(() => {
    if (pointsValue !== null && prevPointsRef.current !== null && pointsValue > prevPointsRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
    prevPointsRef.current = pointsValue;
  }, [pointsValue]);

  if (isLoading) {
    return <Skeleton className="h-8 w-20 rounded-full" data-test-id="header-points-skeleton" />;
  }

  if (pointsValue === null) {
    return null;
  }

  const handleToggle = () => {
    setIsTooltipOpen((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
      <TooltipTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "points-badge shadow-xs flex items-center gap-2 border rounded-full h-8 px-3 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 cursor-pointer",
            isAnimating && "animate-scale"
          )}
          data-test-id="header-points-badge"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
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
