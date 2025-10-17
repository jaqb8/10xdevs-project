import { useCallback, useEffect } from "react";
import { useTextAnalysis } from "../../lib/hooks/useTextAnalysis";
import { AnalysisForm } from "../features/AnalysisForm";
import { AnalysisResult } from "../features/AnalysisResult";
import { toast } from "sonner";

const MAX_TEXT_LENGTH = 500;

export function AnalyzeView() {
  const { state, setText, analyzeText, saveResult, clear } = useTextAnalysis();

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.isCurrentResultSaved) {
      toast.success("Zapisano na liście Do nauki!");
    }
  }, [state.isCurrentResultSaved]);

  const handleSave = useCallback(() => {
    saveResult();
  }, [saveResult]);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Analiza tekstu</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Wprowadź tekst w języku angielskim, a AI pomoże Ci znaleźć błędy gramatyczne.
        </p>
      </header>

      <section aria-label="Formularz analizy tekstu">
        <AnalysisForm
          key={`form-${state.status}`}
          text={state.text}
          onTextChange={setText}
          onSubmit={analyzeText}
          isLoading={state.status !== "idle"}
          isAnalyzing={state.status === "loading"}
          maxLength={MAX_TEXT_LENGTH}
        />
      </section>
      {(state.status === "loading" || state.result) && (
        <section aria-label="Wyniki analizy" aria-live="polite">
          <AnalysisResult
            isLoading={state.status === "loading"}
            analysisResult={state.result}
            isSaved={state.isCurrentResultSaved}
            onClear={clear}
            onSave={handleSave}
          />
        </section>
      )}
    </main>
  );
}
