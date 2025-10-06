# Dokument wymagań produktu (PRD) - Language Learning Buddy

## 1. Przegląd produktu

Language Learning Buddy to aplikacja webowa wspierająca proces nauki języka angielskiego poprzez inteligentną analizę tekstów, wykrywanie błędów i systematyczne śledzenie postępów w eliminowaniu indywidualnych słabości językowych użytkownika.

### 1.1. Cel produktu

Celem produktu jest rozwiązanie problemu braku narzędzia do:

- Natychmiastowej analizy i korekty tekstów w języku angielskim
- Automatycznego wykrywania błędów gramatycznych, ortograficznych i stylistycznych
- Budowania spersonalizowanej listy błędów użytkownika
- Systematycznego śledzenia postępów w nauce

### 1.2. Grupa docelowa

Wersja MVP jest dedykowana dla małej grupy użytkowników (5-10 osób), w tym głównie:

- Twórcy produktu (self-use case)
- Osoby uczące się języka angielskiego na poziomie średniozaawansowanym (B1-C1)
- Użytkownicy regularnie piszący teksty po angielsku (e-maile, dokumenty, media społecznościowe)

### 1.3. Kluczowe założenia MVP

- Maksymalnie 10 sprawdzeń tekstu dziennie na użytkownika
- Limit długości tekstu: 500 znaków
- Aplikacja desktop-first (responsywność nice-to-have)
- Język interfejsu: polski
- Język analizy: angielski

## 2. Problem użytkownika

### 2.1. Opis problemu

Osoby uczące się języka angielskiego często popełniają te same błędy gramatyczne i językowe, ale nie mają prostego sposobu na ich śledzenie i systematyczne eliminowanie.

Tradycyjne metody nauki (podręczniki, kursy językowe) skupiają się na nauczaniu teorii gramatycznej i ogólnych reguł, ale nie pomagają w:

- Identyfikacji specyficznych błędów popełnianych przez konkretnego użytkownika
- Naprawie błędów w praktycznym kontekście pisania
- Systematycznym śledzeniu postępów w eliminowaniu błędów
- Rozpoznawaniu wzorców powtarzających się problemów językowych

### 2.2. Konsekwencje problemu

- Użytkownicy nieświadomie powtarzają te same błędy przez długi czas
- Brak feedback loop - użytkownik nie wie, które aspekty języka wymaga jego szczególnej uwagi
- Frustracja z braku widocznych postępów w nauce
- Marnowanie czasu na naukę zagadnień, które użytkownik już opanował, zamiast skupienia się na rzeczywistych słabościach

### 2.3. Proponowane rozwiązanie

Language Learning Buddy rozwiązuje ten problem poprzez:

1. Natychmiastową analizę tekstów pisanych przez użytkownika za pomocą AI
2. Automatyczne wykrywanie błędów z szczegółowymi wyjaśnieniami
3. Budowanie spersonalizowanej listy słabych punktów użytkownika (Learning List)
4. Śledzenie częstotliwości popełniania konkretnych błędów (seen count)
5. Umożliwienie śledzenia postępów poprzez system statusów (To Learn / Learning / Mastered)
6. Prezentację statystyk pokazujących obszary wymagające uwagi

## 3. Wymagania funkcjonalne

### 3.1. Autentykacja i zarządzanie kontem

3.1.1. Rejestracja użytkownika

- Formularz rejestracji z polami: email, hasło
- Walidacja formatu email i siły hasła
- Tworzenie konta użytkownika w bazie danych
- Automatyczne logowanie po rejestracji

  3.1.2. Logowanie użytkownika

- Formularz logowania z polami: email, hasło
- Weryfikacja credentials
- Sesja użytkownika utrzymywana między wizytami
- Obsługa błędnych danych logowania

  3.1.3. Zarządzanie profilem

- Wyświetlanie danych użytkownika (email)
- Edycja email użytkownika
- Wylogowanie z aplikacji

### 3.2. AI Grammar Checker (główna funkcja)

3.2.1. Interfejs sprawdzania tekstu

- Formularz z textarea do wprowadzania tekstu
- Widoczny licznik pozostałych sprawdzeń dziennych (format: "X/10 checks today")
- Licznik znaków z limitem 500 znaków
- Przycisk "Check Grammar"
- Walidacja długości tekstu przed wysłaniem

  3.2.2. Analiza tekstu przez AI

- Integracja z Grok API (model: grok-4-fast-reasoning)
- Timeout handling (max 30 sekund)
- Retry logic przy błędach tymczasowych
- Structured output: JSON z listą błędów

  3.2.3. Prezentacja wyników

- Layout side-by-side: oryginalny tekst vs poprawiona wersja
- Lista wykrytych błędów z następującymi danymi:
  - Incorrect fragment (błędny fragment)
  - Correct fragment (poprawka)
  - Type (kategoria błędu: Grammar, Spelling, Word Choice, Punctuation, Style, Verb Tense, Articles, Prepositions)
  - Explanation (wyjaśnienie błędu)
  - Context (pełne zdanie, w którym wystąpił błąd)

    3.2.4. Akcje po sprawdzeniu

- Przycisk "Add all to Learning List" (dodaje wszystkie błędy do listy nauki)
- Przycisk "Skip" (zapisuje tylko w historii, nie dodaje do Learning List)
- Przekierowanie po akcji do Learning List (po "Add all") po Skip wyczyszczenie formularza

  3.2.5. Obsługa scenariuszy specjalnych

- Tekst bez błędów: wyświetlenie komunikatu "No errors found!" z wyłączonymi przyciskami dodawania
- Błąd analizy AI: komunikat "Analysis failed. Please try again." bez liczenia do dziennego limitu
- Przekroczenie limitu znaków: walidacja po stronie klienta z komunikatem błędu

  3.2.6. Limity użytkowania

