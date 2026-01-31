import { create } from "zustand";
import type { AnalysisStats } from "@/types";

interface AnalysisStatsState {
  correctAnalyses: number | null;
  totalAnalyses: number | null;
  lastModifiedAt: number | null;
}

interface AnalysisStatsActions {
  setStats: (stats: AnalysisStats | null) => void;
  initializeStats: (stats: AnalysisStats) => void;
  incrementStats: (isCorrect: boolean) => void;
  clearStats: () => void;
}

type AnalysisStatsStore = AnalysisStatsState & AnalysisStatsActions;

export const usePointsStore = create<AnalysisStatsStore>((set) => ({
  correctAnalyses: null,
  totalAnalyses: null,
  lastModifiedAt: null,
  setStats: (stats) =>
    set({
      correctAnalyses: stats?.correctAnalyses ?? null,
      totalAnalyses: stats?.totalAnalyses ?? null,
      lastModifiedAt: Date.now(),
    }),
  initializeStats: (stats) =>
    set((state) => {
      if (state.lastModifiedAt !== null) {
        return state;
      }
      return {
        correctAnalyses: stats.correctAnalyses,
        totalAnalyses: stats.totalAnalyses,
        lastModifiedAt: Date.now(),
      };
    }),
  incrementStats: (isCorrect) =>
    set((state) => ({
      correctAnalyses: isCorrect
        ? (state.correctAnalyses ?? 0) + 1
        : state.correctAnalyses ?? 0,
      totalAnalyses: (state.totalAnalyses ?? 0) + 1,
      lastModifiedAt: Date.now(),
    })),
  clearStats: () => set({ correctAnalyses: null, totalAnalyses: null, lastModifiedAt: null }),
}));
