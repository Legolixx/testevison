'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error)
    }
  }

  const captureImage = () => {
    const canvas = document.createElement('canvas')
    const video = videoRef.current

    if (video) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL('image/png')
        setCapturedImage(imageData)
        console.log('Dados da imagem capturada:', imageData)
      }
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
      {capturedImage && (
        <Image
          src={capturedImage}
          alt="Imagem capturada"
          className="w-full max-w-sm border border-gray-300 rounded-lg"
          width={300} // Adicione o tamanho para o Next.js otimizar
          height={200} // Adicione o tamanho para o Next.js otimizar
        />
      )}
    </div>
  )
}
