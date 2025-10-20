import { describe, expect, it, vi } from "vitest";

import { createUnarchiveTaskUseCase } from "@/modules/tasks/usecases/unarchive.usecase";

describe("Unarchive Task Use Case", () => {
  const userId = "user-123";
  const taskId = "task-999";

  it("should delegate to the update use case with TODO status", async () => {
    const updateTask = vi.fn().mockResolvedValue({});
    const unarchiveTask = createUnarchiveTaskUseCase({ updateTask });

    await unarchiveTask(userId, taskId);

    expect(updateTask).toHaveBeenCalledWith(userId, taskId, {
      status: "TODO",
    });
  });
});
