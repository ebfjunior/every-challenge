import { createApp } from "./app.js";
import { createUseCases } from "@/modules/tasks/task.usecases";
import { logger } from "@/lib/logger";

const port = Number(process.env["PORT"] ?? 3000);

const usecases = createUseCases();
const app = createApp(usecases);

app.listen(port, () => {
  logger.info(`Tasks API listening on port ${port}`);
});
