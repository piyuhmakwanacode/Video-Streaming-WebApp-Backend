import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiErrors.js";
import { AsyncHandler } from "../utils/AsyncHandlers.js";
import jwt from "jsonwebtoken";
export const verifyJWT = AsyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(400, "Unauthorized request");
  }
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  req.user = user;
  next();
});
