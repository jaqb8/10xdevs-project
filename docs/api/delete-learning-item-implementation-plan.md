# API Endpoint Implementation Plan: DELETE /learning-items/:id

## 1. Przegląd endpointa

Ten endpoint umożliwia uwierzytelnionym użytkownikom usunięcie wybranego elementu nauki (`learning item`) na podstawie jego unikalnego identyfikatora. Użytkownik może usunąć wyłącznie zasoby, których jest właścicielem.

## 2. Szczegóły żądania

- **Metoda HTTP**: `DELETE`
- **Struktura URL**: `/api/learning-items/:id`
- **Parametry**:
  - **Wymagane**:
    - `id` (URL parameter, `uuid`): Unikalny identyfikator elementu nauki do usunięcia.
  - **Opcjonalne**: Brak.
- **Request Body**: Brak.

## 3. Wykorzystywane typy

- `LearningItem` z `src/types.ts`: Używany w warstwie serwisowej do weryfikacji `user_id`.

## 4. Szczegóły odpowiedzi

- **Odpowiedź sukcesu**:
  - **Kod**: `204 No Content`
  - **Ciało odpowiedzi**: Puste.
- **Odpowiedzi błędów**:
  - **Kod**: `400 Bad Request`
    - **Ciało odpowiedzi**: `{ "error": "Invalid learning item ID format" }`
  - **Kod**: `401 Unauthorized`
    - **Ciało odpowiedzi**: `{ "error": "Authentication required" }`
  - **Kod**: `403 Forbidden`
    - **Ciało odpowiedzi**: `{ "error": "You do not have permission to delete this item." }`
  - **Kod**: `404 Not Found`
    - **Ciało odpowiedzi**: `{ "error": "Learning item not found." }`
  - **Kod**: `500 Internal Server Error`
    - **Ciało odpowiedzi**: `{ "error": "An unexpected error occurred" }`

## 5. Przepływ danych

1.  Żądanie `DELETE` trafia do endpointa Astro w `src/pages/api/learning-items.ts`.
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje sesję użytkownika i udostępnia klienta Supabase oraz dane sesji w `context.locals`.
3.  Handler `DELETE` w pliku endpointa sprawdza istnienie aktywnej sesji użytkownika. Jeśli jej brak, zwraca `401 Unauthorized`.
4.  Handler wyodrębnia parametr `id` z adresu URL (`context.params.id`).
5.  Parametr `id` jest walidowany przy użyciu schemy Zod, która sprawdza, czy jest to poprawny UUID. W przypadku błędu walidacji zwraca `400 Bad Request`.
6.  Handler wywołuje metodę `deleteLearningItem` z serwisu `learningItemsService`, przekazując instancję klienta Supabase, zweryfikowany `id` oraz `user.id` z sesji.
7.  Metoda `deleteLearningItem` w serwisie wykonuje następujące kroki:
    a. Najpierw wyszukuje w bazie danych element o podanym `id` za pomocą zapytania `select()`.
    b. Jeśli element nie zostanie znaleziony, serwis zwraca wynik wskazujący na `404 Not Found`.
    c. Jeśli element zostanie znaleziony, serwis porównuje jego pole `user_id` z `userId` przekazanym jako argument.
    d. Jeśli `user_id` się nie zgadzają, serwis zwraca wynik wskazujący na `403 Forbidden`.
    e. Jeśli `user_id` się zgadzają, serwis wykonuje operację `delete()` w bazie Supabase, usuwając element o danym `id`.
8.  Handler w pliku endpointa odbiera wynik z serwisu i mapuje go na odpowiednią odpowiedź HTTP (`204`, `403`, `404`, lub `500`).

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Dostęp do zasobu jest chroniony przez middleware, który weryfikuje token JWT użytkownika i odrzuca żądania bez ważnej sesji.
- **Autoryzacja**: Logika w warstwie serwisowej ściśle weryfikuje, czy `user_id` zalogowanego użytkownika jest tożsamy z `user_id` przypisanym do usuwanego zasobu. Uniemożliwia to usunięcie danych przez nieuprawnionego użytkownika (ochrona przed atakiem IDOR).
- **Walidacja danych wejściowych**: Parametr `id` jest walidowany jako UUID, co zapobiega błędom bazy danych i potencjalnym atakom (np. SQL Injection, chociaż Supabase SDK jest na to odporne).

## 7. Etapy wdrożenia

1.  **Modyfikacja serwisu**: W pliku `src/lib/services/learning-items.service.ts` zaimplementować nową, asynchroniczną metodę `deleteLearningItem(id: string, userId: string)`.
    - Metoda powinna zawierać logikę pobrania elementu, weryfikacji właściciela oraz usunięcia.
    - Metoda powinna zwracać obiekt, który pozwoli na rozróżnienie wyników operacji (np. `{ success: true }`, `{ success: false, error: 'not_found' }`, `{ success: false, error: 'forbidden' }`).
2.  **Modyfikacja endpointa API**: W pliku `src/pages/api/learning-items.ts` dodać `export` dla metody `DELETE`.
3.  **Implementacja handlera `DELETE`**:
    - Sprawdzić, czy `context.locals.session` istnieje. Jeśli nie, zwrócić `401`.
    - Zwalidować `context.params.id` przy użyciu `z.string().uuid()`. Jeśli błąd, zwrócić `400`.
    - Wywołać zaimplementowaną metodę `learningItemsService.deleteLearningItem`.
    - Na podstawie zwróconego obiektu, skonstruować i zwrócić odpowiednią odpowiedź HTTP (`Response` z odpowiednim statusem).
4.  **Obsługa błędów**: Zaimplementować globalną obsługę błędów `try...catch` w handlerze na wypadek nieoczekiwanych problemów i zwrócić status `500`.
