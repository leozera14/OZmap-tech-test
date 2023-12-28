import { Router } from "express";
import { editUserInfos, getAllUsers, getUserById } from "../controllers/index";

export const routes = Router();

// GET Routes //
routes.get("/user", getAllUsers);
routes.get("/users/:id", getUserById);

// POST Routes //

// PUT Routes //
routes.put("/users/:id", editUserInfos);
