import { create } from "zustand";
import type { UserViewModel } from "@/types";

interface AuthState {
  user: UserViewModel | null;
  isAuth: boolean;
  isAuthInitialized: boolean;
}

interface AuthActions {
  setUser: (user: UserViewModel | null) => void;
  clearUser: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuth: false,
  isAuthInitialized: false,
  setUser: (user) =>
    set({
      user,
      isAuth: user !== null,
      isAuthInitialized: true,
    }),
  clearUser: () =>
    set({
      user: null,
      isAuth: false,
      isAuthInitialized: true,
    }),
}));
