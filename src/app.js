import express from "express";
const app = express();
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config({
  path: ".env",
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(cookieParser());

// routes

import UserRouter from "./routes/user.routes.js";
import VideoRouter from "./routes/video.routes.js";
import LikeRouter from "./routes/likes.routes.js";
import CommentRouter from "./routes/comment.route.js";
import TweetRouter from "./routes/tweet.routes.js";
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/video", VideoRouter);
app.use("/api/v1/like", LikeRouter);
app.use("/api/v1/comment", CommentRouter);
app.use("/api/v1/tweet", TweetRouter);
export { app };
