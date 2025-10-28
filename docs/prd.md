# Dokument wymagań produktu (PRD) - Language Learning Buddy

## 1. Przegląd produktu

Language Learning Buddy to aplikacja internetowa w wersji MVP (Minimum Viable Product), zaprojektowana jako osobisty asystent dla osób uczących się języka angielskiego. Głównym celem narzędzia jest pomoc w identyfikacji i świadomym korygowaniu powtarzających się błędów gramatycznych i językowych popełnianych w piśmie. Aplikacja analizuje krótkie teksty dostarczone przez użytkownika, podświetla potencjalne błędy i pozwala na manualne dodawanie ich do spersonalizowanej listy "Do nauki". W przeciwieństwie do standardowych narzędzi do korekty, Language Learning Buddy kładzie nacisk na proces aktywnego uczenia się, dając użytkownikowi pełną kontrolę nad tym, które zagadnienia chce zapisać i przeanalizować w przyszłości.

## 2. Problem użytkownika

Uczący się języka angielskiego często nie są świadomi powtarzających się błędów gramatycznych i językowych, które popełniają w pisowni. Standardowe korektory często poprawiają tekst automatycznie, nie dając użytkownikowi szansy na świadomą naukę i zrozumienie, dlaczego dana forma jest niepoprawna. Brakuje prostego narzędzia, które nie tylko wskazuje błędy, ale także pozwala użytkownikowi świadomie tworzyć spersonalizowaną listę zagadnień do dalszej nauki, wspierając tym samym proces eliminowania złych nawyków językowych.

## 3. Wymagania funkcjonalne

### 3.1. System kont użytkowników

- Użytkownicy mogą zakładać konto za pomocą adresu e-mail i hasła.
- Użytkownicy mogą logować się na swoje konto.
- Wszystkie dane, w tym spersonalizowana lista "Do nauki", są trwale powiązane z kontem użytkownika.

### 3.2. Analiza tekstu

- Aplikacja udostępnia interfejs z jednym polem tekstowym do wprowadzania tekstu w języku angielskim.
- Użytkownik ma możliwość wyboru trybu analizy tekstu spośród dostępnych opcji (np. "gramatyka i ortografia", "mowa potoczna").
- Wprowadzany tekst jest ograniczony do 500 znaków.
- Przycisk "Analizuj" inicjuje proces sprawdzania tekstu przez zewnętrzny model AI (`google/gemini-2.0-flash-001`).
- Po analizie, potencjalne błędy są wizualnie podświetlane bezpośrednio w oryginalnym tekście.

### 3.3. Interakcja z błędami

- Kliknięcie na znaleziony błąd powoduje wyświetlenie krótkiego wyjaśnienia (do 500 znaków) w dedykowanym miejscu interfejsu.
- Pod wyjaśnieniem znajduje się przycisk "Dodaj do listy Do nauki", który pozwala zapisać błąd wraz z całym zdaniem kontekstowym na osobistej liście użytkownika.
- Błędy nie są dodawane do listy automatycznie; wymagana jest świadoma akcja użytkownika.

### 3.4. Lista "Do nauki"

- Aplikacja posiada osobną sekcję/widok, w której wyświetlana jest lista zapisanych błędów.
- Elementy na liście są prezentowane w porządku chronologicznym, od najnowszego do najstarszego.
- Każdy element na liście zawiera zapisane słowo/frazę oraz pełne zdanie, w którym błąd wystąpił oraz wyjaśnienie błędu.

### 3.5. Obsługa przypadków brzegowych i błędów

- Aplikacja wyświetla dedykowany komunikat, jeśli analizowany tekst nie zawiera żadnych błędów.
- Aplikacja wyświetla komunikat, jeśli wprowadzony tekst jest w języku innym niż angielski.
- W przypadku wystąpienia błędu technicznego (np. problem z połączeniem z API AI), użytkownikowi wyświetlany jest ogólny, przyjazny komunikat o problemie.

### 3.6. Struktura odpowiedzi AI

- Aplikacja jest przygotowana na przetwarzanie odpowiedzi z modelu AI w określonym formacie JSON.
- Odpowiedź zawsze zawiera pola: `original_text` (string) oraz `is_correct` (boolean).
- Jeśli `is_correct` ma wartość `false`, odpowiedź musi dodatkowo zawierać pola `corrected_text` (string) oraz `context` (string z wyjaśnieniem błędu).

## 4. Granice produktu

Następujące funkcje i cechy nie wchodzą w zakres MVP i mogą zostać rozważone w przyszłych wersjach produktu:

- Zaawansowany system do nauki, taki jak fiszki czy system inteligentnych powtórek (SRS).
- Obsługa innych języków niż angielski.
- Analiza długich tekstów (powyżej 500 znaków).
- Moduły analityczne śledzące postępy w nauce i prezentujące statystyki.
- Dedykowane aplikacje mobilne (iOS, Android).
- Automatyczne dodawanie zidentyfikowanych błędów do listy "Do nauki".
- Jakakolwiek forma monetyzacji.
- Logowanie za pośrednictwem dostawców zewnętrznych (np. Google, Facebook).

