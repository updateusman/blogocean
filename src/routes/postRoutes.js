import Router, { Route } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";

import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  updatePost,
} from "../controllers/postController.js";

const router = Router();

router.route("/newpost").post(
  verifyJWT,
  // upload.single("imageFile"),
  // upload.single("videFile"),
  createPost
);
router.route("/getpost").get(verifyJWT, getPost);
router.route("/posts").get(verifyJWT, getAllPosts);
router.route("/updated").get(verifyJWT, updatePost);
router.route("/delete").get(verifyJWT, deletePost);

export default router;
