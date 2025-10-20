import { Router } from "express";

import type { TaskUseCases } from "@/modules/tasks/task.usecases";
import { createController } from "@/modules/tasks/task.controller";
import { requireUser } from "@/middlewares/userContext";

export const tasksRouter = (usecases: TaskUseCases): Router => {
  const router = Router();
  const controller = createController(usecases);

  router.use(requireUser);

  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);
  router.post("/:id/archive", controller.archive);
  router.post("/:id/unarchive", controller.unarchive);

  return router;
};
