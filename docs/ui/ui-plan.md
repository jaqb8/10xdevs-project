# Architektura UI dla Language Learning Buddy

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji Language Learning Buddy została zaprojektowana w oparciu o framework Astro z wykorzystaniem React dla komponentów interaktywnych. Celem jest stworzenie przejrzystej, responsywnej i dostępnej aplikacji.

Struktura opiera się na czterech głównych widokach: dwóch publicznych (`/login`, `/register`) i dwóch chronionych, dostępnych po zalogowaniu (`/`, `/learning-list`). Globalny stan uwierzytelnienia, zarządzany przez React Context, kontroluje dostęp do chronionych widoków i dynamicznie dostosowuje nawigację. Komunikacja z backendem odbywa się po stronie klienta, z jawną obsługą stanów ładowania i błędów, aby zapewnić użytkownikowi ciągłą informację zwrotną. Spójność wizualną gwarantuje biblioteka komponentów `shadcn/ui`.

## 2. Lista widoków

### Widok 1: Logowanie (Login View)

- **Ścieżka:** `/login`
- **Główny cel:** Umożliwienie zarejestrowanym użytkownikom zalogowania się do aplikacji.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami na e-mail i hasło.
- **Kluczowe komponenty widoku:** `Card`, `Form`, `Input`, `Button`, `Link` do strony rejestracji.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Wyraźne komunikaty o błędach walidacji (np. "Nieprawidłowy e-mail lub hasło") wyświetlane przy formularzu. Po pomyślnym logowaniu automatyczne przekierowanie do widoku analizy (`/`).
  - **Dostępność:** Pola formularza poprawnie powiązane z etykietami. Komunikaty o błędach powiązane z polami za pomocą `aria-describedby`.
  - **Bezpieczeństwo:** Widok publiczny. Komunikacja z API odbywa się przez HTTPS.

### Widok 2: Rejestracja (Register View)

- **Ścieżka:** `/register`
- **Główny cel:** Umożliwienie nowym użytkownikom stworzenia konta.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami na e-mail, hasło i potwierdzenie hasła.
- **Kluczowe komponenty widoku:** `Card`, `Form`, `Input`, `Button`, `Link` do strony logowania.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Walidacja "inline" formatu e-maila, siły hasła i potwierdzenia hasła. Komunikat o błędzie, jeśli konto na podany e-mail już istnieje. Po pomyślnej rejestracji automatyczne zalogowanie i przekierowanie do widoku analizy (`/`).
  - **Dostępność:** Zapewnienie, że wymagania dotyczące hasła są jasno opisane i dostępne dla czytników ekranu.
  - **Bezpieczeństwo:** Widok publiczny.

### Widok 3: Analiza tekstu (Analysis View)

- **Ścieżka:** `/`
- **Główny cel:** Główne narzędzie aplikacji, umożliwiające analizę tekstu, przeglądanie wyników i dodawanie błędów do listy "Do nauki".
- **Kluczowe informacje do wyświetlenia:**
  - Pole tekstowe (`Textarea`) na tekst do analizy (z licznikiem znaków).
  - `Dropdown` (lub `Select`) do wyboru trybu analizy tekstu (np. "Gramatyka i ortografia", "Mowa potoczna").
  - Dynamicznie zmieniający się podtytuł, wyjaśniający działanie wybranego trybu analizy.
  - Wyniki analizy: porównanie tekstu oryginalnego z poprawionym (z wizualnym wyróżnieniem zmian), wyjaśnienie błędu.
  - Komunikaty o stanie: informacja o braku błędów w tekście po analizie lub informacja o błędzie w analizowanym tekście, stan ładowania.
- **Kluczowe komponenty widoku:** `Textarea`, `Button` ("Analizuj", "Dodaj do listy Do nauki", "Wyczyść"), `Card` (do prezentacji wyników), `Skeleton` (wskaźnik ładowania), `Toast` (dla powiadomień), `Select`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Przycisk "Analizuj" jest nieaktywny podczas ładowania i pokazuje spinner. Wyniki są ładowane asynchronicznie, co sygnalizuje `Skeleton`. Dodanie do listy jest potwierdzane przez `Toast`. Wyniki pozostają widoczne do momentu ręcznego wyczyszczenia. Wybór trybu analizy jest zapisywany w `localStorage`, dzięki czemu ostatnio używany tryb jest przywracany przy kolejnej wizycie.
  - **Dostępność:** Stan ładowania jest komunikowany atrybutem `aria-busy`. Nowo pojawiające się wyniki i komunikaty o błędach są ogłaszane przez czytniki ekranu za pomocą `aria-live`.
  - **Bezpieczeństwo:** Widok chroniony. Wymaga uwierzytelnienia. Próba dostępu bez aktywnej sesji skutkuje przekierowaniem na `/login`.

### Widok 4: Lista "Do nauki" (Learning List View)

