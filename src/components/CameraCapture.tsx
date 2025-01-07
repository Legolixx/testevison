'use client'

import { useRef, useState } from 'react'
import Tesseract from 'tesseract.js'

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [odometerValue, setOdometerValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error)
    }
  }

  const captureImage = () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Converter para escala de cinza e aumentar contraste
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const grayData = applyGrayscaleAndContrast(imageData)
      ctx.putImageData(grayData, 0, 0)

      const processedImage = canvas.toDataURL('image/png')
      processImage(processedImage)
    }
  }

  const applyGrayscaleAndContrast = (imageData: ImageData) => {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2]
      data[i] = data[i + 1] = data[i + 2] = gray > 128 ? 255 : 0 // Binarização simples
    }
    return imageData
  }

  const processImage = async (imageData: string) => {
    setLoading(true)
    const worker = await Tesseract.createWorker()

    try {
      await worker.load()
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789', // Permitir apenas números
      })

      const result = await worker.recognize(imageData)
      const text = result.data.text.trim()
      setOdometerValue(text)
    } catch (error) {
      console.error('Erro ao processar a imagem:', error)
    } finally {
      await worker.terminate()
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <video
        ref={videoRef}
        autoPlay
        className="w-full max-w-sm border border-gray-300 rounded-lg"
      ></video>
      <div className="flex space-x-4">
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
      <input
        type="text"
        value={odometerValue}
        readOnly
        placeholder="Valor do odômetro"
        className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg"
      />
      {loading && <p>Processando imagem...</p>}
    </div>
  )
}
