import axios from "axios";

export const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/de7oltfip/auto/upload";
const CLOUDINARY_UPLOAD_PRESET = "expresso";

export const uploadMedia = async (media) => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4"];

  // Validate file type and size
  if (!ALLOWED_TYPES.includes(media.type)) {
    throw new Error("Unsupported file type");
  }

  if (media.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds the limit");
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
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading media:", error);
    throw error;
  }
};
