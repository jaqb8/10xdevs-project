# Plan implementacji widoku Learning Items

## 1. Przegląd

Widok "Learning Items" (`/learning-list`) jest dedykowaną sekcją aplikacji, która umożliwia zalogowanym użytkownikom przeglądanie i usuwanie zapisanych przez siebie elementów do nauki (błędów językowych). Widok prezentuje listę elementów w porządku chronologicznym, obsługuje paginację dla dużej liczby pozycji oraz zapewnia bezpieczny i intuicyjny proces usuwania elementów z listy, włączając w to krok potwierdzenia.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:

- **Ścieżka:** `/learning-list`

Strona zostanie zaimplementowana jako plik `src/pages/learning-list.astro`, który będzie renderował główny komponent React (`LearningItemsView`) z dyrektywą `client:load`.

## 3. Struktura komponentów

Hierarchia komponentów dla tego widoku będzie zorganizowana w celu oddzielenia logiki zarządzania stanem od prezentacji UI.

```
- src/pages/learning-list.astro
  - <Layout>
    - <LearningItemsView client:load>
      - if (isLoading) <LoadingSkeleton />
      - if (error) <ErrorMessage />
      - if (data)
        - <LearningItemsList>
          - if (items.length > 0)
            - <LearningItemCard /> (mapowany po liście)
              - <Button "Usuń">
          - else
            - <EmptyState />
        - <PaginationControls />
      - <DeleteConfirmationDialog /> (renderowany warunkowo)
```

## 4. Szczegóły komponentów

### `LearningItemsView` (Komponent kontenerowy)

- **Opis komponentu:** Główny komponent widoku, odpowiedzialny za orkiestrację wszystkich podkomponentów. Wykorzystuje customowy hook `useLearningItems` do pobierania danych, zarządzania stanem (ładowanie, błędy, paginacja, stan usuwania) i obsługi logiki biznesowej.
- **Główne elementy:** Renderuje warunkowo `LoadingSkeleton`, `ErrorMessage`, `LearningItemsList` oraz `DeleteConfirmationDialog` w zależności od aktualnego stanu.
- **Obsługiwane interakcje:**
  - Przekazuje funkcje do obsługi zmiany strony do `PaginationControls`.
  - Przekazuje funkcję do inicjowania procesu usuwania do `LearningItemsList`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `PaginatedResponseDto<LearningItemDto>`, `LearningItemViewModel`, `PaginationViewModel`.
- **Propsy:** Brak.

### `LearningItemsList`

- **Opis komponentu:** Komponent prezentacyjny, który renderuje listę `LearningItemCard` lub komponent `EmptyState`, jeśli lista jest pusta.
- **Główne elementy:** Kontener `div`, który mapuje tablicę `items` i renderuje komponent `LearningItemCard` dla każdego elementu.
- **Obsługiwane interakcje:** Przekazuje zdarzenie `onDeleteItem` z `LearningItemCard` do komponentu nadrzędnego.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `LearningItemViewModel[]`.
- **Propsy:**
  - `items: LearningItemViewModel[]`
  - `onDeleteItem: (id: string) => void`

### `LearningItemCard`

- **Opis komponentu:** Wyświetla pojedynczy element do nauki w formie karty (Shadcn `Card`). Prezentuje zdanie oryginalne, poprawione, wyjaśnienie i datę utworzenia. Zawiera przycisk "Usuń".
- **Główne elementy:** `Card`, `CardHeader`, `CardContent`, `CardFooter`, `TextDiff` (do wizualnego porównania zdań), `Button` (do usunięcia).
- **Obsługiwane interakcje:** Kliknięcie przycisku "Usuń" wywołuje `onDelete` z ID elementu.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `LearningItemViewModel`.
- **Propsy:**
  - `item: LearningItemViewModel`
  - `onDelete: (id: string) => void`

### `DeleteConfirmationDialog`

