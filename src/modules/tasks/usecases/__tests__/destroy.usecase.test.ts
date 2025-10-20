import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDestroyTaskUseCase } from "@/modules/tasks/usecases/destroy.usecase";

import {
  buildTask,
  createRepositoryMock,
} from "@/modules/tasks/usecases/__tests__/helpers";
import type { TaskRepository } from "@/modules/tasks/task.repository";

describe("Destroy Task Use Case", () => {
  const userId = "user-123";
  const taskId = "task-999";
  let repository: TaskRepository;

  beforeEach(() => {
    repository = createRepositoryMock();
  });

  describe("When task is found", () => {
    it("should remove the task after confirming ownership", async () => {
      const destroyTask = createDestroyTaskUseCase({ repository });
      const existing = buildTask({ id: taskId });

      vi.mocked(repository.find).mockResolvedValue(existing);
      vi.mocked(repository.destroy).mockResolvedValue();

      await destroyTask(userId, taskId);

      expect(repository.find).toHaveBeenCalledWith(userId, taskId);
      expect(repository.destroy).toHaveBeenCalledWith(taskId);
    });
  });

  describe("When task doesnt exist", () => {
    it("should raise a not found error", async () => {
      const destroyTask = createDestroyTaskUseCase({ repository });

      vi.mocked(repository.find).mockResolvedValue(null);

      await expect(destroyTask(userId, taskId)).rejects.toMatchObject({
        message: "Task not found",
        name: "NotFoundError",
        status: 404,
      });

      expect(repository.destroy).not.toHaveBeenCalled();
    });
  });
});
