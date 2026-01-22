import { create } from "zustand";

interface PointsState {
  points: number | null;
  lastModifiedAt: number | null;
}

interface PointsActions {
  setPoints: (points: number | null) => void;
  initializePoints: (points: number) => void;
  incrementPoints: () => void;
  clearPoints: () => void;
}

type PointsStore = PointsState & PointsActions;

export const usePointsStore = create<PointsStore>((set) => ({
  points: null,
  lastModifiedAt: null,
  setPoints: (points) => set({ points, lastModifiedAt: Date.now() }),
  initializePoints: (points) =>
    set((state) => {
      if (state.lastModifiedAt !== null) {
        return state;
      }
      return { points, lastModifiedAt: Date.now() };
    }),
  incrementPoints: () =>
    set((state) => ({
      points: state.points !== null ? state.points + 1 : 1,
      lastModifiedAt: Date.now(),
    })),
  clearPoints: () => set({ points: null, lastModifiedAt: null }),
}));
