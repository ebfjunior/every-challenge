import type { Task } from "@/modules/tasks/task.model";
import type { TaskRepository } from "@/modules/tasks/task.repository";

interface Deps {
  repository: TaskRepository;
}

export type ShowTaskUseCase = (
  userId: string,
  id: string,
) => Promise<Task | null>;

export function createShowTaskUseCase({ repository }: Deps): ShowTaskUseCase {
  return async (userId, id) => {
    const task = await repository.find(userId, id);

    if (!task) {
      const error = new Error("Task not found");
      error.name = "NotFoundError";
      (error as Error & { status?: number; code?: string }).status = 404;
      throw error;
    }

    return task;
  };
}
