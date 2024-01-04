import Router from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  changeUserPassword,
  avatarUpdate,
  updateUserCoverImage,
  getCurrentUser,
  updateAccountDetails,
  getUserAccountProfile,
  getWatchHistory,
} from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),

  registerUser
);

router.route("/login").post(loginUser);

//Secured Routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeUserPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-user-info").patch(verifyJWT, updateAccountDetails);
router.route("/c/:username").get(verifyJWT, getUserAccountProfile);
router
  .route("/avatar-update")
  .patch(verifyJWT, upload.single("avatar"), avatarUpdate);
router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/history").get(verifyJWT, getWatchHistory);

// router.route('/create-video').post(upload.single())

export default router;
