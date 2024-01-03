import { Router } from "express";
import {
  editUserInfos,
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
} from "../controllers/index";

export const routes = Router();

// GET Routes
/* Users */
routes.get("/users", getAllUsers);
routes.get("/users/:id", getUserById);

// POST Routes
/* Users */
routes.post("/users", createUser);

// PUT Routes
/* Users */
routes.put("/users/:id", editUserInfos);

// Delete Routes
/* Users */
routes.delete("/users/:id", deleteUser);
