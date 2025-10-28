# Plan implementacji frontendu: Tryby analizy tekstu

Data: 28.10.2025

## 1. Cel

Celem jest zaimplementowanie interfejsu użytkownika dla nowej funkcjonalności trybów analizy tekstu, zgodnie z ogólnym planem wdrożenia. Użytkownik będzie mógł wybrać jeden z dostępnych trybów, a jego wybór zostanie zapamiętany i uwzględniony podczas wysyłania tekstu do analizy.

## 2. Architektura i komponenty

Implementacja zostanie oparta na istniejącej architekturze komponentowej w React. Zmiany obejmą modyfikację istniejących komponentów oraz dodanie nowych, reużywalnych elementów.

### 2.1. Nowe typy i stałe

W pliku `src/types.ts` zostanie zdefiniowany nowy typ `AnalysisMode`, który będzie reprezentował dostępne tryby analizy.

```typescript
export const ANALYSIS_MODES = {
  GRAMMAR_AND_SPELLING: "grammar_and_spelling",
  COLLOQUIAL_SPEECH: "colloquial_speech",
} as const;

export type AnalysisMode = (typeof ANALYSIS_MODES)[keyof typeof ANALYSIS_MODES];

export const ANALYSIS_MODE_LABELS: Record<AnalysisMode, string> = {
  [ANALYSIS_MODES.GRAMMAR_AND_SPELLING]: "Gramatyka i ortografia",
  [ANALYSIS_MODES.COLLOQUIAL_SPEECH]: "Mowa potoczna",
};

export const ANALYSIS_MODE_DESCRIPTIONS: Record<AnalysisMode, string> = {
  [ANALYSIS_MODES.GRAMMAR_AND_SPELLING]: "Sprawdzę Twój tekst pod kątem błędów gramatycznych i ortograficznych.",
  [ANALYSIS_MODES.COLLOQUIAL_SPEECH]: "Sprawdzę, czy Twój tekst brzmi naturalnie i jest napisany w potocznym stylu.",
};
```

### 2.2. Hook do zarządzania stanem (`useAnalysisMode`)

Aby oddzielić logikę zarządzania stanem od komponentu UI, zostanie stworzony custom hook `src/lib/hooks/useAnalysisMode.ts`.

**Odpowiedzialność:**

- Zarządzanie stanem wybranego trybu analizy.
- Synchronizacja stanu z `localStorage`, aby wybór użytkownika był trwały między sesjami.
- Zapewnienie wartości domyślnej (`grammar_and_spelling`), jeśli w `localStorage` nie ma zapisanego wyboru.
- Zwracanie aktualnie wybranego trybu oraz funkcji do jego zmiany.

### 2.3. Nowy komponent: `AnalysisModeSelector.tsx`

Zostanie stworzony nowy, reużywalny komponent `src/components/features/AnalysisModeSelector.tsx`.

**Odpowiedzialność:**

- Wyświetlanie dropdownu (komponent `Select` z `shadcn/ui`) z listą dostępnych trybów analizy.
- Użycie hooka `useAnalysisMode` do pobierania i aktualizacji stanu.
- Prezentacja etykiet trybów w sposób przyjazny dla użytkownika (np. "Gramatyka i ortografia" zamiast `grammar_and_spelling`).

### 2.4. Modyfikacja komponentu `AnalysisForm.tsx`

Istniejący komponent `src/components/features/AnalysisForm.tsx` zostanie zaktualizowany.

**Zmiany:**

- Zintegrowanie komponentu `AnalysisModeSelector.tsx` w formularzu, pod polem `Textarea`.
- Pobranie aktualnie wybranego trybu analizy (prawdopodobnie przez hook `useAnalysisMode` bezpośrednio w tym komponencie, aby przekazać go do logiki wysyłania formularza).
- Przekazanie wartości `mode` w ciele żądania do endpointu API `/api/analyze` podczas analizy tekstu.
- Dynamiczna zmiana podtytułu pod głównym nagłówkiem na podstawie wybranego trybu analizy.

### 2.5. Modyfikacja DTO i klienta API

- **Typ DTO:** Typ `AnalyzeTextRequestDto` w `src/types.ts` zostanie zaktualizowany o pole `mode: AnalysisMode`.
- **Klient API:** Funkcja odpowiedzialna za wysyłanie żądania analizy tekstu (prawdopodobnie w `src/lib/clients/analysis/analysis.client.ts`) zostanie zaktualizowana, aby przyjmować i przesyłać nowy parametr `mode`.

## 3. Plan implementacji krok po kroku

1.  **Krok 1: Definicja typów** - Zdefiniowanie typu `AnalysisMode` i stałych w `src/types.ts`.
2.  **Krok 2: Implementacja hooka `useAnalysisMode`** - Stworzenie hooka do zarządzania stanem i synchronizacji z `localStorage`.
3.  **Krok 3: Stworzenie komponentu `AnalysisModeSelector`** - Implementacja komponentu UI z użyciem `Select` z `shadcn/ui` i hooka `useAnalysisMode`.
4.  **Krok 4: Aktualizacja DTO i klienta API** - Rozszerzenie `AnalyzeTextRequestDto` oraz funkcji klienta API o pole `mode`.
5.  **Krok 5: Integracja z `AnalysisForm`** - Dodanie `AnalysisModeSelector` do formularza analizy i przekazanie wybranego trybu do wywołania API.
