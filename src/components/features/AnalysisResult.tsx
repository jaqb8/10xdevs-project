import { useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TextDiff } from "@/components/shared/TextDiff";
import { BookPlus, CheckCircle2, UserPlus } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { isFeatureEnabled } from "@/features/feature-flags.service";
import type { TextAnalysisDto, CreateLearningItemCommand } from "../../types";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
  isLoading: boolean;
  analysisResult: TextAnalysisDto | null;
  isSaved: boolean;
  onSave: (item: CreateLearningItemCommand) => void;
}

export function AnalysisResult({ isLoading, analysisResult, isSaved, onSave }: AnalysisResultProps) {
  const { isAuth } = useAuthStore();
  const isAuthFeatureEnabled = isFeatureEnabled("auth");
  const isLearningItemsFeatureEnabled = isFeatureEnabled("learning-items");

  const handleSave = useCallback(() => {
    if (!isAuth) {
      window.location.href = "/login";
      return;
    }

    if (analysisResult && !analysisResult.is_correct) {
      const command: CreateLearningItemCommand = {
        original_sentence: analysisResult.original_text,
        corrected_sentence: analysisResult.corrected_text,
        explanation: analysisResult.explanation,
      };
      onSave(command);
    }
  }, [analysisResult, onSave, isAuth]);

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
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
            <CheckCircle2 className="size-12 text-green-600 dark:text-green-500" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">Świetna robota!</h2>
              <p className="text-muted-foreground text-sm">Twój tekst nie zawiera błędów gramatycznych.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card role="article" aria-label="Wynik analizy - znaleziono błędy" data-test-id="analysis-result-with-errors">
      <CardHeader>
        <CardTitle>
          <h2 className="text-lg font-semibold">Wynik analizy</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextDiff originalText={analysisResult.original_text} correctedText={analysisResult.corrected_text} />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Wyjaśnienie:</h3>
          <p className="rounded-md bg-muted p-3 text-sm leading-relaxed" data-test-id="analysis-explanation">
            {analysisResult.explanation}
          </p>
        </div>
      </CardContent>
      {shouldShowSaveButton && (
        <CardFooter>
          <Button
            onClick={handleSave}
            disabled={isSaved}
            variant="default"
            className={cn("w-full text-lg h-10", !isAuth && !isSaved && "bg-accent hover:bg-accent/90")}
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
