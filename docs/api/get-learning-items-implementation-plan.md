# API Endpoint Implementation Plan: GET /learning-items

## 1. Przegląd endpointu

Ten endpoint umożliwia uwierzytelnionym użytkownikom pobieranie spaginowanej listy ich osobistych "learning items". Dane są sortowane chronologicznie od najnowszych do najstarszych, co pozwala na przeglądanie historii zapisanych błędów gramatycznych.

## 2. Szczegóły żądania

- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/learning-items`
- **Parametry zapytania (Query Parameters)**:
  - **Wymagane**: Brak
  - **Opcjonalne**:
    - `page` (integer): Numer strony. Domyślnie: `1`. Musi być liczbą całkowitą większą od 0.
    - `pageSize` (integer): Liczba elementów na stronie. Domyślnie: `20`. Musi być liczbą całkowitą w zakresie od 1 do 100.
- **Request Body**: Brak

## 3. Wykorzystywane typy

Do implementacji tego endpointu konieczne będzie zdefiniowanie generycznych typów DTO dla paginacji w pliku `src/types.ts` oraz wykorzystanie istniejącego `LearningItemDto`.

```typescript:src/types.ts
// ... existing code ...
export type LearningItemDto = Pick<
  LearningItem,
  "id" | "original_sentence" | "corrected_sentence" | "explanation" | "created_at"
>;

/**
 * DTO for pagination metadata.
 */
export interface PaginationDto {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Generic DTO for a paginated API response.
 * @template T The type of the items in the data array.
 */
export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationDto;
}

/**
 * DTO for the response of a text analysis request.
// ... existing code ...
```

## 4. Szczegóły odpowiedzi

- **Odpowiedź sukcesu (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "original_sentence": "He don't like apples.",
        "corrected_sentence": "He doesn't like apples.",
        "explanation": "Use 'doesn't' for third-person singular.",
        "created_at": "2025-10-26T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`:
    ```json
    { "error": "Invalid query parameters", "details": "[...zod error details...]" }
    ```
  - `401 Unauthorized`:
    ```json
    { "error": "Authentication required" }
    ```
  - `500 Internal Server Error`:
    ```json
    { "error": "An internal server error occurred" }
    ```

## 5. Przepływ danych

1. Klient wysyła żądanie `GET` na adres `/api/learning-items` z opcjonalnymi parametrami `page` i `pageSize`.
2. Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie i wstrzykuje klienta Supabase do `context.locals`.
3. Żądanie trafia do handlera API w `src/pages/api/learning-items.ts`.
4. Handler API waliduje parametry `page` i `pageSize` przy użyciu schematu Zod. W przypadku błędu walidacji zwraca `400 Bad Request`.
5. Handler wywołuje funkcję `getLearningItems` z serwisu `src/lib/services/learning-items.service.ts`, przekazując klienta Supabase, `userId` (MVP: `DEFAULT_USER_ID`), `page` i `pageSize`.
6. Funkcja serwisowa `getLearningItems` wykonuje **dwa zapytania** do bazy danych Supabase:
   - **Pierwsze zapytanie**: Używa `head: true` do pobrania tylko licznika (`count`) bez pobierania danych. To lekkie zapytanie zwraca całkowitą liczbę rekordów użytkownika.
   - **Walidacja offsetu**: Jeśli `totalItems === 0` lub `offset >= totalItems`, funkcja natychmiast zwraca pustą odpowiedź z metadanymi paginacji, unikając niepotrzebnego drugiego zapytania.
   - **Drugie zapytanie**: Jeśli dane istnieją i offset jest prawidłowy, wykonywane jest zapytanie `.range()` do pobrania konkretnej strony danych, posortowanej według `created_at DESC`.
7. Serwis oblicza metadane paginacji (`totalPages`) na podstawie całkowitej liczby rekordów i transformuje wyniki do formatu `LearningItemDto`.
8. Serwis zwraca obiekt `PaginatedResponseDto<LearningItemDto>` do handlera API.
9. Handler API serializuje obiekt do formatu JSON i wysyła odpowiedź `200 OK`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Dostęp do endpointu jest bezwzględnie ograniczony do uwierzytelnionych użytkowników. Middleware Astro jest odpowiedzialne za weryfikację sesji.
- **Autoryzacja**: Logika w serwisie musi gwarantować, że zapytania do bazy danych `learning_items` są filtrowane przez `user_id` pobrany z aktywnej sesji. Zapobiega to dostępowi jednego użytkownika do danych innego.
- **Walidacja danych wejściowych**: Parametry `page` i `pageSize` są walidowane, aby zapobiec niepoprawnym zapytaniom. Wprowadzony jest również maksymalny limit dla `pageSize` (np. 100), aby chronić bazę danych przed nadmiernym obciążeniem.

## 7. Rozważania dotyczące wydajności

- **Indeksowanie bazy danych**: Aby zapewnić szybkie wykonywanie zapytań, kolumny `user_id` i `created_at` w tabeli `learning_items` są zindeksowane. Kompozytowy indeks `idx_learning_items_user_created` na `(user_id, created_at DESC)` optymalizuje główny wzorzec zapytań (filtrowanie po user_id + sortowanie po created_at).
- **Paginacja**: Stosowanie paginacji po stronie serwera jest kluczowe dla wydajności, ponieważ zapobiega przesyłaniu dużych ilości danych i nadmiernemu obciążeniu zarówno serwera, jak i klienta.
- **Liczba zapytań**: Implementacja wykonuje **dwa zapytania** do bazy danych:
  1. Lekkie zapytanie `HEAD` tylko po `count` (bez pobierania danych)
  2. Zapytanie po dane tylko gdy są dostępne rekordy i offset jest prawidłowy

  Pierwsze zapytanie z `head: true` jest bardzo szybkie, ponieważ nie przenosi żadnych danych - tylko metadane z licznikiem. Drugie zapytanie jest pomijane gdy tabela jest pusta lub strona wykracza poza zakres, co oszczędza zasoby w edge cases.

## 8. Etapy wdrożenia

1.  **Aktualizacja typów**: Dodać definicje `PaginationDto` i generycznego `PaginatedResponseDto<T>` do pliku `src/types.ts`.
2.  **Utworzenie serwisu**: Stworzyć nowy plik `src/lib/services/learning-items.service.ts`.
3.  **Implementacja logiki serwisu**: W `learning-items.service.ts` zaimplementować funkcję `getLearningItems(userId: string, page: number, pageSize: number): Promise<PaginatedResponseDto<LearningItemDto>>`. Funkcja ta będzie zawierać logikę zapytań do Supabase, obliczenia paginacji i mapowanie danych.
4.  **Utworzenie pliku API**: Stworzyć plik `src/pages/api/learning-items.ts`.
5.  **Walidacja Zod**: W pliku API zdefiniować schemat Zod do walidacji parametrów `page` i `pageSize`.
6.  **Implementacja handlera GET**: W pliku API zaimplementować handler `GET`, który:
    - Pobiera sesję użytkownika z `context.locals`.
    - Parsuje i waliduje parametry zapytania przy użyciu Zod.
    - Wywołuje funkcję serwisową `getLearningItems`.
    - Obsługuje potencjalne błędy i zwraca odpowiednie odpowiedzi HTTP.
