# Plan Testów dla Aplikacji "Language Learning Buddy"

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje strategię, zakres, podejście oraz zasoby przeznaczone do testowania aplikacji internetowej "Language Learning Buddy". Aplikacja jest narzędziem, które pomaga użytkownikom w nauce języka angielskiego poprzez analizę i korektę błędów gramatycznych w tekście pisanym.

### 1.2. Cele Testowania

Główne cele procesu testowego to:

- **Weryfikacja funkcjonalności:** Zapewnienie, że wszystkie funkcje aplikacji działają zgodnie z założeniami i specyfikacją.
- **Zapewnienie bezpieczeństwa:** Potwierdzenie, że dane użytkowników są bezpieczne, a dostęp do zasobów jest odpowiednio kontrolowany.
- **Gwarancja niezawodności:** Sprawdzenie, czy aplikacja jest stabilna i odporna na błędy, w tym na problemy z usługami zewnętrznymi.
- **Ocena użyteczności (UX/UI):** Weryfikacja, czy interfejs użytkownika jest intuicyjny, spójny i responsywny.
- **Identyfikacja i raportowanie defektów:** Skuteczne wykrywanie, dokumentowanie i śledzenie błędów w celu ich naprawy przed wdrożeniem.

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami

- **Moduł Uwierzytelniania:**
  - Rejestracja nowego użytkownika (wraz z potwierdzeniem email).
  - Logowanie i wylogowywanie.
  - Resetowanie hasła.
  - Ochrona tras wymagających zalogowania.
- **Główna funkcjonalność - Analiza Tekstu:**
  - Wprowadzanie tekstu przez użytkownika.
  - Wyświetlanie wyniku analizy (poprawiony tekst, wyjaśnienia).
  - Obsługa stanów (ładowanie, błąd, sukces).
- **Zarządzanie Listą Nauki (Learning Items):**
  - Tworzenie nowego elementu na podstawie analizy.
  - Wyświetlanie listy elementów z paginacją.
  - Usuwanie elementów z listy.
- **Integracja z API:**
  - Komunikacja frontend-backend dla wszystkich powyższych funkcjonalności.
  - Obsługa kodów błędów (`error_code`) i wyświetlanie komunikatów.

## 3. Typy Testów do Przeprowadzenia

- **Testy Jednostkowe (Unit Tests):**
  - **Cel:** Weryfikacja pojedynczych funkcji, komponentów React i usług w izolacji.
  - **Zakres:** Funkcje pomocnicze (`/src/lib/utils.ts`), logika usług (`/src/lib/services/**`) z zamockowanymi zależnościami, poszczególne komponenty React.
- **Testy Integracyjne (Integration Tests):**
  - **Cel:** Weryfikacja współpracy między różnymi częściami systemu.
  - **Zakres:**
    - Testowanie endpointów API (`/src/pages/api/**`) i ich interakcji z warstwą usług i bazą danych.
    - Testowanie polityk RLS w Supabase (np. czy użytkownik A może odczytać dane użytkownika B).
    - Testowanie middleware (`/src/middleware/index.ts`) i jego wpływu na routing i kontekst.
- **Testy End-to-End (E2E Tests):**
  - **Cel:** Symulacja rzeczywistych scenariuszy użytkownika w przeglądarce.
  - **Zakres:** Pełne ścieżki użytkownika, takie jak "rejestracja -> logowanie -> analiza tekstu -> dodanie do listy -> wylogowanie". Weryfikacja hydracji "wysp" React na stronach Astro.
- **Testy Wizualnej Regresji (Visual Regression Testing):**
  - **Cel:** Automatyczne wykrywanie niezamierzonych zmian w interfejsie użytkownika.
  - **Zakres:** Kluczowe widoki (`AnalyzeView`, `LearningItemsView`) i komponenty współdzielone.
- **Testy Manualne (Manual Exploratory Testing):**
  - **Cel:** Wykrywanie błędów trudnych do zautomatyzowania poprzez swobodną eksplorację aplikacji.
  - **Zakres:** Testowanie użyteczności, responsywności na różnych urządzeniach i nietypowych zachowań użytkowników.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

