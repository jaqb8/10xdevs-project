import { useState, useCallback, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

function mapErrorCodeToMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    validation_error_invalid_email: "Nieprawidłowy format adresu email.",
    unknown_error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
  };

  return errorMessages[errorCode] || "Wystąpił błąd. Spróbuj ponownie.";
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email jest wymagany" }));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Nieprawidłowy format email" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  };

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const isEmailValid = validateEmail(email);

      if (!isEmailValid) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          setIsSuccess(true);
          toast.success("Jeśli konto istnieje, link do resetu hasła został wysłany na podany adres email.");
        } else {
          const data = await response.json();
          const errorMessage = mapErrorCodeToMessage(data.error_code);
          toast.error(errorMessage);
        }
      } catch (error) {
        toast.error("Wystąpił błąd połączenia. Spróbuj ponownie.");
      } finally {
        setIsLoading(false);
      }
    },
    [email]
  );

  const handleEmailBlur = useCallback(() => {
    if (email) validateEmail(email);
  }, [email]);

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sprawdź swoją skrzynkę</CardTitle>
          <CardDescription>
            Jeśli konto z tym adresem email istnieje, wysłaliśmy link do resetowania hasła.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full" size="lg">
            <a href="/login">Wróć do logowania</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Zapomniałeś hasła?</CardTitle>
        <CardDescription>Wprowadź swój adres email, aby zresetować hasło</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              disabled={isLoading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              autoComplete="email"
              required
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {errors.email}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button type="submit" className="w-full" disabled={isLoading} size="lg" aria-busy={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Wysyłanie...
              </>
            ) : (
              <>
                <Mail className="size-4" /> Wyślij link resetujący
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Pamiętasz hasło?{" "}
            <a href="/login" className="text-primary hover:underline font-medium">
              Zaloguj się
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
