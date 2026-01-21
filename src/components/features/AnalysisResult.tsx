import { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TextDiff } from "@/components/shared/TextDiff";
import { AnalysisModeBadge } from "@/components/shared/AnalysisModeBadge";
import { BookPlus, CheckCircle2, UserPlus, Languages, Trophy } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { usePendingAnalysisStore } from "@/lib/stores/pending-analysis.store";
import { isFeatureEnabled } from "@/features/feature-flags.service";
import type { TextAnalysisDto, CreateLearningItemCommand, AnalysisMode } from "../../types";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
  isLoading: boolean;
  analysisResult: TextAnalysisDto | null;
  isSaved: boolean;
  analysisMode: AnalysisMode;
  analysisContext?: string;
  onSave: (item: CreateLearningItemCommand) => void;
  earnedPoint?: boolean;
}

export function AnalysisResult({
  isLoading,
  analysisResult,
  isSaved,
  analysisMode,
  analysisContext,
  onSave,
  earnedPoint = false,
}: AnalysisResultProps) {
  const { isAuth } = useAuthStore();
  const { setPendingAnalysis } = usePendingAnalysisStore();
  const isAuthFeatureEnabled = isFeatureEnabled("auth");
  const isLearningItemsFeatureEnabled = isFeatureEnabled("learning-items");

  const handleSave = useCallback(() => {
    if (!isAuth) {
      if (analysisResult && !analysisResult.is_correct) {
        setPendingAnalysis({
          result: analysisResult,
          mode: analysisMode,
          originalText: analysisResult.original_text,
          analysisContext: analysisContext?.trim() || undefined,
          timestamp: Date.now(),
        });
      }
      const returnUrl = encodeURIComponent("/?restoreAnalysis=true");
      window.location.href = `/login?returnUrl=${returnUrl}`;
      return;
    }

    if (analysisResult && !analysisResult.is_correct) {
      const command: CreateLearningItemCommand = {
        original_sentence: analysisResult.original_text,
        corrected_sentence: analysisResult.corrected_text,
        explanation: analysisResult.explanation,
        analysis_mode: analysisMode,
        translation: analysisResult.translation ?? null,
      };
      onSave(command);
    }
  }, [analysisResult, onSave, isAuth, analysisMode, analysisContext, setPendingAnalysis]);

  const shouldShowSaveButton = isAuthFeatureEnabled && isLearningItemsFeatureEnabled;

  if (isLoading) {
    return (
      <Card
        aria-busy="true"
        role="status"
        aria-label="Ładowanie wyników analizy"
        data-test-id="analysis-result-loading"
      >
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <span className="sr-only">Analizuję tekst, proszę czekać...</span>
      </Card>
    );
  }

  if (!analysisResult) {
    return null;
  }

  if (analysisResult.is_correct) {
    return (
      <Card role="status" aria-label="Wynik analizy - tekst poprawny" data-test-id="analysis-result-correct">
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-2 text-center">
            <CheckCircle2 className="size-12 text-green-600 dark:text-green-500" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Świetna robota!</h2>
              <p className="text-muted-foreground text-sm">Twój tekst nie wymaga poprawek.</p>
            </div>
            {earnedPoint && (
              <div
                className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                data-test-id="earned-point-badge"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700">
                  <Trophy className="size-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">+1 punkt!</span>
                </div>
                <p className="text-xs text-muted-foreground">Zdobywasz punkty za każdą analizę bez błędów.</p>
              </div>
            )}
            {analysisResult.translation && (
              <div className="flex flex-col items-center gap-2 pt-4 max-w-2xl w-full">
                <div className="border-t border-border w-full pt-6">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 justify-center">
                    <Languages className="size-4" aria-hidden="true" />
                    Tłumaczenie:
                  </h3>
                  <div
                    className="text-sm font-thin leading-relaxed text-foreground/80 italic mt-2"
                    data-test-id="analysis-result-translation"
                  >
                    {analysisResult.translation}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card role="article" aria-label="Wynik analizy - znaleziono błędy" data-test-id="analysis-result-with-errors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Wynik analizy</h2>
          <AnalysisModeBadge mode={analysisMode} className="text-xs" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextDiff
          originalText={analysisResult.original_text}
          correctedText={analysisResult.corrected_text}
          translation={analysisResult.translation}
        />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold px-2">Wyjaśnienie:</h3>
          <div
            className="rounded-md bg-muted p-3 text-sm leading-relaxed markdown-content"
            data-test-id="analysis-explanation"
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-outside mb-3 ml-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-outside mb-3 ml-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
              }}
            >
              {analysisResult.explanation}
            </ReactMarkdown>
          </div>
        </div>
      </CardContent>
      {shouldShowSaveButton && (
        <CardFooter>
          <Button
            onClick={handleSave}
            disabled={isSaved}
            variant="secondary"
            className={cn("w-full text-lg h-10", !isAuth && !isSaved && "hover:bg-accent/90")}
            aria-label={
              isSaved
                ? "Element już zapisany na liście"
                : isAuth
                  ? "Dodaj ten błąd do listy Do nauki"
                  : "Zaloguj się, aby dodać do listy"
            }
            data-test-id="analysis-save-button"
          >
            {isSaved ? (
              "Zapisano ✓"
            ) : isAuth ? (
              <>
                <BookPlus className="size-4" />
                Dodaj do listy Do nauki
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                Zaloguj się, aby dodać do listy
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
