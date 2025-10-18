# Plan Implementacji Usługi OpenRouter

## 1. Opis Usługi

`OpenRouterService` to moduł po stronie serwera odpowiedzialny za hermetyzację wszystkich interakcji z API OpenRouter.ai. Jego główną funkcją jest zapewnienie prostego i solidnego interfejsu do wysyłania żądań uzupełniania czatu oraz otrzymywania ustrukturyzowanych, bezpiecznych typologicznie odpowiedzi. Usługa ta będzie obsługiwać uwierzytelnianie API, formatowanie żądań, parsowanie odpowiedzi i obsługę błędów, abstrahując złożoność bazowego API od reszty aplikacji.

Została zaprojektowana do użytku wyłącznie w środowiskach serwerowych w aplikacji Astro (np. w punktach końcowych API w `src/pages/api/`), aby chronić wrażliwe dane uwierzytelniające, takie jak klucz API.

## 2. Opis Konstruktora

Usługa zostanie zaimplementowana jako klasa TypeScript w lokalizacji `src/lib/services/openrouter.service.ts`.

```typescript
import type { ZodSchema } from "zod";

class OpenRouterService {
  private readonly apiKey: string;
  private readonly siteUrl: string;
  private readonly appName: string;

  constructor(config: { apiKey: string; siteUrl: string; appName: string }) {
    if (!config.apiKey) {
      throw new Error("Brak klucza API OpenRouter. Ustaw zmienną środowiskową OPENROUTER_API_KEY.");
    }
    this.apiKey = config.apiKey;
    this.siteUrl = config.siteUrl;
    this.appName = config.appName;
  }
}
```

**Parametry:**

- `config`: Obiekt zawierający niezbędną konfigurację.
  - `apiKey`: Klucz API OpenRouter. Konstruktor rzuci `ConfigurationError`, jeśli nie zostanie podany. Wartość ta powinna być odczytywana z `import.meta.env.OPENROUTER_API_KEY`.
  - `siteUrl`: Bazowy adres URL aplikacji, używany w nagłówku `HTTP-Referer` zgodnie z zaleceniami OpenRouter. Odczytywany z `import.meta.env.ASTRO_SITE`.
  - `appName`: Nazwa aplikacji, używana w nagłówku `X-Title`. Np. "Language Learning Buddy".

## 3. Publiczne Metody i Pola

### `getChatCompletion<T>(params: ChatCompletionParams<T>): Promise<T>`

Jest to główna publiczna metoda do interakcji z API OpenRouter. Wysyła ona prompt i zwraca ustrukturyzowaną, sparsowaną i zwalidowaną odpowiedź.

**Parametry:**

- `params`: Obiekt typu `ChatCompletionParams<T>` z następującymi właściwościami:
  - `model`: `string` - Identyfikator modelu do użycia (np. `'anthropic/claude-3.5-sonnet'`).
  - `systemMessage`: `string` - Prompt systemowy kierujący zachowaniem modelu.
  - `userMessage`: `string` - Dane wejściowe od użytkownika.
  - `responseSchema`: `ZodSchema<T>` - Schemat Zod definiujący oczekiwaną strukturę JSON odpowiedzi modelu. Usługa używa go do konstruowania ładunku `response_format` i walidacji odpowiedzi. `T` jest typem generycznym wywnioskowanym ze schematu.
  - `temperature` (opcjonalnie): `number` - Temperatura próbkowania.
  - `maxTokens` (opcjonalnie): `number` - Maksymalna liczba tokenów do wygenerowania.

**Zwraca:**

- `Promise<T>`, który rozwiązuje się do sparsowanego i zwalidowanego obiektu JSON, otypowanego zgodnie z dostarczonym `responseSchema`.

**Przykład Użycia:**

```typescript
// Wewnątrz endpointu API, np. src/pages/api/analyze.ts
import { z } from "zod";
import { openRouterService } from "@/lib/services"; // Instancja singletona

const CorrectionSchema = z.object({
  corrected_sentence: z.string(),
  explanation: z.string(),
});

try {
  const result = await openRouterService.getChatCompletion({
    model: "anthropic/claude-3.5-sonnet",
    systemMessage: "Jesteś ekspertem od gramatyki. Popraw tekst użytkownika i podaj wyjaśnienie.",
    userMessage: "I has two apple.",
    responseSchema: CorrectionSchema,
    temperature: 0.5,
  });

  // `result` jest w pełni otypowany: { corrected_sentence: string; explanation: string; }
  console.log(result.corrected_sentence);
} catch (error) {
  // Obsługa specyficznych błędów z usługi
  console.error(error);
}
```

## 4. Prywatne Metody i Pola

