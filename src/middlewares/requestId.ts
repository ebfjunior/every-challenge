import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export function requestId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const headerKey = "x-request-id";
  const incoming = req.header(headerKey);
  const id = incoming?.trim() || randomUUID();

  req.requestId = id;
  res.setHeader("X-Request-Id", id);

  next();
}
