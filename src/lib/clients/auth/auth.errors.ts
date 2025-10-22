export function mapAuthErrorCodeToMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    validation_error_invalid_email: "Nieprawidłowy format adresu email.",
    validation_error_password_too_short: "Hasło musi mieć co najmniej 6 znaków.",
    authentication_error_invalid_credentials: "Nieprawidłowy email lub hasło.",
    authentication_error_email_not_confirmed: "Adres email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową.",
    authentication_error_user_already_exists: "Użytkownik o tym adresie email już istnieje.",
    authentication_error_weak_password: "Hasło jest zbyt słabe. Użyj silniejszego hasła.",
    authentication_error: "Wystąpił błąd podczas operacji. Spróbuj ponownie.",
    unknown_error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
  };

  return errorMessages[errorCode] || "Wystąpił błąd. Spróbuj ponownie.";
}

export class AuthClientError extends Error {
  constructor(public code: string) {
    super(mapAuthErrorCodeToMessage(code));
    this.name = "AuthClientError";
  }
}
