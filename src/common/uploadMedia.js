import axios from "axios";

export const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/de7oltfip/auto/upload";
const CLOUDINARY_UPLOAD_PRESET = "expresso";

export const uploadMedia = async (media) => {
  // Check if media is null or undefined
  if (!media) {
    throw new Error("No file selected");
  }

  // Check if media has type property
  if (!media.type) {
    throw new Error("Invalid file format");
  }

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4"];

  // Validate file type
  if (!ALLOWED_TYPES.includes(media.type)) {
    throw new Error("Unsupported file type. Please use JPG, PNG, GIF or MP4 files.");
  }

  const formData = new FormData();
  formData.append("file", media);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "social-media");

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000, // Increase timeout to 60 seconds for larger files
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading media:", error);
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("Upload timed out. Please try with a smaller file or check your connection.");
    } else {
      throw new Error("Failed to upload image. Please try again.");
    }
  }
};
