import { Router } from "express";
import {
  UpdateAvatarImg,
  UpdatecoverImage,
  changePassword,
  checkEmailforPassword_Check,
  getCurrentUser,
  logOutUser,
  loginUser,
  matchOtp,
  registerUser,
} from "../controllers/User/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();
// router.route("/register").post(
//   upload.fields([
//     {
//       name: "avatar",
//       maxCount: 1,
//     },
//     {
//       name: "coverImage",
//       maxCount: 1,
//     },
//   ]),
//   registerUser
// );
// router.route("/login").post(upload.none(),loginUser);

// router.route("/logout").get(verifyJWT,logOutUser);
// export default router;
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
//? if you want to send form data from clientside then you want to add middleware here this middelawaer is  upload.none() that do nothing just not send the file data in while login the user
router.route("/login").post(upload.none(), loginUser);

router.route("/logout").get(verifyJWT, logOutUser);
router
  .route("/email_checking")
  .post(upload.none(), checkEmailforPassword_Check);

router.route("/check_Otp").post(verifyJWT, upload.none(), matchOtp);

router.route("/change_password").post(verifyJWT, upload.none(), changePassword);

router
  .route("/update-Avatar")
  .patch(verifyJWT, upload.single("avatar"), UpdateAvatarImg);

router
  .route("/update-CoverImage")
  .patch(verifyJWT, upload.single("coverImage"), UpdatecoverImage);

router.route("/current-user").get(verifyJWT, upload.none(), getCurrentUser);
export default router;
