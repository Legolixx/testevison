"use server";

import sharp from "sharp";

async function preprocessImage(imageDataUrl: string): Promise<string> {
  try {
    // Convert data URL to buffer
    const base64 = imageDataUrl.split(",")[1];
    if (!base64) throw new Error("Invalid image data URL");
    const imageBuffer = Buffer.from(base64, "base64");

    // Process the image with sharp
    const processedBuffer = await sharp(imageBuffer)
      .grayscale()
      .modulate({ brightness: 1.2, saturation: 1 })
      .blur(1)
      .normalize()
      .threshold(170)
      .toBuffer();

    // Convert processed buffer back to data URL
    const processedImageDataUrl = `data:image/png;base64,${processedBuffer.toString(
      "base64"
    )}`;

    return processedImageDataUrl;
  } catch (error) {
    console.error("Error during image preprocessing:", error);
    throw error;
  }
}

export default preprocessImage;