- Maksymalnie 10 sprawdzeń dziennie na użytkownika
- Reset licznika o północy UTC
- Przy przekroczeniu limitu: wyłączenie textarea i przycisku z komunikatem "Daily limit reached. Reset at midnight UTC."
- Pozostałe funkcje aplikacji (Learning List, Dashboard) dostępne bez ograniczeń

### 3.3. Learning List (lista błędów do nauki)

3.3.1. Model danych pojedynczego elementu

- Incorrect text (błędny fragment)
- Correct text (poprawka)
- Type (kategoria błędu - jedna z 8 kategorii)
- Explanation (wyjaśnienie)
- Context (pełne zdanie)
- Status (To Learn / Learning / Mastered)
- Seen count (licznik wykryć tego samego błędu)
- Created at (data dodania)

  3.3.2. Wyświetlanie listy

- Widok listy wszystkich błędów użytkownika
- Każdy element wyświetla: incorrect → correct, type, status, seen count
- Rozwijanie elementu pokazuje: explanation, context
- Paginacja lub infinite scroll dla długich list

  3.3.3. Filtrowanie

- Filtr po statusie: All / To Learn / Learning / Mastered
- Filtr po typie błędu (8 kategorii)
- Możliwość łączenia filtrów
- Licznik elementów spełniających filtry

  3.3.4. Sortowanie

- Sortowanie po dacie dodania (newest first / oldest first)
- Sortowanie po typie błędu (alfabetycznie)
- Sortowanie po statusie
- Sortowanie po seen count (most frequent first)

  3.3.5. Zmiana statusu pojedynczego elementu

- Przyciski inline przy każdym elemencie
- Single-click zmienia status
- Możliwość przejścia z To Learn bezpośrednio do Mastered (skip Learning)
- Wizualna informacja o aktualnym statusie

  3.3.6. Bulk actions (akcje grupowe)

- Checkbox przy każdym elemencie
- Select all / deselect all
- Bulk action: "Mark as Learning"
- Bulk action: "Mark as Mastered"
- Bulk action: "Delete selected"
- Potwierdzenie przed usunięciem wielu elementów

  3.3.7. Usuwanie elementów

- Przycisk delete przy pojedynczym elemencie
- Potwierdzenie przed usunięciem
- Trwałe usunięcie z bazy danych

  3.3.8. Obsługa duplikatów

- Przy dodawaniu błędów z Grammar Checker: porównanie pola "incorrect" z istniejącymi elementami
- Case-sensitive string comparison
- Jeśli znaleziono duplikat: zwiększenie seen count o 1 zamiast tworzenia nowego wpisu
- Brak duplikatów: utworzenie nowego elementu z seen count = 1

### 3.4. Dashboard i Analytics

3.4.1. Statystyki ogólne (all-time)

- Total Checks: całkowita liczba sprawdzeń przez użytkownika
- Learning List breakdown:
  - X items To Learn
  - Y items Learning
  - Z items Mastered
- Prezentacja wyłącznie liczbowa (bez wykresów)

  3.4.2. Top 3 Error Categories

- Lista 3 najczęstszych kategorii błędów
- Format: "Grammar: 15, Articles: 8, Verb Tense: 6"
- Sortowanie malejące według liczby wystąpień

  3.4.3. Historia sprawdzeń

- Chronologiczna lista ostatnich sprawdzeń (newest first)
- Dla każdego sprawdzenia wyświetlane dane:
  - Timestamp (data i godzina)
  - Fragment original text (pierwsze 50 znaków + "...")
  - Liczba wykrytych błędów
  - Status: "Added to list" (Yes/No)
- Możliwość kliknięcia w element historii

  3.4.4. Szczegóły sprawdzenia z historii

- Wyświetlenie po kliknięciu w element historii
- Pełny original text
- Pełny corrected text
- Lista wszystkich wykrytych błędów z wyjaśnieniami
- Informacja, czy błędy zostały dodane do Learning List

### 3.6. Obsługa błędów

3.6.1. Błędy API Grok

- Timeout (>30s): wyświetlenie komunikatu "Analysis failed. Please try again."
- Error 500: retry 1x, jeśli fail - komunikat jak wyżej
- Błędy analizy nie liczą się do dziennego limitu sprawdzeń

  3.6.2. Błędy bazy danych

- Connection error: komunikat "Service temporarily unavailable"
- Retry logic dla operacji krytycznych

  3.6.3. Walidacja danych

- Email format przy rejestracji
- Minimalna długość hasła: 8 znaków
- Maksymalna długość tekstu do sprawdzenia: 500 znaków
- Komunikaty walidacji w formularzu

## 4. Granice produktu

### 4.1. Ograniczenia techniczne MVP

4.1.1. Limity użytkowania

- Maksymalnie 10 sprawdzeń dziennie na użytkownika
- Maksymalnie 500 znaków na pojedyncze sprawdzenie
- Reset licznika sprawdzeń o północy UTC

  4.1.2. UI/UX

- Desktop-first (responsywność nice-to-have, nie required)
- Podstawowy UI bez zaawansowanych animacji
- Język interfejsu tylko polski

### 4.3. Założenia dotyczące grupy użytkowników

4.3.1. Wielkość grupy

- MVP dedykowane dla małej grupy: 5-10 użytkowników
- Głównie twórca produktu + kilka osób testujących

  4.3.2. Profil użytkowników

- Osoby uczące się języka angielskiego
- Poziom B1-C1
- Regularnie piszące teksty po angielsku
- Dostęp do komputera z przeglądarką

  4.3.3. Kontekst użytkowania

- Aplikacja używana głównie w celach osobistych
- Nie jest to narzędzie profesjonalne dla tłumaczy czy nauczycieli
- Brak wymagań compliance (GDPR, COPPA)

## 5. Historyjki użytkowników

### 5.1. Grupa: Autentykacja i zarządzanie kontem

US-001: Rejestracja nowego użytkownika

