import { Request, Response } from "express";

import { Region, RegionModel } from "../models/models";

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

export const editRegionById = async (req: Request, res: Response) => {};

// Delete Methods //

export const deleteRegion = async (req: Request, res: Response) => {};
