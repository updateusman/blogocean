import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { createVideo, getAllVideos } from "../controllers/videoController.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = Router();

router
  .route("/newvideo")
  .post(verifyJWT, upload.single("videoFile"), createVideo);

router.route("/videos").get(verifyJWT, getAllVideos);

export default router;
