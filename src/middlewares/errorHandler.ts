import type { NextFunction, Request, Response } from "express";
import type { ZodIssue } from "zod";
import { ZodError } from "zod";

type AppError = Error & {
  status?: number;
  code?: string;
};

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
        details: (err as ZodError<unknown>).issues as ZodIssue[],
      },
    });
    return;
  }

  const status = err.status ?? 500;
  const code =
    err.code ??
    (status === 404
      ? "NOT_FOUND"
      : status === 403
        ? "FORBIDDEN"
        : "INTERNAL_ERROR");

  res.status(status).json({
    error: {
      code,
      message: err.message || "Unexpected error",
    },
  });
}
