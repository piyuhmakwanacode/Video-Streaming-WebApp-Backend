import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  addTweet,
  deleteTweet,
  getAllTweet,
  updateTweet,
} from "../controllers/Tweet/Tweet.controller.js";
const router = Router();
import { upload } from "../middleware/multer.middleware.js";

router.use(upload.none())
router.route("/add-Tweet").post(verifyJWT, addTweet);
router.route("/delete-Tweet/:tweetId").delete(verifyJWT, deleteTweet);
router.route("/update-Tweet/:tweetId").patch(verifyJWT, updateTweet);
router.route("/GetAllTweet").get(verifyJWT, getAllTweet);

export default router;
