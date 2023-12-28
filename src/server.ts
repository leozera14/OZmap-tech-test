import * as express from "express";
import { routes } from "./routes/routes";
import { initializeDatabase } from "./database/database";

const app = express();

(async () => {
  await initializeDatabase();

  app.use(express.json());

  app.use(routes);

  app.listen(3003, () => {
    console.log("Server started on port 3003");
  });
})().catch((error) => {
  console.error("Failed to start the server:", error);

  process.exit(1);
});
