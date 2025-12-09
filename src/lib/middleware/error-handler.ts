import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSecureResponse } from "./security-headers";

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: unknown;
  timestamp: string;
}

export class ApiError extends Error {
  statusCode: number;

  code: string;

  details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function buildErrorResponse(
  message: string,
  statusCode: number,
  code: string,
  details?: unknown
): NextResponse<ErrorResponse> {
  const body: ErrorResponse = {
    success: false,
    error: message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };

  return createSecureResponse(body, statusCode) as NextResponse<ErrorResponse>;
}

/**
 * Central error handling helper for API routes and Server Actions. Converts
 * thrown errors into standardized JSON responses and ensures errors are logged
 * for observability.
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return buildErrorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.details
    );
  }

  if (error instanceof ZodError) {
    return buildErrorResponse(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      }))
    );
  }

  if (error instanceof Error) {
    return buildErrorResponse(
      error.message || "Internal server error",
      500,
      "INTERNAL_ERROR"
    );
  }

  return buildErrorResponse("Unknown error", 500, "INTERNAL_ERROR");
}

export function createApiError(
  message: string,
  statusCode = 500,
  code = "INTERNAL_ERROR",
  details?: unknown
): ApiError {
  return new ApiError(message, statusCode, code, details);
}

export const badRequestError = (message: string, details?: unknown): ApiError =>
  createApiError(message, 400, "BAD_REQUEST", details);

export const unauthorizedError = (
  message: string,
  details?: unknown
): ApiError => createApiError(message, 401, "UNAUTHORIZED", details);

export const forbiddenError = (message: string, details?: unknown): ApiError =>
  createApiError(message, 403, "FORBIDDEN", details);

export const notFoundError = (message: string, details?: unknown): ApiError =>
  createApiError(message, 404, "NOT_FOUND", details);

export const rateLimitError = (message: string, resetTime?: number): ApiError =>
  createApiError(message, 429, "RATE_LIMITED", { resetTime });

export const serverError = (message: string, details?: unknown): ApiError =>
  createApiError(message, 500, "INTERNAL_ERROR", details);
