import Tesseract from "tesseract.js";

export const extractOdometerValue = async (imageData: string): Promise<string> => {
  try {
    const result = await Tesseract.recognize(imageData, "eng");
    return result.data.text.trim();
  } catch (err) {
    console.error("Error processing image:", err);
    return "";
  }
};