- Tytuł: Rejestracja nowego konta w aplikacji
- Opis: Jako nowa osoba odwiedzająca aplikację chcę zarejestrować konto, aby móc korzystać z funkcji sprawdzania gramatyki i śledzenia swoich błędów.
- Kryteria akceptacji:
  1. Formularz rejestracji zawiera pola: email, hasło, powtórz hasło
  2. Walidacja emaila: sprawdzenie poprawnego formatu
  3. Walidacja hasła: minimum 8 znaków
  4. Hasła muszą się zgadzać
  5. Po kliknięciu "Sign up" tworzone jest konto w bazie danych
  6. Po sukcesie użytkownik jest automatycznie zalogowany
  7. Użytkownik jest przekierowany do Dashboard
  8. Komunikat błędu wyświetla się, jeśli email już istnieje w systemie
  9. Komunikaty walidacji wyświetlają się przy każdym polu z błędem

US-002: Logowanie użytkownika

- Tytuł: Logowanie do istniejącego konta
- Opis: Jako zarejestrowany użytkownik chcę zalogować się do aplikacji, aby uzyskać dostęp do swoich danych i funkcji.
- Kryteria akceptacji:
  1. Formularz logowania zawiera pola: email, hasło
  2. Przycisk "Log in" wysyła credentials do weryfikacji
  3. Po sukcesie użytkownik jest przekierowany do Dashboard
  4. Sesja użytkownika jest zapisywana (użytkownik pozostaje zalogowany między wizytami)
  5. Przy błędnych credentials wyświetla się komunikat "Invalid email or password"
  6. Przycisk "Sign up" przenosi do strony rejestracji
  7. Formularz waliduje obecność obu pól przed wysłaniem

US-003: Wylogowanie użytkownika

- Tytuł: Wylogowanie z aplikacji
- Opis: Jako zalogowany użytkownik chcę wylogować się z aplikacji, aby zabezpieczyć moje konto na współdzielonym urządzeniu.
- Kryteria akceptacji:
  1. Przycisk/link "Log out" jest widoczny w nawigacji dla zalogowanego użytkownika
  2. Po kliknięciu "Log out" sesja użytkownika jest kończona
  3. Użytkownik jest przekierowany do strony logowania
  4. Próba dostępu do chronionych stron przekierowuje do logowania

US-004: Wyświetlanie danych profilu

- Tytuł: Przeglądanie informacji o moim koncie
- Opis: Jako zalogowany użytkownik chcę zobaczyć swoje dane profilowe, aby zweryfikować poprawność informacji.
- Kryteria akceptacji:
  1. Strona profilu wyświetla: email użytkownika
  2. Strona profilu jest dostępna z głównej nawigacji
  3. Dane są pobierane z bazy danych dla zalogowanego użytkownika
  4. Data utworzenia konta jest wyświetlana

US-005: Edycja email użytkownika

- Tytuł: Zmiana email w profilu
- Opis: Jako zalogowany użytkownik chcę zmienić swój email w profilu
- Kryteria akceptacji:
  1. Formularz edycji z polem "Email" zawiera aktualne email
  2. Po kliknięciu "Save" nowy email jest zapisywane w bazie
  3. Wyświetla się komunikat sukcesu "Profile updated successfully"
  4. Nowy email jest widoczne natychmiast w interfejsie
  5. Walidacja: email nie może być pusty i musi być poprawny format email

### 5.2. Grupa: AI Grammar Checker

US-006: Sprawdzenie tekstu z błędami

- Tytuł: Analiza tekstu i wykrycie błędów gramatycznych
- Opis: Jako użytkownik uczący się angielskiego chcę sprawdzić napisany przeze mnie tekst, aby zobaczyć jakie błędy popełniłem i jak je poprawić.
- Kryteria akceptacji:
  1. Strona Grammar Checker zawiera textarea do wpisania tekstu
  2. Licznik znaków pokazuje "X/500 characters"
  3. Licznik sprawdzeń pokazuje "X/10 checks today"
  4. Przycisk "Check Grammar" jest aktywny gdy tekst nie jest pusty i ≤500 znaków
  5. Po kliknięciu "Check Grammar" następuje analiza przez Grok API
  6. Loading state podczas analizy (spinner lub skeleton)
  7. Wyniki pokazują side-by-side: Original text | Corrected text
  8. Lista błędów zawiera: incorrect → correct, type, explanation, context
  9. Licznik sprawdzeń zmniejsza się o 1 (np. z 10/10 na 9/10)
  10. Sprawdzenie jest zapisywane w historii

US-007: Dodanie wszystkich błędów do Learning List

- Tytuł: Zapisanie wykrytych błędów do listy nauki
- Opis: Jako użytkownik, który otrzymał wyniki analizy tekstu chcę dodać wszystkie wykryte błędy do mojej Learning List, aby móc nad nimi systematycznie pracować.
- Kryteria akceptacji:
  1. Przycisk "Add all to Learning List" jest widoczny pod listą błędów
  2. Przycisk jest aktywny tylko gdy errors_count > 0
  3. Po kliknięciu wszystkie błędy są dodawane do tabeli Learning_Items
  4. Każdy błąd otrzymuje status "To Learn"
  5. System sprawdza duplikaty (porównanie pola "incorrect")
  6. Dla duplikatów: zwiększenie seen_count zamiast tworzenia nowego wpisu
  7. Dla nowych błędów: utworzenie z seen_count = 1
  8. W tabeli Checks pole added_to_list = true
  9. Użytkownik jest przekierowany do Learning List
  10. Toast/komunikat sukcesu: "X errors added to Learning List"

US-008: Pominięcie dodawania błędów do listy

- Tytuł: Zapisanie sprawdzenia bez dodawania do Learning List
- Opis: Jako użytkownik, który otrzymał wyniki analizy chcę zapisać sprawdzenie tylko w historii bez dodawania błędów do Learning List, ponieważ nie planuję nad nimi pracować.
- Kryteria akceptacji:
  1. Przycisk "Skip" jest widoczny obok "Add all to Learning List"
  2. Po kliknięciu sprawdzenie jest zapisane w historii z added_to_list = false
  3. Żadne błędy nie są dodawane do Learning_Items
  4. Formularz jest wyczyszczany
  5. Nie wyświetla się żaden komunikat sukcesu

