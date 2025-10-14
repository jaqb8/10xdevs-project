# Plan implementacji widoku Analizy Tekstu

## 1. Przegląd

Widok Analizy Tekstu jest głównym narzędziem aplikacji, które umożliwia użytkownikom wprowadzanie tekstu w języku angielskim, analizowanie go pod kątem błędów gramatycznych za pomocą AI, przeglądanie wyników oraz zapisywanie zidentyfikowanych błędów na spersonalizowanej liście "Do nauki". Widok ten ma na celu wspieranie świadomego procesu uczenia się poprzez manualną interakcję z błędami.

## 2. Routing widoku

Widok będzie dostępny pod główną ścieżką aplikacji: `/`. Dostęp do tej ścieżki wymaga uwierzytelnienia. Użytkownicy, którzy nie są zalogowani, zostaną automatycznie przekierowani na stronę logowania `/login`.

## 3. Struktura komponentów

Hierarchia komponentów zostanie zaimplementowana w React i zintegrowana ze stroną Astro jako pojedynczy, interaktywny "island".

```
- src/pages/index.astro (Strona Astro)
  - src/layouts/Layout.astro (Główny layout)
    - src/components/views/AnalyzeView.tsx (Główny komponent React)
      - src/components/features/AnalysisForm.tsx (Formularz do wprowadzania tekstu)
        - components/ui/textarea (Komponent Textarea z shadcn/ui)
        - components/ui/button (Komponent Button z shadcn/ui)
      - src/components/features/AnalysisResult.tsx (Wyświetlanie wyników analizy)
        - components/ui/skeleton (Komponent Skeleton z shadcn/ui)
        - components/ui/card (Komponent Card z shadcn/ui)
        - src/components/shared/TextDiff.tsx (Komponent do wizualizacji różnic w tekście)
        - components/ui/button (Komponenty Button z shadcn/ui)
      - components/ui/toaster (Komponent do wyświetlania powiadomień toast)
```

## 4. Szczegóły komponentów

### `AnalyzeView.tsx`

- **Opis komponentu:** Główny komponent-kontener, który zarządza całym stanem i logiką widoku analizy. Integruje `AnalysisForm` i `AnalysisResult` oraz obsługuje komunikację z API za pomocą dedykowanego hooka `useTextAnalysis`.
- **Główne elementy:** Komponenty `AnalysisForm` i `AnalysisResult`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji, deleguje je do komponentów podrzędnych.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `AnalyzeViewState`.
- **Propsy:** Brak.

### `AnalysisForm.tsx`

- **Opis komponentu:** Formularz zawierający pole tekstowe do wprowadzania tekstu przez użytkownika, licznik znaków oraz przycisk do rozpoczęcia analizy.
- **Główne elementy:** `Textarea`, `Button`, element `p` dla licznika znaków.
- **Obsługiwane interakcje:** Wprowadzanie tekstu, kliknięcie przycisku "Analizuj tekst".
- **Obsługiwana walidacja:** Przycisk "Analizuj tekst" jest nieaktywny, gdy pole tekstowe jest puste, przekroczono limit 500 znaków lub trwa analiza.
- **Typy:** Brak.
- **Propsy:**
  ```typescript
  interface AnalysisFormProps {
    text: string;
    onTextChange: (text: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    maxLength: number;
  }
  ```

### `AnalysisResult.tsx`

- **Opis komponentu:** Komponent odpowiedzialny za wyświetlanie wyników analizy. Może pokazywać stan ładowania (`Skeleton`), komunikat o braku błędów, lub szczegółowy wynik z porównaniem tekstów i wyjaśnieniem.
- **Główne elementy:** `Card`, `Skeleton`, `TextDiff`, `Button`.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Dodaj do listy Do nauki", kliknięcie przycisku "Wyczyść".
- **Obsługiwana walidacja:** Przycisk "Dodaj do listy Do nauki" jest nieaktywny, jeśli wynik bieżącej analizy został już zapisany.
- **Typy:** `TextAnalysisDto`, `CreateLearningItemCommand`.
- **Propsy:**
  ```typescript
  interface AnalysisResultProps {
    isLoading: boolean;
    analysisResult: TextAnalysisDto | null;
    isSaved: boolean;
    onClear: () => void;
    onSave: (item: CreateLearningItemCommand) => void;
  }
  ```

