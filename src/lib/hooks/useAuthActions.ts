import { useState } from "react";
import { toast } from "sonner";
import { authClient, AuthClientError } from "@/lib/clients/auth";
import { validateReturnUrl } from "@/lib/utils";
import type {
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "@/lib/validation/auth-schemas";

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await authClient.login(data);
      toast.success("Zalogowano pomyślnie!");

      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get("returnUrl");
      const redirectUrl = validateReturnUrl(returnUrl) ?? "/";

      window.location.href = redirectUrl;
    } catch (error) {
      if (error instanceof AuthClientError) {
        toast.error(error.message);
      } else {
        toast.error("Wystąpił błąd połączenia. Spróbuj ponownie.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await authClient.signup(data);
      toast.success("Rejestracja pomyślna! Sprawdź swoją skrzynkę pocztową, aby potwierdzić adres email.", {
        duration: 5000,
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      if (error instanceof AuthClientError) {
        toast.error(error.message);
      } else {
        toast.error("Wystąpił błąd połączenia. Spróbuj ponownie.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authClient.forgotPassword(data);
      toast.success("Jeśli konto istnieje, link do resetu hasła został wysłany na podany adres email.");
      return true;
    } catch (error) {
      if (error instanceof AuthClientError) {
        toast.error(error.message);
      } else {
        toast.error("Wystąpił błąd połączenia. Spróbuj ponownie.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authClient.resetPassword(data);
      toast.success("Hasło zostało zmienione pomyślnie! Za chwilę zostaniesz przekierowany do strony głównej.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      if (error instanceof AuthClientError) {
        toast.error(error.message);
      } else {
        toast.error("Wystąpił błąd połączenia. Spróbuj ponownie.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signup,
    forgotPassword,
    resetPassword,
    isLoading,
  };
}
