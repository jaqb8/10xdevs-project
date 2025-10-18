import {
  ConfigurationError,
  AuthenticationError,
  RateLimitError,
  InvalidRequestError,
  ValidationError,
  NetworkError,
  UnknownError,
} from "../errors";

export class AnalysisConfigurationError extends ConfigurationError {}

export class AnalysisAuthenticationError extends AuthenticationError {}

export class AnalysisRateLimitError extends RateLimitError {}

export class AnalysisInvalidRequestError extends InvalidRequestError {}

export class AnalysisValidationError extends ValidationError {}

export class AnalysisNetworkError extends NetworkError {}

export class AnalysisUnknownError extends UnknownError {}
