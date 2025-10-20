import type { Request, Response } from "express";

import type { TaskUseCases } from "@/modules/tasks/task.usecases";
import {
  createSchema,
  updateSchema,
  type TaskStatus,
} from "@/schemas/task.schema";

interface TaskController {
  create: (req: Request, res: Response) => Promise<void>;
  list: (req: Request, res: Response) => Promise<void>;
  get: (req: Request, res: Response) => Promise<void>;
  update: (req: Request, res: Response) => Promise<void>;
  remove: (req: Request, res: Response) => Promise<void>;
  archive: (req: Request, res: Response) => Promise<void>;
  unarchive: (req: Request, res: Response) => Promise<void>;
}

export function createController(usecases: TaskUseCases): TaskController {
  return {
    async create(req: Request, res: Response) {
      const userId = req.userId!;
      const body = createSchema.parse(req.body);
      const task = await usecases.createTask(userId, {
        title: body.title,
        description: body.description,
        status: body.status ?? undefined,
      });
      res.status(201).json({ data: task });
    },

    async list(req: Request, res: Response) {
      const userId = req.userId!;
      const tasks = await usecases.searchTasks(userId, {
        userId,
        status: (req.query["status"] as TaskStatus) ?? undefined,
      });
      res.json({ data: tasks });
    },

    async get(req: Request, res: Response) {
      const userId = req.userId!;
      const { id } = req.params;
      const task = await usecases.showTask(userId, id!);
      res.json({ data: task });
    },

    async update(req: Request, res: Response) {
      const userId = req.userId!;
      const { id } = req.params;
      const body = updateSchema.parse(req.body);
      const task = await usecases.updateTask(userId, id!, {
        title: body.title,
        description: body.description,
        status: body.status as TaskStatus,
      });
      res.json({ data: task });
    },

    async remove(req: Request, res: Response) {
      const userId = req.userId!;
      const { id } = req.params;
      await usecases.destroyTask(userId, id!);
      res.status(204).send();
    },

    async archive(req: Request, res: Response) {
      const userId = req.userId!;
      const { id } = req.params;
      const task = await usecases.archiveTask(userId, id!);
      res.json({ data: task });
    },

    async unarchive(req: Request, res: Response) {
      const userId = req.userId!;
      const { id } = req.params;
      const task = await usecases.unarchiveTask(userId, id!);
      res.json({ data: task });
    },
  };
}
