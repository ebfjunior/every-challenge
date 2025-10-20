import type { TaskStatus } from "@/schemas/task.schema";
export type { TaskStatus };
export interface TaskJson {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  archivedAt: Date | string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  archivedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const asDate = (value: Date | string) => new Date(value);
const asNullableDate = (value: Date | string | null) =>
  value == null ? null : new Date(value);

export const fromJson = (json: TaskJson): Task => {
  const {
    id,
    userId,
    title,
    description,
    status,
    archivedAt,
    completedAt,
    createdAt,
    updatedAt,
  } = json;

  return {
    id,
    userId,
    title,
    description,
    status,
    archivedAt: asNullableDate(archivedAt),
    completedAt: asNullableDate(completedAt),
    createdAt: asDate(createdAt),
    updatedAt: asDate(updatedAt),
  };
};
