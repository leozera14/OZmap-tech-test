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

    if (!id) {
      res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ message: "User ID is required!" });
    }

    //Use lean method to read and get data faster
    const user = await UserModel.findOne({ _id: id }).lean();

    if (!user) {
      res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json({ message: "User not found, verify the ID and try again!" });
    }

    return res.status(HTTP_STATUS_CODE.OK).json(user);
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

    if (!id) {
      res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ message: "User ID is required!" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();

    if (!updatedUser) {
      res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json({ message: "User not found" });
    }

    return res
      .status(HTTP_STATUS_CODE.UPDATED)
      .json("User successfully edited!");
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to edit current user!",
      error: error.message || "",
    });
  }
};

// Delete Methods //
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ message: "User ID is required!" });
    }

    const deleteUser = await UserModel.findByIdAndDelete(id);

    if (!deleteUser) {
      res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json({ message: "User not found!" });
    }

    return res.status(HTTP_STATUS_CODE.OK).json("User successfully deleted!");
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to delete user!",
      error: error.message || "",
    });
  }
};
