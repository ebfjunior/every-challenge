import type { Task } from "@/modules/tasks/task.model";
import {
  statusSchema as taskStatusSchema,
  type TaskStatus,
  type UpdateTaskPayload,
} from "@/schemas/task.schema";

import type { TaskRepository } from "@/modules/tasks/task.repository";

interface Deps {
  repository: TaskRepository;
}

const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
  TODO: ["IN_PROGRESS", "ARCHIVED"],
  IN_PROGRESS: ["DONE", "ARCHIVED", "TODO"],
  DONE: ["ARCHIVED", "IN_PROGRESS"],
  ARCHIVED: ["TODO"],
};

const applySideEffects = (current: TaskStatus, next: TaskStatus) => {
  const data: { archivedAt?: Date | null; completedAt?: Date | null } = {};

  if (next === "ARCHIVED") {
    data.archivedAt = new Date();
  }

  if (current === "ARCHIVED" && next !== "ARCHIVED") {
    data.archivedAt = null;
  }

  if (current !== "DONE" && next === "DONE") {
    data.completedAt = new Date();
  }

  if (current === "DONE" && next !== "DONE") {
    data.completedAt = null;
  }

  return data;
};

export type UpdateTaskUseCase = (
  userId: string,
  taskId: string,
  input: UpdateTaskPayload,
) => Promise<Task>;

export const createUpdateTaskUseCase = ({
  repository,
}: Deps): UpdateTaskUseCase => {
  return async (userId, id, input) => {
    const task = await repository.find(userId, id);

    if (!task) {
      const error = new Error("Task not found");
      error.name = "NotFoundError";
      (error as Error & { status?: number; code?: string }).status = 404;
      throw error;
    }

    const currentStatus = task.status;
    const nextStatus = taskStatusSchema.parse(input.status);

    if (nextStatus) {
      if (!allowedTransitions[currentStatus].includes(nextStatus)) {
        const error = new Error(
          `Invalid transition ${currentStatus} -> ${nextStatus}`,
        );
        (error as Error & { status?: number; code?: string }).status = 422;
        (error as Error & { status?: number; code?: string }).code =
          "INVALID_TRANSITION";
        throw error;
      }
    }

    const effects = applySideEffects(currentStatus, nextStatus);

    const updated = await repository.update(id, {
      title: input.title,
      description: input.description,
      status: nextStatus,
      ...effects,
    });

    return updated;
  };
};
