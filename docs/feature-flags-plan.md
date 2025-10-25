# Plan Implementacji Flag Funkcyjnych

## 1. Cel

Wprowadzenie systemu flag funkcyjnych w celu oddzielenia wdrożeń od wydań, co pozwoli na lepszą kontrolę nad udostępnianiem nowych funkcjonalności.

## 2. Wymagania

- **Zakres:** System powinien mieć zastosowanie na poziomie endpointów API, stron Astro oraz komponentów React.
- **Środowiska:** Wsparcie dla środowisk `local`, `integration` i `production`.
- **Konfiguracja:** Flagi będą zarządzane statycznie w pliku konfiguracyjnym w kodzie aplikacji.
- **Domyślne zachowanie:** Jeśli flaga funkcyjna nie jest jawnie zdefiniowana dla danego środowiska, powinna być traktowana jako **wyłączona**.
- **Wykrywanie środowiska:** Bieżące środowisko będzie określane na podstawie zmiennej środowiskowej `ENV_NAME` (backend) lub `PUBLIC_ENV_NAME` (frontend), z domyślną wartością `production` w przypadku braku ustawienia.
- **Początkowe flagi:**
  - `auth`: Kontroluje cały moduł uwierzytelniania.
  - `learning-items`: Kontroluje funkcjonalność listy do nauki.

## 3. Projekt Modułu

Nowy, uniwersalny moduł zostanie utworzony w `src/features`, aby hermetyzować całą logikę flag funkcyjnych.

### 3.1. Struktura Katalogów

```
src/
└── features/
    ├── feature-flags.config.ts
    └── feature-flags.service.ts
```

### 3.2. `feature-flags.config.ts`

Ten plik będzie przechowywał statyczną konfigurację wszystkich flag funkcyjnych dla różnych środowisk.

```typescript
export type Feature = "auth" | "learning-items";
export type Environment = "local" | "integration" | "production";

const featureFlagsConfig: Record<Environment, Record<Feature, boolean>> = {
  local: {
    auth: true,
    "learning-items": true,
  },
  integration: {
    auth: true,
    "learning-items": true,
  },
  production: {
    auth: false,
    "learning-items": false,
  },
};

export default featureFlagsConfig;
```

### 3.3. `feature-flags.service.ts`

Serwis ten dostarczy uniwersalną funkcję `isFeatureEnabled` do sprawdzania statusu flagi. Zostanie zaprojektowany tak, aby działał bezproblemowo zarówno po stronie serwera (izomorficznie), jak i klienta.

```typescript
import featureFlagsConfig, { type Environment, type Feature } from "./feature-flags.config";

const getEnvironment = (): Environment => {
  const env = import.meta.env.PUBLIC_ENV_NAME || import.meta.env.ENV_NAME;
  if (env === "local" || env === "integration" || env === "production") {
    return env;
  }
  return "production";
};

export const isFeatureEnabled = (feature: Feature): boolean => {
  const environment = getEnvironment();
  const environmentConfig = featureFlagsConfig[environment];

  if (!environmentConfig) {
    return false;
  }

  return environmentConfig[feature] ?? false;
};
```

## 4. Kroki Implementacji

1.  **Stworzenie modułu:**
    - [x] Utwórz katalog `src/features`.
    - [x] Utwórz i wypełnij plik `src/features/feature-flags.config.ts`.
    - [x] Utwórz i wypełnij plik `src/features/feature-flags.service.ts`.
2.  **Integracja:**
    - [x] **Endpointy API:** Zabezpiecz trasy API związane z `auth` i `learning-items` za pomocą funkcji `isFeatureEnabled`. Zwróć status `404 Not Found` lub `403 Forbidden`, jeśli funkcjonalność jest wyłączona.
    - [x] **Strony Astro:** Zabezpiecz zawartość stron takich jak `login.astro`, `signup.astro`, `reset-password.astro` i `learning-list.astro`. Jeśli odpowiednia funkcjonalność (`auth` lub `learning-items`) jest wyłączona, przekieruj użytkownika lub wyświetl komunikat o niedostępności funkcji.
    - [x] **Komponent Nagłówka:** W `Header.tsx` warunkowo renderuj elementy interfejsu użytkownika (np. przyciski logowania/rejestracji, link "Moja lista") w oparciu o stan flag `auth` i `learning-items`.

## 5. Zmienne Środowiskowe

Upewnij się, że następujące zmienne środowiskowe są poprawnie ustawione w każdym środowisku:

- `.env` (lokalnie): `ENV_NAME="local"`, `PUBLIC_ENV_NAME="local"`
- Integracja CI/CD: `ENV_NAME="integration"`, `PUBLIC_ENV_NAME="integration"`
- Produkcja CI/CD: `ENV_NAME="production"`, `PUBLIC_ENV_NAME="production"`
