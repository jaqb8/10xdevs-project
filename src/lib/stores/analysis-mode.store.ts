import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ANALYSIS_MODES, type AnalysisMode } from "@/types";

interface AnalysisModeStore {
  mode: AnalysisMode;
  setMode: (mode: AnalysisMode) => void;
}

export const useAnalysisModeStore = create<AnalysisModeStore>()(
  persist(
    (set) => ({
      mode: ANALYSIS_MODES.GRAMMAR_AND_SPELLING,
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "analysis_mode",
    }
  )
);
