import { Request, Response } from "express";

import { Region, RegionModel, UserModel } from "../models/models";

import { HTTP_STATUS_CODE } from "../constants";

// GET and Find Methods //
export const getRegionBySpecificPoint = async (
  req: Request,
  res: Response
) => {};

export const getRegionByDistance = async (req: Request, res: Response) => {};

// Create Methods //

export const createRegion = async (req: Request, res: Response) => {
  try {
    const regionInfos: Region = req.body;

    const validateIfRegionExists = await RegionModel.findOne({
      coordinates: regionInfos.coordinates,
    }).lean();

    if (validateIfRegionExists) {
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json("Region coordinates already exists!");
    }

    const createdRegion = await RegionModel.create(regionInfos);

    return res
      .status(HTTP_STATUS_CODE.CREATED)
      .json(`User ${createdRegion.name} successfully created!`);
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to create region",
      error: error.message || "",
    });
  }
};

// Edit Methods //

export const editRegionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedRegionInfos: Region = req.body;

    if (!id) {
      res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ message: "User ID is required!" });
    }

    const findRegion = await RegionModel.findById(id);

    if (!findRegion) {
      res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json({ message: "User not found" });
    }

    Object.assign(findRegion, updatedRegionInfos);

    const updatedUser = await findRegion.save();

    return res
      .status(HTTP_STATUS_CODE.UPDATED)
      .json(`Region ${updatedUser.name} successfully updated!`);
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to update region!",
      error: error.message || "",
    });
  }
};

// Delete Methods //

export const deleteRegion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ message: "Region ID is required!" });
    }

    //Delete the region referenced in the User
    await UserModel.updateOne({ regions: id }, { $pull: { regions: id } });

    const deleteUser = await RegionModel.deleteOne({ _id: id });

    if (deleteUser.deletedCount === 0) {
      res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json({ message: "Region not found!" });
    }

    return res.status(HTTP_STATUS_CODE.OK).json("Region successfully deleted!");
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to delete region!",
      error: error.message || "",
    });
  }
};
