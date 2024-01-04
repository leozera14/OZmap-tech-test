import { Request, Response } from "express";

import { Region, RegionModel, UserModel } from "../models/models";

import { HTTP_STATUS_CODE } from "../constants";

import GeoLib from "../lib";

// GET and Find Methods //
export const getRegionBySpecificPoint = async (req: Request, res: Response) => {
  try {
    const { address, lat, lng } = req.query;

    let coordinates: String | { lat: number; lng: number };

    if (address) {
      coordinates = await GeoLib.getCoordinatesFromAddress(address as string);
    } else if (lat && lng) {
      coordinates = {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
      };
    } else {
      return res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json("Either address or coordinates must be provided!");
    }

    const maxDistance = 5000; // Max distance in meters to search

    const localizationNearBy = await RegionModel.find({
      coordinates: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [coordinates.lng, coordinates.lat],
          },
          $maxDistance: maxDistance,
        },
      },
    });

    console.log("coordinates", {
      coordinates,
      localizationNearBy,
    });

    return res.status(HTTP_STATUS_CODE.OK).json({
      message: "Localization found successfully!",
      localization: localizationNearBy,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to get the specific region!",
      error: error.message || "",
    });
  }
};

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

    const newRegion = new RegionModel(regionInfos);

    const savedRegion = await newRegion.save();

    const foundRegionUser = await UserModel.findById(savedRegion.user);

    if (foundRegionUser) {
      foundRegionUser.regions.push(savedRegion._id);

      await foundRegionUser.save();
    }

    return res
      .status(HTTP_STATUS_CODE.CREATED)
      .json(`User ${savedRegion.name} successfully created!`);
  } catch (error) {
    console.log(error);
    //Return a message if get an generic error returned by the Geo Lib
    //If region coordinates was not found
    if (error.message.includes("Can't extract geo keys")) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        message: "Failed to create region",
        error: "Region coordinates not found, please verify it and try again!",
      });
    }

    //If is other type of error return the generic message
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

    //Apply the updated values to the document
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
