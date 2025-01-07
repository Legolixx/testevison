"use client";

import { useRef, useState } from "react";

const CameraCapture = ({ onCapture }: { onCapture: (imageData: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera not supported on this device.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/png");
      onCapture(imageData);
    }

    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraOn(false);
    }
  };

  return (
    <div className="camera-container">
      {isCameraOn ? (
        <div>
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
          <button onClick={takePhoto} className="btn btn-primary mt-2">
            Capture Photo
          </button>
        </div>
      ) : (
        <button onClick={startCamera} className="btn btn-primary">
          Open Camera
        </button>
      )}
    </div>
  );
};

export default CameraCapture;