### 4.1. Scenariusz: Logowanie użytkownika

| Krok | Akcja Użytkownika                                       | Oczekiwany Rezultat                                                                                | Priorytet |
| ---- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------- |
| 1    | Wejście na stronę `/login`                              | Wyświetla się formularz logowania z polami "Email" i "Hasło"                                       | Krytyczny |
| 2    | Wprowadzenie poprawnych danych i kliknięcie "Zaloguj"   | Użytkownik zostaje przekierowany na stronę `/`. W nagłówku widać jego email/awatar.                | Krytyczny |
| 3    | Wprowadzenie niepoprawnego hasła i kliknięcie "Zaloguj" | Pod formularzem pojawia się komunikat o błędnych danych. Użytkownik pozostaje na stronie `/login`. | Krytyczny |
| 4    | Próba wejścia na `/learning-list` bez zalogowania       | Użytkownik zostaje automatycznie przekierowany na stronę `/login`.                                 | Krytyczny |

### 4.2. Scenariusz: Analiza tekstu i dodanie do listy nauki

| Krok | Akcja Użytkownika                                          | Oczekiwany Rezultat                                                                                                                                        | Priorytet |
| ---- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1    | Na stronie `/` (AnalyzeView) wpisuje tekst w pole tekstowe | Przycisk "Analizuj" staje się aktywny.                                                                                                                     | Wysoki    |
| 2    | Klika "Analizuj"                                           | Wyświetla się stan ładowania. Po chwili pojawia się `AnalysisResult` z poprawionym tekstem i wyjaśnieniami. Przycisk "Dodaj do Listy Nauki" jest widoczny. | Wysoki    |
| 3    | Klika "Dodaj do Listy Nauki"                               | Element zostaje dodany. Użytkownik otrzymuje powiadomienie o sukcesie.                                                                                     | Wysoki    |
| 4    | Klika "Analizuj" z pustym polem tekstowym                  | Przycisk "Analizuj" jest nadal nieaktywny.                                                                                                                 | Średni    |
| 5    | (Symulacja błędu API) Klika "Analizuj"                     | Wyświetla się komunikat o błędzie serwera.                                                                                                                 | Wysoki    |

### 4.3. Scenariusz: Zarządzanie listą nauki

| Krok | Akcja Użytkownika                                  | Oczekiwany Rezultat                                                                                                         | Priorytet |
| ---- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1    | Wejście na stronę `/learning-list`                 | Wyświetla się lista wcześniej dodanych elementów. Widoczna jest paginacja, jeśli elementów jest więcej niż limit na stronę. | Wysoki    |
| 2    | Kliknięcie ikony usunięcia przy jednym z elementów | Pojawia się modal z prośbą o potwierdzenie usunięcia.                                                                       | Średni    |
| 3    | Potwierdzenie usunięcia                            | Element znika z listy. Wyświetla się powiadomienie o sukcesie.                                                              | Wysoki    |

## 5. Środowisko Testowe

- **Środowisko developerskie (lokalne):** Używane do developmentu i uruchamiania testów jednostkowych/integracyjnych.
- **Środowisko testowe (staging):** Osobna instancja aplikacji z własnym projektem Supabase (osobna baza danych i konfiguracja Auth). Na tym środowisku będą uruchamiane testy E2E i przeprowadzane testy manualne. Klucze do API OpenRouter będą miały ustawione niskie limity.
- **Środowisko produkcyjne:** Dostęp do tego środowiska jest ograniczony. Testy na produkcji będą ograniczone do smoke testów po każdym wdrożeniu.

## 6. Narzędzia do Testowania

