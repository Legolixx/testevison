"use server";

import sharp from "sharp";
import cv from "opencv-ts";

async function preprocessImage(imageDataUrl: string): Promise<string> {
  try {
    // Step 1: Sharp preprocessing
    const base64 = imageDataUrl.split(",")[1];
    if (!base64) throw new Error("Invalid image data URL");
    const imageBuffer = Buffer.from(base64, "base64");

    const processedBuffer = await sharp(imageBuffer)
      .grayscale()
      .modulate({ brightness: 1.2, saturation: 1 })
      .blur(1)
      .normalize()
      .threshold(135)
      .toBuffer();

    // Convert processed buffer to an ImageData object for OpenCV
    const sharpImage = new Image();
    sharpImage.src = `data:image/png;base64,${processedBuffer.toString("base64")}`;

    return new Promise((resolve, reject) => {
      sharpImage.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = sharpImage.width;
        canvas.height = sharpImage.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Failed to get canvas context");

        ctx.drawImage(sharpImage, 0, 0);
        const src = cv.imread(canvas);

        // Step 2: Apply Morphological Closing with OpenCV
        const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3), new cv.Point(-1, -1));
        cv.morphologyEx(src, src, cv.MORPH_CLOSE, kernel, new cv.Point(-1, -1), 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        // Step 3: Display or return the processed image
        cv.imshow(canvas, src);
        const finalImageDataUrl = canvas.toDataURL("image/png");
        resolve(finalImageDataUrl);

        // Cleanup
        src.delete();
      };

      sharpImage.onerror = (err) => reject(err);
    });
  } catch (error) {
    console.error("Error during image preprocessing:", error);
    throw error;
  }
}

export default preprocessImage;
