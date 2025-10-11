# API Endpoint Implementation Plan: POST /api/analyze

## 1. Przegląd punktu końcowego

Ten punkt końcowy umożliwia użytkownikom przesyłanie tekstu do analizy gramatycznej przez model AI. Endpoint sprawdza poprawność gramatyczną, a w przypadku znalezienia błędów, zwraca poprawioną wersję tekstu wraz z wyjaśnieniem. Usługa wymaga uwierzytelnienia użytkownika.

## 2. Szczegóły żądania

- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/analyze`
- **Nagłówki**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "text": "I is a student. He go to school."
  }
  ```
- **Walidacja ciała żądania**:
  - `text`: Musi być typu `string`, nie może być pusty i nie może przekraczać 500 znaków.

## 3. Wykorzystywane typy

- **Command Model (Request)**: `AnalyzeTextCommand` z `src/types.ts`
- **DTO (Response)**: `TextAnalysisDto` z `src/types.ts`

## 4. Szczegóły odpowiedzi

- **Odpowiedź sukcesu (znaleziono błędy)**:
  - **Kod statusu**: `200 OK`
  - **Ciało odpowiedzi**:
    ```json
    {
      "is_correct": false,
      "original_text": "I is a student. He go to school.",
      "corrected_text": "I am a student. He goes to school.",
      "explanation": "Use 'am' with 'I'. Use 'goes' for third-person singular."
    }
    ```
- **Odpowiedź sukcesu (brak błędów)**:
  - **Kod statusu**: `200 OK`
  - **Ciało odpowiedzi**:
    ```json
    {
      "is_correct": true,
      "original_text": "I am a student."
    }
    ```
- **Odpowiedzi błędów**: Zobacz sekcję "Obsługa błędów".

## 5. Przepływ danych

1.  Klient wysyła żądanie `POST` na adres `/api/analyze` z tekstem do analizy.
2.  Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, weryfikuje token sesji użytkownika z Supabase. Jeśli użytkownik nie jest uwierzytelniony, zwraca błąd `401 Unauthorized`.
3.  Middleware odpowiedzialne za rate limiting sprawdza, czy użytkownik nie przekroczył dozwolonej liczby zapytań. Jeśli tak, zwraca błąd `429 Too Many Requests`.
4.  Handler endpointu w `src/pages/api/analyze.ts` otrzymuje żądanie.
5.  Dane wejściowe są walidowane przy użyciu schemy Zod. W przypadku błędu walidacji zwracany jest błąd `400 Bad Request`.
6.  Handler wywołuje metodę z serwisu `AnalysisService` (`src/lib/services/analysis.service.ts`), przekazując tekst do analizy.
7.  `AnalysisService` **zwraca zamockowaną odpowiedź**, symulującą odpowiedź z API OpenRouter.ai. Rzeczywiste zapytanie do API zostanie zaimplementowane w późniejszym etapie, kontrolowane przez zmienną środowiskową.
8.  Serwis zwraca przetworzone dane do handlera endpointu.
9.  Handler formatuje odpowiedź w strukturze `TextAnalysisDto` i odsyła ją do klienta z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnienie**: Endpoint będzie chroniony. Dostęp będzie możliwy tylko dla zalogowanych użytkowników. Middleware Astro zweryfikuje sesję na podstawie cookies i `context.locals.supabase`.
- **Autoryzacja**: Wszyscy uwierzytelnieni użytkownicy mają takie same uprawnienia do korzystania z tego endpointu.
- **Walidacja danych wejściowych**: Użycie Zod do ścisłej walidacji `text` (typ, długość, brak pustego ciągu) zapobiegnie nieoczekiwanym błędom i atakom. Limit 500 znaków chroni przed nadużyciem zasobów.
- **Rate Limiting**: Zostanie zaimplementowany mechanizm ograniczający liczbę żądań na użytkownika w jednostce czasu, aby zapobiec atakom DoS i kontrolować koszty API.
  - **Implementacja**: Dla celów MVP, zostanie zastosowane proste rozwiązanie w pamięci serwera (`in-memory`) wewnątrz middleware Astro (`src/middleware/index.ts`). Będzie ono wykorzystywać algorytm "sliding window" do śledzenia znaczników czasu żądań dla każdego ID użytkownika.
  - **Ograniczenia**: To podejście jest proste i wydajne, ale jego stan resetuje się przy każdym restarcie serwera i nie skaluje się horyzontalnie (w środowisku z wieloma instancjami). W przyszłości można je zastąpić rozwiązaniem opartym na zewnętrznej usłudze, np. Redis.