- **Opis komponentu:** Modalne okno dialogowe (Shadcn `AlertDialog`) wyświetlane w celu uzyskania od użytkownika potwierdzenia usunięcia elementu.
- **Główne elementy:** `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
- **Obsługiwane interakcje:**
  - Kliknięcie "Anuluj" zamyka okno.
  - Kliknięcie "Potwierdź" wywołuje funkcję `onConfirm`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:**
  - `isOpen: boolean`
  - `isPending: boolean`
  - `onCancel: () => void`
  - `onConfirm: () => void`

### `PaginationControls`

- **Opis komponentu:** Renderuje przyciski "Poprzednia" i "Następna" do nawigacji między stronami listy.
- **Główne elementy:** Kontener `div` z dwoma komponentami `Button`.
- **Obsługiwane interakcje:** Kliknięcie przycisków wywołuje `onPageChange` z numerem nowej strony.
- **Obsługiwana walidacja:** Przyciski są wyłączane (`disabled`), gdy dana akcja jest niemożliwa (np. "Poprzednia" na pierwszej stronie).
- **Typy:** `PaginationViewModel`.
- **Propsy:**
  - `pagination: PaginationViewModel`
  - `onPageChange: (page: number) => void`

## 5. Typy

Do implementacji widoku potrzebne będą istniejące typy DTO oraz nowe typy ViewModel, które lepiej dostosują dane do potrzeb UI.

- **`LearningItemDto` (istniejący):** Obiekt transferu danych z API.

  ```typescript
  export type LearningItemDto = {
    id: string;
    original_sentence: string;
    corrected_sentence: string;
    explanation: string;
    created_at: string;
  };
  ```

- **`PaginationDto` (istniejący):** Obiekt metadanych paginacji z API.

  ```typescript
  export interface PaginationDto {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }
  ```

- **`LearningItemViewModel` (nowy):** Rozszerza `LearningItemDto` o sformatowaną datę do wyświetlania w UI.

  ```typescript
  export interface LearningItemViewModel extends LearningItemDto {
    formatted_created_at: string; // np. "26 października 2025"
  }
  ```

- **`PaginationViewModel` (nowy):** Rozszerza `PaginationDto` o flagi stanu UI dla przycisków paginacji.
  ```typescript
  export interface PaginationViewModel extends PaginationDto {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
  ```

## 6. Zarządzanie stanem

Cała logika stanu zostanie zamknięta w customowym hooku `useLearningItems`, aby zapewnić czystość i reużywalność.

- **`useLearningItems()` hook:**
  - **Zarządzany stan:**
    - `data: PaginatedResponseDto<LearningItemDto> | null` - dane z API.
    - `isLoading: boolean` - stan ładowania listy.
    - `error: string | null` - komunikat błędu.
    - `page: number` - aktualny numer strony.
    - `itemToDelete: LearningItemDto | null` - element wybrany do usunięcia, kontroluje widoczność modala.
    - `isDeleting: boolean` - stan ładowania podczas operacji usuwania.
  - **Udostępniane wartości i funkcje:**
    - `viewModels: LearningItemViewModel[]` - zmapowane dane gotowe do renderowania.
    - `paginationViewModel: PaginationViewModel | null` - zmapowane dane paginacji.
    - `isLoading`, `error`, `isDeleting`, `isDeleteDialogOpen`.
    - `setPage: (page: number) => void` - funkcja do zmiany strony.
    - `deleteItem: (item: LearningItemDto) => void` - inicjuje proces usuwania.
    - `confirmDelete: () => void` - potwierdza i wykonuje usunięcie.
    - `cancelDelete: () => void` - anuluje proces usuwania.

## 7. Integracja API

Integracja z API będzie realizowana przez hook `useLearningItems` za pomocą `fetch` API.

- **`GET /api/learning-items`**
  - **Typ żądania:** `GET`
  - **Parametry zapytania:** `page` (number), `pageSize` (number). W ramach MVP, `pageSize` będzie miało stałą, zahardkodowaną wartość `10`, aby uniknąć dodatkowej komplikacji w UI.
  - **Typ odpowiedzi ( sukces):** `PaginatedResponseDto<LearningItemDto>`
  - **Wywołanie:** Przy montowaniu komponentu oraz przy każdej zmianie stanu `page`.

- **`DELETE /api/learning-items/:id`**
  - **Typ żądania:** `DELETE`
  - **Parametry URL:** `id` (string) - identyfikator elementu do usunięcia.
  - **Typ odpowiedzi (sukces):** `204 No Content`
  - **Wywołanie:** Po potwierdzeniu usunięcia w `DeleteConfirmationDialog`.

## 8. Interakcje użytkownika

- **Przeglądanie stron:** Użytkownik klika przyciski "Następna" lub "Poprzednia" w `PaginationControls`, co wywołuje `setPage` i ponowne pobranie danych.
- **Inicjowanie usunięcia:** Użytkownik klika przycisk "Usuń" na `LearningItemCard`, co powoduje wyświetlenie `DeleteConfirmationDialog`.
- **Potwierdzenie usunięcia:** Użytkownik klika "Potwierdź" w dialogu, co wywołuje żądanie `DELETE` do API, a po sukcesie odświeża listę i wyświetla powiadomienie toast.
- **Anulowanie usunięcia:** Użytkownik klika "Anuluj" w dialogu lub poza nim, co zamyka okno bez żadnych dalszych akcji.

## 9. Warunki i walidacja

- **`PaginationControls`:**
  - Przycisk "Poprzednia" jest nieaktywny, gdy `pagination.page <= 1`.
  - Przycisk "Następna" jest nieaktywny, gdy `pagination.page >= pagination.totalPages`.
- **`DeleteConfirmationDialog`:**
  - Przycisk "Potwierdź" jest nieaktywny (`disabled`) i może pokazywać spinner, gdy `isDeleting` jest `true`, aby zapobiec wielokrotnemu wysyłaniu żądania.

## 10. Obsługa błędów

- **Błąd pobierania listy:** Jeśli żądanie `GET` zakończy się niepowodzeniem, komponent `LearningItemsView` wyświetli ogólny komunikat o błędzie, zachęcając do odświeżenia strony.
- **Błąd usuwania elementu:** Jeśli żądanie `DELETE` nie powiedzie się, dialog zostanie zamknięty, a użytkownik zobaczy powiadomienie toast z informacją o błędzie (np. "Nie udało się usunąć elementu.").
- **Brak elementów:** Jeśli API zwróci pustą listę (`totalItems: 0`), komponent `LearningItemsList` wyświetli komponent `EmptyState` z informacją, że lista jest pusta.

## 11. Kroki implementacji

1. **Utworzenie plików:**
   - Stwórz plik strony `src/pages/learning-list.astro`.
   - Stwórz plik komponentu `src/components/views/LearningItemsView.tsx`.
   - Stwórz pliki dla komponentów prezentacyjnych w `src/components/features/learning-items/` (np. `LearningItemsList.tsx`, `LearningItemCard.tsx`, `PaginationControls.tsx` itd.).
2. **Definicja typów:** Zdefiniuj nowe typy `LearningItemViewModel` i `PaginationViewModel` w pliku `src/types.ts` lub lokalnie w `LearningItemsView.tsx`.
3. **Implementacja hooka `useLearningItems`:** Zaimplementuj całą logikę pobierania danych, usuwania i zarządzania stanem w `src/lib/hooks/useLearningItems.ts`.
4. **Implementacja komponentów:**
   - Zbuduj komponenty prezentacyjne, używając komponentów z biblioteki Shadcn/ui (`Card`, `Button`, `AlertDialog`, `Skeleton`).
   - Zbuduj komponent kontenerowy `LearningItemsView`, który używa hooka `useLearningItems` i renderuje odpowiednie komponenty w zależności od stanu.
5. **Stworzenie strony Astro:** W pliku `src/pages/learning-list.astro` zaimportuj i wyrenderuj komponent `LearningItemsView` wewnątrz `Layout`, dodając dyrektywę `client:load`.
6. **Stylowanie:** Użyj klas Tailwind CSS do ostylowania komponentów zgodnie z ogólnym wyglądem aplikacji.
7. **Testowanie:** Przetestuj ręcznie wszystkie ścieżki użytkownika: pomyślne załadowanie danych, stan pusty, paginację, proces usuwania (potwierdzenie i anulowanie) oraz obsługę błędów API.