## 5. Historyjki użytkowników

### ID: US-001

- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę mieć możliwość założenia konta za pomocą mojego adresu e-mail i hasła, abym mógł zapisywać moje błędy i mieć do nich dostęp w przyszłości.
- Kryteria akceptacji:
  1. Formularz rejestracji zawiera pola na adres e-mail i hasło.
  2. System waliduje poprawność formatu adresu e-mail.
  3. Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany do głównego widoku aplikacji.
  4. System uniemożliwia rejestrację na adres e-mail, który już istnieje w bazie danych, i wyświetla odpowiedni komunikat.

### ID: US-002

- Tytuł: Logowanie do systemu
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na moje konto przy użyciu e-maila i hasła, aby uzyskać dostęp do moich zapisanych danych.
- Kryteria akceptacji:
  1. Formularz logowania zawiera pola na adres e-mail i hasło.
  2. Po pomyślnym zalogowaniu użytkownik jest przekierowany do głównego widoku aplikacji.
  3. W przypadku podania nieprawidłowego e-maila lub hasła, system wyświetla stosowny komunikat błędu.

### ID: US-003

- Tytuł: Analiza wprowadzonego tekstu
- Opis: Jako zalogowany użytkownik, chcę wkleić lub napisać krótki tekst po angielsku i uruchomić jego analizę, aby zidentyfikować potencjalne błędy.
- Kryteria akceptacji:
  1. Na głównym ekranie znajduje się pole tekstowe oraz przycisk "Analizuj".
  2. Pole tekstowe ma limit 500 znaków.
  3. Po kliknięciu przycisku "Analizuj" aplikacja wysyła tekst do analizy i informuje użytkownika o trwającym procesie (np. przez stan ładowania).
  4. Po zakończeniu analizy, wyniki są wyświetlane w interfejsie użytkownika.

### ID: US-004

- Tytuł: Wyświetlanie wyników analizy
- Opis: Jako użytkownik, po zakończeniu analizy chcę zobaczyć mój oryginalny tekst z wizualnie wyróżnionymi błędami, abym mógł łatwo je zidentyfikować.
- Kryteria akceptacji:
  1. Jeśli AI zidentyfikuje błędy (`is_correct: false`), wyświetlone jest porównanie oryginalnego tekstu z poprawionym tekstem.
  2. Widoczne jest wyjaśnienie błędu.

### ID: US-005

- Tytuł: Wyświetlanie szczegółów błędu
- Opis: Jako użytkownik, chcę zobaczyć krótkie wyjaśnienie błędu i móc zdecydować, czy chcę go zapisać.
- Kryteria akceptacji:
  1. Po analizie tekstu pojawia się wyjaśnienie błędu (`context` z odpowiedzi AI) w centralnym miejscu widoku.
  2. Pod wyjaśnieniem widoczny jest przycisk "Dodaj do listy Do nauki".
  3. Wyświetlane wyjaśnienie ma maksymalnie 500 znaków.

### ID: US-006

- Tytuł: Dodawanie błędu do listy "Do nauki"
- Opis: Jako użytkownik, po zapoznaniu się z wyjaśnieniem błędu, chcę mieć możliwość dodania go do mojej osobistej listy "Do nauki" jednym kliknięciem.
- Kryteria akceptacji:
  1. Kliknięcie przycisku "Dodaj do listy Do nauki" zapisuje błąd na koncie użytkownika.
  2. Zapisany element zawiera oryginalne zdanie, w którym wystąpił błąd.
  3. Po dodaniu błędu aplikacja wyświetla wizualne potwierdzenie (np. krótki komunikat "Dodano!").
  4. Ten sam błąd z tej samej analizy nie może być dodany wielokrotnie.

### ID: US-007

- Tytuł: Przeglądanie listy "Do nauki"
- Opis: Jako użytkownik, chcę mieć dostęp do widoku mojej listy zapisanych błędów, abym mógł je regularnie przeglądać i pracować nad ich eliminacją.
- Kryteria akceptacji:
  1. W aplikacji istnieje dedykowana sekcja lub strona "Do nauki".
  2. Lista wyświetla wszystkie zapisane przez użytkownika błędy.
  3. Elementy są posortowane chronologicznie, od najnowszego do najstarszego.
  4. Każdy element na liście jest czytelny i zawiera pełne zdanie kontekstowe.

### ID: US-007-1

- Tytuł: Usuwanie błędu z listy "Do nauki"
- Opis: Jako użytkownik, chcę mieć możliwość usunięcia błędu z mojej listy "Do nauki" jednym kliknięciem.
- Kryteria akceptacji:
  1. Kliknięcie przycisku "Usuń" z listy "Do nauki" usuwa błąd z listy użytkownika.
  2. Użytkownik otrzymuje potwierdzenie usunięcia w oknie modalnym z pytaniem, czy na pewno chce usunąć błąd.
  3. Po potwierdzeniu usunięcia, błąd jest usuwany z listy użytkownika.
  4. Użytkownik otrzymuje wizualne potwierdzenie (np. krótki komunikat "Usunięto!").

### ID: US-008