- **Zabezpieczenie przed Prompt Injection**: Prompt systemowy wysyłany do modelu AI zostanie starannie skonstruowany, aby instruować model, by ignorował wszelkie polecenia zawarte w tekście od użytkownika i skupił się wyłącznie na korekcie gramatycznej.
- **Zmienne środowiskowe**: Klucz API do OpenRouter.ai będzie przechowywany w bezpieczny sposób w zmiennych środowiskowych (`.env`) i nie będzie eksponowany po stronie klienta.

## 7. Obsługa błędów

- **`400 Bad Request`**: Zwracany, gdy walidacja schemą Zod nie powiedzie się.
  ```json
  { "error": "Text cannot exceed 500 characters." }
  ```
- **`401 Unauthorized`**: Zwracany przez middleware, gdy użytkownik nie jest zalogowany.
  ```json
  { "error": "Authentication required" }
  ```
- **`429 Too Many Requests`**: Zwracany przez middleware, gdy użytkownik przekroczy limit zapytań.
  ```json
  { "error": "You have exceeded the analysis limit. Please try again later." }
  ```
- **`500 Internal Server Error`**: Zwracany w przypadku problemów z komunikacją z API OpenRouter.ai lub innych nieoczekiwanych błędów serwera.
  ```json
  { "error": "An error occurred while analyzing the text." }
  ```

## 8. Rozważania dotyczące wydajności

- Głównym czynnikiem wpływającym na czas odpowiedzi będzie zewnętrzne wywołanie API do OpenRouter.ai. Czas odpowiedzi tego endpointu będzie bezpośrednio zależny od czasu odpowiedzi modelu AI. Zostanie zaimplementowany timeout dla wywołania API do OpenRouter.ai 60 sekund. **Na obecnym etapie, z użyciem mocków, czas odpowiedzi będzie natychmiastowy.**
- Limit 500 znaków na wejściu jest kluczowy dla utrzymania rozsądnych czasów odpowiedzi i kosztów.
- Dla MVP synchroniczny przepływ (żądanie -> oczekiwanie -> odpowiedź) jest akceptowalny. W przyszłości, w przypadku długich czasów przetwarzania, można rozważyć implementację z użyciem WebSockets lub odpytywania (polling) o status zadania.

## 9. Etapy wdrożenia

1.  **Konfiguracja Zod**: W `src/lib` lub obok endpointu, zdefiniować schemę Zod dla `AnalyzeTextCommand`.
2.  **Utworzenie serwisu**: Stworzyć plik `src/lib/services/analysis.service.ts`.
3.  **Utworzenie danych mockowych**: Stworzyć plik `src/lib/services/analysis.mocks.ts` zawierający przykładowe, zamockowane odpowiedzi dla różnych scenariuszy (np. tekst poprawny, tekst z błędami).
4.  **Implementacja logiki serwisu (z mockami)**: W `analysis.service.ts` zaimplementować funkcję, która:
    - Przyjmuje tekst jako argument.
    - W oparciu o zmienną środowiskową `USE_MOCKS`, zwraca odpowiednie dane z `analysis.mocks.ts`.
5.  **Utworzenie endpointu**: Stworzyć plik `src/pages/api/analyze.ts`.
6.  **Implementacja handlera**: W `analyze.ts` zaimplementować handler `POST`, który:
    - Sprawdza, czy `context.locals.user` istnieje.
    - Waliduje ciało żądania za pomocą Zod.
    - Wywołuje serwis `AnalysisService`.
    - Obsługuje błędy i zwraca odpowiednie kody statusu.
    - Formatuje i zwraca pomyślną odpowiedź.
7.  **Aktualizacja Middleware**: W `src/middleware/index.ts` dodać ścieżkę `/api/analyze` do chronionych tras, które wymagają uwierzytelnienia.
8.  **Implementacja Rate Limiting**: Dodać proste middleware (lub zintegrować z istniejącym) do obsługi ograniczania liczby zapytań.
