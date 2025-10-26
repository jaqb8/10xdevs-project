import type { ZodError } from "zod";
import type { ApiErrorResponse } from "@/types";

export function createErrorResponse(errorCode: string, status: number, data?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ error_code: errorCode, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function createValidationErrorResponse(zodError: ZodError): Response {
  const errorCode = parseZodErrorCode(zodError);

  return createErrorResponse(errorCode, 400);
}

export function parseZodErrorCode(zodError: ZodError): string {
  const firstError = zodError.errors[0];
  return firstError?.message || "validation_error";
}

export type { ApiErrorResponse };
