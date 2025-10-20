import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Task } from "@/modules/tasks/task.model";

const prismaTaskMock = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: prismaTaskMock,
  },
}));

import type { Filters } from "@/modules/tasks/task.repository";
import { TaskRepository } from "@/modules/tasks/task.repository";
import type { TaskStatus } from "@/schemas/task.schema";

const buildTask = (overrides: Partial<Task> = {}): Task => {
  const timestamp = new Date("2025-01-01T00:00:00.000Z");

  return {
    id: "task-123",
    userId: "user-123",
    title: "This is a sample task title",
    description: "This is a sample task description",
    status: "TODO",
    archivedAt: null,
    completedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
};

describe("Task Repository", () => {
  const repository = new TaskRepository();

  beforeEach(() => {
    Object.values(prismaTaskMock).forEach((mock) => mock.mockReset());
  });

  describe("#create", () => {
    it("should correctly forward the payload to Prisma and return a task", async () => {
      const payload = {
        userId: "user-123",
        title: "Task title",
        description: "Task description",
        status: "IN_PROGRESS" as TaskStatus,
      };
      const createdTask = buildTask({ ...payload });

      prismaTaskMock.create.mockResolvedValue(createdTask);

      const task = await repository.create(payload);

      expect(prismaTaskMock.create).toHaveBeenCalledWith({ data: payload });
      expect(task).toBe(createdTask);
    });
  });

  describe("#search", () => {
    it("should query Prisma by provided filters and sort by creation date", async () => {
      const where = { userId: "user-123", status: "DONE" } as Filters;
      const tasks = [
        buildTask({ id: "task-1" }),
        buildTask({ id: "task-2", status: "DONE" }),
      ];
      const expectedList = tasks.filter((task) => task.status === "DONE");

      prismaTaskMock.findMany.mockResolvedValue(expectedList);

      const list = await repository.search(where);

      expect(prismaTaskMock.findMany).toHaveBeenCalledWith({
        where,
        orderBy: { createdAt: "desc" },
      });

      expect(list).toEqual(expectedList);
    });
  });

  describe("#find", () => {
    it("should return the first found task", async () => {
      const id = "task-999";
      const userId = "123";

      const match = buildTask({ id, userId });

      prismaTaskMock.findFirst.mockResolvedValue(match);

      const task = await repository.find(userId, id);

      expect(prismaTaskMock.findFirst).toHaveBeenCalledWith({
        where: { id, userId },
      });
      expect(task).toBe(match);
    });
  });

  describe("#update", () => {
    it("should update task and drop undefined fields", async () => {
      const id = "task-444";
      const update: Partial<Task> = {
        title: "Updated title",
        status: "DONE",
        archivedAt: null,
      };
      const updatedTask = buildTask({ id, ...update });

      prismaTaskMock.update.mockResolvedValue(updatedTask);

      const result = await repository.update(id, update);

      expect(prismaTaskMock.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          title: update.title,
          status: update.status,
          archivedAt: update.archivedAt,
        },
      });
      expect(result).toBe(updatedTask);
    });
  });

  describe("#destroy", () => {
    it("then deletes by the composite user/id scope", async () => {
      const id = "task-555";

      await repository.destroy(id);

      expect(prismaTaskMock.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
