import { useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TextDiff } from "@/components/shared/TextDiff";
import { CheckCircle2 } from "lucide-react";
import type { TextAnalysisDto, CreateLearningItemCommand } from "../../types";

interface AnalysisResultProps {
  isLoading: boolean;
  analysisResult: TextAnalysisDto | null;
  isSaved: boolean;
  onClear: () => void;
  onSave: (item: CreateLearningItemCommand) => void;
}

export function AnalysisResult({ isLoading, analysisResult, isSaved, onClear, onSave }: AnalysisResultProps) {
  const handleSave = useCallback(() => {
    if (analysisResult && !analysisResult.is_correct) {
      const command: CreateLearningItemCommand = {
        original_sentence: analysisResult.original_text,
        corrected_sentence: analysisResult.corrected_text,
        explanation: analysisResult.explanation,
      };
      onSave(command);
    }
  }, [analysisResult, onSave]);

  if (isLoading) {
    return (
      <Card aria-busy="true" role="status" aria-label="Ładowanie wyników analizy">
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
      <Card role="status" aria-label="Wynik analizy - tekst poprawny">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
            <CheckCircle2 className="size-12 text-green-600 dark:text-green-500" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">Świetna robota!</h2>
              <p className="text-muted-foreground text-sm">Twój tekst nie zawiera błędów gramatycznych.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={onClear}
            variant="outline"
            className="w-full"
            aria-label="Wyczyść formularz i zacznij od nowa"
          >
            Wyczyść
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card role="article" aria-label="Wynik analizy - znaleziono błędy">
      <CardHeader>
        <CardTitle>
          <h2 className="text-lg font-semibold">Wynik analizy</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextDiff originalText={analysisResult.original_text} correctedText={analysisResult.corrected_text} />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Wyjaśnienie:</h3>
          <p className="rounded-md bg-muted p-3 text-sm leading-relaxed">{analysisResult.explanation}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={handleSave}
          disabled={isSaved}
          className="w-full sm:w-auto"
          aria-label={isSaved ? "Element już zapisany na liście" : "Dodaj ten błąd do listy Do nauki"}
        >
          {isSaved ? "Zapisano ✓" : "Dodaj do listy Do nauki"}
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          className="w-full sm:w-auto"
          aria-label="Wyczyść formularz i zacznij od nowa"
        >
          Wyczyść
        </Button>
      </CardFooter>
    </Card>
  );
}
