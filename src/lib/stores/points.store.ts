import { create } from "zustand";

interface PointsState {
  points: number | null;
}

interface PointsActions {
  setPoints: (points: number | null) => void;
  incrementPoints: () => void;
  clearPoints: () => void;
}

type PointsStore = PointsState & PointsActions;

export const usePointsStore = create<PointsStore>((set) => ({
  points: null,
  setPoints: (points) => set({ points }),
  incrementPoints: () =>
    set((state) => ({
      points: state.points !== null ? state.points + 1 : 1,
    })),
  clearPoints: () => set({ points: null }),
}));
