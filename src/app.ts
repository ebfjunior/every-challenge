import express from "express";
import { pinoHttp } from "pino-http";

import { logger } from "@/lib/logger";
import { tasksRouter } from "@/modules/tasks/task.routes";
import type { TaskUseCases } from "@/modules/tasks/task.usecases";
import { errorHandler } from "@/middlewares/errorHandler";
import { requestId } from "@/middlewares/requestId";

export function createApp(usecases: TaskUseCases): express.Express {
  const app = express();

  app.use(express.json());
  app.use(requestId);

  if (process.env["NODE_ENV"] !== "test" && process.env["VITEST"] !== "true") {
    const loggerMiddleware = pinoHttp(logger);
    app.use(loggerMiddleware);
  }

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/tasks", tasksRouter(usecases));

  app.use(errorHandler);

  return app;
}
