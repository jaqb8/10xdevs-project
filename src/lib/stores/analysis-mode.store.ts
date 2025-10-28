import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ANALYSIS_MODES, type AnalysisMode } from "@/types";

interface AnalysisModeState {
  mode: AnalysisMode;
}

interface AnalysisModeActions {
  setMode: (mode: AnalysisMode) => void;
}

type AnalysisModeStore = AnalysisModeState & AnalysisModeActions;

const getInitialMode = (): AnalysisMode => {
  // if (typeof window === "undefined") {
  //   return ANALYSIS_MODES.GRAMMAR_AND_SPELLING;
  // }

  try {
    const stored = localStorage.getItem("analysis_mode");
    if (stored) {
      const parsed = JSON.parse(stored);
      const mode = parsed?.state?.mode;
      if (mode === ANALYSIS_MODES.GRAMMAR_AND_SPELLING || mode === ANALYSIS_MODES.COLLOQUIAL_SPEECH) {
        return mode;
      }
    }
  } catch {
    // Ignore parse errors
  }

  return ANALYSIS_MODES.GRAMMAR_AND_SPELLING;
};

export const useAnalysisModeStore = create<AnalysisModeStore>()(
  persist(
    (set) => ({
      mode: getInitialMode(),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "analysis_mode",
    }
  )
);
