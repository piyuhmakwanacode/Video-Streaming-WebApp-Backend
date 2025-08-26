import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { videoLikesToggle } from "../controllers/like/like.controller.js";

const router = Router()

router.route("/:videoId").get(verifyJWT,videoLikesToggle)

export default router