import { Router } from "express";
import {
  editUserInfos,
  getAllUsers,
  getUserById,
  createUser,
} from "../controllers/index";

export const routes = Router();

// GET Routes //
routes.get("/users", getAllUsers);
routes.get("/users/:id", getUserById);

// POST Routes //
routes.post("/users", createUser);

// PUT Routes //
routes.put("/users/:id", editUserInfos);