- **Ścieżka:** `/learning-list`
- **Główny cel:** Umożliwienie użytkownikowi przeglądania i zarządzania zapisanymi błędami.
- **Kluczowe informacje do wyświetlenia:**
  - Lista zapisanych elementów.
  - Każdy element zawiera: zdanie oryginalne, zdanie poprawione, wyjaśnienie, datę dodania.
  - Placeholder w przypadku braku elementów.
  - Paginacja, jeśli lista jest długa.
- **Kluczowe komponenty widoku:** `Card` (dla każdego elementu listy), `Button` ("Usuń"), `AlertDialog` (potwierdzenie usunięcia), Paginacja (`Button` "Następna"/"Poprzednia").
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Usunięcie elementu wymaga potwierdzenia w oknie modalnym, aby zapobiec przypadkowym akcjom. Czytelna prezentacja każdego elementu na osobnej karcie.
  - **Dostępność:** Każdy element listy ma logiczną strukturę nagłówków. Akcje (np. usunięcie) są jasno opisane.
  - **Bezpieczeństwo:** Widok chroniony. Dane pobierane z API są specyficzne dla zalogowanego użytkownika.

## 3. Mapa podróży użytkownika

1.  **Uwierzytelnianie:**
    - Użytkownik wchodzi na stronę (`/login` lub `/register`).
    - Wypełnia formularz. Po pomyślnej akcji jest przekierowywany na stronę główną (`/`).
2.  **Analiza tekstu:**
    - Na stronie `/` użytkownik wprowadza tekst w `Textarea` i klika "Analizuj".
    - Interfejs pokazuje stan ładowania.
    - Po zakończeniu analizy wyświetlane są wyniki (porównanie tekstów i wyjaśnienie).
3.  **Zapisywanie błędu:**
    - Użytkownik klika przycisk "Dodaj do listy Do nauki".
    - Otrzymuje potwierdzenie operacji przez `Toast`.
4.  **Przeglądanie listy:**
    - Użytkownik przechodzi do widoku `/learning-list` za pomocą nawigacji w nagłówku.
    - Widzi listę wszystkich zapisanych przez siebie błędów.
5.  **Zarządzanie listą:**
    - Użytkownik klika "Usuń" przy wybranym elemencie.
    - Potwierdza swój wybór w oknie modalnym `AlertDialog`.
    - Element znika z listy, a użytkownik otrzymuje potwierdzenie przez `Toast`.
6.  **Wylogowanie:**
    - Użytkownik klika "Wyloguj" w nagłówku.
    - Sesja jest kończona, a użytkownik zostaje przekierowany na stronę logowania (`/login`).

## 4. Układ i struktura nawigacji

Aplikacja będzie posiadać stały, globalny układ (layout) zawierający nagłówek (`Header`) oraz obszar na treść renderowanego widoku.

- **Nagłówek (Header):**
  - Jego zawartość jest warunkowa, zależna od stanu uwierzytelnienia użytkownika.
  - **Dla gości:** Logo, linki do "Zaloguj" (`/login`) i "Zarejestruj" (`/register`).
  - **Dla zalogowanych użytkowników:** Logo, linki do "Analiza" (`/`) i "Moja lista" (`/learning-list`) oraz przycisk "Wyloguj".
- **Routing:**
  - Za routing odpowiada Astro. Dostęp do ścieżek `/` i `/learning-list` jest chroniony. Logika sprawdzająca stan uwierzytelnienia (z globalnego `AuthContext`) będzie zaimplementowana na poziomie komponentu layoutu lub w middleware, przekierowując niezalogowanych użytkowników do `/login`.

## 5. Kluczowe komponenty

Poniższe komponenty (z `shadcn/ui`) będą stanowić podstawę interfejsu i będą reużywane w różnych widokach w celu zapewnienia spójności.

- **`Card`**: Główny kontener do grupowania powiązanych treści, np. formularzy, wyników analizy, elementów na liście "Do nauki".
- **`Button`**: Standardowy komponent do wywoływania akcji (wysyłanie formularzy, usuwanie, nawigacja). Będzie obsługiwał stany `disabled` i stany ładowania.
- **`Input` / `Textarea`**: Podstawowe pola do wprowadzania danych przez użytkownika.
- **`Toast`**: Dyskretne, tymczasowe powiadomienia do informowania o wyniku operacji (np. "Dodano do listy", "Wystąpił błąd").
- **`AlertDialog`**: Modalne okno dialogowe używane do uzyskania od użytkownika potwierdzenia krytycznej akcji (np. usunięcia elementu).
- **`Skeleton`**: Placeholder używany do sygnalizowania ładowania treści, poprawiający postrzeganą wydajność aplikacji.
- **`AuthContext Provider`**: Komponent React (niewizualny), który będzie otaczał chronione części aplikacji, dostarczając informacji o statusie zalogowania i danych użytkownika.
