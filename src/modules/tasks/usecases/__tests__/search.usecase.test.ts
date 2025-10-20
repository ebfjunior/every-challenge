import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSearchTasksUseCase } from "@/modules/tasks/usecases/search.usecase";

import {
  buildTask,
  createRepositoryMock,
} from "@/modules/tasks/usecases/__tests__/helpers";
import type { TaskStatus } from "@/schemas/task.schema";
import type { TaskRepository } from "@/modules/tasks/task.repository";

describe("Search Tasks Use Case", () => {
  const userId = "user-123";
  let repository: TaskRepository;

  beforeEach(() => {
    repository = createRepositoryMock();
  });

  describe("Given a set of filters", () => {
    it("Then it queries the repository on behalf of the user", async () => {
      const searchTasks = createSearchTasksUseCase({ repository });
      const filters = { userId, status: "DONE" as TaskStatus };
      const foundTasks = [buildTask({ id: "task-1", userId })];

      vi.mocked(repository.search).mockResolvedValue(foundTasks);

      const result = await searchTasks(userId, filters);

      expect(repository.search).toHaveBeenCalledWith({
        ...filters,
        userId,
      });
      expect(result).toEqual(foundTasks);
    });
  });
});