### `TextDiff.tsx`

- **Opis komponentu:** Wyspecjalizowany komponent do renderowania wizualnych różnic między oryginalnym a poprawionym tekstem. Fragmenty dodane zostaną podświetlone na zielono, a usunięte na czerwono.
- **Główne elementy:** Elementy `div` i `span` z klasami Tailwind CSS.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:**
  ```typescript
  interface TextDiffProps {
    originalText: string;
    correctedText: string;
  }
  ```

## 5. Typy

Do implementacji widoku wykorzystane zostaną istniejące typy DTO. Dodatkowo, na potrzeby zarządzania stanem, zdefiniowane zostaną następujące typy `ViewModel`.

- **`AnalysisStatus`**: Typ wyliczeniowy określający aktualny stan interfejsu.

  ```typescript
  type AnalysisStatus = "idle" | "loading" | "success" | "error";
  ```

- **`AnalyzeViewState`**: Interfejs reprezentujący kompletny stan widoku.
  ```typescript
  interface AnalyzeViewState {
    status: AnalysisStatus; // Aktualny stan UI
    text: string; // Tekst wprowadzony przez użytkownika
    result: TextAnalysisDto | null; // Wynik analizy z API
    error: string | null; // Komunikat błędu dla użytkownika
    isCurrentResultSaved: boolean; // Flaga informująca, czy bieżący wynik został już zapisany
  }
  ```

## 6. Zarządzanie stanem

Cała logika i stan widoku zostaną zamknięte w niestandardowym hooku `useTextAnalysis`. Takie podejście pozwoli na oddzielenie logiki od prezentacji i uproszczenie komponentu `AnalyzeView`.

- **Hook `useTextAnalysis()`:**
  - **Cel:** Zarządzanie stanem `AnalyzeViewState`, obsługa wywołań API (analiza i zapis) oraz dostarczanie funkcji do interakcji z tym stanem.
  - **Zarządzany stan:** Obiekt `AnalyzeViewState`.
  - **Zwracane wartości:**
    - `state: AnalyzeViewState` - aktualny stan widoku.
    - `setText: (text: string) => void` - funkcja do aktualizacji tekstu w stanie.
    - `analyzeText: () => Promise<void>` - funkcja wywołująca API `/api/analyze`.
    - `saveResult: () => Promise<void>` - funkcja wywołująca API `/api/learning-items`.
    - `clear: () => void` - funkcja resetująca stan do wartości początkowych.

## 7. Integracja API

### 1. Analiza tekstu

- **Endpoint:** `POST /api/analyze`
- **Akcja:** Wywoływana przez funkcję `analyzeText` w hooku `useTextAnalysis`.
- **Typ żądania:** `AnalyzeTextCommand`
  ```json
  { "text": "I is a student." }
  ```
- **Typ odpowiedzi (sukces):** `TextAnalysisDto`
  ```json
  {
    "is_correct": false,
    "original_text": "I is a student.",
    "corrected_text": "I am a student.",
    "explanation": "Use 'am' with 'I'."
  }
  ```

### 2. Zapisywanie elementu do nauki

- **Endpoint:** `POST /api/learning-items`
- **Akcja:** Wywoływana przez funkcję `saveResult` w hooku `useTextAnalysis`.
- **Typ żądania:** `CreateLearningItemCommand`
  ```json
  {
    "original_sentence": "I is a student.",
    "corrected_sentence": "I am a student.",
    "explanation": "Use 'am' with 'I'."
  }
  ```
- **Typ odpowiedzi (sukces):** `LearningItemDto`

## 8. Interakcje użytkownika

