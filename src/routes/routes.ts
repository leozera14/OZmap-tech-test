import { Router } from "express";
import {
  editUserById,
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  createRegion,
  deleteRegion,
  editRegionById,
} from "../controllers/index";

export const routes = Router();

/* ------------- USER ROUTES ------------- */

// GET Routes
routes.get("/users", getAllUsers);
routes.get("/users/:id", getUserById);

// POST Routes
routes.post("/users", createUser);

// PUT Routes
routes.put("/users/:id", editUserById);

// Delete Routes
routes.delete("/users/:id", deleteUser);

/* ------------- REGION ROUTES ------------- */

// GET Routes

// POST Routes
routes.post("/regions", createRegion);

// PUT Routes
routes.put("/regions/:id", editRegionById);

// Delete Routes
routes.delete("/regions/:id", deleteRegion);
