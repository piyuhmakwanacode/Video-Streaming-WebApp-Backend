import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      default: null,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
      default: null,
    },

    LikeBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
LikeSchema.index(
  { video: 1, LikeBy: 1 },
  { unique: true, partialFilterExpression: { video: { $exists: true } } }
);

LikeSchema.index(
  { comment: 1, LikeBy: 1 },
  { unique: true, partialFilterExpression: { comment: { $exists: true } } }
);

LikeSchema.index(
  { tweet: 1, LikeBy: 1 },
  { unique: true, partialFilterExpression: { tweet: { $exists: true } } }
);

export const Like = mongoose.model("Like", LikeSchema);
