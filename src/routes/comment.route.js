import { Router } from "express";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../controllers/comment/comment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/addComment/videoId").post(verifyJWT, createComment);
router.route("/updateComment/commentId").patch(verifyJWT, updateComment);
router.route("/deleteComment/commentId").delete(verifyJWT, deleteComment);
export default router;
