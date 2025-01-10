/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import cv, { Mat, Rect } from "opencv-ts";

async function preprocessImage(imageDataUrl: string): Promise<string> {
  try {
    // Convert data URL to ImageData
    const base64 = imageDataUrl.split(",")[1];
    if (!base64) throw new Error("Invalid image data URL");
    const imageBuffer = Buffer.from(base64, "base64");

    // Create an HTML Image element to load the image
    const img = new Image();
    img.src = imageDataUrl;
    
    // Wait for image to load
    await new Promise((resolve) => (img.onload = resolve));

    // Create a canvas to draw the image and extract ImageData
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    // Load image into OpenCV Mat
    const src = cv.matFromImageData(imageData);
    const gray = new cv.Mat();
    const blurred = new cv.Mat();
    const binary = new cv.Mat();
    const kernel = new cv.Mat.ones(3, 3, cv.CV_8U);

    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Apply Gaussian blur to reduce noise
    cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);

    // Apply adaptive thresholding
    cv.adaptiveThreshold(
      blurred,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      11, // Block size
      2   // Constant subtracted from mean
    );

    // Apply morphological closing to fill gaps in digits
    cv.morphologyEx(binary, binary, cv.MORPH_CLOSE, kernel, new cv.Point(-1, -1), 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    // Convert processed image back to ImageData
    const outputCanvas = document.createElement("canvas");
    const outputCtx = outputCanvas.getContext("2d")!;
    outputCanvas.width = binary.cols;
    outputCanvas.height = binary.rows;

    // Create ImageData from the OpenCV Mat
    const outputImageData = new ImageData(
      new Uint8ClampedArray(binary.data),
      binary.cols,
      binary.rows
    );
    outputCtx.putImageData(outputImageData, 0, 0);

    // Convert output canvas to data URL
    const processedImageDataUrl = outputCanvas.toDataURL("image/png");

    // Clean up memory
    src.delete();
    gray.delete();
    blurred.delete();
    binary.delete();
    kernel.delete();

    return processedImageDataUrl;
  } catch (error) {
    console.error("Error during image preprocessing:", error);
    throw error;
  }
}

export default preprocessImage;
