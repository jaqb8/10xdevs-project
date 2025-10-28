# Wstępny plan implementacji: Tryby analizy tekstu

Data: 28.10.2025

## 1. Cel

Celem jest wprowadzenie nowej funkcjonalności, która pozwoli użytkownikom wybierać między różnymi trybami analizy tekstu. Na początek zostaną zaimplementowane dwa tryby:

- **Gramatyka i ortografia** (istniejąca funkcjonalność)
- **Mowa potoczna** (analiza pod kątem naturalności i stylu)

## 2. Podsumowanie decyzji architektonicznych

Poniżej znajduje się podsumowanie kluczowych decyzji technicznych i projektowych podjętych podczas sesji planistycznej.

### 2.1. Baza danych

- **Zmiana w schemacie:** Do tabeli `learning_items` zostanie dodana nowa kolumna o nazwie `analysis_mode`.
- **Typ danych i ograniczenia:** Kolumna będzie typu `TEXT`. Zamiast tworzyć osobną tabelę słownikową, co jest nadmiarowe przy małej liczbie opcji, zastosujemy ograniczenie `CHECK` na poziomie tabeli, aby dopuszczać tylko predefiniowane wartości (np. `grammar_and_spelling`, `colloquial_speech`).
- **Migracja:** Konieczne będzie stworzenie i uruchomienie nowej migracji bazy danych w Supabase w celu dodania kolumny.

### 2.2. Frontend

- **Komponent UI:** Pod polem tekstowym do analizy zostanie dodany komponent `Dropdown` (lub `Select`) z biblioteki Shadcn/ui, umożliwiający wybór trybu.
- **Zarządzanie stanem:** Wybór użytkownika będzie zapisywany w `localStorage` przeglądarki. Zapewni to, że ostatnio wybrany tryb zostanie zachowany między sesjami, poprawiając doświadczenie użytkownika.
- **Wartość domyślna:** Dla nowych użytkowników lub przy braku zapisu w `localStorage`, domyślnym trybem będzie "Gramatyka i ortografia".

### 2.3. API

- **Modyfikacja kontraktu:** Ciało żądania `POST` do endpointu `/api/analyze` zostanie rozszerzone o nowe, wymagane pole `mode`, które będzie przyjmować jedną z predefiniowanych wartości tekstowych.
- **Logika backendu:** Po stronie serwera, na podstawie wartości pola `mode`, będzie dynamicznie wybierany odpowiedni prompt systemowy, który zostanie wysłany wraz z tekstem użytkownika do modelu AI.

### 2.4. Model AI i Prompty

- **Model AI:** Oba tryby analizy będą na początkowym etapie obsługiwane przez ten sam model: `google/gemini-2.0-flash-001`. Architektura serwisu zostanie przygotowana w taki sposób, aby w przyszłości można było łatwo przypisać różne modele do różnych trybów.
- **Nowy prompt:** Zostanie utworzony nowy plik z promptem dla trybu mowy potocznej w lokalizacji `src/lib/prompts/colloquial-speech.md`.
- **Struktura odpowiedzi:** Nowy prompt będzie zawierał instrukcje wymuszające na modelu AI trzymanie się istniejącej, sztywnej struktury odpowiedzi JSON (`is_correct`, `corrected_text`, `context`), aby zapewnić pełną kompatybilność z istniejącą logiką frontendową. Model zostanie poinstruowany, aby zwracać `is_correct: false` również w sytuacjach, gdy tekst jest gramatycznie poprawny, ale nienaturalny stylistycznie.
