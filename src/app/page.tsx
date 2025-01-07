"use client";

import { useState } from "react";
import CameraCapture from "@/components/CameraCapture";
import { extractOdometerValue } from "@/utils/processImage";

export default function Home() {
  const [odometerValue, setOdometerValue] = useState("");

  const handleCapture = async (imageData: string) => {
    const value = await extractOdometerValue(imageData);
    setOdometerValue(value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Odometer Capture</h1>
      <CameraCapture onCapture={handleCapture} />
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Odometer Value</label>
        <input
          type="text"
          value={odometerValue}
          onChange={(e) => setOdometerValue(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
}
