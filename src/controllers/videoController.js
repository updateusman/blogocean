import { Video } from "../models/videoModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/clodinary.js";

const createVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  console.log(title);

  if (!title) {
    throw new ApiError(401, "Title is Required");
  }

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
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Created Succefully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(401, "User is not Authenticated");
  }

  const videos = await Video.find({ owner: userId });

  if (!videos) {
    throw new ApiError(500, "Error While fetching Videos");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos Fetched Succhefully"));
});

export { createVideo, getAllVideos };
