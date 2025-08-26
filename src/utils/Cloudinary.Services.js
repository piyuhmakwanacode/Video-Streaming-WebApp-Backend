import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv'
dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});
const UpLoadImageOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(response.url)
    return response
   
  } catch (error) {
     fs.unlinkSync(localFilePath)
    console.log(
      "error comes when uploading the file to Cloudinary this is Error:- ",
      error
    );
    return null
  }
};

export {UpLoadImageOnCloudinary}
