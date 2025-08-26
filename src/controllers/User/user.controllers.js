import { User } from "../../models/user.models.js";
import { EmailOtp } from "../../models/mail_Otp.models.js";
import { ApiError } from "../../utils/ApiErrors.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler, option } from "../../utils/AsyncHandlers.js";
import { UpLoadImageOnCloudinary } from "../../utils/Cloudinary.Services.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../../utils/sendMail.js";

const generating_Access_And_Refersh_Token = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while creating the access and refersh token"
    );
  }
};
const registerUser = AsyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;
  [(username, email, password, fullName)].some((field) => {
    if (field.trim() === "") {
      throw new ApiError(400, "all fields are required");
    }
  });

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(400, "user allredy Exist");
  }

  const localAvatarFilePath = req.files?.avatar[0]?.path;
  let localCoverImageFilePath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    localCoverImageFilePath = req.files.coverImage[0].path;
  }

  if (!localAvatarFilePath) {
    throw new ApiError(400, "avatar file is required");
  }

  const avatar = await UpLoadImageOnCloudinary(localAvatarFilePath);
  const coverImage = await UpLoadImageOnCloudinary(localCoverImageFilePath);

  if (!avatar) {
    throw new ApiError(400, "cloudinary can not send the file ");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while regestring the user");
  }

  res
    .status(200)
    .json(new ApiResponse(201, createdUser, "user register successfully"));
});

const loginUser = AsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email are required");
  }

  const Existinguser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!Existinguser) {
    throw new ApiError(400, "user not exist");
  }

  if (!password) {
    throw new ApiError(400, "password field is required");
  }
  const IspasswordCorrect = await Existinguser.isPasswordCorrect(password);

  if (!IspasswordCorrect) {
    throw new ApiError(400, "password is incorrect ");
  }

  // creating access and refreshtoken

  const { accessToken, refreshToken } =
    await generating_Access_And_Refersh_Token(Existinguser._id);

  const user = await User.findById(Existinguser._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(500, "something went wrong while login the user");
  }

  res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user,
          accessToken,
          refreshToken,
        },
        "user login successfully"
      )
    );
});

const logOutUser = AsyncHandler(async (req, res) => {
  const userID = req.user;

  const user = await User.findByIdAndUpdate(userID, {
    $unset: [
      { refreshToken: 1 },
      {
        new: true,
      },
    ],
  });

  if (!user) {
    throw new ApiError(500, "something went wrong whemn logout the user");
  }
  res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logout successfully"));
});

const Access_And_Refresh_Token = AsyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body;

  if (!token) {
    throw new ApiError(400, "request is unAuthorized");
  }

  const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_EXPIRY);

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(400, "refresh token is invalid");
  }

  if (token !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }

  const { accessToken, refreshToken } =
    await generating_Access_And_Refersh_Token(user._id);

  res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});

const checkEmailforPassword_Check = AsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const existEmail = await User.findOne({ email });

  if (!existEmail) {
    throw new ApiError(400, "email not exist");
  }
  const otp = Math.floor(100000 + Math.random() * 900000);

  await sendMail(email, "ONE TIME USE OTP", otp);

  const saveOtp = await EmailOtp.create({
    email,
    otp,
  });

  if (!saveOtp) {
    throw new ApiError(
      500,
      "something went wrong to save the otp to the database"
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "otp send successfully to the email"));
});

const matchOtp = AsyncHandler(async (req, res) => {
  const { otp } = req.body;
  const userId = req.user?._id;
  if (!otp) {
    throw new ApiError(400, "otp is required");
  }

  const user = await User.findById(userId);

  const EmailOtp = await EmailOtp.findOne(user.email);

  if (otp !== EmailOtp.otp) {
    throw new ApiError(400, "otp is invalid");
  }

  res.status(200).json(new ApiResponse(200, {}, "otp is correct"));
});

const changePassword = AsyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user?._id;
  if (!newPassword) {
    throw new ApiError(400, "password field is reqired");
  }
  const user = await User.findById(userId);

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  
  if (!user) {
    throw new ApiError(
      500,
      "something went wrong while update the password field"
    );
  }


  res
    .status(200)
    .json(new ApiResponse(200, {}, "password change successfully"));
});

const UpdateAvatarImg = AsyncHandler(async (req, res) => {
  const { localAvatarFilePath } = req.file?.path;
  const userId = req.user?._id;
  if (!localAvatarFilePath) {
    throw new ApiError(400, "avatar file path is requiered");
  }

  const newAvatar = await UpLoadImageOnCloudinary(localAvatarFilePath);

  if (!newAvatar) {
    throw new ApiError(
      400,
      "something went wrong while get the image url in cloudinary"
    );
  }

  const setNewAvatarImg = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        avatar: newAvatar,
      },
    },
    { new: true }
  );
});

const UpdatecoverImage = AsyncHandler(async (req, res) => {
  const { localCoverImageFilePath } = req.file?.path;
  const userId = req.user?._id;
  if (!localCoverImageFilePath) {
    throw new ApiError(400, "cover Image file path is requiered");
  }

  const newcoverImage = await UpLoadImageOnCloudinary(localCoverImageFilePath);

  if (!newcoverImage) {
    throw new ApiError(
      400,
      "something went wrong while get the cover image url in cloudinary"
    );
  }

  const setNewCoverImage = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        coverImage: newcoverImage,
      },
    },
    { new: true }
  );

  if (!setNewCoverImage) {
    throw new ApiError(
      500,
      "something went wrong while updating the coverImage "
    );
  }
});

const getCurrentUser = AsyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});
export {
  registerUser,
  loginUser,
  logOutUser,
  Access_And_Refresh_Token,
  checkEmailforPassword_Check,
  matchOtp,
  changePassword,
  UpdatecoverImage,
  UpdateAvatarImg,
  getCurrentUser,
};
