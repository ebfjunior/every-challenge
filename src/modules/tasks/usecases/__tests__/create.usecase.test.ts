import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Task } from "@/modules/tasks/task.model";
import { createCreateTaskUseCase } from "@/modules/tasks/usecases/create.usecase";
import type { TaskRepository } from "@/modules/tasks/task.repository";

import {
  buildTask,
  createRepositoryMock,
} from "@/modules/tasks/usecases/__tests__/helpers";

describe("Create Task Use Case", () => {
  const userId = "user-123";
  let repository: TaskRepository;

  beforeEach(() => {
    repository = createRepositoryMock();
  });

  describe("When payload is valid", () => {
    it("should persist the task scoped to the user", async () => {
      const createTask = createCreateTaskUseCase({ repository });
      const input = {
        title: "This is a title",
        description: "This is a description",
        status: "IN_PROGRESS" as Task["status"],
      };
      const createdTask = buildTask({ ...input });

      vi.mocked(repository.create).mockResolvedValue(createdTask);

      const result = await createTask(userId, input);

      expect(repository.create).toHaveBeenCalledWith({
        userId,
        ...input,
      });

      expect(result).toBe(createdTask);
    });
  });

  describe("When a error occurs", () => {
    it("should forward the error", async () => {
      const createTask = createCreateTaskUseCase({ repository });
      const input = {
        title: "This is a title",
        description: "This is a description",
        status: "IN_PROGRESS" as Task["status"],
      };
      const failure = new Error("database offline");

      vi.mocked(repository.create).mockRejectedValue(failure);

      await expect(createTask(userId, input)).rejects.toBe(failure);
    });
  });
});
