# Schemat Bazy Danych - Language Learning Buddy

Ten dokument przedstawia schemat bazy danych dla aplikacji Language Learning Buddy, zaprojektowany dla PostgreSQL i hostowany na platformie Supabase.

## 1. Lista tabel z kolumnami, typami danych i ograniczeniami

### Tabela: `auth.users` (Dostarczana przez Supabase)

Tabela ta jest zarządzana przez mechanizm uwierzytelniania Supabase i będzie używana do zarządzania użytkownikami. Kluczową kolumną do nawiązywania relacji jest `id`.

- **`id`**: `uuid` (Klucz główny) - Unikalny identyfikator użytkownika.
- ... (inne kolumny zarządzane przez Supabase, takie jak `email`, `encrypted_password` itd.)

### Tabela: `learning_items`

Tabela przechowuje elementy do nauki (błędy gramatyczne) zapisane przez użytkowników.

| Nazwa kolumny        | Typ danych     | Ograniczenia                                                            | Opis                                                  |
| -------------------- | -------------- | ----------------------------------------------------------------------- | ----------------------------------------------------- |
| `id`                 | `uuid`         | `PRIMARY KEY`, `default gen_random_uuid()`                              | Unikalny identyfikator elementu do nauki.             |
| `user_id`            | `uuid`         | `NOT NULL`, `FOREIGN KEY` references `auth.users(id)` ON DELETE CASCADE | Identyfikator użytkownika, do którego należy element. |
| `original_sentence`  | `text`         | `NOT NULL`                                                              | Pełne zdanie, w którym wystąpił błąd.                 |
| `corrected_sentence` | `text`         | `NOT NULL`                                                              | Poprawiona wersja zdania.                             |
| `explanation`        | `varchar(150)` | `NOT NULL`                                                              | Krótkie wyjaśnienie błędu (maks. 150 znaków).         |
| `created_at`         | `timestamptz`  | `NOT NULL`, `default now()`                                             | Znacznik czasu utworzenia elementu.                   |

## 2. Relacje między tabelami

- **`auth.users` i `learning_items`**: Występuje relacja **jeden-do-wielu**.
  - Jeden użytkownik (`auth.users`) może mieć wiele elementów do nauki (`learning_items`).
  - Każdy element do nauki (`learning_items`) należy do dokładnie jednego użytkownika.
  - Relacja jest ustanowiona za pomocą klucza obcego `learning_items.user_id` odwołującego się do `auth.users.id`. Klauzula `ON DELETE CASCADE` zapewnia, że usunięcie użytkownika spowoduje automatyczne usunięcie wszystkich powiązanych z nim elementów do nauki.

## 3. Indeksy

W celu optymalizacji wydajności zapytań, zwłaszcza podczas pobierania listy "Do nauki" posortowanej według daty utworzenia.

- **Indeks na `learning_items`**: Złożony indeks na tabeli `learning_items`.
  - **Kolumny**: `(user_id, created_at DESC)`
  - **Cel**: Indeks ten znacząco przyspiesza zapytania filtrujące po `user_id` i sortujące wyniki po `created_at` w porządku malejącym, co jest głównym zapytaniem do wyświetlania listy.

## 4. Polityki PostgreSQL (Row-Level Security)

Aby zapewnić prywatność i bezpieczeństwo danych, na tabeli `learning_items` zostanie włączony mechanizm Row-Level Security (RLS). Poniższe polityki gwarantują, że użytkownicy mogą wchodzić w interakcje wyłącznie z własnymi danymi.

- **Włączenie RLS**:

  ```sql
  ALTER TABLE learning_items ENABLE ROW LEVEL SECURITY;
  ```

- **Polityka dla `SELECT`**: Umożliwia użytkownikom odczytywanie własnych elementów.

  ```sql
  CREATE POLICY "Enable users to read their own learning items"
  ON learning_items FOR SELECT
  USING (auth.uid() = user_id);
  ```

- **Polityka dla `INSERT`**: Umożliwia użytkownikom dodawanie nowych elementów dla siebie.

  ```sql
  CREATE POLICY "Enable users to insert their own learning items"
  ON learning_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  ```

- **Polityka dla `UPDATE`**: Umożliwia użytkownikom aktualizowanie własnych elementów.

  ```sql
  CREATE POLICY "Enable users to update their own learning items"
  ON learning_items FOR UPDATE
  USING (auth.uid() = user_id);
  ```

- **Polityka dla `DELETE`**: Umożliwia użytkownikom usuwanie własnych elementów.
  ```sql
  CREATE POLICY "Enable users to delete their own learning items"
  ON learning_items FOR DELETE
  USING (auth.uid() = user_id);
  ```

## 5. Dodatkowe uwagi projektowe

- **Uwierzytelnianie**: System w pełni polega na wbudowanym mechanizmie uwierzytelniania Supabase. Nie jest potrzebna osobna tabela `users`.
- **Usuwanie danych**: Usuwanie elementów z listy "Do nauki" jest realizowane jako trwałe usunięcie (hard delete), co oznacza, że wiersze są na stałe usuwane z tabeli `learning_items`.
