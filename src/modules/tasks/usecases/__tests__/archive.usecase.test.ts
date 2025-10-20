import { describe, expect, it, vi } from "vitest";

import { createArchiveTaskUseCase } from "@/modules/tasks/usecases/archive.usecase";

describe("Archive Task Use Case", () => {
  const userId = "user-123";
  const taskId = "task-999";

  it("should delegate to the update use case with ARCHIVED status", async () => {
    const updateTask = vi.fn().mockResolvedValue({});
    const archiveTask = createArchiveTaskUseCase({ updateTask });

    await archiveTask(userId, taskId);

    expect(updateTask).toHaveBeenCalledWith(userId, taskId, {
      status: "ARCHIVED",
    });
  });
});
