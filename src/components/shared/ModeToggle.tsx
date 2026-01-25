import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/hooks/useTheme";

export function ModeToggle({ children }: { children?: React.ReactNode }) {
  const { toggleTheme } = useTheme();

  return (
    <Button
      variant={children ? "secondary" : "ghost"}
      size={children ? "default" : "icon"}
      onClick={toggleTheme}
      data-test-id="theme-toggle-button"
      className={children ? "w-full justify-center gap-2" : ""}
    >
      {!children ? (
        <>
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Przełącz motyw</span>
        </>
      ) : (
        <>
          <div className="relative h-[1.2rem] w-[1.2rem]">
            <Sun className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </div>
          <span>{children}</span>
        </>
      )}
    </Button>
  );
}
