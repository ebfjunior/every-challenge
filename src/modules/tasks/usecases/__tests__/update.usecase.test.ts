import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUpdateTaskUseCase } from "@/modules/tasks/usecases/update.usecase";

import {
  buildTask,
  createRepositoryMock,
} from "@/modules/tasks/usecases/__tests__/helpers";
import type { TaskRepository } from "@/modules/tasks/task.repository";

describe("Update Task Use Case", () => {
  const userId = "user-123";
  const taskId = "task-999";
  let repository: TaskRepository;

  beforeEach(() => {
    repository = createRepositoryMock();
  });

  describe("When task doesnt exist", () => {
    it("should fail with a not found error", async () => {
      const updateTask = createUpdateTaskUseCase({ repository });

      vi.mocked(repository.find).mockResolvedValue(null);

      await expect(
        updateTask(userId, taskId, { status: "DONE" }),
      ).rejects.toMatchObject({
        message: "Task not found",
        name: "NotFoundError",
        status: 404,
      });

      expect(vi.mocked(repository.update)).not.toHaveBeenCalled();
    });
  });

  describe("When task exists", () => {
    describe("When the transition is permitted", () => {
      it("should update task and forward the changes", async () => {
        const updateTask = createUpdateTaskUseCase({ repository });
        const currentTask = buildTask({ id: taskId, status: "TODO" });
        const updatedTask = buildTask({
          id: taskId,
          status: "IN_PROGRESS",
          title: "Updated title",
        });
        const input = {
          title: updatedTask.title,
          status: updatedTask.status,
        };

        vi.mocked(repository.find).mockResolvedValue(currentTask);
        vi.mocked(repository.update).mockResolvedValue(updatedTask);

        const result = await updateTask(userId, taskId, input);

        expect(vi.mocked(repository.find)).toHaveBeenCalledWith(userId, taskId);
        expect(vi.mocked(repository.update)).toHaveBeenCalledWith(taskId, {
          title: input.title,
          description: undefined,
          status: "IN_PROGRESS",
          archivedAt: undefined,
          completedAt: undefined,
        });
        expect(result).toBe(updatedTask);
      });
    });

    describe("When archiving the task", () => {
      it("it should generate archivedAt timestamp", async () => {
        const updateTask = createUpdateTaskUseCase({ repository });
        const currentTask = buildTask({ id: taskId, status: "TODO" });
        const archivedTask = buildTask({
          id: taskId,
          status: "ARCHIVED",
          archivedAt: new Date(),
        });
        const frozenTime = new Date("2025-02-02T10:00:00.000Z");

        vi.mocked(repository.find).mockResolvedValue(currentTask);
        vi.mocked(repository.update).mockResolvedValue(archivedTask);

        vi.useFakeTimers();
        vi.setSystemTime(frozenTime);

        try {
          await updateTask(userId, taskId, { status: "ARCHIVED" });

          const [, payload] = vi.mocked(repository.update).mock.calls.at(-1)!;

          expect(payload.status).toBe("ARCHIVED");
          expect(payload.archivedAt).toEqual(frozenTime);
          expect(payload.completedAt).toBeUndefined();
        } finally {
          vi.useRealTimers();
        }
      });
    });

    describe("When reopening an archived task", () => {
      it("should clear archivedAt timestamp", async () => {
        const updateTask = createUpdateTaskUseCase({ repository });
        const currentTask = buildTask({
          id: taskId,
          status: "ARCHIVED",
          archivedAt: new Date("2025-01-05T00:00:00.000Z"),
        });
        const reopenedTask = buildTask({ id: taskId, status: "TODO" });

        vi.mocked(repository.find).mockResolvedValue(currentTask);
        vi.mocked(repository.update).mockResolvedValue(reopenedTask);

        await updateTask(userId, taskId, { status: "TODO" });

        const [, payload] = vi.mocked(repository.update).mock.calls.at(-1)!;

        expect(payload.status).toBe("TODO");
        expect(payload.archivedAt).toBeNull();
        expect(payload.completedAt).toBeUndefined();
      });
    });

    describe("When marking the task as done", () => {
      it("should stamp completedAt timestamp", async () => {
        const updateTask = createUpdateTaskUseCase({ repository });
        const currentTask = buildTask({ id: taskId, status: "IN_PROGRESS" });
        const completedTask = buildTask({
          id: taskId,
          status: "DONE",
          completedAt: new Date(),
        });
        const frozenTime = new Date("2025-03-03T18:30:00.000Z");

        vi.mocked(repository.find).mockResolvedValue(currentTask);
        vi.mocked(repository.update).mockResolvedValue(completedTask);

        vi.useFakeTimers();
        vi.setSystemTime(frozenTime);

        try {
          await updateTask(userId, taskId, { status: "DONE" });

          const [, payload] = vi.mocked(repository.update).mock.calls.at(-1)!;

          expect(payload.status).toBe("DONE");
          expect(payload.completedAt).toEqual(frozenTime);
          expect(payload.archivedAt).toBeUndefined();
        } finally {
          vi.useRealTimers();
        }
      });
    });

    describe("When the transition is forbidden", () => {
      it("should reject the change with a descriptive error", async () => {
        const updateTask = createUpdateTaskUseCase({ repository });
        const currentTask = buildTask({ id: taskId, status: "TODO" });

        vi.mocked(repository.find).mockResolvedValue(currentTask);

        await expect(
          updateTask(userId, taskId, { status: "DONE" }),
        ).rejects.toMatchObject({
          message: "Invalid transition TODO -> DONE",
          status: 400,
          code: "INVALID_TRANSITION",
        });
      });
    });

    describe("When undoing completion", () => {
      it("should clear completedAt timestamp", async () => {
        const updateTask = createUpdateTaskUseCase({ repository });
        const currentTask = buildTask({
          id: taskId,
          status: "DONE",
          completedAt: new Date("2025-01-10T10:00:00.000Z"),
        });
        const backToInProgress = buildTask({
          id: taskId,
          status: "IN_PROGRESS",
          completedAt: null,
        });

        vi.mocked(repository.find).mockResolvedValue(currentTask);
        vi.mocked(repository.update).mockResolvedValue(backToInProgress);

        await updateTask(userId, taskId, { status: "IN_PROGRESS" });

        const [, payload] = vi.mocked(repository.update).mock.calls.at(-1)!;

        expect(payload.status).toBe("IN_PROGRESS");
        expect(payload.completedAt).toBeNull();
        expect(payload.archivedAt).toBeUndefined();
      });
    });
  });
});
