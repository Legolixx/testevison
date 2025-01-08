"use client";

import { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import Image from "next/image";

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [odometerValue, setOdometerValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1); // Zoom state

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
      // Get video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Apply zoom scaling to canvas size
      canvas.width = videoWidth * zoom;
      canvas.height = videoHeight * zoom;

      // Get the 2d context
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Apply zoom transformation to the context
        ctx.scale(zoom, zoom);

        // Calculate the offset needed to capture the center
        const offsetX = (videoWidth * (zoom - 1)) / 2;
        const offsetY = (videoHeight * (zoom - 1)) / 2;

        // Draw the video to the canvas with the appropriate offset
        ctx.drawImage(
          video,
          -offsetX,
          -offsetY,
          videoWidth * zoom,
          videoHeight * zoom
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
        const result = await Tesseract.recognize(imageData, "eng", {
          logger: (m) => console.log(m),
        });
        const text = result.data.text;
        const numbersOnly = text.replace(/\D/g, ""); // Remove qualquer coisa que não seja número
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
      {/* Video feed with zoom applied via CSS */}
      <div
        className="relative overflow-hidden"
        style={{ width: "100%", height: "auto" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="rounded-lg"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Zoom Slider */}
      <input
        type="range"
        min="1"
        max="3"
        step="0.1"
        value={zoom}
        onChange={(e) => setZoom(parseFloat(e.target.value))}
        className="w-1/2 mt-4"
      />

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
