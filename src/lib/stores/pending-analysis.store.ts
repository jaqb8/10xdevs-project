import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TextAnalysisDto, AnalysisMode } from "@/types";

export interface PendingAnalysisState {
  result: TextAnalysisDto;
  mode: AnalysisMode;
  originalText: string;
  analysisContext?: string;
  timestamp?: number;
}

interface PendingAnalysisStore {
  pendingAnalysis: PendingAnalysisState | null;
  setPendingAnalysis: (state: PendingAnalysisState) => void;
  clearPendingAnalysis: () => void;
}

export const usePendingAnalysisStore = create<PendingAnalysisStore>()(
  persist(
    (set) => ({
      pendingAnalysis: null,
      setPendingAnalysis: (state) => set({ pendingAnalysis: state }),
      clearPendingAnalysis: () => set({ pendingAnalysis: null }),
    }),
    {
      name: "pending_analysis",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
