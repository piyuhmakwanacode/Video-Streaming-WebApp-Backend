import mongoose from "mongoose";
import { Video } from "../../models/video.models.js";
import { ApiError } from "../../utils/ApiErrors.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler } from "../../utils/AsyncHandlers.js";
import { UpLoadImageOnCloudinary } from "../../utils/Cloudinary.Services.js";

const videoCreate = AsyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id;
  if (!title || !description) {
    throw new ApiError(400, "title and description field are required");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbNailLocalPath = req.files?.thumbNail[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "video file is requierd");
  }

  if (!thumbNailLocalPath) {
    throw new ApiError(400, "thumbNail is required");
  }

  const videoFile = await UpLoadImageOnCloudinary(videoFileLocalPath);
  const thumbNail = await UpLoadImageOnCloudinary(thumbNailLocalPath);

  if (!videoFile) {
    throw new ApiError(
      400,
      "Failed to get the public URL of the uploaded video."
    );
  }

  if (!thumbNail) {
    throw new ApiError(
      400,
      "Failed to get the public URL of the uploaded thumbNail."
    );
  }
  const videoDuration = videoFile.duration;
  console.log(typeof videoDuration);
  const createVideo = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbNail: thumbNail.url,
    duration: videoDuration,
    owner: userId,
  });

  if (!createVideo) {
    throw new ApiError(500, "something went wrong while creating the video");
  }

  const videoUser = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(createVideo?._id) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbNail: 1,
        owner: 1,
        duration: 1,
        views: 1,
      },
    },
  ]);

  if (!videoUser) {
    throw new ApiError(
      500,
      "something went wrong while getting the details of video"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoUser[0], "video create successfully"));
});

const UpdateVideoDetails = AsyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!videoId) {
    throw new ApiError(400, "please provide videoId");
  }

  const videoOwner = await Video.findById(videoId);

  if (videoOwner.owner._id.toString() !== userId.toString()) {
    throw new ApiError(400, "you are not the owner of this video");
  }

  if (!title || !description) {
    throw new ApiError(400, "title and description field is required");
  }

  const newthumbNailLocalPath = req.file?.path;

  if (!newthumbNailLocalPath) {
    throw new ApiError(400, "please provide the local path of thumbNail");
  }

  const newThumbNail = await UpLoadImageOnCloudinary(newthumbNailLocalPath);

  if (!newThumbNail) {
    throw new ApiError(
      400,
      "something went wrong while getting the thumbNail path on  cloudinary"
    );
  }

  const UpdateVideo = await Video.findByIdAndUpdate(videoId, {
    $set: {
      title,
      description,
      thumbNail: newThumbNail.url,
    },
  });

  if (!UpdateVideo) {
    throw new ApiError(
      500,
      "something went wrog while updateing the video details"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, UpdateVideo, "update video successfully"));
});

const deleteVideo = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  const videoOwnwer = await Video.findById(videoId);
  if (!videoOwnwer) {
    throw new ApiError(400, "not have any video of this owner");
  }

  if (videoOwnwer.owner._id.toString() !== userId.toString()) {
    throw new ApiError(400, "you are not the owner of this user");
  }

  const deletingVideo = await Video.findByIdAndDelete(videoId);

  if (!deletingVideo) {
    throw new ApiError(400, "something went wrong while deleting the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted succesfully"));
});

const getAllVideo = AsyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  let skip = (page - 1) * limit;

  const totalDocument = await Video.countDocuments();

  const videos = await Video.find()
    .skip(skip)
    .limit(limitNumber)
    .sort({ createdAt: -1 });

  if (!videos) {
    throw new ApiError(500, "someting went wrong while sorting the video");
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pageNumber,
        limitNumber,
        totalPage: Math.ceil(totalDocument / limitNumber),
        totalDocument,
        data: videos,
      },
      "video get with pagination successfully"
    )
  );
});

const getvideoById = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "something went wrong finding the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video find successfully"));
});

export { videoCreate, UpdateVideoDetails, deleteVideo, getAllVideo,getvideoById };
