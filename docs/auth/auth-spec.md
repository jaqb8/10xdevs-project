### Specyfikacja Techniczna Modułu Autentykacji

Dokument ten opisuje architekturę i implementację funkcjonalności związanych z zarządzaniem kontami użytkowników w aplikacji Language Learning Buddy, zgodnie z wymaganiami US-001, US-002 i US-011 z dokumentu PRD.

---

### 1. Architektura Interfejsu Użytkownika

Interfejs użytkownika zostanie rozbudowany o nowe strony i komponenty do obsługi procesów autentykacji. Głównym założeniem jest rozdzielenie statycznej struktury stron (Astro) od dynamicznej logiki formularzy (React).

#### 1.1. Nowe Strony (Astro)

W katalogu `src/pages/` zostaną utworzone następujące strony:

- **`login.astro`**: Strona logowania.
  - **Layout**: Wykorzysta `src/layouts/AuthLayout.astro`.
  - **Komponent React**: Będzie renderować komponent `<LoginForm client:load />`, który obsłuży interakcję z użytkownikiem.
  - **Logika Server-Side**: Sprawdzi, czy użytkownik jest już zalogowany (na podstawie sesji w `Astro.locals.user`). Jeśli tak, przekieruje go na stronę główną (`/`).

- **`signup.astro`**: Strona rejestracji.
  - **Layout**: Wykorzysta `src/layouts/AuthLayout.astro`.
  - **Komponent React**: Będzie renderować `<SignupForm client:load />`.
  - **Logika Server-Side**: Podobnie jak na stronie logowania, zalogowany użytkownik zostanie przekierowany na stronę główną.

- **`forgot-password.astro`**: Strona do inicjowania procesu odzyskiwania hasła.
  - **Layout**: Wykorzysta `src/layouts/AuthLayout.astro`.
  - **Komponent React**: Będzie renderować `<ForgotPasswordForm client:load />`.

- **`reset-password.astro`**: Strona, na którą użytkownik zostanie przekierowany z linku w mailu w celu ustawienia nowego hasła (obsługa tokenu).
  - **Layout**: Wykorzysta `src/layouts/AuthLayout.astro`.
  - **Komponent React**: Będzie renderować `<ResetPasswordForm client:load />`. Ta strona nie będzie bezpośrednio linkowana z aplikacji.

#### 1.2. Nowy Layout

- **`src/layouts/AuthLayout.astro`**:
  - Zostanie utworzony nowy, dedykowany layout dla wszystkich stron związanych z procesem autentykacji (`/login`, `/signup`, etc.).
  - **Struktura**: Będzie zawierał podstawową strukturę HTML, sekcję `<head>` (zduplikowaną z `Layout.astro` w celu spójności meta tagów i stylów globalnych) oraz komponent `<Toaster />`.
  - **Brak Nawigacji**: W przeciwieństwie do `Layout.astro`, **nie będzie** renderował komponentu `<Header />`.
  - **Stylowanie**: Umożliwi łatwe centrowanie zawartości (formularzy) na stronie, co jest typowe dla widoków autentykacji.

#### 1.3. Nowe Komponenty Formularzy (React)

W katalogu `src/components/features/auth/` zostaną utworzone nowe, interaktywne komponenty React do obsługi formularzy.

- **`LoginForm.tsx`**:
  - **Pola**: Email, Hasło.
  - **Walidacja**: Po stronie klienta z użyciem biblioteki `zod` i `react-hook-form` w celu zapewnienia natychmiastowego feedbacku dla użytkownika (np. walidacja formatu e-mail, wymagane pola).
  - **Obsługa zdarzeń**: Po submisji formularza, wyśle zapytanie `POST` do endpointu `/api/auth/login`.
  - **Komunikaty**: Będzie wyświetlać komunikaty o błędach (np. "Nieprawidłowy email lub hasło") oraz stany ładowania. Po pomyślnym zalogowaniu, przekieruje użytkownika na stronę główną (`/`) za pomocą `window.location.href`.

- **`SignupForm.tsx`**:
  - **Pola**: Email, Hasło, Potwierdzenie hasła.
  - **Walidacja**: Walidacja `zod` i `react-hook-form` (m.in. sprawdzanie, czy hasła są identyczne).
  - **Obsługa zdarzeń**: Wyśle zapytanie `POST` do `/api/auth/signup`.
  - **Komunikaty**: Po pomyślnej rejestracji, wyświetli komunikat informujący o konieczności potwierdzenia adresu e-mail i przekieruje na stronę logowania. Obsłuży również błędy, np. "Użytkownik o tym adresie e-mail już istnieje".

