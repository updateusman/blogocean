import { Image } from "../models/imageModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/clodinary.js";
// import { User } from "../models/userModel.js";

const createImage = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  // console.log(caption);

  const imageLocalPath = req.file?.path;
  // console.log(imageLocalPath);

  if (!imageLocalPath) {
    throw new ApiError(401, "Files are not available");
  }

  try {
    const imageFile = await uploadOnCloudinary(imageLocalPath);
    console.log(imageFile);

    if (!imageFile.url) {
      throw new ApiError(404, "Error while uploading Image");
    }

    const owner = await User.findById(req.user._id);
    if (!owner) {
      throw new ApiError(401, "Unathorised Access");
    }

    const image = await Image.create({
      imageFile: imageFile.url,
      caption: caption || "",
      owner: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Media File Created Successfully"));
  } catch (error) {
    throw new ApiError(500, "Error While Uploading image", error.message);
  }
});

const getMyImages = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "User is not Authenticated");
  }

  const images = await Image.find({ owner: userId });

  if (!images) {
    throw new ApiError(500, "Error While fetching Images");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, images, "Images fetched Succefully"));
});

const deleteImage = asyncHandler(async (req, res) => {
  const imageId = req.params._id;
  const userId = req.user._id;

  try {
    await Image.deleteOne({ _id: imageId, owner: userId });

    return res
      .status(200)
      .json(new ApiResponse(200, "Image Deleted Successfully"));
  } catch (error) {
    throw new ApiError(401, "Could not veify user or delete Image");
  }
});

export { createImage, deleteImage, getMyImages };
