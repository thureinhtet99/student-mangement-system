import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_CONFIG } from "@/configs/appConfig";

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.CLOUD_NAME,
  api_key: CLOUDINARY_CONFIG.API_KEY,
  api_secret: CLOUDINARY_CONFIG.API_SECRET,
});

export const uploadToCloudinary = async (
  file: File,
  folder: string = CLOUDINARY_CONFIG.FOLDER.PROFILE
): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "auto",
            transformation: [
              {
                width: 400,
                height: 400,
                crop: "fill",
                gravity: "face",
                quality: "auto",
                format: "auto",
              },
            ],
          },
          (error, result) => {
            if (error) {
              reject(new Error(`Upload failed: ${error.message}`));
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error("Upload failed: No result returned"));
            }
          }
        )
        .end(buffer);
    });
  } catch (error) {
    throw new Error(
      `File processing failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl) return;

    // Extract public_id from Cloudinary URL
    const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
    // Don't throw error as this is not critical
  }
};

export const getCloudinaryUrl = (
  publicId: string,
  transformation?: string
): string => {
  if (!publicId) return "";

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload/`;

  if (transformation) {
    return `${baseUrl}${transformation}/${publicId}`;
  }

  return `${baseUrl}${publicId}`;
};

export default cloudinary;