US-009: Sprawdzenie tekstu bez błędów

- Tytuł: Analiza tekstu nie zawierającego błędów
- Opis: Jako użytkownik chcę sprawdzić tekst i otrzymać informację, że nie zawiera błędów, aby mieć pewność co do jakości mojego pisania.
- Kryteria akceptacji:
  1. Proces sprawdzania przebiega jak w US-006
  2. Wynik analizy pokazuje komunikat "No errors found!"
  3. Original text i corrected text są identyczne
  4. Brak listy błędów
  5. Przyciski "Add all to Learning List" i "Skip" są wyłączone lub ukryte
  6. Widoczny jest przycisk "Clear form"
  7. Sprawdzenie zapisuje się w historii z errors_count = 0
  8. Licznik sprawdzeń zmniejsza się o 1

US-010: Przekroczenie limitu znaków

- Tytuł: Walidacja długości wprowadzanego tekstu
- Opis: Jako użytkownik próbujący sprawdzić długi tekst chcę otrzymać informację o przekroczeniu limitu, aby wiedzieć że muszę skrócić tekst.
- Kryteria akceptacji:
  1. Licznik znaków na bieżąco pokazuje aktualna liczba/500
  2. Po przekroczeniu 500 znaków licznik zmienia kolor na czerwony
  3. Przycisk "Check Grammar" jest wyłączony gdy tekst > 500 znaków
  4. Komunikat walidacji: "Text exceeds 500 character limit"
  5. Użytkownik może edytować tekst bez ograniczeń (textarea nie blokuje wpisywania)

US-011: Osiągnięcie dziennego limitu sprawdzeń

- Tytuł: Blokada sprawdzania po wykorzystaniu 10 sprawdzeń dziennie
- Opis: Jako użytkownik, który wykonał już 10 sprawdzeń dzisiaj chcę zobaczyć komunikat o osiągnięciu limitu i czasie resetu, aby wiedzieć kiedy będę mógł ponownie sprawdzać teksty.
- Kryteria akceptacji:
  1. Licznik pokazuje "0/10 checks today"
  2. Textarea jest wyłączona (disabled)
  3. Przycisk "Check Grammar" jest wyłączony
  4. Komunikat: "Daily limit reached. Reset at midnight UTC."
  5. Informacja o dokładnym czasie do resetu (np. "Reset in 5 hours 23 minutes")
  6. Pozostałe funkcje aplikacji (Learning List, Dashboard, History) działają normalnie

US-012: Reset dziennego limitu sprawdzeń

- Tytuł: Automatyczne odnowienie limitu o północy UTC
- Opis: Jako użytkownik, który wykorzystał wczoraj swój dzienny limit chcę aby limit został automatycznie odnowiony, aby móc kontynuować sprawdzanie tekstów.
- Kryteria akceptacji:
  1. O północy UTC pole daily_checks_count w bazie jest resetowane do 0
  2. Pole daily_checks_reset_at jest aktualizowane na następną północ UTC
  3. Użytkownik widzi licznik "10/10 checks today" po odświeżeniu strony
  4. Textarea i przycisk "Check Grammar" są ponownie aktywne
  5. Komunikat o limicie znika

US-013: Błąd analizy AI

- Tytuł: Obsługa błędu podczas analizy tekstu przez API
- Opis: Jako użytkownik, którego sprawdzenie nie powiodło się z powodu błędu API chcę otrzymać jasny komunikat i nie stracić swojego dziennego sprawdzenia, aby móc spróbować ponownie.
- Kryteria akceptacji:
  1. Przy timeout (>30s) lub error 500 wyświetla się komunikat "Analysis failed. Please try again."
  2. Licznik sprawdzeń NIE zmniejsza się (błąd nie liczy się do limitu)
  3. Sprawdzenie NIE jest zapisywane w historii
  4. Użytkownik pozostaje na stronie Grammar Checker
  5. Textarea zachowuje wprowadzony tekst
  6. Użytkownik może natychmiast kliknąć "Check Grammar" ponownie
  7. Dla error 500: jeden automatyczny retry przed wyświetleniem błędu

US-014: Widok szczegółów błędu na liście wyników

- Tytuł: Przeglądanie szczegółów pojedynczego błędu
- Opis: Jako użytkownik przeglądający wyniki sprawdzenia chcę zobaczyć szczegółowe informacje o każdym błędzie, aby zrozumieć co zrobiłem źle i jak to poprawić.
- Kryteria akceptacji:
  1. Każdy błąd na liście wyświetla: incorrect → correct fragment
  2. Type (kategoria) jest widoczny z kolorowym badge lub ikoną
  3. Po kliknięciu w błąd rozwija się sekcja ze szczegółami
  4. Szczegóły zawierają: explanation (wyjaśnienie) i context (pełne zdanie)
  5. Możliwość zwinięcia szczegółów ponownym kliknięciem
  6. Explanation jest napisany prostym językiem z przykładami

### 5.3. Grupa: Learning List

US-015: Wyświetlanie wszystkich błędów w Learning List

- Tytuł: Przeglądanie mojej pełnej listy błędów do nauki
- Opis: Jako użytkownik chcę zobaczyć wszystkie błędy, które dodałem do mojej Learning List, aby mieć przegląd moich słabości językowych.
- Kryteria akceptacji:
  1. Strona Learning List wyświetla wszystkie Learning_Items użytkownika
  2. Każdy element pokazuje: incorrect → correct, type, status, seen count
  3. Domyślne sortowanie: newest first (po created_at DESC)
  4. Licznik na górze strony: "X items in total"
  5. Dla pustej listy: komunikat "No items yet. Start checking your texts!"
  6. Layout: lista lub karty, czytelne na desktop

US-016: Rozwijanie szczegółów błędu w Learning List

