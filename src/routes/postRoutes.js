import Router, { Route } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";

import { createPost } from "../controllers/postController.js";

const router = Router();

router.route("/newpost").post(
  verifyJWT,
  // upload.single("imageFile"),
  // upload.single("videFile"),
  createPost
);

export default router;