- `private readonly apiKey: string;`
- `private readonly siteUrl: string;`
- `private readonly appName: string;`

## 5. Obsługa Błędów

Usługa będzie implementować solidną strategię obsługi błędów poprzez zdefiniowanie niestandardowych klas błędów, które rozszerzają bazową klasę `Error`. Pozwoli to kodowi konsumującemu na użycie sprawdzeń `instanceof` do eleganckiej obsługi specyficznych scenariuszy awarii.

**Niestandardowe Klasy Błędów:**

- `OpenRouterConfigurationError`: Rzucany przez konstruktor, jeśli brakuje klucza API.
- `OpenRouterApiError`: Ogólny błąd dla problemów związanych z API, zawierający kod `status`.
  - `OpenRouterAuthenticationError (rozszerza OpenRouterApiError)`: Dla błędów `401 Unauthorized`.
  - `OpenRouterRateLimitError (rozszerza OpenRouterApiError)`: Dla błędów `429 Too Many Requests`.
  - `OpenRouterInvalidRequestError (rozszerza OpenRouterApiError)`: Dla błędów `400 Bad Request`.
- `OpenRouterResponseValidationError`: Rzucany, jeśli treść odpowiedzi API nie pasuje do dostarczonego schematu Zod. Może się to zdarzyć, jeśli model nie wygeneruje prawidłowego JSON-a lub struktura jest nieprawidłowa.
- `OpenRouterNetworkError`: Rzucany w przypadku problemów na poziomie sieci (np. niepowodzenie `fetch`).

Takie podejście zapewnia, że logika punktu końcowego API może rozróżnić problem konfiguracyjny, błąd po stronie klienta (nieprawidłowe żądanie), błąd po stronie serwera (problem z API) oraz problem z wydajnością modelu (nieprawidłowy JSON).

## 6. Kwestie Bezpieczeństwa

1.  **Zarządzanie Kluczem API**: `OPENROUTER_API_KEY` musi być przechowywany bezpiecznie jako zmienna środowiskowa i nigdy nie powinien być ujawniany po stronie klienta. Usługa musi być inicjowana i używana wyłącznie na serwerze.
2.  **Sanityzacja Danych Wejściowych**: Chociaż prompty są wysyłane do zaufanego API strony trzeciej, wszelkie dane wejściowe dostarczone przez użytkownika, które są później przechowywane lub wyświetlane, powinny być sanityzowane, aby zapobiec atakom typu injection (np. XSS). Odpowiedzialne za to są punkty końcowe API korzystające z tej usługi.
3.  **Ograniczenie Liczby Żądań (Rate Limiting)**: Punkty końcowe API, które wykorzystują `OpenRouterService`, muszą być chronione przez ogranicznik liczby żądań (taki jak w `src/lib/rate-limiter.ts`), aby zapobiec nadużyciom i kontrolować koszty.
4.  **Ataki Denial-of-Service (DoS)**: Parametr `maxTokens` powinien mieć rozsądny, sztywno zakodowany górny limit w usłudze, aby uniemożliwić użytkownikom żądanie nadmiernie długich odpowiedzi, co mogłoby prowadzić do wysokich kosztów i długiego czasu odpowiedzi.

## 7. Plan Implementacji Krok po Kroku

1.  **Stworzenie Niestandardowych Typów Błędów:**
    - W nowym pliku `src/lib/services/openrouter.errors.ts` zdefiniuj niestandardowe klasy błędów, jak opisano w sekcji "Obsługa Błędów".

2.  **Implementacja Klasy Usługi:**
    - Utwórz plik `src/lib/services/openrouter.service.ts`.
    - Zaimportuj niestandardowe błędy oraz Zod.
    - Zaimplementuj klasę `OpenRouterService` z konstruktorem i publiczną metodą `getChatCompletion`.
    - Konstruktor powinien odczytywać zmienne środowiskowe i rzucać `OpenRouterConfigurationError`, jeśli brakuje klucza.
    - Metoda `getChatCompletion` będzie:
      a. Konstruować ciało żądania, w tym tablicę `messages` i obiekt `response_format` pochodzący ze schematu Zod. Użyj biblioteki, takiej jak `zod-to-json-schema`, aby przekonwertować schemat Zod na prawidłowy obiekt JSON Schema.
      b. Ustawiać wymagane nagłówki: `Authorization: Bearer ${this.apiKey}`, `Content-Type: application/json`, `HTTP-Referer: ${this.siteUrl}` oraz `X-Title: ${this.appName}`.
      c. Używać globalnego API `fetch` do wykonania żądania `POST` na adres `https://openrouter.ai/api/v1/chat/completions`.
      d. Owinąć wywołanie `fetch` w blok `try...catch`, aby obsłużyć błędy sieciowe i rzucić `OpenRouterNetworkError`.
      e. Sprawdzać kod statusu odpowiedzi i rzucać odpowiednią podklasę `OpenRouterApiError` dla odpowiedzi innych niż 200.
      f. Parsować główne ciało odpowiedzi JSON.
      g. Wyodrębniać ciąg `content` z `response.choices[0].message.content`.
      h. Parsować ciąg `content` jako JSON.
      i. Używać dostarczonej metody `responseSchema.safeParse()` do walidacji sparsowanego obiektu. Jeśli walidacja się nie powiedzie, rzucić `OpenRouterResponseValidationError`.
      j. Jeśli walidacja się powiedzie, zwrócić sparsowane dane.

