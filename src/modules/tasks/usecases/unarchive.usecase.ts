import type { Task } from "@/modules/tasks/task.model";
import type { UpdateTaskUseCase } from "./update.usecase.js";

interface Deps {
  updateTask: UpdateTaskUseCase;
}

export type UnarchiveTaskUseCase = (
  userId: string,
  id: string,
) => Promise<Task>;

export function createUnarchiveTaskUseCase({
  updateTask,
}: Deps): UnarchiveTaskUseCase {
  return (userId, id) => updateTask(userId, id, { status: "TODO" });
}
