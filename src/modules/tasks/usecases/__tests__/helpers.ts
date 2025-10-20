import { vi } from "vitest";

import type { Task } from "@/modules/tasks/task.model";
import type { TaskRepository } from "@/modules/tasks/task.repository";

export const buildTask = (overrides: Partial<Task> = {}): Task => {
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

export const createRepositoryMock = (): TaskRepository => ({
  create: vi.fn(),
  search: vi.fn(),
  find: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
});
