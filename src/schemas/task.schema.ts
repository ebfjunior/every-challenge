import { z } from "zod";

const title = z.string().min(1, "Title is required");
const description = z.string().trim();

export const statusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"]);

export const createSchema = z.object({
  title,
  description,
  status: statusSchema.optional(),
});

export const updateSchema = z
  .object({
    title: title.optional(),
    description: description.optional(),
    status: statusSchema.optional(),
  })
  .refine(
    (fields) => Object.values(fields).some((value) => value !== undefined),
    { message: "At least one field must be provided", path: [] },
  );

export type TaskStatus = z.infer<typeof statusSchema>;
export type CreateTaskPayload = z.infer<typeof createSchema>;
export type UpdateTaskPayload = z.infer<typeof updateSchema>;
