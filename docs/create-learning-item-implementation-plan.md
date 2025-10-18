# API Endpoint Implementation Plan: POST /learning-items

## 1. Przegląd endpointu

Ten endpoint umożliwia uwierzytelnionemu użytkownikowi dodanie nowego elementu nauki do jego osobistej listy. Każdy element reprezentuje konkretny błąd gramatyczny, składający się ze zdania oryginalnego, jego poprawionej wersji oraz krótkiego wyjaśnienia. Pomyślne utworzenie zasobu zwraca pełny obiekt nowo utworzonego elementu.

## 2. Szczegóły żądania

- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/learning-items`
- **Request Body**: Ciało żądania musi zawierać obiekt JSON o następującej strukturze:

  ```json
  {
    "original_sentence": "She have two cats.",
    "corrected_sentence": "She has two cats.",
    "explanation": "Use 'has' for the third-person singular present tense."
  }
  ```

- **Parametry**:
  - **Wymagane**:
    - `original_sentence` (string): Zdanie zawierające błąd.
    - `corrected_sentence` (string): Poprawiona wersja zdania.
    - `explanation` (string, max 500 znaków): Krótkie wyjaśnienie błędu.
  - **Opcjonalne**: Brak.

## 3. Wykorzystywane typy

- **Command Model (Request)**: `CreateLearningItemCommand` z `src/types.ts`
- **Entity (Database/Response)**: `LearningItem` z `src/types.ts`

## 4. Szczegóły odpowiedzi

- **Odpowiedź sukcesu**:
  - **Kod statusu**: `201 Created`
  - **Struktura (Payload)**: Obiekt JSON reprezentujący nowo utworzony element nauki.

  ```json
  {
    "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
    "user_id": "f1g2h3i4-j5k6-7890-1234-567890abcdef",
    "original_sentence": "She have two cats.",
    "corrected_sentence": "She has two cats.",
    "explanation": "Use 'has' for the third-person singular present tense.",
    "created_at": "2025-10-26T10:05:00Z"
  }
  ```

- **Odpowiedzi błędu**:
  - `400 Bad Request`: Nieprawidłowe dane wejściowe.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych

1.  Użytkownik wysyła żądanie `POST` na adres `/api/learning-items` z wymaganymi danymi w ciele żądania.
2.  Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie i inicjalizuje klienta Supabase w `Astro.locals`.
3.  Handler `POST` w `src/pages/api/learning-items.ts` zostaje wywołany.
4.  Handler sprawdza istnienie aktywnej sesji użytkownika, pobierając ją z `Astro.locals.supabase.auth.getSession()`. Jeśli sesja nie istnieje, zwraca odpowiedź `401 Unauthorized`.
5.  Ciało żądania jest parsowane i walidowane przy użyciu schematu Zod, który weryfikuje obecność, typy i ograniczenia (np. długość `explanation`). W przypadku błędu walidacji, zwracana jest odpowiedź `400 Bad Request` ze szczegółami.
6.  Handler wywołuje funkcję `createLearningItem` z serwisu `src/lib/services/learning-items.service.ts`, przekazując jej zweryfikowane dane oraz `user.id` z obiektu sesji.
7.  Funkcja `createLearningItem` w serwisie wykonuje operację `INSERT` na tabeli `learning_items` w bazie danych Supabase, używając wstrzykniętego klienta.
8.  W przypadku błędu operacji na bazie danych, serwis zgłasza błąd, który jest przechwytywany przez handler i zwracany jako `500 Internal Server Error`.
9.  Po pomyślnym zapisie, baza danych zwraca nowo utworzony rekord.
10. Serwis zwraca ten rekord do handlera API.
11. Handler formatuje odpowiedź i wysyła ją do klienta z kodem statusu `201 Created`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Endpoint musi być chroniony. Dostęp do niego jest możliwy wyłącznie dla zalogowanych użytkowników. Mechanizm sesji Supabase, zarządzany przez middleware, zapewni weryfikację tożsamości.
- **Autoryzacja**: Identyfikator użytkownika (`user_id`) do zapisu w bazie danych musi być pobierany **wyłącznie** z obiektu sesji po stronie serwera. Nie wolno go przyjmować z ciała żądania, aby uniemożliwić jednemu użytkownikowi tworzenie zasobów w imieniu innego.
- **Walidacja danych**: Wszystkie dane wejściowe muszą być rygorystycznie walidowane przy użyciu Zod, aby zapewnić ich poprawność i zgodność z modelem danych, a także aby chronić przed potencjalnymi atakami (np. przez ograniczenie długości pól).

## 7. Obsługa błędów

- **Kod statusu `400 Bad Request`**
  - **Warunek**: Błąd walidacji danych wejściowych (np. brakujące pole, za długi tekst).
  - **Ciało odpowiedzi (przykład)**:
    ```json
    {
      "error": "Invalid input",
      "details": {
        "explanation": ["String must contain at most 500 character(s)"]
      }
    }
    ```

- **Kod statusu `401 Unauthorized`**
  - **Warunek**: Brak aktywnej sesji użytkownika (próba dostępu bez zalogowania).
  - **Ciało odpowiedzi (przykład)**:
    ```json
    { "error": "Authentication required" }
    ```

- **Kod statusu `500 Internal Server Error`**
  - **Warunek**: Błąd serwera (np. problem z połączeniem z bazą danych, błąd zapytania).
  - **Ciało odpowiedzi (przykład)**:
    ```json
    { "error": "Internal Server Error" }
    ```

## 8. Rozważania dotyczące wydajności

Operacja `INSERT` na tabeli `learning_items` jest operacją o niskiej złożoności i nie powinna stanowić wąskiego gardła wydajnościowego. Klucz obcy `user_id` powinien mieć założony indeks (co jest standardem dla kluczy obcych w PostgreSQL), co zapewni wysoką wydajność przyszłych zapytań odczytujących dane dla konkretnego użytkownika.

## 9. Etapy wdrożenia

1.  **Aktualizacja serwisu `learning-items`**:
    - W pliku `src/lib/services/learning-items.service.ts` dodaj nową, asynchroniczną funkcję `createLearningItem`.
    - Funkcja powinna przyjmować dwa argumenty: `itemData: CreateLearningItemCommand` i `userId: string`.
    - Wewnątrz funkcji, użyj klienta Supabase do wykonania zapytania `insert` na tabeli `learning_items`, przekazując dane `itemData` oraz `user_id: userId`.
    - Funkcja powinna obsługiwać potencjalne błędy z bazy danych i zwracać nowo utworzony obiekt `LearningItem` w przypadku sukcesu.

2.  **Implementacja endpointu i walidacji**:
    - W pliku `src/pages/api/learning-items.ts`:
      - Zdefiniuj schemat walidacji Zod `CreateLearningItemSchema` na górze pliku. Schemat powinien walidować obiekt `CreateLearningItemCommand` zgodnie z wymaganiami (wszystkie pola wymagane, `explanation` o maksymalnej długości 500 znaków).
      - Dodaj `export const prerender = false;`.
      - Zaimplementuj handler `POST({ request, locals }: APIContext)`.
      - W handlerze:
        - Pobierz sesję użytkownika z `locals.supabase.auth`. Jeśli brak, zwróć `401`.
        - Pobierz ciało żądania za pomocą `request.json()`.
        - Zwaliduj ciało żądania używając `CreateLearningItemSchema.safeParse()`. W przypadku błędu zwróć `400` ze szczegółami.
        - Wywołaj `learningItemsService.createLearningItem`, przekazując zwalidowane dane oraz ID użytkownika z sesji.
        - Obsłuż ewentualny błąd z serwisu, zwracając `500`.
        - W przypadku sukcesu, zwróć odpowiedź JSON z nowo utworzonym obiektem i kodem statusu `201`.
