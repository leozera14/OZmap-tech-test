import { Request, Response } from "express";

import { Region, RegionModel, UserModel } from "../models/models";

import {
  BOUNDARY_NUM_SIDES,
  BOUNDARY_RADIUS_IN_METERS,
  HTTP_STATUS_CODE,
  NEARBY_MAX_DISTANCE_IN_METERS,
} from "../constants";

import { calculateCircularBoundary } from "../utils/calculateBoundary";
import { validateCoordinatesSpecificPoint } from "../utils/validateCoordinates";
import { IQueryConditions } from "../types/regionController";

// GET and Find Methods //
export const getRegionBySpecificPoint = async (req: Request, res: Response) => {
  try {
    const { address, lat, lng } = req.query;

    if (!address && !lat && !lng) {
      return res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json("Either address or coordinates must be provided!");
    }

    const validatedCoordinates = validateCoordinatesSpecificPoint(
      address as string,
      parseFloat(lng as string),
      parseFloat(lat as string)
    );

    //Get the Regions nearby the coordinates by the Boundary calculated values.
    const regionsByThePoint = await RegionModel.find({
      boundary: {
        $geoIntersects: {
          $geometry: { type: "Point", coordinates: validatedCoordinates },
        },
      },
    }).select("-boundary");

    return res.status(HTTP_STATUS_CODE.OK).json({
      message: "Localization found successfully!",
      localization: regionsByThePoint,
    });
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to get the specific region!",
      error: error.message || "",
    });
  }
};

export const getRegionByDistance = async (req: Request, res: Response) => {
  try {
    const { address, lng, lat, userId, distance } = req.query;

    if (!address && !lat && !lng) {
      return res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json("Either address or coordinates must be provided!");
    }

    const validatedCoordinates = await validateCoordinatesSpecificPoint(
      address as string,
      parseFloat(lng as string),
      parseFloat(lat as string)
    );

    const maxDistance = distance ? distance : NEARBY_MAX_DISTANCE_IN_METERS; // Max distance in meters to search by the point referenced.

    //Get the Regions nearby the coordinates given and the distance, also filtered or not by userID.
    let queryConditions: IQueryConditions = {
      coordinates: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: validatedCoordinates,
          },
          $maxDistance: maxDistance as number,
        },
      },
    };

    if (userId) {
      queryConditions.user = userId as string;
    }

    const localizationNearBy = await RegionModel.find(queryConditions).select(
      "-boundary"
    );

    return res.status(HTTP_STATUS_CODE.OK).json({
      message: "Localization found successfully!",
      localization: localizationNearBy,
    });
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to get the specific region!",
      error: error.message || "",
    });
  }
};

// Create Methods //

export const createRegion = async (req: Request, res: Response) => {
  try {
    const { coordinates, name, user }: Region = req.body;

    const validateIfRegionExists = await RegionModel.findOne({
      coordinates: coordinates,
    }).lean();

    if (validateIfRegionExists) {
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json("Region coordinates already exists!");
    }

    const calculatedLocBoundary = calculateCircularBoundary(
      coordinates,
      BOUNDARY_RADIUS_IN_METERS,
      BOUNDARY_NUM_SIDES
    );

    const newRegion = new RegionModel({
      name,
      coordinates,
      user,
      boundary: {
        type: "Polygon",
        coordinates: [calculatedLocBoundary],
      },
    });

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

    const deletedRegion = await RegionModel.deleteOne({ _id: id });

    if (deletedRegion.deletedCount === 0) {
      res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json({ message: "Region not found!" });
    }

    //Delete the region referenced in the User
    await UserModel.updateOne({ regions: id }, { $pull: { regions: id } });

    return res.status(HTTP_STATUS_CODE.OK).json("Region successfully deleted!");
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
      message: "Failed to delete region!",
      error: error.message || "",
    });
  }
};
