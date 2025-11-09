# Dokumentacja testowania analityki PostHog

## Przegląd

Aplikacja używa PostHog do zbierania metryk dotyczących zachowań użytkowników. Ten dokument opisuje jak testować funkcjonalność analityki zarówno lokalnie, jak i w środowisku CI/CD.

## Konfiguracja środowiska

### Zmienne środowiskowe

Aplikacja wymaga następujących zmiennych środowiskowych dla PostHog:

- `POSTHOG_PROJECT_API_KEY` - Klucz API projektu PostHog (wymagany dla serwera)
- `POSTHOG_HOST` - Host PostHog (opcjonalny, domyślnie `https://us.posthog.com`)
- `POSTHOG_DISABLED` - Wyłącza PostHog gdy ustawione na `"true"` (opcjonalne)
- `PUBLIC_POSTHOG_PROJECT_API_KEY` - Klucz API dostępny w przeglądarce (wymagany dla klienta)
- `PUBLIC_POSTHOG_HOST` - Host PostHog dla klienta (opcjonalny)
- `PUBLIC_POSTHOG_DISABLED` - Wyłącza klienta PostHog gdy ustawione na `"true"` (opcjonalne)

### Wyłączenie PostHog w środowisku testowym

W środowisku CI/CD lub lokalnym testowaniu, PostHog jest automatycznie wyłączony gdy brakuje kluczy API lub gdy `POSTHOG_DISABLED=true`. W takim przypadku wszystkie funkcje analityczne działają w trybie no-op (nie wykonują żadnych operacji).

## Mockowanie PostHog w testach jednostkowych

### Przykład mockowania klienta serwerowego

```typescript
import { vi } from "vitest";
import { captureServerEvent } from "@/lib/analytics/posthog.server";

vi.mock("@/lib/analytics/posthog.server", () => ({
  captureServerEvent: vi.fn(),
}));

describe("Analytics", () => {
  it("should track user signup", async () => {
    const { captureServerEvent } = await import("@/lib/analytics/posthog.server");
    const { trackUserSignup } = await import("@/lib/analytics/events");

    trackUserSignup({
      user_id: "test-user-id",
      email_domain: "example.com",
    });

    expect(captureServerEvent).toHaveBeenCalledWith(
      "user_signup",
      expect.objectContaining({
        user_id: "test-user-id",
        email_domain: "example.com",
      })
    );
  });
});
```

### Przykład mockowania klienta przeglądarkowego

```typescript
import { vi } from "vitest";

vi.mock("@/lib/analytics/posthog.client", () => ({
  initPosthogClient: vi.fn(),
  captureClientEvent: vi.fn(),
}));
```

## Testowanie eventów w endpointach API

### Scenariusze testowe

1. **Rejestracja użytkownika** (`POST /api/auth/signup`)
   - Sprawdź, czy event `user_signup` jest wysyłany po pomyślnej rejestracji
   - Sprawdź, czy event zawiera `user_id` i `email_domain`

2. **Logowanie** (`POST /api/auth/login`)
   - Sprawdź, czy event `user_login` jest wysyłany po pomyślnym logowaniu
   - Sprawdź, czy event zawiera `user_id` i `email_domain`

3. **Wylogowanie** (`POST /api/auth/logout`)
   - Sprawdź, czy event `user_logout` jest wysyłany po wylogowaniu
   - Sprawdź, czy event zawiera `user_id`

4. **Analiza tekstu** (`POST /api/analyze`)
   - Sprawdź, czy event `text_analysis_requested` jest wysyłany przed analizą
   - Sprawdź, czy event `text_analysis_completed` jest wysyłany po sukcesie
   - Sprawdź, czy event `text_analysis_failed` jest wysyłany w przypadku błędu
   - Sprawdź, czy eventy zawierają `user_id`, `mode`, `text_length`

5. **Dodanie elementu do nauki** (`POST /api/learning-items`)
   - Sprawdź, czy event `learning_item_added` jest wysyłany po dodaniu
   - Sprawdź, czy event zawiera `user_id`, `item_id`, `mode`

6. **Usunięcie elementu** (`DELETE /api/learning-items/:id`)
   - Sprawdź, czy event `learning_item_removed` jest wysyłany po usunięciu
   - Sprawdź, czy event zawiera `user_id`, `item_id`, `mode`

## Weryfikacja eventów w przeglądarce

### DevTools

1. Otwórz narzędzia deweloperskie przeglądarki (F12)
2. Przejdź do zakładki "Network"
3. Filtruj żądania zawierające "posthog" lub "i.posthog.com"
4. Sprawdź, czy żądania są wysyłane po wykonaniu akcji użytkownika

### Konsola PostHog

1. Zaloguj się do panelu PostHog
2. Przejdź do sekcji "Events" lub "Live events"
3. Sprawdź, czy eventy pojawiają się w czasie rzeczywistym

## Checklista QA

- [ ] Eventy są wysyłane po rejestracji użytkownika
- [ ] Eventy są wysyłane po logowaniu
- [ ] Eventy są wysyłane po wylogowaniu
- [ ] Eventy analizy tekstu są wysyłane przed i po analizie
- [ ] Eventy błędów analizy są wysyłane w przypadku niepowodzenia
- [ ] Eventy dodania elementu są wysyłane po dodaniu do listy
- [ ] Eventy usunięcia elementu są wysyłane po usunięciu z listy
- [ ] PostHog działa w trybie no-op gdy brakuje kluczy API
- [ ] PostHog nie powoduje błędów w środowisku CI/CD
- [ ] Wszystkie eventy zawierają wymagane właściwości (`user_id`, `mode`, itp.)

## Rozwiązywanie problemów

### Eventy nie są wysyłane

1. Sprawdź, czy zmienne środowiskowe są poprawnie ustawione
2. Sprawdź konsolę przeglądarki pod kątem błędów JavaScript
3. Sprawdź logi serwera pod kątem błędów PostHog
4. Upewnij się, że PostHog nie jest wyłączony (`POSTHOG_DISABLED` nie jest ustawione na `"true"`)

### Błędy w środowisku CI/CD

1. Upewnij się, że PostHog działa w trybie no-op gdy brakuje kluczy API
2. Sprawdź, czy wszystkie funkcje analityczne mają fallback na no-op
3. Sprawdź logi testów pod kątem błędów związanych z PostHog

