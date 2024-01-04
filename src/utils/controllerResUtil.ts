import { HTTP_STATUS_CODE } from "../constants/constants";
import { Response } from "express";

const sendBadRequest = (res: Response, message = "Bad request") => {
  return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message });
};

const sendNotFound = (res: Response, message = "Not found") => {
  return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message });
};

const sendSuccess = (res: Response, data: any, message = "Success") => {
  return res.status(HTTP_STATUS_CODE.OK).json({ message, data });
};

const sendCreated = (res: Response, data: any, message = "Created") => {
  return res.status(HTTP_STATUS_CODE.CREATED).json({ message, data });
};

const sendUpdated = (res: Response, data: any, message = "Updated") => {
  return res.status(HTTP_STATUS_CODE.UPDATED).json({ message, data });
};

const sendDeleted = (res: Response, data: any, message = "Deleted") => {
  return res.status(HTTP_STATUS_CODE.UPDATED).json({ message, data });
};

const sendDefaultError = (res: Response, message: string, error: Error) => {
  return res.status(HTTP_STATUS_CODE.DEFAULT_ERROR).json({
    message: message,
    error: error.message || "",
  });
};

const sendServerError = (res: Response, error: Error) => {
  return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
    error: error.message || "",
  });
};

const responseUtils = {
  sendBadRequest,
  sendNotFound,
  sendSuccess,
  sendCreated,
  sendUpdated,
  sendDeleted,
  sendDefaultError,
  sendServerError,
};

export default responseUtils;
