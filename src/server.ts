import { createApp } from "./app.ts";
import { createUseCases } from "@/modules/tasks/task.usecases";

const port = Number(process.env["PORT"] ?? 3000);

const usecases = createUseCases();
const app = createApp(usecases);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`); // eslint-disable-line no-console
});

export default app;
