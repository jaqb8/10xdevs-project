import { useCallback, useEffect, useMemo } from "react";
import { useTextAnalysis } from "../../lib/hooks/useTextAnalysis";
import { useAnalysisModeStore } from "../../lib/stores/analysis-mode.store";
import { AnalysisForm } from "../features/AnalysisForm";
import { AnalysisResult } from "../features/AnalysisResult";
import { toast } from "sonner";
import { ANALYSIS_MODES } from "@/types";

const MAX_TEXT_LENGTH = 500;

const ANALYSIS_MODE_DESCRIPTIONS = {
  [ANALYSIS_MODES.GRAMMAR_AND_SPELLING]:
    "Wprowadź tekst w języku angielskim, a AI pomoże Ci znaleźć błędy gramatyczne.",
  [ANALYSIS_MODES.COLLOQUIAL_SPEECH]:
    "Wprowadź tekst w języku angielskim, a AI sprawdzi, czy brzmi naturalnie i potocznie.",
} as const;

export function AnalyzeView() {
  const { state, setText, analyzeText, saveResult, clear } = useTextAnalysis();
  const mode = useAnalysisModeStore((state) => state.mode);

  const description = useMemo(() => {
    return ANALYSIS_MODE_DESCRIPTIONS[mode] || ANALYSIS_MODE_DESCRIPTIONS[ANALYSIS_MODES.GRAMMAR_AND_SPELLING];
  }, [mode]);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.isCurrentResultSaved) {
      toast.success("Zapisano na liście Do nauki!", {
        action: {
          label: "Przejdź do listy",
          onClick: () => {
            window.location.href = "/learning-list";
          },
        },
      });
    }
  }, [state.isCurrentResultSaved]);

  const handleSave = useCallback(() => {
    saveResult(mode);
  }, [saveResult, mode]);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Analiza tekstu</h1>
        <p
          key={mode}
          className="text-muted-foreground text-base sm:text-lg animate-in fade-in duration-300"
          suppressHydrationWarning
        >
          {description}
        </p>
      </header>

      <section aria-label="Formularz analizy tekstu">
        <AnalysisForm
          key={`form-${state.status}`}
          text={state.text}
          onTextChange={setText}
          onSubmit={() => analyzeText(mode)}
          onClear={clear}
          isLoading={state.status === "loading"}
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
            onSave={handleSave}
          />
        </section>
      )}
    </main>
  );
}
