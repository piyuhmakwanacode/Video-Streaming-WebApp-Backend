import mongoose,{Schema} from 'mongoose';

const TweetSchema = new mongoose.Schema({
 content: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    parentTweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
}, { timestamps:true });

export const Tweet = mongoose.model('Tweet', TweetSchema);