- Tytuł: Wyświetlenie pełnych informacji o błędzie
- Opis: Jako użytkownik przeglądający Learning List chcę zobaczyć szczegółowe wyjaśnienie i kontekst błędu, aby lepiej zrozumieć regułę gramatyczną.
- Kryteria akceptacji:
  1. Każdy element ma przycisk/ikonę "expand" lub jest klikalny
  2. Po kliknięciu rozwija się sekcja z: explanation, context
  3. Explanation wyświetla pełne wyjaśnienie błędu
  4. Context pokazuje pełne zdanie, w którym wystąpił błąd
  5. Możliwość zwinięcia szczegółów
  6. Stan rozwinięcia/zwinięcia zachowuje się przy scrollowaniu

US-017: Zmiana statusu pojedynczego błędu

- Tytuł: Aktualizacja statusu błędu (To Learn / Learning / Mastered)
- Opis: Jako użytkownik pracujący nad błędem chcę zmienić jego status, aby śledzić moje postępy w nauce.
- Kryteria akceptacji:
  1. Przy każdym elemencie są przyciski/dropdown dla statusów: To Learn, Learning, Mastered
  2. Aktualny status jest wizualnie wyróżniony
  3. Single-click na status natychmiast aktualizuje bazę danych
  4. Wizualne potwierdzenie zmiany (zmiana koloru, animacja)
  5. Możliwość przejścia z To Learn bezpośrednio do Mastered (bez zatrzymywania się na Learning)
  6. Zmiana statusu aktualizuje liczniki na Dashboard

US-018: Filtrowanie po statusie

- Tytuł: Wyświetlanie tylko błędów o określonym statusie
- Opis: Jako użytkownik chcę filtrować błędy po statusie, aby skupić się na błędach do nauki lub zobaczyć co już opanowałem.
- Kryteria akceptacji:
  1. Dropdown lub przyciski filtru: All / To Learn / Learning / Mastered
  2. Po wybraniu filtru lista pokazuje tylko elementy z wybranym statusem
  3. Licznik aktualizuje się: "X items (filtered)" lub "Showing X To Learn items"
  4. Filtr zachowuje się przy odświeżeniu strony (query param lub localStorage)
  5. Możliwość resetowania filtru do "All"
  6. Domyślnie wyświetlane "All"

US-019: Filtrowanie po typie błędu

- Tytuł: Wyświetlanie błędów z określonej kategorii
- Opis: Jako użytkownik chcę filtrować błędy po kategorii (Grammar, Articles, etc.), aby skupić się na konkretnym obszarze gramatycznym.
- Kryteria akceptacji:
  1. Dropdown lub multi-select z 8 kategoriami błędów
  2. Po wybraniu kategorii lista pokazuje tylko błędy tego typu
  3. Możliwość wybrania wielu kategorii jednocześnie
  4. Licznik aktualizuje się zgodnie z filtrem
  5. Możliwość łączenia filtru typu z filtrem statusu
  6. Reset filtrów przywraca widok "All"

US-020: Sortowanie listy błędów

- Tytuł: Zmiana kolejności wyświetlania błędów
- Opis: Jako użytkownik chcę sortować listę błędów według różnych kryteriów, aby łatwiej znaleźć interesujące mnie elementy.
- Kryteria akceptacji:
  1. Dropdown sortowania z opcjami: Date added (newest), Date added (oldest), Type (A-Z), Status, Seen count (most frequent)
  2. Po wybraniu opcji lista jest natychmiast przesortowana
  3. Domyślne sortowanie: Date added (newest)
  4. Sortowanie działa razem z filtrami
  5. Wybór sortowania zapisuje się w sesji użytkownika

US-021: Wyświetlanie licznika seen count

- Tytuł: Zobacz ile razy popełniłem ten sam błąd
- Opis: Jako użytkownik chcę widzieć przy każdym błędzie ile razy go popełniłem, aby zidentyfikować moje najczęstsze problemy.
- Kryteria akceptacji:
  1. Każdy element wyświetla seen count w formacie "Seen: X times" lub badge "×X"
  2. Seen count jest widoczny bez rozwijania szczegółów
  3. Dla seen count = 1: wyświetla się "Seen: 1 time" (singular)
  4. Dla seen count > 3: wizualne wyróżnienie (np. pomarańczowy badge)
  5. Możliwość sortowania po seen count

US-022: Usuwanie pojedynczego błędu

- Tytuł: Usunięcie błędu z Learning List
- Opis: Jako użytkownik chcę usunąć błąd z mojej listy, jeśli uznałem że jest nieistotny lub już go w pełni opanowałem.
- Kryteria akceptacji:
  1. Przy każdym elemencie przycisk/ikona "Delete"
  2. Po kliknięciu wyświetla się modal potwierdzenia: "Are you sure you want to delete this item?"
  3. Przyciski w modalu: "Cancel", "Delete"
  4. Po "Delete" element jest trwale usuwany z bazy danych
  5. Lista aktualizuje się bez przeładowania strony
  6. Toast/komunikat: "Item deleted"
  7. Liczniki na Dashboard są aktualizowane

US-023: Zaznaczanie wielu błędów (bulk selection)

- Tytuł: Wybór wielu błędów do grupowych akcji
- Opis: Jako użytkownik z długą listą błędów chcę zaznaczyć wiele elementów naraz, aby wykonać na nich zbiorczą akcję.
- Kryteria akceptacji:
  1. Checkbox przy każdym elemencie listy
  2. Checkbox "Select all" na górze listy
  3. "Select all" zaznacza wszystkie widoczne elementy (respektując filtry)
  4. Licznik zaznaczonych elementów: "X selected"
  5. Możliwość odznaczania pojedynczych elementów
  6. Zaznaczenie zachowuje się przy scrollowaniu
  7. Przycisk "Deselect all" gdy coś jest zaznaczone

US-024: Grupowa zmiana statusu (bulk action)

