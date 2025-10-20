import { describe, expect, it } from "vitest";

import type { TaskJson } from "@/modules/tasks/task.model";
import { fromJson } from "@/modules/tasks/task.model";

describe("Task Model", () => {
  describe("fromJson", () => {
    it("should create a task from a valid JSON", () => {
      const json: TaskJson = {
        id: "task-123",
        title: "This is a test task",
        description: "This is a test task description",
        status: "IN_PROGRESS",
        archivedAt: null,
        completedAt: null,
        createdAt: new Date("2025-03-09T12:34:56.000Z"),
        updatedAt: new Date("2025-03-12T12:34:56.000Z"),
      };

      const task = fromJson(json);

      expect(task).toMatchObject({
        id: json.id,
        title: json.title,
        description: json.description,
        status: json.status,
        archivedAt: null,
        completedAt: null,
        createdAt: new Date("2025-03-09T12:34:56.000Z"),
        updatedAt: new Date("2025-03-12T12:34:56.000Z"),
      });
    });

    it("should convert timestamp strings to Date instances", () => {
      const json: TaskJson = {
        id: "task-456",
        title: "This is a test task",
        description: "This is a test task description",
        status: "IN_PROGRESS",
        archivedAt: "2025-03-10T12:34:56.000Z",
        completedAt: "2025-03-11T12:34:56.000Z",
        createdAt: "2025-03-09T12:34:56.000Z",
        updatedAt: "2025-03-12T12:34:56.000Z",
      };

      const task = fromJson(json);

      expect(task.archivedAt).toBeInstanceOf(Date);
      expect(task.completedAt).toBeInstanceOf(Date);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it("should keep nullable timestamps as null", () => {
      const json: TaskJson = {
        id: "task-789",
        title: "This is a test task",
        description: "This is a test task description",
        status: "TODO",
        archivedAt: null,
        completedAt: null,
        createdAt: "2025-04-01T00:00:00.000Z",
        updatedAt: "2025-04-02T00:00:00.000Z",
      };

      const task = fromJson(json);

      expect(task.archivedAt).toBeNull();
      expect(task.completedAt).toBeNull();
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });
  });
});
