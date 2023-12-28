import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
// import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log(decodedToken._id);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    // console.log(user._id);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    // console.log(req.user._id);
    next();
  } catch (error) {
    if (error instanceof jwt) {
      throw new ApiError(401, `Invalid Access Token: ${error.message}`);
    }
    next(error);
  }
});