- Tytuł: Zmiana statusu wielu błędów jednocześnie
- Opis: Jako użytkownik, który opanował wiele błędów chcę zmienić ich status na Mastered grupowo, aby zaoszczędzić czas.
- Kryteria akceptacji:
  1. Przyciski bulk actions są widoczne gdy X > 0 elementów jest zaznaczonych
  2. Dostępne akcje: "Mark as Learning", "Mark as Mastered"
  3. Po kliknięciu wszystkie zaznaczone elementy zmieniają status
  4. Aktualizacja bazy danych w jednej transakcji lub batch
  5. Lista odświeża się bez przeładowania strony
  6. Toast: "X items updated"
  7. Checkboxy są automatycznie odznaczane po akcji
  8. Dashboard liczniki są aktualizowane

US-025: Grupowe usuwanie błędów

- Tytuł: Usunięcie wielu błędów jednocześnie
- Opis: Jako użytkownik chcę usunąć wiele błędów naraz, aby szybko oczyścić moją listę z nieistotnych elementów.
- Kryteria akceptacji:
  1. Przycisk "Delete selected" jest widoczny gdy X > 0 elementów jest zaznaczonych
  2. Po kliknięciu modal potwierdzenia: "Are you sure you want to delete X items?"
  3. Przyciski: "Cancel", "Delete all"
  4. Po "Delete all" wszystkie zaznaczone elementy są usuwane z bazy
  5. Lista aktualizuje się bez przeładowania strony
  6. Toast: "X items deleted"
  7. Liczniki na Dashboard są aktualizowane

US-026: Wykrywanie i obsługa duplikatów

- Tytuł: Zwiększenie seen count przy dodawaniu istniejącego błędu
- Opis: Jako użytkownik, który ponownie popełnił ten sam błąd chcę aby system rozpoznał duplikat i zwiększył licznik, zamiast tworzyć nowy wpis.
- Kryteria akceptacji:
  1. Przy dodawaniu błędów z Grammar Checker system porównuje pole "incorrect" z istniejącymi Learning_Items użytkownika
  2. Porównanie: case-sensitive string comparison
  3. Jeśli znaleziono match: zwiększenie seen_count o 1
  4. Jeśli znaleziono match: updated_at jest aktualizowane (optional)
  5. Jeśli brak match: utworzenie nowego Learning_Item z seen_count = 1
  6. Toast po dodaniu: "X errors added" (nie ma potrzeby tutaj informowania o duplikatach)
  7. Lista Learning List sortuje updated items na górę (jeśli sortowanie = newest)

### 5.4. Grupa: Dashboard i Analytics

US-027: Wyświetlanie ogólnych statystyk

- Tytuł: Przegląd moich postępów w nauce
- Opis: Jako użytkownik chcę zobaczyć podstawowe statystyki mojej aktywności, aby mieć przegląd moich postępów.
- Kryteria akceptacji:
  1. Dashboard wyświetla sekcję "Statistics"
  2. Statystyka: "Total Checks: X" (liczba wszystkich sprawdzeń użytkownika)
  3. Statystyka: "Learning List: X To Learn, Y Learning, Z Mastered"
  4. Wszystkie liczby są pobierane z bazy danych w czasie rzeczywistym
  5. Format prezentacji: duże liczby, czytelne labels
  6. Brak wykresów, tylko liczby
  7. Statystyki aktualizują się po każdej akcji użytkownika (sprawdzenie, zmiana statusu)

US-028: Wyświetlanie top 3 kategorii błędów

- Tytuł: Identyfikacja moich najczęstszych problemów językowych
- Opis: Jako użytkownik chcę zobaczyć które kategorie błędów popełniam najczęściej, aby wiedzieć nad czym szczególnie popracować.
- Kryteria akceptacji:
  1. Sekcja "Top Error Categories" na Dashboard
  2. Lista 3 najczęstszych kategorii błędów z liczbą wystąpień
  3. Format: "Grammar: 15, Articles: 8, Verb Tense: 6"
  4. Sortowanie malejące po liczbie wystąpień
  5. Obliczane na podstawie wszystkich Learning_Items użytkownika (wszystkie statusy)
  6. Jeśli użytkownik ma < 3 kategorii: wyświetlenie tylko istniejących
  7. Jeśli brak błędów: komunikat "No data yet"

US-029: Wyświetlanie historii sprawdzeń

- Tytuł: Przeglądanie moich poprzednich sprawdzeń tekstów
- Opis: Jako użytkownik chcę zobaczyć historię moich sprawdzeń, aby przypomnieć sobie co sprawdzałem i wrócić do szczegółów.
- Kryteria akceptacji:
  1. Sekcja "Recent Checks" na Dashboard
  2. Lista ostatnich sprawdzeń (domyślnie 10-20 ostatnich)
  3. Każdy element wyświetla: timestamp (format: "2 hours ago" lub "Jan 15, 2025"), fragment tekstu (pierwsze 50 znaków + "..."), liczba błędów, status "Added to list: Yes/No"
  4. Sortowanie: newest first
  5. Format timestamp: relative time dla ostatnich 24h, absolute date dla starszych
  6. Wizualne rozróżnienie elementów added to list vs not added (np. kolor, ikona)

US-030: Podgląd szczegółów sprawdzenia z historii

- Tytuł: Wyświetlenie pełnych wyników poprzedniego sprawdzenia
- Opis: Jako użytkownik przeglądający historię chcę kliknąć w sprawdzenie i zobaczyć pełne szczegóły, aby przypomnieć sobie co zostało wykryte.
- Kryteria akceptacji:
  1. Każdy element w historii jest klikalny
  2. Po kliknięciu otwiera się modal lub nowa strona ze szczegółami
  3. Szczegóły zawierają: timestamp, pełny original text, pełny corrected text, lista wszystkich błędów (z wyjaśnieniami)
  4. Każdy błąd wyświetla: incorrect → correct, type, explanation, context
  5. Informacja "Added to Learning List: Yes/No"
  6. Przycisk "Close" lub "Back to Dashboard"
  7. Brak możliwości edycji (widok read-only)

