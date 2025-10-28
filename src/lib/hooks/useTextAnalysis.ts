import { useState } from "react";
import type { TextAnalysisDto, CreateLearningItemCommand, ApiErrorResponse, AnalysisMode } from "../../types";

type AnalysisStatus = "idle" | "loading" | "success" | "error";

interface AnalyzeViewState {
  status: AnalysisStatus;
  text: string;
  result: TextAnalysisDto | null;
  error: string | null;
  isCurrentResultSaved: boolean;
}

const INITIAL_STATE: AnalyzeViewState = {
  status: "idle",
  text: "",
  result: null,
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
    invalid_request_error: "Nieprawidłowe żądanie. Sprawdź wprowadzone dane.",
    validation_error: "Nie udało się przetworzyć odpowiedzi AI. Spróbuj ponownie.",
    network_error: "Błąd sieci. Sprawdź połączenie i spróbuj ponownie.",
    unknown_error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    database_error: "Wystąpił błąd serwera. Spróbuj ponownie za chwilę.",
    validation_error_original_sentence_empty: "Oryginalne zdanie jest wymagane.",
    validation_error_corrected_sentence_empty: "Poprawione zdanie jest wymagane.",
    validation_error_explanation_empty: "Wyjaśnienie jest wymagane.",
    validation_error_explanation_too_long: "Wyjaśnienie nie może przekraczać 500 znaków.",
  };

  return errorMessages[error_code] || "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
}

export function useTextAnalysis() {
  const [state, setState] = useState<AnalyzeViewState>(INITIAL_STATE);

  const setText = (text: string) => {
    setState((prev) => ({ ...prev, text }));
  };

  const analyzeText = async (mode: AnalysisMode) => {
    if (!state.text.trim()) {
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: state.text, mode }),
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
          status: "error",
          error: errorMessage,
        }));
        return;
      }

      const result: TextAnalysisDto = await response.json();

      setState((prev) => ({
        ...prev,
        status: "success",
        result,
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

  const saveResult = async (mode: AnalysisMode) => {
    if (!state.result || state.result.is_correct) {
      return;
    }

    const command: CreateLearningItemCommand = {
      original_sentence: state.result.original_text,
      corrected_sentence: state.result.corrected_text,
      explanation: state.result.explanation,
      analysis_mode: mode,
    };

    try {
      const response = await fetch("/api/learning-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (response.status === 401) {
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
    setText,
    analyzeText,
    saveResult,
    clear,
  };
}
