import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "@/app";
import type { Task } from "@/modules/tasks/task.model";
import type { TaskUseCases } from "@/modules/tasks/task.usecases";
import { buildTask } from "../usecases/__tests__/helpers.js";

const userId = "user-123";

const serializeTask = (task: Task) => ({
  ...task,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
  completedAt: task.completedAt ? task.completedAt.toISOString() : null,
  archivedAt: task.archivedAt ? task.archivedAt.toISOString() : null,
});

describe("Task Routes", () => {
  let taskUseCases: TaskUseCases;

  beforeEach(() => {
    taskUseCases = {
      createTask: vi.fn(),
      searchTasks: vi.fn(),
      showTask: vi.fn(),
      updateTask: vi.fn(),
      destroyTask: vi.fn(),
      archiveTask: vi.fn(),
      unarchiveTask: vi.fn(),
    };
  });

  const buildApp = () => createApp(taskUseCases);

  describe("POST /api/tasks", () => {
    it("returns 401 when user id header is missing", async () => {
      const app = buildApp();

      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Test" });

      expect(vi.mocked(taskUseCases.createTask)).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: {
          code: "MISSING_USER_ID",
          message: "X-User-Id header required",
        },
      });
    });

    it("returns 400 when payload is invalid", async () => {
      const app = buildApp();

      const response = await request(app)
        .post("/api/tasks")
        .set("X-User-Id", userId)
        .send({ title: "" });

      expect(vi.mocked(taskUseCases.createTask)).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
      });
    });

    it("creates a task when payload is valid", async () => {
      const app = buildApp();
      const payload = {
        title: "Test",
        description: "",
      };
      const task = buildTask(payload);

      vi.mocked(taskUseCases.createTask).mockResolvedValue(task);

      const response = await request(app)
        .post("/api/tasks")
        .set("X-User-Id", userId)
        .send(payload);

      expect(taskUseCases.createTask).toHaveBeenCalledWith(userId, payload);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ data: serializeTask(task) });
    });
  });

  describe("GET /api/tasks", () => {
    it("returns 401 when user id header is missing", async () => {
      const app = buildApp();

      const response = await request(app).get("/api/tasks");

      expect(vi.mocked(taskUseCases.searchTasks)).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: {
          code: "MISSING_USER_ID",
          message: "X-User-Id header required",
        },
      });
    });

    it("lists tasks for the authenticated user", async () => {
      const app = buildApp();
      const tasks = [
        buildTask({ id: "task-1", userId }),
        buildTask({ id: "task-2", userId }),
      ];

      vi.mocked(taskUseCases.searchTasks).mockResolvedValue(tasks);

      const response = await request(app)
        .get("/api/tasks")
        .set("X-User-Id", userId);

      expect(taskUseCases.searchTasks).toHaveBeenCalledWith(userId, {
        userId,
        status: undefined,
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: tasks.map(serializeTask),
      });
    });

    it("forwards status filters to the use case", async () => {
      const app = buildApp();
      const tasks = [buildTask({ id: "task-1", userId, status: "DONE" })];

      vi.mocked(taskUseCases.searchTasks).mockResolvedValue(tasks);

      const response = await request(app)
        .get("/api/tasks")
        .set("X-User-Id", userId)
        .query({ status: "DONE" });

      expect(taskUseCases.searchTasks).toHaveBeenCalledWith(userId, {
        userId,
        status: "DONE",
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: tasks.map(serializeTask),
      });
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("returns 401 when user id header is missing", async () => {
      const app = buildApp();

      const response = await request(app).get("/api/tasks/task-1");

      expect(vi.mocked(taskUseCases.showTask)).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: {
          code: "MISSING_USER_ID",
          message: "X-User-Id header required",
        },
      });
    });

    it("returns 404 when the task is missing", async () => {
      const app = buildApp();
      const failure = Object.assign(new Error("Task not found"), {
        status: 404,
        code: "NOT_FOUND",
      });

      vi.mocked(taskUseCases.showTask).mockRejectedValue(failure);

      const response = await request(app)
        .get("/api/tasks/task-1")
        .set("X-User-Id", userId);

      expect(taskUseCases.showTask).toHaveBeenCalledWith(userId, "task-1");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: {
          code: "NOT_FOUND",
          message: "Task not found",
        },
      });
    });

    it("returns the task when found", async () => {
      const app = buildApp();
      const task = buildTask({ id: "task-1", userId });

      vi.mocked(taskUseCases.showTask).mockResolvedValue(task);

      const response = await request(app)
        .get("/api/tasks/task-1")
        .set("X-User-Id", userId);

      expect(taskUseCases.showTask).toHaveBeenCalledWith(userId, "task-1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: serializeTask(task) });
    });
  });

  describe("PATCH /api/tasks/:id", () => {
    it("returns 401 when user id header is missing", async () => {
      const app = buildApp();

      const response = await request(app)
        .patch("/api/tasks/task-1")
        .send({ status: "DONE" });

      expect(vi.mocked(taskUseCases.updateTask)).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: {
          code: "MISSING_USER_ID",
          message: "X-User-Id header required",
        },
      });
    });

    it("returns 400 when payload is invalid", async () => {
      const app = buildApp();

      const response = await request(app)
        .patch("/api/tasks/task-1")
        .set("X-User-Id", userId)
        .send({ status: "INVALID" });

      expect(vi.mocked(taskUseCases.updateTask)).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
      });
    });

    it("updates the task when payload is valid", async () => {
      const app = buildApp();
      const updatedTask = buildTask({
        id: "task-1",
        userId,
        status: "DONE",
      });

      vi.mocked(taskUseCases.updateTask).mockResolvedValue(updatedTask);

      const response = await request(app)
        .patch("/api/tasks/task-1")
        .set("X-User-Id", userId)
        .send({ status: "DONE" });

      expect(taskUseCases.updateTask).toHaveBeenCalledWith(
        userId,
        "task-1",
        expect.objectContaining({ status: "DONE" }),
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: serializeTask(updatedTask) });
    });

    it("returns service errors", async () => {
      const app = buildApp();
      const failure = Object.assign(new Error("Invalid transition"), {
        status: 422,
        code: "INVALID_TRANSITION",
      });

      vi.mocked(taskUseCases.updateTask).mockRejectedValue(failure);

      const response = await request(app)
        .patch("/api/tasks/task-1")
        .set("X-User-Id", userId)
        .send({ status: "DONE" });

      expect(taskUseCases.updateTask).toHaveBeenCalledWith(
        userId,
        "task-1",
        expect.objectContaining({ status: "DONE" }),
      );
      expect(response.status).toBe(422);
      expect(response.body.error).toMatchObject({
        code: "INVALID_TRANSITION",
        message: "Invalid transition",
      });
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("returns 401 when user id header is missing", async () => {
      const app = buildApp();

      const response = await request(app).delete("/api/tasks/task-1");

      expect(vi.mocked(taskUseCases.destroyTask)).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: {
          code: "MISSING_USER_ID",
          message: "X-User-Id header required",
        },
      });
    });

    it("removes the task when found", async () => {
      const app = buildApp();

      vi.mocked(taskUseCases.destroyTask).mockResolvedValue(undefined);

      const response = await request(app)
        .delete("/api/tasks/task-1")
        .set("X-User-Id", userId);

      expect(taskUseCases.destroyTask).toHaveBeenCalledWith(userId, "task-1");
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
  });

  describe("POST /api/tasks/:id/archive", () => {
    it("archives the task", async () => {
      const app = buildApp();
      const archivedTask = buildTask({
        id: "task-1",
        userId,
        status: "ARCHIVED",
        archivedAt: new Date("2024-01-01T00:00:00.000Z"),
      });

      vi.mocked(taskUseCases.archiveTask).mockResolvedValue(archivedTask);

      const response = await request(app)
        .post("/api/tasks/task-1/archive")
        .set("X-User-Id", userId);

      expect(taskUseCases.archiveTask).toHaveBeenCalledWith(userId, "task-1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: serializeTask(archivedTask) });
    });
  });

  describe("POST /api/tasks/:id/unarchive", () => {
    it("unarchives the task", async () => {
      const app = buildApp();
      const task = buildTask({
        id: "task-1",
        userId,
        status: "TODO",
        archivedAt: null,
      });

      vi.mocked(taskUseCases.unarchiveTask).mockResolvedValue(task);

      const response = await request(app)
        .post("/api/tasks/task-1/unarchive")
        .set("X-User-Id", userId);

      expect(taskUseCases.unarchiveTask).toHaveBeenCalledWith(userId, "task-1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: serializeTask(task) });
    });
  });
});
