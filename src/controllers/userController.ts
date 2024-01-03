import { Request, Response } from "express";

import { User, UserModel } from "../models/models";

import { HTTP_STATUS_CODE } from "../constants";

// GET and Find Methods //
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;

    const [users, total] = await Promise.all([
      UserModel.find().lean(),
      UserModel.count(),
    ]);

    return res.status(HTTP_STATUS_CODE.OK).json({
      rows: users,
      page,
      limit,
      total,
    });
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to get all users!",
      error: error.message || "",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findOne({ _id: id }).lean();

    if (!user) {
      res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json({ message: "User not found, verify the ID and try again!" });
    }

    return user;
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to get current user!",
      error: error.message || "",
    });
  }
};

// Create Methods //
export const createUser = async (req: Request, res: Response) => {
  try {
    const userInfos: User = req.body;

    const result = await UserModel.create(userInfos);

    return res
      .status(HTTP_STATUS_CODE.CREATED)
      .json(`User ${result.name} successfully created!`);
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to create user!",
      error: error.message || "",
    });
  }
};

// Edit Methods //
export const editUserInfos = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { update } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();

    if (!updatedUser) {
      res
        .status(HTTP_STATUS_CODE.DEFAULT_ERROR)
        .json({ message: "User not found" });
    }

    return res
      .status(HTTP_STATUS_CODE.CREATED)
      .json("User successfully edited!");
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to edit current user!",
      error: error.message || "",
    });
  }
};
