import { Comment } from "../../models/comment.models.js";
import { Video } from "../../models/video.models.js";
import { ApiError } from "../../utils/ApiErrors.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler } from "../../utils/AsyncHandlers.js";

const createComment = AsyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  const userId = req.user._id;
  if (!content || !videoId) {
    throw new ApiError(400, "videoId and content are required ");
  }

  const creatingContent = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  if (!creatingContent) {
    throw new ApiError(500, "something went wrong while creating the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, creatingContent, "comment create successfully"));
});

const updateComment = AsyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { Newcontent } = req.body;
  const userId = req.user._id;

  if (!commentId) {
    throw new ApiError(400, "commentId is requierd");
  }

  if (!Newcontent) {
    throw new ApiError(400, "content is requierd");
  }

  const existComment = await Comment.findById(commentId);
  if (!existComment) {
    throw new ApiError(400, "this comment does not exist");
  }
  if (existComment.owner.toString() !== userId.toString()) {
    throw new ApiError(400, "You are not Authorized to update this comment");
  }
  if (Newcontent.toString() === existComment.content.toString()) {
    throw new ApiError(400, "you provided the same comment as the old comment");
  }

  const updateComments = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content: Newcontent },
    },
    { new: true }
  );

  if (!updateComments) {
    throw new ApiError(500, "something went wrong while updateing the comment");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateComments, "upadate the comment successfully")
    );
});

const deleteComment = AsyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!commentId) {
    throw new ApiError(
      400,
      "please privide valid comment Id this filled is incorrect"
    );
  }

  const exsitingComment = await Comment.findById(commentId);

  if (exsitingComment.owner.toString() !== userId.toString()) {
    throw new ApiError(400, "this user not Authorize to delete the comment");
  }

  const deletigComment = await Comment.findByIdAndDelete(commentId);
  if (!deletigComment) {
    throw new ApiError(500, "something went wrong while deleting the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment delete successfully"));
});
export { createComment, updateComment, deleteComment };
