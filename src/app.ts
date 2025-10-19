import express from "express";
import type { Request, Response } from "express";

export function createApp(): express.Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" } satisfies Record<string, string>);
  });

  return app;
}