- **Wprowadzanie tekstu:** Użytkownik wpisuje tekst w `Textarea`, co aktualizuje stan `text` i licznik znaków.
- **Kliknięcie "Analizuj tekst":** Wywołuje funkcję `analyzeText`. Stan `status` zmienia się na `'loading'`, formularz jest blokowany, a w miejscu wyników pojawia się `Skeleton`. Po otrzymaniu odpowiedzi od API, stan zmienia się na `'success'` lub `'error'`, a komponent `AnalysisResult` renderuje odpowiedni widok.
- **Kliknięcie "Dodaj do listy Do nauki":** Wywołuje funkcję `saveResult`. Przycisk staje się nieaktywny, a po pomyślnym zapisie wyświetlany jest `Toast` z potwierdzeniem.
- **Kliknięcie "Wyczyść":** Wywołuje funkcję `clear`, która resetuje cały stan widoku do wartości początkowych, czyszcząc formularz i wyniki.

## 9. Warunki i walidacja

- **Limit znaków:** `AnalysisForm` uniemożliwia wysłanie formularza, jeśli tekst jest pusty lub przekracza 500 znaków. Licznik znaków zmienia kolor na czerwony po przekroczeniu limitu, aby poinformować użytkownika.
- **Stan ładowania:** Wszystkie przyciski interaktywne (`Analizuj`, `Dodaj`, `Wyczyść`) są nieaktywne, gdy `status` jest ustawiony na `'loading'`.
- **Zapisany wynik:** Przycisk "Dodaj do listy Do nauki" jest nieaktywny, jeśli flaga `isCurrentResultSaved` ma wartość `true`.

## 10. Obsługa błędów

- **Błędy walidacji (400):** Jeśli API zwróci błąd 400, użytkownikowi zostanie wyświetlony odpowiedni komunikat (np. w `Toast`).
- **Brak autoryzacji (401):** Globalny wrapper `fetch` lub logika w hooku powinna przechwycić ten status i przekierować użytkownika na stronę `/login`.
- **Limit zapytań (429):** Użytkownik zobaczy komunikat inline na podstawie błędu zwróconego przez API: "Przekroczono limit zapytań. Spróbuj ponownie za chwilę.".
- **Błędy serwera (500) i błędy sieciowe:** Stan `status` zostanie ustawiony na `'error'`, a w interfejsie pojawi się ogólny komunikat, np. "Coś poszło nie tak. Spróbuj ponownie za chwilę.".

## 11. Kroki implementacji

1.  **Stworzenie struktury plików:** Utworzenie plików dla komponentów: `AnalyzeView.tsx`, `AnalysisForm.tsx`, `AnalysisResult.tsx`, `TextDiff.tsx` oraz pliku dla hooka `useTextAnalysis.ts`.
2.  **Implementacja `useTextAnalysis`:** Zaimplementowanie hooka z pełną logiką zarządzania stanem i obsługą wywołań do API (`fetch`).
3.  **Implementacja `TextDiff`:** Stworzenie komponentu do wizualizacji różnic w tekście. Można w tym celu użyć biblioteki `diff-match-patch` lub `jsdiff` do wygenerowania różnic, a następnie je wystylizować.
4.  **Implementacja `AnalysisForm`:** Zbudowanie formularza z użyciem komponentów `Textarea` i `Button` z biblioteki `shadcn/ui`. Podłączenie propsów do zarządzania stanem i zdarzeniami.
5.  **Implementacja `AnalysisResult`:** Zbudowanie widoku wyników, który warunkowo renderuje `Skeleton`, komunikat o sukcesie lub pełne wyniki analizy na podstawie propsów.
6.  **Implementacja `AnalyzeView`:** Połączenie wszystkich komponentów. Użycie hooka `useTextAnalysis` i przekazanie stanu oraz funkcji do komponentów podrzędnych.
7.  **Integracja w Astro:** Umieszczenie komponentu `<AnalyzeView client:load />` na stronie `src/pages/index.astro`.
8.  **Stylowanie:** Dopracowanie wyglądu za pomocą Tailwind CSS, aby był zgodny z makietą.
9.  **Dostępność:** Dodanie atrybutów `aria-*` (np. `aria-busy` dla stanu ładowania, `aria-live` dla wyników i błędów) w celu zapewnienia zgodności z WCAG.
10. **Testowanie:** Ręczne przetestowanie wszystkich ścieżek użytkownika, w tym obsługi błędów i przypadków brzegowych.
