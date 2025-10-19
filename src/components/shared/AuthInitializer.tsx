import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { UserViewModel } from "@/types";

interface AuthInitializerProps {
  user: UserViewModel | null;
}

export function AuthInitializer({ user }: AuthInitializerProps) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return null;
}
