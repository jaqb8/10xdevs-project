import type {
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "@/lib/validation/auth-schemas";
import { AuthClientError } from "./auth.errors";

export const authClient = {
  async login(data: LoginFormData): Promise<void> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthClientError(errorData.error_code);
    }
  },

  async signup(data: SignupFormData): Promise<void> {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthClientError(errorData.error_code);
    }
  },

  async forgotPassword(data: ForgotPasswordFormData): Promise<void> {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthClientError(errorData.error_code);
    }
  },

  async resetPassword(data: ResetPasswordFormData): Promise<void> {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: data.password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthClientError(errorData.error_code);
    }
  },
};
