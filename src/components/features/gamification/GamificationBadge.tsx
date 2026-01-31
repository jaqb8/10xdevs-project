import { useEffect, useRef, useState, useMemo } from "react";
import { ChevronUp, ChevronsUp, Rocket, Crown } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GamificationBadgeProps {
  correctAnalyses?: number;
  totalAnalyses?: number;
  showBeta?: boolean;
  isLoading?: boolean;
}

interface LevelConfig {
  name: string;
  description: string;
  range: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  betaClass: string;
  Icon: typeof ChevronUp;
}

const LEVEL_CONFIGS: Record<string, LevelConfig> = {
  beginner: {
    name: "Początkujący",
    description: "Dopiero zaczynasz swoją przygodę z językiem. Każdy błąd to okazja do nauki!",
    range: "0% – 39%",
    bgClass: "bg-slate-100 dark:bg-slate-800/50",
    borderClass: "border-slate-300 dark:border-slate-700",
    textClass: "text-slate-700 dark:text-slate-300",
    betaClass: "text-slate-600 dark:text-slate-400 border-slate-400 dark:border-slate-500",
    Icon: ChevronUp,
  },
  developing: {
    name: "Rozwijający się",
    description: "Robisz postępy! Kontynuuj ćwiczenia, a wkrótce osiągniesz wyższy poziom.",
    range: "40% – 69%",
    bgClass: "bg-amber-50 dark:bg-amber-950/50",
    borderClass: "border-amber-200 dark:border-amber-800",
    textClass: "text-amber-700 dark:text-amber-300",
    betaClass: "text-amber-600 dark:text-amber-400 border-amber-400 dark:border-amber-500",
    Icon: ChevronsUp,
  },
  advanced: {
    name: "Zaawansowany",
    description: "Świetna robota! Twoja znajomość języka jest na wysokim poziomie.",
    range: "70% – 89%",
    bgClass: "bg-green-50 dark:bg-green-950/50",
    borderClass: "border-green-200 dark:border-green-800",
    textClass: "text-green-700 dark:text-green-300",
    betaClass: "text-green-600 dark:text-green-400 border-green-400 dark:border-green-500",
    Icon: Crown,
  },
  expert: {
    name: "Ekspert",
    description: "Mistrzostwo! Piszesz niemal bezbłędnie. Jesteś wzorem do naśladowania!",
    range: "90% – 100%",
    bgClass: "bg-blue-50 dark:bg-blue-950/50",
    borderClass: "border-blue-200 dark:border-blue-800",
    textClass: "text-blue-700 dark:text-blue-300",
    betaClass: "text-blue-600 dark:text-blue-400 border-blue-400 dark:border-blue-500",
    Icon: Rocket,
  },
};

function getLevelFromPercentage(percentage: number): string {
  if (percentage >= 90) return "expert";
  if (percentage >= 70) return "advanced";
  if (percentage >= 40) return "developing";
  return "beginner";
}

export function GamificationBadge({
  correctAnalyses,
  totalAnalyses,
  showBeta = false,
  isLoading = false,
}: GamificationBadgeProps) {
  const prevTotalRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const hasData = correctAnalyses !== undefined && totalAnalyses !== undefined;
  const hasAnalyses = hasData && totalAnalyses > 0;

  const { percentage, config } = useMemo(() => {
    if (!hasAnalyses) {
      return { percentage: 0, config: LEVEL_CONFIGS.beginner };
    }
    const pct = Math.round((correctAnalyses / totalAnalyses) * 100);
    const lvl = getLevelFromPercentage(pct);
    return { percentage: pct, config: LEVEL_CONFIGS[lvl] };
  }, [correctAnalyses, totalAnalyses, hasAnalyses]);

  useEffect(() => {
    if (totalAnalyses !== undefined && prevTotalRef.current !== null && totalAnalyses > prevTotalRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
    prevTotalRef.current = totalAnalyses ?? null;
  }, [totalAnalyses]);

  if (isLoading) {
    return <Skeleton className="h-8 w-20 rounded-full" data-test-id="header-points-skeleton" />;
  }

  if (correctAnalyses === undefined || totalAnalyses === undefined) {
    return null;
  }

  const { Icon } = config;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "points-badge shadow-xs flex items-center gap-2 border rounded-full h-8 px-3 cursor-pointer transition-colors",
            config.bgClass,
            config.borderClass,
            isAnimating && "animate-scale"
          )}
          data-test-id="header-points-badge"
        >
          <Icon className={cn("size-4", config.textClass)} />
          <span className={cn("text-base font-medium", config.textClass)}>{percentage}%</span>
          {showBeta && (
            <span
              className={cn(
                "text-[7px] font-semibold uppercase tracking-wide border rounded-sm px-1 py-0.5",
                config.betaClass
              )}
            >
              beta
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center size-10 rounded-full",
                config.bgClass,
                config.borderClass
              )}
            >
              <Icon className={cn("size-5", config.textClass)} />
            </div>
            <div>
              <span className={config.textClass}>{config.name}</span>
              <p className="text-sm font-normal text-muted-foreground">{config.range}</p>
            </div>
          </SheetTitle>
          <SheetDescription className="pt-3 text-lg">{config.description}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Twój wynik</p>
              <p className={cn("text-3xl font-bold", config.textClass)}>{percentage}%</p>
            </div>
            {hasAnalyses && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Poprawne analizy</p>
                <p className="text-lg font-semibold">
                  {correctAnalyses} z {totalAnalyses}
                </p>
              </div>
            )}
          </div>

          {!hasAnalyses && (
            <p className="text-sm text-muted-foreground text-center">
              Przeprowadź pierwszą analizę, aby zobaczyć swoje statystyki!
            </p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Wszystkie poziomy:</p>
            <div className="grid gap-2">
              {Object.entries(LEVEL_CONFIGS).map(([key, levelConfig]) => {
                const isCurrentLevel = config === levelConfig;
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center gap-3 border rounded-md p-2 text-sm",
                      isCurrentLevel && "font-semibold",
                      isCurrentLevel && "bg-secondary/40"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center size-7 rounded-full",
                        levelConfig.bgClass,
                        levelConfig.borderClass
                      )}
                    >
                      <levelConfig.Icon className={cn("size-4", levelConfig.textClass)} />
                    </div>
                    <div className="flex-1">
                      <span className={cn(isCurrentLevel ? "font-bold" : "font-medium", levelConfig.textClass)}>
                        {levelConfig.name}
                      </span>
                    </div>
                    <span className={cn("text-xs", isCurrentLevel ? "font-semibold" : "text-muted-foreground")}>
                      {levelConfig.range}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
