import { describe, expect, it, vi } from "vitest";

import { createUnarchiveTaskUseCase } from "@/modules/tasks/usecases/unarchive.usecase";

describe("Unarchive Task Use Case", () => {
  const userId = "user-123";
  const taskId = "task-999";

  it("should execute update usecase with TODO status", async () => {
    const updateTask = vi.fn().mockResolvedValue({});
    const unarchiveTask = createUnarchiveTaskUseCase({ updateTask });

    await unarchiveTask(userId, taskId);

    expect(updateTask).toHaveBeenCalledWith(userId, taskId, {
      status: "TODO",
    });
  });

  it("should forward errors from the update usecase", async () => {
    const failure = new Error("update failed");
    const updateTask = vi.fn().mockRejectedValue(failure);
    const unarchiveTask = createUnarchiveTaskUseCase({ updateTask });

    await expect(unarchiveTask(userId, taskId)).rejects.toBe(failure);
    expect(updateTask).toHaveBeenCalledWith(userId, taskId, {
      status: "TODO",
    });
  });
});
