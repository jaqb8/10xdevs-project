import { useState, useCallback, type FormEvent, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

function mapErrorCodeToMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    validation_error_password_too_short: "Hasło musi mieć co najmniej 6 znaków.",
    authentication_error_weak_password: "Hasło jest zbyt słabe. Użyj silniejszego hasła.",
    authentication_error: "Wystąpił błąd podczas resetowania hasła. Spróbuj ponownie.",
    unknown_error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
  };

  return errorMessages[errorCode] || "Wystąpił błąd podczas resetowania hasła.";
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    setHasValidToken(!!accessToken);

    if (!accessToken) {
      toast.error("Nieprawidłowy lub wygasły link resetujący hasło.");
    }
  }, []);

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Hasło jest wymagane" }));
      return false;
    }
    if (password.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Hasło musi mieć co najmniej 6 znaków" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, password: undefined }));
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): boolean => {
    if (!confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Potwierdzenie hasła jest wymagane" }));
      return false;
    }
    if (confirmPassword !== password) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Hasła nie są identyczne" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    return true;
  };

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const isPasswordValid = validatePassword(password);
      const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

      if (!isPasswordValid || !isConfirmPasswordValid) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        });

        if (response.ok) {
          toast.success("Hasło zostało zmienione pomyślnie!");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
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
    [password, confirmPassword]
  );

  const handlePasswordBlur = useCallback(() => {
    if (password) validatePassword(password);
  }, [password]);

  const handleConfirmPasswordBlur = useCallback(() => {
    if (confirmPassword) validateConfirmPassword(confirmPassword, password);
  }, [confirmPassword, password]);

  if (!hasValidToken) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Nieprawidłowy link</CardTitle>
          <CardDescription>Link do resetowania hasła jest nieprawidłowy lub wygasł.</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full" size="lg">
            <a href="/forgot-password">Wyślij nowy link</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Ustaw nowe hasło</CardTitle>
        <CardDescription>Wprowadź nowe hasło dla swojego konta</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nowe hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              autoComplete="new-password"
              required
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={handleConfirmPasswordBlur}
              disabled={isLoading}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-destructive" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-1">
          <Button type="submit" className="w-full" disabled={isLoading} size="lg" aria-busy={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Resetowanie...
              </>
            ) : (
              <>
                <Lock className="size-4" /> Zresetuj hasło
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