- **`ForgotPasswordForm.tsx`**:
  - **Pola**: Email.
  - **Obsługa zdarzeń**: Wyśle zapytanie `POST` do `/api/auth/forgot-password`.
  - **Komunikaty**: Po wysłaniu formularza, poinformuje użytkownika, że jeśli konto istnieje, link do resetu hasła został wysłany na podany adres.

- **`ResetPasswordForm.tsx`**:
  - **Pola**: Nowe hasło, Potwierdzenie nowego hasła.
  - **Obsługa zdarzeń**: Wyśle zapytanie `POST` do `/api/auth/reset-password`, zawierając nowe hasło. Token potrzebny do resetu będzie zarządzany przez Supabase SDK po stronie klienta.
  - **Komunikaty**: Poinformuje o pomyślnej zmianie hasła i przekieruje na stronę logowania.

#### 1.3. Aktualizacja Istniejących Komponentów

- **`src/components/layout/Header.tsx`**:
  - Komponent zostanie zmodyfikowany, aby nie przyjmować danych użytkownika przez propsy. Zamiast tego, będzie korzystał z klienckiego store'a Zustand (`useAuthStore`) do pobierania informacji o stanie uwierzytelnienia i danych zalogowanego użytkownika (`isAuth`, `user`). Na podstawie tych danych będzie dynamicznie renderował odpowiednie menu (dla gościa lub zalogowanego użytkownika).

- **`src/layouts/Layout.astro`**:
  - Pozostanie głównym layoutem aplikacji dla widoków związanych z głównymi funkcjami aplikacji (dla widoków `/`, `/learning-list` itp.).
  - Zostanie z niego usunięta logika warunkowego renderowania nagłówka (`hideHeader`) oraz przekazywanie propsa `user` do komponentu `Header`, co uprości jego kod.
  - Jego główną odpowiedzialnością, oprócz renderowania widoku aplikacji z nawigacją, będzie **inicjalizacja stanu Zustand po stronie klienta.** Wewnątrz layoutu zostanie umieszczony skrypt, który pobierze dane użytkownika z `Astro.locals.user` i użyje ich do zainicjowania `authStore` przy pierwszym ładowaniu strony. Zapewni to synchronizację stanu serwerowego z klienckim.

- **`src/components/features/AnalysisResult.tsx` (lub analogiczny komponent)**:
  - Komponent odpowiedzialny za wyświetlanie wyników analizy i przycisku "Dodaj do listy do nauki" zostanie zaktualizowany.
  - Będzie korzystał ze store'a `useAuthStore` do sprawdzania statusu zalogowania (`isAuth`).
  - Przycisk "Dodaj do listy do nauki" będzie renderowany warunkowo:
    - Jeśli `isAuth` jest `true`, przycisk będzie miał tekst "Dodaj do listy..." i standardową funkcjonalność.
    - Jeśli `isAuth` jest `false`, przycisk będzie miał tekst "Zaloguj się, aby dodać do listy" i po kliknięciu będzie przekierowywał użytkownika na stronę `/login`.

---

### 2. Logika Backendowa

Backend będzie oparty o API routes w Astro, które będą komunikować się z Supabase Auth.

#### 2.1. Endpointy API

W katalogu `src/pages/api/auth/` zostaną utworzone następujące endpointy:

- **`login.ts` (`POST /api/auth/login`)**:
  - **Model Danych (Request)**: `SignInCommand` (`{ email: string, password: string }`).
  - **Walidacja**: Użycie `zod` do walidacji payloadu.
  - **Logika**: Wywoła `supabase.auth.signInWithPassword()`. W przypadku sukcesu, sesja (w formie cookies) zostanie automatycznie utworzona przez Supabase SDK.
  - **Odpowiedź**: Zwróci `200 OK` z danymi użytkownika (`SignedInUserDto`) lub odpowiedni kod błędu (np. `401 Unauthorized` dla błędnych danych).

- **`signup.ts` (`POST /api/auth/signup`)**:
  - **Model Danych (Request)**: `SignUpCommand` (`{ email: string, password: string }`).
  - **Walidacja**: `zod`.
  - **Logika**: Wywoła `supabase.auth.signUp()`. Supabase domyślnie wyśle e-mail z linkiem potwierdzającym.
  - **Odpowiedź**: Zwróci `201 Created` z danymi nowo utworzonego użytkownika (`UserDto`) lub `409 Conflict`, jeśli użytkownik już istnieje.

- **`logout.ts` (`POST /api/auth/logout`)**:
  - **Logika**: Wywoła `supabase.auth.signOut()`. Spowoduje to unieważnienie tokenów i usunięcie cookies sesyjnych.
  - **Odpowiedź**: Zwróci `302 Found` z przekierowaniem na stronę główną (`/`).