3.  **Stworzenie Instancji Singletona:**
    - W nowym pliku `src/lib/services/index.ts` utwórz i wyeksportuj instancję singletona `OpenRouterService`. Zapewni to, że w całej aplikacji będzie używana jedna, współdzielona instancja, co jest wydajne i zapobiega problemom konfiguracyjnym.

    ```typescript
    // src/lib/services/index.ts
    import { OpenRouterService } from "./openrouter.service";

    export const openRouterService = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      siteUrl: import.meta.env.ASTRO_SITE,
      appName: "Language Learning Buddy",
    });
    ```

4.  **Dodanie Zmiennych Środowiskowych:**
    - Dodaj `OPENROUTER_API_KEY` do pliku `.env` oraz `ASTRO_SITE` do `.env` lub upewnij się, że jest ustawiony przez dostawcę hostingu.
    - Zaktualizuj `.env.example` o te nowe zmienne.

5.  **Instalacja Zależności:**
    - Dodaj pakiet `zod-to-json-schema`, aby konwertować schematy Zod na schematy JSON dla API OpenRouter.
    - Uruchom `npm install zod-to-json-schema`.

6.  **Integracja z Punktem Końcowym API:**
    - Zrefaktoryzuj istniejący punkt końcowy `src/pages/api/analyze.ts`.
    - Zaimportuj singleton `openRouterService`.
    - Zdefiniuj schemat Zod dla wyniku analizy.
    - Wywołaj `openRouterService.getChatCompletion` z wymaganymi parametrami.
    - Dodaj blok `try...catch`, aby obsłużyć specyficzne błędy rzucane przez usługę i zwrócić odpowiednie kody statusu HTTP (np. 500 dla błędów konfiguracyjnych, 429 dla błędów ograniczenia liczby żądań).

## 8. Zarządzanie Promptami (Najlepsze Praktyki)

Aby zachować czystość kodu i ułatwić zarządzanie oraz iterowanie promptów systemowych, zaleca się przechowywanie ich w osobnych plikach Markdown (`.md`), a nie jako stałe tekstowe (stringi) bezpośrednio w kodzie.

### Zalety

- **Separacja Odpowiedzialności:** Logika biznesowa (w plikach `.ts`) jest oddzielona od treści kreatywnej (w plikach `.md`).
- **Łatwość Edycji:** Prompty można łatwo modyfikować bez dotykania kodu aplikacji, co jest bezpieczniejsze i przyspiesza proces "prompt engineeringu".
- **Czytelność:** Długie, złożone prompty są znacznie czytelniejsze w dedykowanym pliku Markdown.

### Implementacja w Astro

Środowisko Astro (Vite) pozwala na importowanie zawartości dowolnego pliku jako surowego tekstu za pomocą sufixu `?raw`.

1.  **Struktura Plików:** Utwórz dedykowany katalog na prompty, np. `src/lib/prompts/`.
2.  **Przykładowy Prompt (`src/lib/prompts/grammar-analysis.prompt.md`):**

    ```markdown
    Jesteś ekspertem od gramatyki języka angielskiego. Twoim zadaniem jest przeanalizowanie tekstu użytkownika, zidentyfikowanie błędów gramatycznych i zasugerowanie poprawnej wersji. Odpowiadaj wyłącznie w formacie JSON zgodnym z dostarczonym schematem.
    ```

3.  **Użycie w Kodzie:** Zaimportuj plik w punkcie końcowym API i przekaż jego zawartość do usługi.

    ```typescript
    // src/pages/api/analyze.ts
    import { openRouterService } from "@/lib/services";
    import grammarPrompt from "@/lib/prompts/grammar-analysis.prompt.md?raw"; // Import jako surowy tekst

    // ...

    const result = await openRouterService.getChatCompletion({
      // ...
      systemMessage: grammarPrompt, // Przekazanie treści promptu
      // ...
    });
    ```
