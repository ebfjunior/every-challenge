import type { TaskRepository } from "@/modules/tasks/task.repository";

interface Deps {
  repository: TaskRepository;
}

export type DestroyTaskUseCase = (userId: string, id: string) => Promise<void>;

export function createDestroyTaskUseCase({
  repository,
}: Deps): DestroyTaskUseCase {
  return async (userId, id) => {
    const task = await repository.find(userId, id);

    if (!task) {
      const error = new Error("Task not found");
      error.name = "NotFoundError";
      (error as Error & { status?: number }).status = 404;
      throw error;
    }

    await repository.destroy(id);
  };
}