- **`forgot-password.ts` (`POST /api/auth/forgot-password`)**:
  - **Model Danych (Request)**: `{ email: string }`.
  - **Logika**: Wywoła `supabase.auth.resetPasswordForEmail()`.
  - **Odpowiedź**: Zawsze zwróci `200 OK`, aby nie ujawniać, czy dany adres e-mail istnieje w bazie.

- **`callback.ts` (`GET /api/auth/callback`)**:
  - **Logika**: Ten endpoint jest potrzebny do obsłużenia przekierowania od Supabase po kliknięciu linku weryfikacyjnego w e-mailu. Supabase SDK po stronie serwera (`supabase.auth.exchangeCodeForSession()`) wymieni kod autoryzacyjny z adresu URL na sesję użytkownika.
  - **Przekierowanie**: Po pomyślnej wymianie kodu, sesja użytkownika zostanie utworzona, a on sam zostanie przekierowany na stronę główną (`/`), będąc już zalogowanym. To realizuje wymaganie `US-001` dotyczące automatycznego logowania po rejestracji.

#### 2.2. Modele Danych

W pliku `src/types.ts` istnieją już odpowiednie definicje (`SignUpCommand`, `SignInCommand`, `UserDto`, `SignedInUserDto`), które zostaną wykorzystane.

---

### 3. System Autentykacji

Cały system będzie oparty na Supabase Auth i jego integracji z Astro.

#### 3.1. Konfiguracja Supabase

- **Szablony e-mail**: W panelu Supabase zostaną skonfigurowane szablony e-maili dla potwierdzenia rejestracji i resetu hasła.
- **Adres URL aplikacji**: W ustawieniach Supabase Auth zostanie podany adres URL wdrożonej aplikacji, aby linki w e-mailach były generowane poprawnie.

#### 3.2. Aktualizacja Middleware (`src/middleware/index.ts`)

Obecne zamockowane dane użytkownika zostaną zastąpione rzeczywistą logiką autentykacji.

- Middleware przy każdym żądaniu będzie próbował pobrać sesję użytkownika z cookies za pomocą `supabase.auth.getUser()`.
- Jeśli sesja jest aktywna, dane użytkownika (`user`) zostaną zmapowane do `UserViewModel` i zapisane w `context.locals.user`.
- Jeśli sesja nie istnieje, `context.locals.user` zostanie ustawione na `null`.
- Strona `/learning-list` wymaga autentykacji. Middleware sprawdza `user` i automatycznie przekierowuje niezalogowanych użytkowników do `/login`.
- Strona główna `/` jest dostępna dla wszystkich użytkowników (zalogowanych i niezalogowanych). Przycisk "Dodaj do listy do nauki" jest warunkowo renderowany w zależności od stanu autentykacji (sprawdzanego przez Zustand store po stronie klienta).

#### 3.3. Zarządzanie Sesją

- Supabase Auth SDK automatycznie zarządza sesją użytkownika za pomocą bezpiecznych, serwerowych cookies (`httpOnly`). Nie ma potrzeby ręcznego zarządzania tokenami JWT po stronie klienta.
- Klient Supabase w Astro (`context.locals.supabase`) będzie automatycznie uwierzytelniony na podstawie cookies z przychodzącego żądania, co zapewni bezpieczny dostęp do danych w endpointach API.

#### 3.5. Zarządzanie Stanem Klienckim (Zustand)

- W celu zapewnienia spójnego stanu uwierzytelnienia w interaktywnych komponentach React, zostanie wdrożony globalny store oparty o bibliotekę Zustand.
- **Lokalizacja**: `src/lib/stores/auth.store.ts`
- **Struktura Store'a**:
  - `state`: `{ user: UserViewModel | null, isAuth: boolean }`
  - `actions`: `{ setUser: (user: UserViewModel | null) => void }`
- **Inicjalizacja**: Stan store'a będzie inicjalizowany w głównym layoucie (`Layout.astro`) na podstawie danych serwerowych (`Astro.locals.user`), co zapewni spójność między serwerem a klientem przy pierwszym renderowaniu strony. W `AuthLayout.astro` store będzie inicjalizowany z wartością `null` dla użytkownika.

#### 3.4. Kluczowe Wnioski

- Architektura jest zgodna z podejściem "islands architecture" promowanym przez Astro, gdzie statyczna zawartość jest serwowana przez Astro, a interaktywność zapewniają komponenty React.
- Wykorzystanie Supabase Auth upraszcza implementację, przenosząc ciężar logiki uwierzytelniania na sprawdzoną usługę zewnętrzną.
- Middleware w Astro stanowi centralny punkt do zarządzania stanem uwierzytelnienia w całej aplikacji po stronie serwera.
- Walidacja po stronie klienta i serwera (zod) zapewnia dobre UX i bezpieczeństwo.
