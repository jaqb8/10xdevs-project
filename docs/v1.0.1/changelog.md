# Language Learning Buddy v1.0.1

## Nowości

- **Ulepszona obsługa błędów autentykacji**: Wprowadzono szczegółową obsługę błędów Supabase Auth, wykorzystując kody błędów zamiast polegania na treści wiadomości. Poprawia to niezawodność i ułatwia debugowanie.
- **Lepsze komunikaty dla użytkownika**: Ulepszono formularze odzyskiwania i resetowania hasła, dodając powiadomienia (toasty) z czytelnymi komunikatami o błędach, co poprawia doświadczenie użytkownika.
- **Aktualizacja endpointów API**: Zaktualizowano endpointy związane z autentykacją, aby korzystały z nowego, ulepszonego systemu obsługi błędów.

## Naprawiono

- **Proces resetowania hasła**: Zrefaktoryzowano i naprawiono logikę resetowania hasła, aby zapewnić prawidłowe sprawdzanie sesji użytkownika i skuteczną obsługę błędów.
