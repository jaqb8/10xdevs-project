import { useState } from "react";
import type { TextAnalysisDto, CreateLearningItemCommand } from "../../types";

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

export function useTextAnalysis() {
  const [state, setState] = useState<AnalyzeViewState>(INITIAL_STATE);

  const setText = (text: string) => {
    setState((prev) => ({ ...prev, text }));
  };

  const analyzeText = async () => {
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
        body: JSON.stringify({ text: state.text }),
      });

      if (response.status === 401) {
        // eslint-disable-next-line react-compiler/react-compiler
        window.location.href = "/login";
        return;
      }

      if (response.status === 429) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Przekroczono limit zapytań. Spróbuj ponownie za chwilę.",
        }));
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Array.isArray(errorData)
          ? errorData[0]?.message || "Wystąpił błąd podczas analizy."
          : errorData.error || "Wystąpił błąd podczas analizy.";

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

  const saveResult = async () => {
    if (!state.result || state.result.is_correct) {
      return;
    }

    const command: CreateLearningItemCommand = {
      original_sentence: state.result.original_text,
      corrected_sentence: state.result.corrected_text,
      explanation: state.result.explanation,
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
        const errorData = await response.json();
        const errorMessage = Array.isArray(errorData)
          ? errorData[0]?.message || "Nie udało się zapisać."
          : errorData.error || "Nie udało się zapisać.";

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
