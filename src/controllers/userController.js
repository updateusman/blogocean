import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../utils/verifyMail.js";

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
    username,
    email,
    password,
    bio,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error while creating User");
  }

  try {
    const sentMail = await verifyEmail({
      email,
      emailType: "VERIFY",
      userId: createdUser._id,
    });
    console.log(sentMail);
  } catch (error) {
    throw new ApiError(500, "Error Sending Email", error.message);
  }
  // if (!sentMail) {
  //   throw new ApiError(500, "Error Sending Email", error);
  // }

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User Created Successfully"));
});

const userEmailVerification = asyncHandler(async (req, res) => {
  // const reqBody = await req.body.json();
  // const { token } = reqBody;
  const { token } = req.query;
  console.log(token);

  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpiry: { $gt: Date.now() },
  });
  console.log(user);

  if (!user) {
    throw new ApiError(400, "Invalid Token", error);
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;
  await user.save();

  // try {
  //   await verifyMail(token);
  // } catch (error) {
  //   throw new ApiError(401, "Error While getting token", error.message);
  // }

  return res
    .status(200)
    .json(new ApiResponse(200, "Email verified successfully"));
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

  if (!user.isVerified) {
    throw new ApiError(
      400,
      "Email is not Verified please check your Inbox and verify your email to login"
    );
  }

  const isPasswordValid = await user.comparePassword(password);

  // console.log(isPasswordValid);

  if (!isPasswordValid) {
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
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "No Refresh Token ");
  }
  console.log(incommingRefreshToken);
  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user || !user.refreshToken) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incommingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh Token is Expired or Used");
    }

    const options = { httpOnly: true, secure: true };

    const { accessToken, refreshToken } = await generateTokens(user._id);

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { refreshToken, accessToken },
          "access Token refreshed Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(401, "All Credentials Required");
  }
  // console.log(req.user._id);

  const user = await User.findById(req.user?._id);
  console.log(user.password);
  if (!user) {
    throw new ApiError(401, "User is not logged In");
  }

  const matchPassword = await user.comparePassword(oldPassword);

  if (!matchPassword) {
    throw new ApiError(401, "Incorrect Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password Changed Successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const user = User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid Token", error);
  }

  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password Reset Succefully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched Successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName || email)) {
    throw new ApiError(401, "Nothing to update");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken ");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Sucefully"));
});

const avatarUpdate = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error While uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select(-"password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar Updated Successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(401, "Cover Image File is Missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(500, "Error While uploading coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage Updated Successfully"));
});

const getUserAccountProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const account = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "account",
        as: "followers",
      },
    },
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "followedBy",
        as: "following",
      },
    },
    {
      $addFields: {
        followersCount: {
          $size: "$followers",
        },
        accountFollowing: {
          $size: "$following",
        },
        isFollowed: {
          $in: [req.user?._id, "$followers.followers"],
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        followersCount: 1,
        accountFollowing: 1,
        isFollowed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        socialMediaLinks: 1,
        bio: 1,
      },
    },
  ]);

  if (!account?.length) {
    throw new ApiError(404, "Account does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, account[0], "User Account Fetched Succefully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "author",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
                {
                  $addFields: {
                    author: {
                      $first: "$author",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHostory,
        "Watch History fetched Successfully"
      )
    );
});

export {
  registerUser,
  userEmailVerification,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeUserPassword,
  getCurrentUser,
  updateAccountDetails,
  avatarUpdate,
  updateUserCoverImage,
  getUserAccountProfile,
  getWatchHistory,
  resetPassword
};
