import { Moon, Sun } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/hooks/useTheme";

export function UserMenuThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer" data-test-id="header-theme-toggle-menu-item">
      <div className="relative h-[1.2rem] w-[1.2rem]">
        <Sun className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </div>
      <span>Przełącz motyw</span>
    </DropdownMenuItem>
  );
}
