import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  deleteVideo,
  getAllVideo,
  getvideoById,
  UpdateVideoDetails,
  videoCreate,
} from "../controllers/video/video.controllers.js";


const router = Router();
router.use(verifyJWT);

router.route("/create-video").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbNail", maxCount: 1 },
  ]),
  videoCreate
);
router
  .route("/:videoId/update-video")
  .patch(upload.single("thumbNail"), UpdateVideoDetails);

router.route("/:videoId/delete-video").delete(upload.none(), deleteVideo);

router.route("/getAllVideos").get(getAllVideo);
router.route("/:videoId").get(getvideoById);

export default router;
// 684ea90c774609a47525db6d