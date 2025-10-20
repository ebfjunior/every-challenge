import { createApp } from "./app.js";

const port = Number(process.env["PORT"] ?? 3000);

createApp().listen(port, () => {
  console.log(`Server listening on port ${port}`); // eslint-disable-line no-console
});
