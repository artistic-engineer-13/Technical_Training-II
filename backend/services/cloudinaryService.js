import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

/**
 * Uploads a local file to Cloudinary and deletes the local temporary file
 * @param {string} filePath - Absolute/relative path to the local file
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (filePath, folder = 'grocery') => {
  try {
    // Ensure Cloudinary is configured (will run in server.js)
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `online-grocery/${folder}`,
      use_filename: true,
      unique_filename: true,
    });

    // Clean up local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (error) {
    // Clean up local file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};
