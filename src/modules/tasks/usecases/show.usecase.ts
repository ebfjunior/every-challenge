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
  return (userId, id) => repository.find(userId, id);
}
