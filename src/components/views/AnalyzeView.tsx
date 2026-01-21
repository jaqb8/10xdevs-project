import { useCallback, useEffect, useRef } from "react";
import { useTextAnalysis } from "../../lib/hooks/useTextAnalysis";
import { useAnalysisModeStore } from "../../lib/stores/analysis-mode.store";
import { usePendingAnalysisStore } from "../../lib/stores/pending-analysis.store";
import { useAuthStore } from "../../lib/stores/auth.store";
import { usePointsStore } from "../../lib/stores/points.store";
import { formatResetTime } from "../../lib/utils";
import { AnalysisForm } from "../features/AnalysisForm";
import { AnalysisResult } from "../features/AnalysisResult";
import { toast } from "sonner";
import type { CreateLearningItemCommand } from "../../types";

const MAX_TEXT_LENGTH = 500;

export function AnalyzeView() {
  const { state, quota, setText, setAnalysisContext, analyzeText, saveResult, clear } = useTextAnalysis();
  const mode = useAnalysisModeStore((state) => state.mode);
  const { clearPendingAnalysis } = usePendingAnalysisStore();
  const isAuth = useAuthStore((state) => state.isAuth);
  const incrementPoints = usePointsStore((state) => state.incrementPoints);
  const lastResultRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.result?.is_correct && isAuth && state.resultTimestamp) {
      if (lastResultRef.current !== state.resultTimestamp) {
        lastResultRef.current = state.resultTimestamp;
        incrementPoints();
      }
    }
  }, [state.result, state.resultTimestamp, isAuth, incrementPoints]);

  useEffect(() => {
    return () => {
      clearPendingAnalysis();
    };
  }, [clearPendingAnalysis]);

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

  const handleSave = useCallback(
    (command: CreateLearningItemCommand) => {
      saveResult(command);
    },
    [saveResult]
  );

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Analiza tekstu</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Wprowadź tekst w języku angielskim, a AI pomoże Ci znaleźć błędy gramtyczne oraz stylistyczne.
        </p>
      </header>

      <section aria-label="Formularz analizy tekstu">
        <AnalysisForm
          text={state.text}
          onTextChange={setText}
          onSubmit={() => analyzeText(mode)}
          onClear={clear}
          isLoading={state.status === "loading"}
          isAnalyzing={state.status === "loading"}
          maxLength={MAX_TEXT_LENGTH}
          quota={!isAuth ? quota : null}
          formatResetTime={formatResetTime}
          analysisContext={state.analysisContext}
          onAnalysisContextChange={setAnalysisContext}
          isAuth={isAuth}
        />
      </section>
      {(state.status === "loading" || state.result) && (
        <section aria-label="Wyniki analizy" aria-live="polite">
          <AnalysisResult
            isLoading={state.status === "loading"}
            analysisResult={state.result}
            isSaved={state.isCurrentResultSaved}
            analysisMode={mode}
            analysisContext={state.analysisContext}
            onSave={handleSave}
            earnedPoint={state.result?.is_correct === true && isAuth}
          />
        </section>
      )}
    </main>
  );
}
