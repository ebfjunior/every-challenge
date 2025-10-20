import { beforeEach, describe, expect, it, vi } from "vitest";

import { createShowTaskUseCase } from "@/modules/tasks/usecases/show.usecase";

import {
  buildTask,
  createRepositoryMock,
} from "@/modules/tasks/usecases/__tests__/helpers";
import type { TaskRepository } from "@/modules/tasks/task.repository";

describe("Show Task Use Case", () => {
  const userId = "user-123";
  const taskId = "task-999";
  let repository: TaskRepository;

  beforeEach(() => {
    repository = createRepositoryMock();
  });

  describe("Given a task identifier", () => {
    it("Then it looks up the task scoped to the user", async () => {
      const showTask = createShowTaskUseCase({ repository });
      const task = buildTask({ id: taskId });

      vi.mocked(repository.find).mockResolvedValue(task);

      const result = await showTask(userId, taskId);

      expect(repository.find).toHaveBeenCalledWith(userId, taskId);
      expect(result).toBe(task);
    });
  });

  describe("When task does not exist", () => {
    it("should reject with a not found error", async () => {
      const showTask = createShowTaskUseCase({ repository });

      vi.mocked(repository.find).mockResolvedValue(null);

      await expect(showTask(userId, taskId)).rejects.toMatchObject({
        message: "Task not found",
        name: "NotFoundError",
        status: 404,
      });
    });
  });
});
