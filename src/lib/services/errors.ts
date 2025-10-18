export class DatabaseError extends Error {
  public readonly cause?: unknown;

  constructor(cause?: unknown) {
    super("database_error");
    this.name = "DatabaseError";
    this.cause = cause;
  }
}

export class NotFoundError extends Error {
  constructor() {
    super("not_found");
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("forbidden");
    this.name = "ForbiddenError";
  }
}

export class ConfigurationError extends Error {
  constructor() {
    super("configuration_error");
    this.name = "ConfigurationError";
  }
}

export class AuthenticationError extends Error {
  constructor() {
    super("authentication_error");
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends Error {
  constructor() {
    super("rate_limit_error");
    this.name = "RateLimitError";
  }
}

export class InvalidRequestError extends Error {
  constructor() {
    super("invalid_request_error");
    this.name = "InvalidRequestError";
  }
}

export class ValidationError extends Error {
  public readonly validationErrors?: unknown;

  constructor(validationErrors?: unknown) {
    super("validation_error");
    this.name = "ValidationError";
    this.validationErrors = validationErrors;
  }
}

export class NetworkError extends Error {
  public readonly cause?: unknown;

  constructor(cause?: unknown) {
    super("network_error");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

export class UnknownError extends Error {
  public readonly cause?: unknown;

  constructor(cause?: unknown) {
    super("unknown_error");
    this.name = "UnknownError";
    this.cause = cause;
  }
}
