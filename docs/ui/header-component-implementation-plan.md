# Plan implementacji komponentu Header

## 1. Przegląd

Celem jest stworzenie globalnego komponentu `Header`, który będzie częścią głównego layoutu aplikacji. Komponent ten będzie dynamicznie dostosowywał swoją zawartość w zależności od stanu uwierzytelnienia użytkownika, zapewniając odpowiednie linki nawigacyjne oraz funkcję wylogowania.

## 2. Routing widoku

Komponent `Header` nie będzie posiadał własnej, dedykowanej ścieżki. Będzie on stałym elementem renderowanym na każdej stronie aplikacji w ramach `src/layouts/Layout.astro`.

## 3. Struktura komponentów

Hierarchia komponentów zostanie zorganizowana w celu zachowania czystości kodu i reużywalności.

```
- src/layouts/Layout.astro
  - src/components/layout/Header.tsx (komponent interaktywny)
    - src/components/layout/MainNav.tsx (nawigacja główna)
    - src/components/layout/UserNav.tsx (nawigacja użytkownika, warunkowa)
```

## 4. Szczegóły komponentów

### `src/layouts/Layout.astro`

- **Opis komponentu:** Główny layout aplikacji, który definiuje strukturę strony HTML. Będzie zawierał komponent `Header.tsx` oraz `<slot />` do renderowania zawartości poszczególnych stron. Będzie również otaczał zawartość dostawcą stanu (Provider) w celu zarządzania globalnym stanem uwierzytelnienia.
- **Główne elementy:** `<html>`, `<head>`, `<body>`, `<Header client:load />`, `<slot />`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** `title: string`.

### `src/components/layout/Header.tsx`

- **Opis komponentu:** Główny kontener nagłówka. Jego zadaniem jest pobranie stanu uwierzytelnienia z globalnego hooka `useAuth` i przekazanie go do komponentów podrzędnych.
- **Główne elementy:** `<header>`, `<Logo />`, `<MainNav />`, `<UserNav />`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `UserViewModel | null` (z `useAuth`).
- **Propsy:** Brak.

### `src/components/layout/MainNav.tsx`

- **Opis komponentu:** Odpowiada za renderowanie głównych linków nawigacyjnych dla zalogowanego użytkownika.
- **Główne elementy:** `<nav>`, `<a>`. Będzie renderował linki "Analiza" (`/`) i "Moja lista" (`/learning-list`).
- **Obsługiwane interakcje:** Nawigacja po kliknięciu linku.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `UserViewModel | null`.
- **Propsy:** `user: UserViewModel | null`.

### `src/components/layout/UserNav.tsx`

- **Opis komponentu:** Komponent warunkowy. Renderuje linki "Zaloguj" i "Zarejestruj" dla gości lub przycisk "Wyloguj" dla zalogowanych użytkowników.
- **Główne elementy:** `<div>`, `<a>`, `<Button />` (z `shadcn/ui`).
- **Obsługiwane interakcje:**
  - Kliknięcie "Wyloguj": wywołuje funkcję `logout` z hooka `useAuth`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `UserViewModel | null`.
- **Propsy:** `user: UserViewModel | null`.

## 5. Typy

Do implementacji widoku nie są wymagane nowe typy DTO. Wykorzystamy istniejące definicje oraz stworzymy prosty model widoku dla użytkownika.

- **`UserViewModel`**
  - **Opis:** Reprezentacja danych użytkownika na potrzeby frontendu.
  - **Pola:**
    - `id: string`
    - `email: string`
  - **Użycie:** Przechowywany w stanie globalnym hooka `useAuth`. Stan będzie miał typ `UserViewModel | null`.

## 6. Zarządzanie stanem

Stan uwierzytelnienia będzie zarządzany globalnie przy użyciu niestandardowego hooka `useAuth` oraz mechanizmu React Context API, aby był dostępny w całej aplikacji.

- **Hook `useAuth` (`src/lib/hooks/useAuth.ts`)**
  - **Cel:** Centralne miejsce do zarządzania stanem i logiką uwierzytelniania.
  - **Stan wewnętrzny:**
    - `user: UserViewModel | null`
    - `isLoading: boolean`
  - **Udostępniane akcje:**
    - `login(credentials)`: (zamockowane) Loguje użytkownika.
    - `signup(credentials)`: (zamockowane) Rejestruje użytkownika.
    - `logout()`: (zamockowane) Wylogowuje użytkownika, czyści stan i przekierowuje.