| Typ Testu                  | Narzędzie                                    | Uzasadnienie                                                                                                                                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jednostkowe / Integracyjne | **Vitest**                                   | Szybkie, kompatybilne z Vite (używanym przez Astro), proste API, wsparcie dla TypeScript.                                                                                 |
| Mockowanie API             | **Mock Service Worker (MSW)**                | Pozwala na przechwytywanie zapytań sieciowych i zwracanie mockowych odpowiedzi, co jest kluczowe dla testów integracyjnych i E2E bez zależności od działającego backendu. |
| End-to-End                 | **Playwright**                               | Nowoczesne, szybkie i niezawodne narzędzie do testów E2E, wspiera wiele przeglądarek, ma świetne narzędzia deweloperskie.                                                 |
| Wizualna Regresja          | **Storybook** + dodatek do testów wizualnych | Umożliwia izolację komponentów i ich testowanie wizualne w różnych stanach.                                                                                               |
| Zarządzanie Testami        | **Dokumentacja w repozytorium (Markdown)**   | Dla projektu MVP jest to wystarczające. W przyszłości można rozważyć dedykowane narzędzie (np. TestRail).                                                                 |
| CI/CD                      | **GitHub Actions**                           | Automatyczne uruchamianie testów (jednostkowych, integracyjnych, E2E) przy każdym pushu i przed każdym wdrożeniem.                                                        |

## 7. Harmonogram Testów

Testowanie jest procesem ciągłym, zintegrowanym z cyklem rozwoju oprogramowania.

- **Testy jednostkowe i integracyjne:** Pisane na bieżąco przez deweloperów wraz z nowymi funkcjonalnościami. Muszą przejść przed zmergowaniem Pull Requesta.
- **Testy E2E:** Uruchamiane automatycznie w pipeline CI/CD na środowisku stagingowym po każdym wdrożeniu.
- **Testy manualne / eksploracyjne:** Przeprowadzane przed każdym wydaniem nowej wersji aplikacji (release).

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria wejścia (rozpoczęcia testów)

- Nowa funkcjonalność została zaimplementowana i zmergowana do gałęzi `main`/`develop`.
- Aplikacja została wdrożona na środowisku testowym (staging).
- Wszystkie testy jednostkowe i integracyjne przechodzą pomyślnie.

### 8.2. Kryteria wyjścia (zakończenia testów)

- 100% testów automatycznych (jednostkowych, integracyjnych, E2E) przechodzi pomyślnie.
- Brak otwartych błędów o priorytecie `Krytyczny` lub `Wysoki`.
- Wszystkie zaplanowane scenariusze testowe zostały wykonane.
- Dokumentacja testowa została zaktualizowana.

## 9. Role i Odpowiedzialności

- **Deweloper:**
  - Pisanie testów jednostkowych i integracyjnych dla tworzonych funkcjonalności.
  - Naprawa błędów zgłoszonych przez QA.
  - Utrzymanie pipeline'u CI/CD.
- **Inżynier QA:**
  - Tworzenie i utrzymanie planu testów.
  - Tworzenie i utrzymanie automatycznych testów E2E.
  - Przeprowadzanie testów manualnych i eksploracyjnych.
  - Raportowanie i weryfikacja błędów.
  - Akceptacja wersji przed wdrożeniem na produkcję.
- **Product Owner / Manager:**
  - Definiowanie wymagań i kryteriów akceptacji dla funkcjonalności.
  - Priorytetyzacja błędów.

## 10. Procedury Raportowania Błędów

1.  **Zgłaszanie Błędów:** Wszystkie błędy będą zgłaszane jako "Issues" w repozytorium GitHub projektu.
2.  **Format Zgłoszenia:** Każde zgłoszenie musi zawierać:
    - Tytuł: Krótki, zwięzły opis problemu.
    - Opis: Szczegółowy opis błędu, kroki do reprodukcji.
    - Oczekiwany vs. Rzeczywisty rezultat.
    - Środowisko: (np. Staging, Lokalnie), przeglądarka, wersja.
    - Dowody: Zrzuty ekranu, nagrania wideo, logi z konsoli.
    - Priorytet: `Krytyczny`, `Wysoki`, `Średni`, `Niski`.
3.  **Cykl Życia Błędu:**
    - `Open`: Nowo zgłoszony błąd.
    - `In Progress`: Deweloper rozpoczął pracę nad naprawą.
    - `Ready for QA`: Błąd został naprawiony i wdrożony na środowisko testowe.
    - `In QA`: QA weryfikuje poprawkę.
    - `Closed`: Poprawka została zweryfikowana i błąd nie występuje.
    - `Reopened`: Poprawka nie zadziałała, błąd nadal występuje.