US-031: Dashboard/Grammar Checker dla nowego użytkownika

- Tytuł: Wyświetlenie Dashboard/Grammar Checker bez danych
- Opis: Jako nowy użytkownik, który jeszcze nic nie sprawdził chcę zobaczyć Dashboard/Grammar Checker z zachętą do rozpoczęcia, aby wiedzieć co robić.
- Kryteria akceptacji:
  1. Wszystkie statystyki pokazują 0: "Total Checks: 0", "Learning List: 0 To Learn, 0 Learning, 0 Mastered"
  2. Top Error Categories: komunikat "No data yet. Start checking your texts!"
  3. Recent Checks: komunikat "No checks yet" z przyciskiem "Check your first text"
  4. Komponent Grammar Checker jest widoczny
  5. Dashboard nie wyświetla pustych sekcji/tabeli

### 5.5. Grupa: Nawigacja i UX

US-032: Nawigacja między głównymi sekcjami

- Tytuł: Przechodzenie między stronami aplikacji
- Opis: Jako użytkownik chcę łatwo poruszać się między różnymi sekcjami aplikacji, aby efektywnie korzystać z funkcji.
- Kryteria akceptacji:
  1. Główna nawigacja zawiera linki: Dashboard/Grammar Checker, Learning List, Profile
  2. Nawigacja jest widoczna na każdej stronie (header lub sidebar)
  3. Aktywna strona jest wizualnie wyróżniona w nawigacji
  4. Nawigacja jest responsywna (hamburger menu na mobile, opcjonalnie w MVP)
  5. Kliknięcie w logo/nazwę aplikacji przenosi do Dashboard
  6. Link "Log out" jest dostępny w nawigacji

US-033: Liczniki i wskaźniki w nawigacji

- Tytuł: Wyświetlanie liczników w menu głównym
- Opis: Jako użytkownik chcę widzieć kluczowe liczniki w nawigacji, aby na bieżąco śledzić mój status.
- Kryteria akceptacji:
  1. Link "Grammar Checker" pokazuje licznik: "Grammar Checker (X/10)"
  2. Link "Learning List" pokazuje licznik: "Learning List (X)" gdzie X = liczba To Learn items
  3. Liczniki aktualizują się po każdej akcji
  4. Liczniki są opcjonalne (nice-to-have) - mogą być wyłączone jeśli komplikują layout

US-034: Responsywność podstawowa

- Tytuł: Użytkowanie aplikacji na różnych rozmiarach ekranu
- Opis: Jako użytkownik czasem korzystający z tabletu chcę aby aplikacja była użyteczna na mniejszych ekranach, chociaż głównie używam desktopa.
- Kryteria akceptacji:
  1. Layout nie psuje się na ekranach 768px+ (tablet landscape)
  2. Główne funkcje są dostępne i użyteczne na tablet
  3. Nawigacja adaptuje się do mniejszego ekranu (opcjonalnie hamburger)
  4. Teksty nie wychodzą poza ekran
  5. Przyciski są kliklane (odpowiedni touch target size)
  6. Mobile phone (< 768px) może mieć ograniczoną funkcjonalność lub gorszy UX (not critical w MVP)

US-035: Loading states

- Tytuł: Informacja o trwających operacjach
- Opis: Jako użytkownik chcę widzieć wizualne potwierdzenie że aplikacja przetwarza moją akcję, aby wiedzieć że coś się dzieje.
- Kryteria akceptacji:
  1. Podczas analizy tekstu (Grammar Checker): spinner lub skeleton loader
  2. Podczas zapisywania danych: disabled buttons + spinner
  3. Podczas ładowania listy (Learning List): skeleton lub spinner
  4. Operacje < 200ms mogą nie pokazywać loadera
  5. Brak "flashing" - loader pokazuje się dopiero po 300-500ms

US-036: Komunikaty sukcesu i błędów (Toasts)

- Tytuł: Feedback po akcjach użytkownika
- Opis: Jako użytkownik chcę otrzymywać potwierdzenie że moja akcja się powiodła lub informację o błędzie, aby mieć pewność co do stanu aplikacji.
- Kryteria akceptacji:
  1. Toast notifications dla kluczowych akcji: sukces dodania do listy, usunięcie, zmiana statusu
  2. Toast dla błędów: failed API calls, validation errors
  3. Toast znika automatycznie po 3-5 sekundach
  4. Możliwość ręcznego zamknięcia toasta (×)
  5. Toast nie blokuje interfejsu (nie jest modalem)
  6. Kolejne toasty stackują się lub zastępują poprzedni

### 5.6. Grupa: Edge cases i obsługa błędów

US-037: Próba dostępu bez logowania

- Tytuł: Przekierowanie do logowania dla niezalogowanych użytkowników
- Opis: Jako osoba niezalogowana próbująca wejść na chronioną stronę chcę zostać przekierowana do logowania, aby zrozumieć że muszę się najpierw zalogować.
- Kryteria akceptacji:
  1. Wszystkie strony poza Login i Sign up wymagają autentykacji
  2. Próba dostępu do /dashboard, /learning-list, /profile przekierowuje do /login
  3. Po zalogowaniu użytkownik jest przekierowany do oryginalnie żądanej strony
  4. Komunikat na stronie logowania: "Please log in to continue" (opcjonalnie)

US-038: Brak połączenia z bazą danych

- Tytuł: Obsługa błędu połączenia z bazą danych
- Opis: Jako użytkownik doświadczający błędu połączenia z bazą chcę zobaczyć jasny komunikat i możliwość retry, aby wiedzieć że problem jest po stronie serwera.
- Kryteria akceptacji:
  1. Przy błędzie connection do Supabase: wyświetlenie komunikatu "Service temporarily unavailable. Please try again later."
  2. Dla operacji krytycznych (login, sprawdzenie tekstu): automatyczny retry 1x
  3. Jeśli retry fail: komunikat błędu użytkownikowi
  4. Przycisk "Try again" reload'uje stronę lub powtarza akcję
  5. Dane wprowadzone przez użytkownika (textarea) są zachowane jeśli możliwe

