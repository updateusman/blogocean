import { Video } from "../models/videoModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/clodinary.js";

const createVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  console.log(title);

  // if (!title) {
  //   throw new ApiError(401, "Title is Required");
  // }

  const videoLocalPath = req.file?.path;

  if (!videoLocalPath) {
    throw new ApiError(401, "No File Local Path");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);

  if (!videoFile) {
    throw new ApiError(500, "Error While Uploading Video");
  }

  const video = await Video.create({
    title: title || "",
    description: description || "",
    videoFile: videoFile.url,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Created Succefully"));
});

export { createVideo };
