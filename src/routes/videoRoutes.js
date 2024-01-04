import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { createVideo } from "../controllers/videoController.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = Router();

router
  .route("/newvideo")
  .post(verifyJWT, upload.single("videoFile"), createVideo);

export default router;
