"use client";

import { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import Image from "next/image";
import preprocessImage from "@/utils/preprocessImage";

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [odometerValue, setOdometerValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [imageData, setImageData] = useState<string | null>(null);

  // Define cropping frame size (percentage of video dimensions)
  const [cropFrame, setCropFrame] = useState({ width: 50, height: 30 });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
      }
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error);
    }
  };

  const captureImage = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    if (video) {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Calculate cropping frame position and size in pixels
      const cropWidth = (cropFrame.width / 100) * videoWidth;
      const cropHeight = (cropFrame.height / 100) * videoHeight;
      const cropX = (videoWidth - cropWidth) / 2;
      const cropY = (videoHeight - cropHeight) / 2;

      // Set canvas size to crop size
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw only the cropped area of the video onto the canvas
        ctx.drawImage(
          video,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        const capturedImage = canvas.toDataURL("image/png");
        setImageData(capturedImage);
      }
    }
  };

  const processImage = async () => {
    if (imageData) {
      setLoading(true);
  
      try {
        // Preprocess the image and get the processed data URL
        const preprocessedImageData = await preprocessImage(imageData);
  
        // Display the preprocessed image
        setImageData(preprocessedImageData);
  
        // Perform OCR using Tesseract on the preprocessed image
        const result = await Tesseract.recognize(preprocessedImageData, "eng", {
          logger: (m) => console.log(m),
        });
  
        const text = result.data.text;
        const numbersOnly = text.replace(/\D/g, "");
        setOdometerValue(numbersOnly);
      } catch (error) {
        console.error("Erro ao processar a imagem:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Video feed with cropping frame */}
      {/* Video feed with cropping frame */}
      <div
        className="relative"
        style={{ width: "100%", height: "auto", overflow: "hidden" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="rounded-lg"
          style={{
            width: "100%",
            height: "auto",
            transformOrigin: "center center",
          }}
        />

        {/* Cropping frame overlay */}
        <div
          className="absolute border-2 border-red-500 pointer-events-none"
          style={{
            width: `${cropFrame.width}%`,
            height: `${cropFrame.height}%`,
            top: `${(100 - cropFrame.height) / 2}%`,
            left: `${(100 - cropFrame.width) / 2}%`,
          }}
        ></div>
      </div>

      {/* Sliders for adjusting crop frame size */}
      <div className="flex flex-col space-y-2 mt-4">
        <label>
          Largura do corte: {cropFrame.width}%
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={cropFrame.width}
            onChange={(e) =>
              setCropFrame({ ...cropFrame, width: parseInt(e.target.value) })
            }
            className="w-full"
          />
        </label>

        <label>
          Altura do corte: {cropFrame.height}%
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={cropFrame.height}
            onChange={(e) =>
              setCropFrame({ ...cropFrame, height: parseInt(e.target.value) })
            }
            className="w-full"
          />
        </label>
      </div>

      <div className="flex space-x-4 z-10">
        <button
          onClick={startCamera}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Abrir Câmera
        </button>
        <button
          onClick={captureImage}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          Capturar Imagem
        </button>
      </div>

      {/* Show image after capture */}
      {imageData && !loading && (
        <div className="relative">
          <Image src={imageData} width={400} height={400} alt="teste" />
          <button
            onClick={processImage}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Processar Imagem
          </button>
        </div>
      )}

      {/* Show loading or the odometer value */}
      {loading ? (
        <p>Processando imagem...</p>
      ) : (
        <input
          type="text"
          value={odometerValue}
          readOnly
          placeholder="Valor do odômetro"
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg"
        />
      )}
    </div>
  );
}
