import { useState, useEffect, useRef, useCallback } from "react";
import { usePendingAnalysisStore } from "../stores/pending-analysis.store";
import { useAnalysisModeStore } from "../stores/analysis-mode.store";
import { useAuthStore } from "../stores/auth.store";
import { formatResetTime } from "../utils";
import type { TextAnalysisDto, CreateLearningItemCommand, ApiErrorResponse, AnalysisMode } from "../../types";

type AnalysisStatus = "idle" | "loading" | "success" | "error";

interface AnalyzeViewState {
  status: AnalysisStatus;
  text: string;
  analysisContext: string;
  result: TextAnalysisDto | null;
  resultTimestamp: number | null;
  isRestoredResult: boolean;
  error: string | null;
  isCurrentResultSaved: boolean;
}

interface QuotaStatus {
  remaining: number;
  resetAt: string;
  limit: number;
}

const INITIAL_STATE: AnalyzeViewState = {
  status: "idle",
  text: "",
  analysisContext: "",
  result: null,
  resultTimestamp: null,
  isRestoredResult: false,
  error: null,
  isCurrentResultSaved: false,
};

function mapErrorCodeToMessage(error: ApiErrorResponse): string {
  const { error_code, data } = error;
  const errorMessages: Record<string, string> = {
    validation_error_text_empty: "Tekst nie może być pusty.",
    validation_error_text_too_long: "Tekst nie może przekraczać 500 znaków.",
    configuration_error: "Błąd konfiguracji serwisu. Skontaktuj się z pomocą techniczną.",
    authentication_error: "Błąd uwierzytelniania. Skontaktuj się z pomocą techniczną.",
    authentication_error_unauthorized: "Musisz być zalogowany, aby wykonać tę operację.",
    rate_limit_error: `Przekroczono limit zapytań. Spróbuj ponownie za ${Math.ceil(((data?.time_until_reset as number) ?? 0) / 1000)} sekund.`,
    daily_quota_exceeded: `Przekroczono dzienny limit analiz dla niezalogowanych użytkowników. Limit zostanie zresetowany ${formatResetTime((data?.reset_at as string) ?? "")}. Zaloguj się, aby uzyskać więcej analiz.`,
    invalid_request_error: "Nieprawidłowe żądanie. Sprawdź wprowadzone dane.",
    validation_error: "Nie udało się przetworzyć odpowiedzi AI. Spróbuj ponownie.",
    network_error: "Błąd sieci. Sprawdź połączenie i spróbuj ponownie.",
    unknown_error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    database_error: "Wystąpił błąd serwera. Spróbuj ponownie za chwilę.",
    validation_error_original_sentence_empty: "Oryginalne zdanie jest wymagane.",
    validation_error_corrected_sentence_empty: "Poprawione zdanie jest wymagane.",
    validation_error_explanation_empty: "Wyjaśnienie jest wymagane.",
    validation_error_explanation_too_long: "Wyjaśnienie nie może przekraczać 500 znaków.",
    validation_error_analysis_context_too_long: "Kontekst nie może przekraczać 500 znaków.",
  };

  return errorMessages[error_code] || "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
}

export function useTextAnalysis() {
  const [state, setState] = useState<AnalyzeViewState>(INITIAL_STATE);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const { pendingAnalysis, clearPendingAnalysis } = usePendingAnalysisStore();
  const { setMode } = useAnalysisModeStore();
  const isAuth = useAuthStore((state) => state.isAuth);
  const hasRestoredRef = useRef(false);

  const checkQuota = useCallback(async () => {
    if (isAuth) {
      setQuota(null);
      return;
    }

    try {
      const response = await fetch("/api/analyze/quota");
      if (response.ok) {
        const data = await response.json();
        if (data.remaining !== null && data.resetAt !== null && data.limit !== null) {
          setQuota({
            remaining: data.remaining,
            resetAt: data.resetAt,
            limit: data.limit,
          });
        } else {
          setQuota(null);
        }
      }
    } catch (error) {
      console.error("Error checking quota:", error);
    }
  }, [isAuth]);

  useEffect(() => {
    if (hasRestoredRef.current) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const shouldRestore = urlParams.get("restoreAnalysis") === "true";

    if (!shouldRestore || !pendingAnalysis) {
      return;
    }

    try {
      setState({
        status: "success",
        text: pendingAnalysis.originalText,
        analysisContext: pendingAnalysis.analysisContext ?? "",
        result: pendingAnalysis.result,
        resultTimestamp: pendingAnalysis.timestamp ?? null,
        isRestoredResult: true,
        error: null,
        isCurrentResultSaved: false,
      });

      setMode(pendingAnalysis.mode);

      clearPendingAnalysis();

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("restoreAnalysis");
      window.history.replaceState({}, "", newUrl.toString());

      hasRestoredRef.current = true;
    } catch (error) {
      console.error("Error restoring analysis state:", error);
      clearPendingAnalysis();
    }
  }, [pendingAnalysis, clearPendingAnalysis, setMode]);

  useEffect(() => {
    checkQuota();
  }, [checkQuota]);

  const setText = (text: string) => {
    setState((prev) => ({ ...prev, text }));
  };

  const setAnalysisContext = (analysisContext: string) => {
    setState((prev) => ({ ...prev, analysisContext }));
  };

  const analyzeText = async (mode: AnalysisMode) => {
    if (!state.text.trim()) {
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    try {
      const requestBody: { text: string; mode: AnalysisMode; analysisContext?: string } = {
        text: state.text,
        mode,
      };

      if (state.analysisContext.trim()) {
        requestBody.analysisContext = state.analysisContext.trim();
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();

        if (errorData.error_code === "daily_quota_exceeded") {
          const resetAt = (errorData.data?.reset_at as string) ?? "";
          const limit = (errorData.data?.limit as number) ?? 0;
          setQuota({
            remaining: 0,
            resetAt,
            limit,
          });
          setState((prev) => ({
            ...prev,
            status: "error",
            error: null,
          }));
          return;
        }

        const errorMessage = mapErrorCodeToMessage(errorData);

        setState((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
        }));
        return;
      }

      const result: TextAnalysisDto = await response.json();

      const remainingHeader = response.headers.get("X-Daily-Quota-Remaining");
      const resetAtHeader = response.headers.get("X-Daily-Quota-Reset-At");
      const limitHeader = response.headers.get("X-Daily-Quota-Limit");

      if (remainingHeader !== null && resetAtHeader !== null && limitHeader !== null) {
        setQuota({
          remaining: parseInt(remainingHeader, 10),
          resetAt: resetAtHeader,
          limit: parseInt(limitHeader, 10),
        });
      }

      setState((prev) => ({
        ...prev,
        status: "success",
        result,
        resultTimestamp: Date.now(),
        isRestoredResult: false,
        error: null,
        isCurrentResultSaved: false,
      }));
    } catch (error) {
      console.error("Network error during text analysis:", error);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
      }));
    }
  };

  const saveResult = async (command: CreateLearningItemCommand) => {
    if (!state.result || state.result.is_correct) {
      return;
    }

    try {
      const response = await fetch("/api/learning-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (response.status === 401) {
        // eslint-disable-next-line react-compiler/react-compiler
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        const errorMessage = mapErrorCodeToMessage(errorData);

        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isCurrentResultSaved: true,
      }));
    } catch (error) {
      console.error("Network error during save:", error);
      setState((prev) => ({
        ...prev,
        error: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
      }));
    }
  };

  const clear = () => {
    setState(INITIAL_STATE);
  };

  return {
    state,
    quota,
    setText,
    setAnalysisContext,
    analyzeText,
    saveResult,
    clear,
  };
}
