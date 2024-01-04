import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log(localFilePath);
    if (!localFilePath) return null;
    const file = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File has been uploaded on Cloudinary", file.url);
    fs.unlink(localFilePath);
    return file;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error("Error While Uploading File on cloudinary");
    return error.message;
  }
};

const deleteFromCloudinay = async (mediaId) => {
  await cloudinary.uploader.destroy();
};

export { uploadOnCloudinary };
