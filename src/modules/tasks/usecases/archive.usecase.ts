import type { Task } from "@/modules/tasks/task.model";
import type { UpdateTaskUseCase } from "./update.usecase.js";

interface Deps {
  updateTask: UpdateTaskUseCase;
}

export type ArchiveTaskUseCase = (userId: string, id: string) => Promise<Task>;

export function createArchiveTaskUseCase({
  updateTask,
}: Deps): ArchiveTaskUseCase {
  return (userId, id) => updateTask(userId, id, { status: "ARCHIVED" });
}
