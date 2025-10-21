import express from "express";
import { tasksRouter } from "@/modules/tasks/task.routes";
import type { TaskUseCases } from "@/modules/tasks/task.usecases";
import { errorHandler } from "./middlewares/errorHandler.js";

export function createApp(usecases: TaskUseCases): express.Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/tasks", tasksRouter(usecases));

  app.use(errorHandler);

  return app;
}
