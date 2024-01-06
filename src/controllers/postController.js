import { Post } from "../models/postModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Image } from "../models/imageModel.js";

const createPost = asyncHandler(async (req, res) => {
  //get post Data
  // validate post data
  // get files
  // upload files on cloudinary
  // delete files from localpath
  // create / save post in db
  // return reponse
  const { title, body, category, tags } = req.body;

  // console.log(title, body, category);
  if (
    [title, body, category].some((field) => field === "" || field === undefined)
  ) {
    throw new ApiError(401, "All Fields required");
  }

  const featuredImageId = req.body.featuredImage;
  // console.log(featuredImageId);

  if (!featuredImageId) {
    throw new ApiError(401, "featured Image Required");
  }
  const imageFile = await Image.findById(featuredImageId);
  console.log(imageFile);

  if (!imageFile) {
    throw new ApiError(404, "Featured Image is Required");
  }

  const processedTags = tags ? tags.split(",").map((tag) => tag.trim()) : [];

  const preparedBody = [];

  // console.log(body);

  for (const element of body) {
    // console.log(element);
    if (element.type === "text") {
      preparedBody.push({ type: "text", content: element.content });
    } else if (element.type === "image") {
    } else if (element.type === "video") {
    }
  }

  const post = await Post.create({
    title,
    body: preparedBody,
    category,
    tags: processedTags || [],
    author: req.user._id,
    featuredImage: imageFile,
    
  });

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Post Created Succefully"));
});

const getPost = asyncHandler(async (req, res) => {
  const postId = req.params._id;
  const singlePost = Post.findById(postId);
  if (!singlePost) {
    throw new ApiError(500, "Error While fetching Post");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, singlePost, "Post Fetched Succefully"));
});

const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find();

  res
    .status(200)
    .json(new ApiResponse(200, posts, "All Posts Fetched Succefully"));
});
const updatePost = asyncHandler(async (req, res) => {
  const postId = req.params._id;
  if (!postId) {
    throw new ApiError(400, "Please Select Post to Update");
  }

  const updatedPost = await Post.findByIdAndUpdate(postId, req.body, {
    new: true,
  });
  if (!updatedPost) {
    throw new ApiError("400", error, "Post not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Post Updated Succefullu"));
});

const deletePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200, "Post Deleted Succefully");
  } catch (error) {
    throw new ApiError(500, error.message, "Error while deleting Post");
  }
});

export { createPost, getPost, updatePost, getAllPosts, deletePost };
