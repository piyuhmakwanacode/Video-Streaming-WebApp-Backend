import { Video } from "../../models/video.models.js";
import { ApiError } from "../../utils/ApiErrors.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler } from "../../utils/AsyncHandlers.js";
import { Like } from "../../models/like.models.js";
import { Comment } from "../../models/comment.models.js";
const videoLikesToggle = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({ video: videoId, LikeBy: userId });

  if (existingLike) {
    const deletingLike = await Like.deleteOne({
      video: videoId,
      LikeBy: userId,
    });
    if (!deletingLike) {
      throw new ApiError(500, "something with wrong while unlike the video");
    }
    const UnlikedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: { Likes: -1 },
      },
      { new: true }
    );

    if (!UnlikedVideo) {
      throw new ApiError(500, "something went wrong while couting the likes");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video is unlike successfully"));
  } else {
    const createLike = await Like.create({ video: videoId, LikeBy: userId });
    if (!createLike) {
      throw new ApiError(500, "something went wrong while adding likes");
    }

    const likeVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: { Likes: 1 },
      },
      { new: true }
    );

    if (!likeVideo) {
      throw new ApiError(500, "something went wrong while like the video");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video is like successfully"));
  }
});

const commentLikeToggel = AsyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "This comment does not exist");
  }

  const ToggelCommentLike = await Like.findOne({
    comment: commentId,
    LikeBy: userId,
  });

  if (ToggelCommentLike) {
    const unlike = await Like.findOneAndDelete({
      comment: commentId,
      LikeBy: userId,
    });

    if (!unlike) {
      throw new ApiError(500, "something went wrong while unlike the comment");
    }

    const countLikes = await Comment.findByIdAndUpdate(
      commentId,
      {
        $inc: { LikeBy: -1 },
      },
      { new: true }
    );

    if (!countLikes) {
      throw new ApiError(500, "something  went wrong while unlike the comment");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { Likes: countLikes.likes },
          "toggel the comment successfully"
        )
      );
  } else {
    const likeComment = await Like.create({
      comment: commentId,
      LikeBy: userId,
    });

    if (!likeComment) {
      throw new ApiError(500, "something went wrong while like the comment");
    }

    const countLikes = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { LikeBy: 1 } },
      { new: true }
    );

    if (!countLikes) {
      throw new ApiError(500, "something went wrong while like the comment");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { Likes: countLikes.likes },
          "add the like to the comment successfully"
        )
      );
  }
});

export { videoLikesToggle, commentLikeToggel };
