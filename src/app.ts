import express from "express";

import type { TaskUseCases } from "@/modules/tasks/task.usecases";
import { tasksRouter } from "@/modules/tasks/task.routes";

export function createApp(usecases: TaskUseCases): express.Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/tasks", tasksRouter(usecases));

  return app;
}
