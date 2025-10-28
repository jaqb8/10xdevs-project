# Plan implementacji backendu: Tryby analizy tekstu

Data: 28.10.2025

## 1. Cel

Celem jest wdrożenie logiki po stronie serwera dla funkcjonalności trybów analizy tekstu, zgodnie z dokumentem [Wstępny plan implementacji](docs/v1.2.0/analysis-mode-high-level-plan.md). Plan obejmuje modyfikację istniejących endpointów API, aktualizację typów danych oraz integrację nowego promptu dla modelu AI.

## 2. Przegląd zadań

1.  **Migracja bazy danych**: Potwierdzenie i zastosowanie migracji dodającej kolumnę `analysis_mode` do tabeli `learning_items`.
2.  **Aktualizacja typów TypeScript**: Rozszerzenie istniejących typów i DTOs o pole `analysis_mode`.
3.  **Utworzenie nowego promptu AI**: Stworzenie pliku z promptem dla trybu "Mowa potoczna".
4.  **Modyfikacja serwisu AI**: Rozbudowa serwisu `OpenRouterService` o logikę dynamicznego wyboru promptu.
5.  **Aktualizacja endpointu `POST /api/analyze`**: Dostosowanie walidacji i logiki endpointu do przyjmowania nowego parametru `mode`.
6.  **Aktualizacja endpointu `POST /api/learning-items`**: Umożliwienie zapisywania `analysis_mode` wraz z nowym elementem do nauki.
7.  **Testowanie**: Przygotowanie i aktualizacja testów jednostkowych oraz integracyjnych.

## 3. Szczegółowy plan implementacji

### Krok 1: Migracja Bazy Danych

- **Plik migracji**: `supabase/migrations/20251028000000_add_analysis_mode_to_learning_items.sql`
- **Akcja**: Upewnij się, że migracja została uruchomiona w lokalnym środowisku Supabase. Zawartość pliku jest zgodna z planem – dodaje kolumnę `analysis_mode` z ograniczeniem `CHECK` i wartością domyślną.

  ```sql
  ALTER TABLE public.learning_items
  ADD COLUMN analysis_mode TEXT NOT NULL DEFAULT 'grammar_and_spelling';

  ALTER TABLE public.learning_items
  ADD CONSTRAINT check_analysis_mode
  CHECK (analysis_mode IN ('grammar_and_spelling', 'colloquial_speech'));
  ```

### Krok 2: Aktualizacja typów TypeScript

- **Plik**: `src/types.ts`
- **Akcje**:
  1.  Zdefiniuj nowy typ `AnalysisMode`, aby zapewnić spójność i uniknąć literówek.
  2.  Zaktualizuj interfejs `LearningItem` o nowe pole `analysis_mode`.
  3.  Zaktualizuj DTO (Data Transfer Object) `CreateLearningItemDto` używany w API.

  ```typescript:src/types.ts
  // ... existing code ...
  export type AnalysisMode = 'grammar_and_spelling' | 'colloquial_speech';

  export interface LearningItem {
    id: string;
    user_id: string;
    original_sentence: string;
    corrected_sentence: string;
    explanation: string;
    analysis_mode: AnalysisMode;
    created_at: string;
  }

  export interface CreateLearningItemDto extends Omit<LearningItem, 'id' | 'user_id' | 'created_at'> {}

  export interface AnalyzeTextDto {
    text: string;
    mode: AnalysisMode;
  }
  // ...
  ```

### Krok 3: Utworzenie nowego promptu AI

- **Nowy plik**: `src/lib/prompts/colloquial-speech.prompt.md`
- **Akcja**: Stwórz nowy plik z promptem systemowym. Prompt musi instruować model, aby analizował tekst pod kątem naturalności i stylu, a jednocześnie **bezwzględnie** trzymał się istniejącej struktury odpowiedzi JSON.

- **Przykładowa treść**:

  ```markdown
  Jesteś ekspertem od potocznego języka angielskiego. Twoim zadaniem jest analiza podanego tekstu pod kątem jego naturalności i stylu.

  Twoja odpowiedź MUSI być w formacie JSON i zawierać następujące pola:

  - `is_correct`: boolean
  - `corrected_text`: string (jeśli `is_correct: false`)
  - `explanation`: string (jeśli `is_correct: false`)

  Jeśli tekst jest poprawny gramatycznie, ale brzmi nienaturalnie lub "sztywno", zwróć `is_correct: false`. W `corrected_text` podaj wersję, która brzmi bardziej naturalnie. W `explanation` krótko wyjaśnij, dlaczego Twoja propozycja jest lepsza stylistycznie.
  ```

### Krok 4: Modyfikacja serwisu AI

- **Plik**: `src/lib/services/openrouter/openrouter.service.ts`
- **Akcje**:
  1.  Zmodyfikuj metodę odpowiedzialną za analizę tekstu (np. `analyseGrammar`), aby przyjmowała `mode` jako drugi argument.
  2.  Zaimplementuj logikę, która na podstawie `mode` wczytuje zawartość odpowiedniego pliku z promptem (`grammar-analysis.prompt.md` lub `colloquial-speech.prompt.md`).
  3.  Przekaż wybrany prompt jako `system_prompt` do modelu AI.

### Krok 5: Aktualizacja endpointu analizy

- **Plik**: `src/pages/api/analyze.ts`
- **Akcje**:
  1.  Zaktualizuj schemat walidacji (np. Zod), aby wymagał pola `mode` i sprawdzał, czy jego wartość jest jedną z dozwolonych w typie `AnalysisMode`.
  2.  W ciele funkcji obsługującej request, przekaż `mode` z ciała żądania do zmodyfikowanej metody serwisu AI.

### Krok 6: Aktualizacja endpointu `learning-items`

- **Plik**: `src/pages/api/learning-items.ts`
- **Akcje**:
  1.  W handlerze `POST`, zaktualizuj schemat walidacji, aby przyjmował opcjonalne pole `analysis_mode`. Wartość domyślna po stronie bazy danych (`grammar_and_spelling`) obsłuży przypadki, gdyby pole nie zostało dostarczone.
  2.  Podczas zapisu do bazy danych, przekaż `analysis_mode` z ciała żądania.
  3.  Upewnij się, że handler `GET` zwraca obiekty `LearningItem` z nowym polem (powinno to zadziałać automatycznie po aktualizacji typów i odpytaniu bazy).

## 4. Testowanie

- **Testy jednostkowe**:
  - Zaktualizuj testy dla `OpenRouterService`, aby sprawdzały, czy w zależności od parametru `mode` wybierany jest prawidłowy prompt systemowy.
- **Testy integracyjne/API**:
  - Zaktualizuj istniejące testy dla `POST /api/analyze`, dodając do payloadu pole `mode`.
  - Dodaj nowe testy sprawdzające działanie endpointu z `mode: 'colloquial_speech'`.
  - Dodaj testy dla `POST /api/learning-items` weryfikujące, że pole `analysis_mode` jest poprawnie zapisywane w bazie danych.
  - Zaktualizuj testy dla `GET /api/learning-items`, aby sprawdzały obecność i poprawność pola `analysis_mode` w odpowiedzi.

## 5. Nowe zależności

Brak nowych zależności.
