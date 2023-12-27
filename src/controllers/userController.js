import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const generateTokens = async (userId) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new ApiError(500, "User Id is not Valid");
    }
    const accessToken = currentUser.generateAccessToken();
    const refreshToken = currentUser.generateRefreshToken();
    currentUser.refreshToken = refreshToken;
    await currentUser.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and Refresh Tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, bio } = req.body;
  console.log(email);

  if (
    [(username, fullName, email, password)].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(401, "All Credentials are reuired");
  }

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existedUser) {
    throw new ApiError(409, "User with Username Email already Exist");
  }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(501, "Error while creating user");
  }

  res.status(200).json(new ApiResponse(201, "User Created Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get User Data,
  //validate user Data,
  //find User with given email or password,
  // check password
  //generate Access and Refresh Token
  // send access and refresh tolen to user via secure cookie,
  // send response

  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or password is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(401, "User does not exist");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = { httpOnly: true, secure: true };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
    new: true,
  });

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User Logout Successfuly"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookie?.refreshToken || req.body?.refreshToken;

  if (!refreshAccessToken) {
    throw new ApiError(401, "No Refresh Token");
  }

  const decodedToken = jwt.verify(
    incommingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  if (incommingRefreshToken === user?.refreshToken) {
    throw new ApiError(401, "Refresh Token is Expired or Used");
  }

  const options = { httpOnly: true, secure: true };

  const { accessToken, newRefreshToken } = await generateTokens(user._id);

  res
    .status(200)
    .cookie("refreshToken", newRefreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { refreshToken: newRefreshToken, accessToken },
        "access Token refreshed Successfully"
      )
    );
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
