import { useEffect, useRef } from "react";
import type { InitialUserDataStatus } from "@/lib/fetch-initial-user-data";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

interface InitialUserDataErrorToastProps {
  status: InitialUserDataStatus;
}

export function InitialUserDataErrorToast({ status }: InitialUserDataErrorToastProps) {
  const hasShownErrorToast = useRef(false);

  useEffect(() => {
    if (status !== "error" || hasShownErrorToast.current) {
      return;
    }

    hasShownErrorToast.current = true;
    toast.error("Nie udało się wczytać danych użytkownika.");
  }, [status]);

  return <Toaster richColors />;
}
