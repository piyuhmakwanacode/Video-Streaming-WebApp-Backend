import { Tweet } from "../../models/tweet.models.js";
import mongoose from "mongoose";
import { AsyncHandler } from "../../utils/AsyncHandlers.js";
import { ApiError } from "../../utils/ApiErrors.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const addTweet = AsyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    throw new ApiError(400, "please provide the content");
  }

  const createTweet = await Tweet.create({
    content,
    owner: userId,
  });

  if (!createTweet) {
    throw new ApiError(500, "something went wrong while creating the tweet");
  }

  const tweet = await Tweet.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(createTweet._id) } },
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
        content: 1,
        owner: 1,
        likes: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!tweet || tweet.length <= 0) {
    throw new ApiError(
      500,
      "something went wrong while aggrigate the data of tweet"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "create tweet successfully"));
});

const updateTweet = AsyncHandler(async (req, res) => {
  const { newContent } = req.body;
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!newContent) {
    throw new ApiError(400, "please provide the content to update the tweet");
  }
  if (!tweetId) {
    throw new ApiError(400, "please provide the tweetId to update the tweet");
  }

  const existingTweet = await Tweet.findById(tweetId);

  if (!existingTweet) {
    throw new ApiError(400, "this tweet not exist");
  }

  if (existingTweet.owner.toString() !== userId.toString()) {
    throw new ApiError(
      400,
      "you are not owner of this tweet so you can't update this tweet   "
    );
  }

  if (existingTweet.content.toString() === newContent.toString()) {
    throw new ApiError(
      400,
      "you provide the same tweet that allredy exist please provide other content for tweet"
    );
  }

  const updateContent = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: newContent,
      },
    },
    {
      new: true,
    }
  );

  if (!updateContent) {
    throw new ApiError(500, "soething went wrong while updating the tweet");
  }

  const tweet = await Tweet.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(updateContent._id) } },
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
        content: 1,
        owner: 1,
        likes: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!tweet || tweet.length <= 0) {
    throw new ApiError(
      500,
      "something went wrong while aggrigate the data of tweet"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "update the tweet successfully"));
});

const deleteTweet = AsyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!tweetId) {
    throw new ApiError(400, "please provide the tweetId to update the tweet");
  }
  const existingTweet = await Tweet.findById(tweetId);

  if (!existingTweet) {
    throw new ApiError(400, "this tweet not exist");
  }

  if (existingTweet.owner.toString() !== userId.toString()) {
    throw new ApiError(
      400,
      "you are not owner of this tweet so you can't delete this tweet   "
    );
  }

  const deletingTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletingTweet) {
    throw new ApiError(500, "something went wrong while deleting the tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet delete successfully"));
});

const getAllTweet = AsyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const allTweet = await Tweet.aggregate([
    { $limit: limitNumber },
    { $skip: skip },
    { $sort: { createdAt: -1 } },
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
        content: 1,
        owner: 1,
        likes: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (!allTweet || allTweet.length <= 0) {
    throw new ApiError(500, "something went wrong while getting alltweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allTweet, "getting alltweet successfully"));
});

const addTweetOnTweet = AsyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  if (!content) {
    throw new ApiError(400, "please provide the tweeting content");
  }
  if (!tweetId) {
    throw new ApiError(400, "please provide the tweet id");
  }

  const existTwwet = await Tweet.findById(tweetId);

  if (!existTwwet) {
    throw new ApiError(400, "this tweet not exist");
  }

  const addTweet = await Tweet.create({
    content,
    owner: userId,
    parentTweet: tweetId,
  });

  if (!addTweet) {
    throw new ApiError(500, "something went wrong while adding tweet on tweet");
  }
  const tweet = await Tweet.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(addTweet._id) } },
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
      $lookup: {
        from: "tweets",
        localField: "parentTweet",
        foreignField: "_id",
        as: "parentTweet",
        pipeline: [
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
              content: 1,
              owner: 1,
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
        parentTweet: {
          $first: "$parentTweet",
        },
      },
    },
    {
      $project: {
        content: 1,
        likes: 1,
        owner: 1,
        parentTweet: 1,
      },
    },
  ]);

  if (!tweet || tweet.length <= 0) {
    throw new ApiError(
      500,
      "something went wrong while getting users tweet who tweet onether tweet"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, tweet, "adding the tweet on tweet successfully")
    );
});

const getAllTweetsofTweet = AsyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!tweetId) {
    throw new ApiError(400, "please provide the tweet Id");
  }

  const existTweet = await Tweet.findById(tweetId);

  if (!existTweet) {
    throw new ApiError(400, "this tweet does not exist");
  }

  const getAllTweet = await Tweet.aggregate[
    ({ $match: { _id: new mongoose.Types.ObjectId(tweetId) } },
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
      $lookup: {
        from: "tweets",
        localField: "parentTweet",
        foreignField: "_id",
        as: "parentTweet",
        pipeline: [
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
            $project: {
              content: 1,
              owner: 1,
              likes: 1,
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
        parentTweet: {
          $first: "$parentTweet",
        },
      },
    },
    {
      $project: {
        content: 1,
        owner: 1,
        parentTweet: 1,
        likes: 1,
      },
    })
  ];

  if (!getAllTweet) {
    throw new ApiError(
      500,
      "somethig went wroogn while getting the comment of comment"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, getAllTweet, "get all comment successfully"));
});

export {
  addTweet,
  updateTweet,
  deleteTweet,
  getAllTweet,
  addTweetOnTweet,
  getAllTweetsofTweet,
};
