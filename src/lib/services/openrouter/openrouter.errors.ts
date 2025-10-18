import {
  ConfigurationError,
  AuthenticationError,
  RateLimitError,
  InvalidRequestError,
  ValidationError,
  NetworkError,
} from "../errors";

export class OpenRouterConfigurationError extends ConfigurationError {}

export class OpenRouterApiError extends Error {
  public readonly status: number;

  constructor(status: number) {
    super("api_error");
    this.name = "OpenRouterApiError";
    this.status = status;
  }
}

export class OpenRouterAuthenticationError extends AuthenticationError {}

export class OpenRouterRateLimitError extends RateLimitError {}

export class OpenRouterInvalidRequestError extends InvalidRequestError {}

export class OpenRouterResponseValidationError extends ValidationError {}

export class OpenRouterNetworkError extends NetworkError {}
