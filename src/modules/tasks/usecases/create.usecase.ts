import type { Task } from "@/modules/tasks/task.model";
import type { TaskRepository } from "@/modules/tasks/task.repository";
import type { CreateTaskPayload } from "@/schemas/task.schema";

interface Deps {
  repository: TaskRepository;
}

export type CreateTaskUseCase = (
  userId: string,
  input: CreateTaskPayload,
) => Promise<Task>;

export function createCreateTaskUseCase({
  repository,
}: Deps): CreateTaskUseCase {
  return (userId, input) => repository.create({ userId, ...input });
}