US-039: Timeout API Grok

- Tytuł: Obsługa długiego czasu odpowiedzi API
- Opis: Jako użytkownik czekający długo na wynik analizy chcę zobaczyć komunikat o timeout, aby wiedzieć że mogę spróbować ponownie.
- Kryteria akceptacji:
  1. Timeout dla API Grok ustawiony na 30 sekund
  2. Po 30s wyświetla się komunikat "Analysis failed. Please try again."
  3. Sprawdzenie nie liczy się do dziennego limitu
  4. Użytkownik może natychmiast kliknąć "Check Grammar" ponownie
  5. Tekst w textarea jest zachowany

US-040: Pusta Learning List po usunięciu wszystkich elementów

- Tytuł: Wyświetlenie komunikatu dla pustej listy
- Opis: Jako użytkownik, który usunął wszystkie błędy z Learning List chcę zobaczyć informację że lista jest pusta i zachętę do sprawdzenia nowych tekstów.
- Kryteria akceptacji:
  1. Gdy Learning_Items użytkownika = 0: komunikat "Your Learning List is empty!"
  2. Subtext: "Start checking your texts to build your personalized error list."
  3. Przycisk "Check text" prowadzący do Grammar Checker
  4. Brak pustej tabeli/listy
  5. Filtry i sortowanie są ukryte lub disabled

US-041: Bardzo długi tekst w History

- Tytuł: Obsługa długich tekstów w wyświetlaniu historii
- Opis: Jako użytkownik, który sprawdził tekst bliski limitu 500 znaków chcę aby historia wyświetlała go w przystępny sposób.
- Kryteria akceptacji:
  1. W liście historii (Recent Checks): wyświetlanie pierwszych 50 znaków + "..."
  2. W szczegółach sprawdzenia: pełny tekst z możliwością scrollowania
  3. Długie słowa nie psują layoutu (word-break lub overflow)
  4. Tekst jest wyświetlany z zachowaniem line breaks użytkownika

US-042: Jednoczesne dodanie wielu duplikatów

- Tytuł: Obsługa przypadku gdy wszystkie błędy są duplikatami
- Opis: Jako użytkownik, który sprawdził tekst z tymi samymi błędami co wcześniej chcę zobaczyć że system je rozpoznał i zaktualizował liczniki.
- Kryteria akceptacji:
  1. Jeśli wszystkie błędy z sprawdzenia są duplikatami: zwiększenie seen_count dla każdego
  2. Toast: "X errors added" (nie ma potrzeby tutaj informowania o duplikatach)
  3. Brak tworzenia nowych Learning_Items
  4. Użytkownik jest przekierowany do Learning List
  5. Dashboard statystyki pozostają bez zmian (brak nowych items)

US-043: Reset hasła (out of scope - obsługa braku funkcji)

- Tytuł: Informacja o braku funkcji reset hasła
- Opis: Jako użytkownik, który zapomniał hasła chcę wiedzieć co mogę zrobić, ponieważ funkcja reset nie jest dostępna w MVP.
- Kryteria akceptacji:
  1. Brak linku "Forgot password?" na stronie logowania (świadome pominięcie)
  2. Jeśli użytkownik zgłosi problem z hasłem (support): manualna pomoc od admina
  3. Dla MVP (5-10 użytkowników): akceptowalne rozwiązanie

US-044: Specjalne znaki w tekście

- Tytuł: Obsługa tekstów ze specjalnymi znakami i emoji
- Opis: Jako użytkownik wklejający tekst z różnych źródeł chcę aby aplikacja poprawnie obsługiwała specjalne znaki.
- Kryteria akceptacji:
  1. Textarea akceptuje wszystkie znaki Unicode
  2. Emoji, znaki diakrytyczne, symbole są poprawnie przechowywane w bazie
  3. Licznik znaków liczy wszystkie znaki (włącznie z emoji jako 1 znak)
  4. Tekst jest poprawnie wyświetlany w wynikach i historii
  5. Brak XSS vulnerabilities (sanitization)

## 6. Metryki sukcesu

### 6.1. Metryki mierzalne

- Jakość analizy AI (false positive rate)
  - Wskaźnik: manualna weryfikacja próbki 50 sprawdzeń
  - Cel: ≥ 90% wykrytych błędów to rzeczywiste błędy
  - Metoda: twórca produktu przegląda losową próbkę i ocenia trafność

- Procent sprawdzeń zakończonych sukcesem
  - Wskaźnik: (liczba sprawdzeń bez błędu API) / (liczba wszystkich prób sprawdzenia) × 100%
  - Cel: ≥ 95%
  - Oznacza stabilność integracji z API

### 6.2. Metryki jakościowe

6.2.1. Użyteczność osobista

- Twórca produktu (Ty) aktywnie korzysta z aplikacji
  - Kryterium: min. 5 sprawdzeń tygodniowo przez 4 kolejne tygodnie
  - Oznacza że produkt rozwiązuje realny problem

    6.2.2. Intuicyjność interfejsu

- Nowy użytkownik rozumie co robić bez instrukcji
  - Metoda: obserwacja 3 nowych użytkowników podczas pierwszego użycia (user testing)
  - Kryterium: użytkownik wykonuje pierwszego sprawdzenia i dodaje błędy do listy bez pomocy/promptów
  - Maksymalnie 1 pytanie wyjaśniające na użytkownika

### 6.3. Kryteria gotowości do produkcji

Aplikacja jest gotowa do wdrożenia gdy spełnia następujące kryteria:

6.3.1. Funkcjonalność

- Wszystkie historyjki użytkownika (US-001 do US-044) są zaimplementowane
- 1 test jednostkowy (mock API Grok) przechodzi
- 1 test E2E (login → check → add to list) przechodzi
- Manualny smoke test wszystkich głównych flow przechodzi bez błędów
