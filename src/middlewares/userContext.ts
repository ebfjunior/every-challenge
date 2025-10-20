import type { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userId = req.header("X-User-Id");

  if (!userId) {
    res.status(401).json({
      error: {
        code: "MISSING_USER_ID",
        message: "X-User-Id header required",
      },
    });
    return;
  }

  req.userId = userId;
  next();
}
