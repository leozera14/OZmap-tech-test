import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import { routes } from "./routes/routes";
import { connectWithDatabase } from "./database/database";
import mongoose from "mongoose";
import { SERVER_PORT_CONNECTION } from "./constants";

connectWithDatabase();

const app = express();

app.use(express.json());

app.use(routes);

mongoose.connection.once("open", () => {
  console.log("Connected to DB");
});

export default app.listen(SERVER_PORT_CONNECTION, () => {
  console.log(`Server started on port ${SERVER_PORT_CONNECTION}`);
});
