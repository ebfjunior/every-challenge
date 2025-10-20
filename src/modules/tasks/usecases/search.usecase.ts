import type { Filters, TaskRepository } from "@/modules/tasks/task.repository";
import type { Task } from "@/modules/tasks/task.model";

interface Deps {
  repository: TaskRepository;
}

export type SearchTasksUseCase = (
  userId: string,
  input: Filters,
) => Promise<Task[]>;

export function createSearchTasksUseCase({
  repository,
}: Deps): SearchTasksUseCase {
  return (userId, input) => repository.search({ ...input, userId });
}
