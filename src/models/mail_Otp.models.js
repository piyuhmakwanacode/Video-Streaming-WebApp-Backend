import mongoose from "mongoose";

const EmailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120,
  },
});

export const EmailOtp = mongoose.model("EmailOtp", EmailOtpSchema);
