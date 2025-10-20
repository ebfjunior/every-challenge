import { prisma } from "@/lib/prisma";
import type { Task } from "@/modules/tasks/task.model";
import type {
  CreateTaskPayload,
  TaskStatus,
  UpdateTaskPayload,
} from "@/schemas/task.schema";

export interface Filters {
  userId: string;
  id?: string;
  status?: TaskStatus;
}

export type TaskCreateData = CreateTaskPayload & { userId: string };

export type TaskUpdateData = UpdateTaskPayload & {
  archivedAt?: Date | null;
  completedAt?: Date | null;
};

export class TaskRepository {
  create(params: TaskCreateData): Promise<Task> {
    return prisma.task.create({ data: params });
  }

  search(filters?: Filters): Promise<Task[]> {
    return prisma.task.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });
  }

  find(userId: string, id: string): Promise<Task | null> {
    return prisma.task.findFirst({ where: { id, userId } });
  }

  update(id: string, data: TaskUpdateData): Promise<Task> {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    return prisma.task.update({
      where: { id },
      data: payload,
    });
  }

  destroy(id: string): Promise<void> {
    return prisma.task.delete({ where: { id } });
  }
}