- **Provider `AuthProvider`**
  - Komponent Reactowy, który będzie używał hooka `useAuth` i dostarczał jego stan oraz akcje do drzewa komponentów za pomocą `AuthContext.Provider`. Zostanie on użyty w `Layout.astro` do opakowania `<slot />`.

## 7. Integracja API

Zgodnie z wymaganiami, logika związana z autentykacją zostanie na tym etapie zamockowana. Zostanie utworzony dedykowany serwis, którego implementacja będzie mogła być w przyszłości łatwo podmieniona na rzeczywiste wywołania API.

- **Serwis `src/lib/services/auth.service.ts`**
  - **`logout(): Promise<ServiceVoidResult<"unknown_error">>`**
    - **Implementacja:** Będzie zwracać `Promise`, które po krótkim opóźnieniu (np. `setTimeout(resolve, 500)`) zakończy się sukcesem (`{ success: true }`).
- **Wywołanie w `useAuth`**
  - Funkcja `logout` w hooku `useAuth` wywoła `authService.logout()`. Po pomyślnym zakończeniu operacji, stan `user` zostanie ustawiony na `null`, a użytkownik zostanie przekierowany na stronę główną za pomocą `navigate("/")` z `astro:transitions/client`.

## 8. Interakcje użytkownika

- **Użytkownik zalogowany klika "Wyloguj":**
  1. Wywoływana jest funkcja `logout()` z `useAuth`.
  2. Przycisk może zostać tymczasowo zablokowany.
  3. Po pomyślnym zamockowaniu operacji, stan globalny jest aktualizowany (`user` na `null`).
  4. Komponent `Header` renderuje się ponownie, pokazując widok dla gościa.
  5. Następuje przekierowanie na stronę główną (`/`).
- **Nawigacja:**
  - Kliknięcie na linki ("Analiza", "Moja lista", "Zaloguj", "Zarejestruj") powoduje przejście na odpowiednie podstrony.

## 9. Warunki i walidacja

Głównym warunkiem weryfikowanym przez interfejs jest stan uwierzytelnienia użytkownika.

- **Warunek:** `user !== null` (sprawdzane w `useAuth`).
- **Komponenty:** `MainNav`, `UserNav`.
- **Wpływ na interfejs:**
  - Jeśli `true`, `MainNav` renderuje nawigację dla zalogowanego użytkownika, a `UserNav` przycisk "Wyloguj".
  - Jeśli `false`, `MainNav` nic nie renderuje, a `UserNav` linki "Zaloguj" i "Zarejestruj".

## 10. Obsługa błędów

- **Scenariusz:** Zamockowane wylogowanie kończy się błędem.
  - **Obsługa:** Funkcja `logout` w `useAuth` powinna obsłużyć błąd zwrócony przez `auth.service`.
  - **Feedback dla użytkownika:** W przypadku błędu, użytkownikowi zostanie wyświetlony komunikat typu "toast" (za pomocą `sonner`) z informacją "Wylogowanie nie powiodło się. Spróbuj ponownie." Użytkownik pozostaje zalogowany.

## 11. Kroki implementacji

1.  **Stworzenie serwisu autentykacji:**
    - Utwórz plik `src/lib/services/auth.service.ts`.
    - Zaimplementuj w nim zamockowaną funkcję `logout`, która zwraca `Promise` z `{ success: true }`.
2.  **Stworzenie hooka i kontekstu `useAuth`:**
    - Utwórz plik `src/lib/hooks/useAuth.ts`.
    - Zdefiniuj w nim logikę zarządzania stanem (`user`, `isLoading`).
    - Stwórz funkcję `logout`, która wywołuje serwis, aktualizuje stan i wykonuje przekierowanie.
    - Zaimplementuj `AuthProvider` z wykorzystaniem React Context.
3.  **Implementacja komponentów UI:**
    - Stwórz komponent `src/components/layout/UserNav.tsx`, który będzie renderował zawartość warunkowo na podstawie propsa `user`.
    - Stwórz komponent `src/components/layout/MainNav.tsx`, który będzie renderował nawigację dla zalogowanego użytkownika.
    - Stwórz główny komponent `src/components/layout/Header.tsx`, który użyje hooka `useAuth` i złoży `MainNav`

## 12. Aktualizacja Planu: Przejście na Middleware do Zarządzania Stanem Autentykacji

**Data aktualizacji:** 2025-10-17

W odpowiedzi na dalszą analizę, podjęto decyzję o zmianie strategii zarządzania stanem uwierzytelnienia. Poniższa aktualizacja zastępuje podejście oparte na klienckim React Context (`useAuth`) na rzecz integracji z Middleware w Astro.

### Powód zmiany

