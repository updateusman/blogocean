import { Router } from "express";
import {
  createImage,
  deleteImage,
  getMyImages,
} from "../controllers/imageController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/image").post(verifyJWT, upload.single("imageFile"), createImage);
router.route("/myimages").get(verifyJWT, getMyImages);

router.route("/delete/:id").post(verifyJWT, deleteImage);

export default router;
