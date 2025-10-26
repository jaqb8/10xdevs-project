# Plan wdrożenia przełącznika Dark Mode

## 1. Dodanie skryptu zarządzania motywem w Layout.astro

W pliku `src/layouts/Layout.astro` należy dodać inline script w sekcji `<head>`:

- Skrypt sprawdza preferencje użytkownika z localStorage lub system preferences
- Dodaje/usuwa klasę `dark` na elemencie `<html>`
- Obserwuje zmiany klasy i synchronizuje z localStorage
- Zapobiega migotaniu (FOUC) przy ładowaniu strony

**Uwaga:** Obecnie w linii 12 jest hardcoded `class="dark"` - zostanie to usunięte.

## 2. Utworzenie komponentu ModeToggle

Nowy plik `src/components/shared/ModeToggle.tsx`:

- **Prosty przycisk** (bez dropdown) z ikoną Sun/Moon
- Kliknięcie przełącza bezpośrednio między light i dark
- Ikony Sun/Moon z `lucide-react` (już zainstalowane)
- State management dla aktualnego motywu (`"light" | "dark"`)
- useEffect do synchronizacji z DOM
- Wykorzystuje komponent: Button z `@/components/ui/`

**Implementacja:**

```tsx
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setTheme(isDarkMode ? "dark" : "light");
  }, []);

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList[isDark ? "add" : "remove"]("dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} data-test-id="theme-toggle-button">
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Przełącz motyw</span>
    </Button>
  );
}
```

## 3. Integracja ModeToggle w Header.tsx

Modyfikacja `src/components/layout/Header.tsx`:

- Import `ModeToggle` z `@/components/shared/ModeToggle`
- Umieszczenie w desktop menu (linia ~71) przed sekcją auth, w `<div className="flex gap-2">`
- Umieszczenie w mobile menu (linia ~128) w podobnej pozycji
- Dodanie `data-test-id` dla testów E2E

## Kluczowe pliki do modyfikacji

- `src/layouts/Layout.astro` - dodanie inline script
- `src/components/shared/ModeToggle.tsx` - nowy komponent (prosty przycisk toggle)
- `src/components/layout/Header.tsx` - integracja toggle

## Różnice względem pierwotnego planu

- **Usunięto dropdown menu** - nie ma trzech opcji (Light/Dark/System)
- **Prosty toggle** - jedno kliknięcie przełącza między light i dark
- **Brak zależności od dropdown-menu** - nie trzeba dodawać komponentu dropdown-menu z Shadcn
