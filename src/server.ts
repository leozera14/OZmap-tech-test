import * as express from "express";
import { routes } from "./routes/routes";
import { connectWithDatabase } from "./database/database";
import mongoose from "mongoose";

connectWithDatabase();

const app = express();

app.use(express.json());

app.use(routes);

mongoose.connection.once("open", () => {
  console.log("Connected to DB");
  app.listen(3003, () => {
    console.log("Server started on port 3003");
  });
});
