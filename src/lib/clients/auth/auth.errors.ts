export function mapAuthErrorCodeToMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    validation_error_invalid_email: "Nieprawidłowy format adresu email.",
    validation_error_password_too_short: "Hasło musi mieć co najmniej 6 znaków.",
    authentication_error_missing_code: "Brak kodu resetującego hasło. Link jest nieprawidłowy.",
    authentication_error_missing_token: "Brak tokenu resetującego hasło. Link jest nieprawidłowy.",
    authentication_error_invalid_type: "Nieprawidłowy typ tokenu.",
    authentication_error_no_session:
      "Brak aktywnej sesji. Aby zresetować hasło, kliknij w link znajdujący się w emailu z resetem hasła.",
    authentication_error_unauthorized: "Musisz być zalogowany, aby wykonać tę operację.",
    authentication_error: "Wystąpił błąd podczas operacji. Spróbuj ponownie.",
    unknown_error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
    invalid_credentials: "Nieprawidłowy email lub hasło.",
    email_not_confirmed: "Adres email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową.",
    user_not_found: "Użytkownik nie został znaleziony.",
    email_exists: "Użytkownik o tym adresie email już istnieje.",
    user_already_exists: "Użytkownik o tym adresie email już istnieje.",
    weak_password: "Hasło jest zbyt słabe. Użyj silniejszego hasła.",
    same_password: "Nowe hasło nie może być takie samo jak stare.",
    otp_expired: "Kod resetujący hasło wygasł. Poproś o nowy link.",
    otp_disabled: "Resetowanie hasła jest wyłączone.",
    session_not_found: "Sesja nie została znaleziona. Zaloguj się ponownie.",
    session_expired: "Sesja wygasła. Zaloguj się ponownie.",
    refresh_token_not_found: "Token odświeżania nie został znaleziony.",
    refresh_token_already_used: "Token odświeżania został już użyty.",
    user_banned: "Konto użytkownika zostało zablokowane.",
    over_request_rate_limit: "Zbyt wiele prób. Spróbuj ponownie później.",
    over_email_send_rate_limit: "Zbyt wiele wysłanych emaili. Spróbuj ponownie później.",
    signup_disabled: "Rejestracja jest wyłączona.",
    email_provider_disabled: "Logowanie przez email jest wyłączone.",
    validation_failed: "Walidacja danych nie powiodła się.",
    bad_jwt: "Nieprawidłowy token JWT.",
    captcha_failed: "Weryfikacja CAPTCHA nie powiodła się.",
    email_address_invalid: "Nieprawidłowy adres email.",
    email_address_not_authorized: "Ten adres email nie jest autoryzowany.",
    feature_not_available: "Ta funkcja jest niedostępna.",
  };

  return errorMessages[errorCode] || "Wystąpił błąd. Spróbuj ponownie.";
}

export class AuthClientError extends Error {
  constructor(public code: string) {
    super(mapAuthErrorCodeToMessage(code));
    this.name = "AuthClientError";
  }
}