- Tytuł: Obsługa tekstu bez błędów
- Opis: Jako użytkownik, po przeanalizowaniu tekstu, który jest poprawny, chcę otrzymać jasny komunikat, że nie znaleziono w nim żadnych błędów.
- Kryteria akceptacji:
  1. Jeśli odpowiedź AI zawiera `is_correct: true`, aplikacja wyświetla komunikat, np. "Świetna robota! Nie znaleziono żadnych błędów.".
  2. W takim przypadku tekst nie zawiera porównania oryginalnego tekstu z poprawionym tekstem oraz wyjaśnienia błędu.

### ID: US-009

- Tytuł: Obsługa tekstu w języku innym niż angielski
- Opis: Jako użytkownik, jeśli przez pomyłkę wprowadzę tekst w języku innym niż angielski, chcę otrzymać informację, że aplikacja obsługuje tylko język angielski.
- Kryteria akceptacji:
  1. System (lub model AI) próbuje zidentyfikować język.
  2. Jeśli tekst nie jest w języku angielskim, wyświetlany jest komunikat, np. "Proszę wprowadzić tekst w języku angielskim.".

### ID: US-010

- Tytuł: Obsługa błędu po stronie serwera/API
- Opis: Jako użytkownik, w przypadku problemów technicznych podczas analizy, chcę zobaczyć przyjazny komunikat, informujący mnie o problemie, bez pokazywania szczegółów technicznych.
- Kryteria akceptacji:
  1. Jeśli zapytanie do API AI zakończy się błędem (np. status 500, timeout), aplikacja przechwytuje błąd.
  2. Użytkownikowi wyświetlany jest ogólny komunikat, np. "Coś poszło nie tak. Spróbuj ponownie za chwilę.".

### ID: US-011

- Tytuł: Wylogowanie z aplikacji
- Opis: Jako zalogowany użytkownik, chcę mieć możliwość wylogowania się z aplikacji, aby zabezpieczyć moje konto.
- Kryteria akceptacji:
  1. W interfejsie aplikacji znajduje się wyraźnie oznaczony przycisk lub link "Wyloguj".
  2. Po kliknięciu przycisku sesja użytkownika jest kończona.
  3. Użytkownik jest przekierowywany na stronę logowania lub stronę główną dla niezalogowanych.

### ID: US-012

- Tytuł: Wybór trybu analizy tekstu
- Opis: Jako użytkownik, chcę mieć możliwość wyboru trybu analizy (np. "gramatyka i ortografia" lub "mowa potoczna") przed wysłaniem tekstu, aby dostosować rodzaj otrzymywanych wskazówek do moich potrzeb.
- Kryteria akceptacji:
  1. W interfejsie, pod polem do wprowadzania tekstu, znajduje się rozwijana lista (dropdown) z dostępnymi trybami analizy.
  2. Domyślnie wybrany jest tryb "gramatyka i ortografia".
  3. Wybór trybu przez użytkownika jest zapamiętywany (np. w `localStorage`) i zostaje zachowany po odświeżeniu strony.
  4. Wybrany tryb jest przesyłany do backendu podczas inicjowania analizy.

### ID: US-013

- Tytuł: Otrzymywanie wyników analizy dostosowanych do wybranego trybu
- Opis: Jako użytkownik, po wybraniu trybu "mowa potoczna" i przeanalizowaniu tekstu, chcę otrzymać sugestie dotyczące nie tylko błędów gramatycznych, ale także stylu, naturalności i użycia języka potocznego.
- Kryteria akceptacji:
  1. Gdy wybrany jest tryb "mowa potoczna", system używa dedykowanego promptu do analizy stylistycznej.
  2. Wyniki analizy dla tego trybu mogą wskazywać fragmenty, które są gramatycznie poprawne, ale brzmią nienaturalnie.
  3. Wyjaśnienie błędu (`context`) informuje o aspekcie stylistycznym, a nie tylko gramatycznym.
  4. Zapisany na liście "Do nauki" element zawiera informację o trybie, w jakim został zidentyfikowany.

## 6. Metryki sukcesu

Ponieważ aplikacja w wersji MVP jest tworzona głównie na użytek własny i w celu weryfikacji koncepcji, tradycyjne metryki biznesowe (jak liczba użytkowników czy przychody) nie mają zastosowania. Kluczowe kryteria sukcesu koncentrują się na funkcjonalności i użyteczności narzędzia.

- Funkcjonalność: Aplikacja działa stabilnie i zgodnie z wymaganiami. Kluczowy proces, obejmujący rejestrację, logowanie, analizę tekstu, wyświetlanie wyników i zapisywanie błędu na liście "Do nauki", przebiega bezproblemowo i bez błędów. Aplikacja poprawnie interpretuje i prezentuje dane otrzymane z API AI.

- Użyteczność: Użytkownik testowy jest w stanie samodzielnie i intuicyjnie przejść przez cały proces analizy tekstu. Narzędzie jest postrzegane jako pomocne w identyfikacji osobistych słabych punktów językowych, a proces świadomego decydowania o zapisaniu błędu jest jasny i zgodny z zamierzoną ścieżką użytkownika.
