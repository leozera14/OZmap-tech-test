import { Request, Response } from "express";

import { RegionModel, User, UserModel } from "../models/models";

import responseUtils from "../utils/controllerResUtil";

// GET and Find Methods //
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;

    const [users, total] = await Promise.all([
      UserModel.find().lean(),
      UserModel.count(),
    ]);

    const dataToReturn = { rows: users, page, limit, total };

    return responseUtils.sendSuccess(res, dataToReturn);
  } catch (error) {
    return responseUtils.sendDefaultError(
      res,
      "Failed to get all users!",
      error
    );
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return responseUtils.sendBadRequest(res, "User ID is required!");
    }

    //Use lean method to read and get data faster
    const user = await UserModel.findOne({ _id: id }).lean();

    if (!user) {
      return responseUtils.sendNotFound(
        res,
        "User not found, verify the ID and try again!"
      );
    }

    return responseUtils.sendSuccess(res, user);
  } catch (error) {
    return responseUtils.sendDefaultError(
      res,
      "Failed to get current user!",
      error
    );
  }
};

// Create Methods //
export const createUser = async (req: Request, res: Response) => {
  try {
    const userInfos: User = req.body;

    const createdUser = await UserModel.create(userInfos);

    return responseUtils.sendCreated(
      res,
      createdUser,
      `User ${createdUser.name} successfully created!`
    );
  } catch (error) {
    return responseUtils.sendDefaultError(res, "Failed to create user!", error);
  }
};

// Edit Methods //
export const editUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedUserInfo: User = req.body;

    if (!id) {
      return responseUtils.sendBadRequest(res, "User ID is required!");
    }

    const findUser = await UserModel.findById(id);

    if (!findUser) {
      return responseUtils.sendNotFound(res, "User not found!");
    }

    //Apply the updated values to the document
    Object.assign(findUser, updatedUserInfo);

    const updatedUser = await findUser.save();

    return responseUtils.sendUpdated(
      res,
      updatedUser,
      `User ${updatedUser.name} successfully updated!`
    );
  } catch (error) {
    return responseUtils.sendDefaultError(res, "Failed to update user!", error);
  }
};

// Delete Methods //
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return responseUtils.sendBadRequest(res, "User ID is required");
    }

    const deleteUser = await UserModel.findByIdAndDelete(id);

    if (!deleteUser) {
      return responseUtils.sendNotFound(res, "User not found!");
    }

    //Delete the User referenced in the Region
    await RegionModel.updateMany({ user: id }, { $unset: { user: "" } });

    return responseUtils.sendSuccess(res, "", "User succesfully deleted!");
  } catch (error) {
    return responseUtils.sendDefaultError(res, "Failed to delete user!", error);
  }
};