Oryginalny plan oparty na `useAuth` (opisany w sekcji **6. Zarządzanie stanem**) mógłby prowadzić do problemów z renderowaniem po stronie serwera (SSR), takich jak "mruganie" interfejsu (zmiana widoku z niezalogowanego na zalogowany po załadowaniu JavaScriptu). Przeniesienie logiki do middleware zapewnia, że stan użytkownika jest znany już na serwerze, co pozwala na wyrenderowanie poprawnego HTML od samego początku.

### Zaktualizowane kroki implementacji

Poniższe kroki zastępują lub modyfikują te opisane w sekcji **11. Kroki implementacji**.

#### 1. Modyfikacja Middleware (`src/middleware/index.ts`)

Zamiast tworzyć serwis i hook `useAuth`, rozszerzymy istniejące middleware.

- **Cel:** Odczytanie (lub zamockowanie) stanu użytkownika przy każdym żądaniu i udostępnienie go w całej aplikacji przez `context.locals`.
- **Implementacja (mock):**
  - W pliku `src/middleware/index.ts` dodamy logikę, która zamockuje obiekt użytkownika. Będzie on dodawany do `context.locals.user`. W przyszłości zostanie to zastąpione rzeczywistym odpytaniem Supabase o sesję.
  - **Przykład:**

    ```typescript
    // src/middleware/index.ts

    // Mock user data for development
    const MOCKED_USER = {
      id: "12345",
      email: "test@example.com",
    };

    export const onRequest = defineMiddleware((context, next) => {
      // Na potrzeby MVP, użytkownik jest na stałe zalogowany.
      // W przyszłości: logika odczytu sesji z Supabase.
      context.locals.user = MOCKED_USER;
      // Aby przetestować widok dla gościa, ustaw: context.locals.user = null;

      // ... reszta kodu middleware
    });
    ```

#### 2. Usunięcie `useAuth` i `AuthProvider`

Podejście oparte na middleware czyni klienckie zarządzanie stanem zbędnym.

- **Akcja:** Plik `src/lib/hooks/useAuth.tsx` oraz `AuthProvider` **nie będą tworzone**. Sekcje **6. Zarządzanie stanem** i **7. Integracja API** (w części dotyczącej `auth.service.ts` i `useAuth`) z oryginalnego planu stają się **nieaktualne**.

#### 3. Aktualizacja `Layout.astro`

Główny layout będzie teraz przekazywał dane użytkownika bezpośrednio do komponentu `Header`.

- **Zmiany:**
  - W `src/layouts/Layout.astro` odczytamy dane użytkownika z `Astro.locals`.
  - `AuthProvider` nie będzie używany.
  - Dane użytkownika zostaną przekazane jako prop do komponentu `Header`.
  - **Przykład:**

    ```astro
    ---
    // src/layouts/Layout.astro
    import Header from "../components/layout/Header.tsx";
    const { user } = Astro.locals;
    ---

    <html lang="en">
      <head></head>...
      <body>
        <Header user={user} client:load />
        <slot />
      </body>
    </html>
    ```

#### 4. Aktualizacja komponentów UI (`Header.tsx`, `UserNav.tsx`)

Komponenty React będą teraz "głupimi" komponentami, otrzymującymi stan przez propsy.

- **`Header.tsx`:**
  - Będzie przyjmować `user: UserViewModel | null` jako prop.
  - Nie będzie używał hooka `useAuth`.
  - Przekaże prop `user` do `MainNav` i `UserNav`.
- **`UserNav.tsx`:**
  - Również przyjmie `user` jako prop.
  - **Obsługa wylogowania:** Przycisk "Wyloguj" będzie linkiem `<a>` prowadzącym do (jeszcze nieistniejącego) endpointu `/api/auth/logout`, który w przyszłości będzie odpowiedzialny za wyczyszczenie sesji. Na tym etapie link może prowadzić donikąd (`#`) lub po prostu odświeżać stronę, co przy zamockowanym middleware nie zmieni stanu. Logika wylogowania po stronie klienta jest usunięta.

### Podsumowanie zmian w stosunku do pierwotnego planu

- **Anulowano:** Tworzenie `src/lib/hooks/useAuth.tsx` i `src/lib/services/auth.service.ts`.
- **Zmieniono:** Logika autentykacji przeniesiona do `src/middleware/index.ts` (na razie jako mock).
- **Zmieniono:** Komponenty React (`Header`, `MainNav`, `UserNav`) pobierają dane z propsów, a nie z globalnego kontekstu.
- **Zmieniono:** `Layout.astro` jest odpowiedzialny za przekazanie danych z `Astro.locals` do `Header`.
