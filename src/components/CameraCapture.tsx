'use client'

import { useRef, useState } from 'react'
import Tesseract from 'tesseract.js'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cropperInstance, setCropperInstance] = useState<Cropper | null>(null) // Instância do Cropper
  const [odometerValue, setOdometerValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [imageData, setImageData] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
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
        const capturedImage = canvas.toDataURL('image/png')
        setImageData(capturedImage)
      }
    }
  }

  const processImage = async () => {
    if (cropperInstance) {
      // Obtém o canvas recortado
      const croppedCanvas = cropperInstance.getCroppedCanvas()
      const croppedImageData = croppedCanvas.toDataURL('image/png')
      
      // Atualiza o estado com a imagem recortada
      setImageData(croppedImageData)

      setLoading(true)
      try {
        const result = await Tesseract.recognize(croppedImageData, 'eng', {
          logger: (m) => console.log(m),
        })
        const text = result.data.text
        const numbersOnly = text.replace(/\D/g, '') // Remove qualquer coisa que não seja número
        setOdometerValue(numbersOnly)
      } catch (error) {
        console.error('Erro ao processar a imagem:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-sm border border-gray-300 rounded-lg"
      ></video>
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
      
      {imageData && !loading && (
        <div className="relative">
          <Cropper
            src={imageData}
            onInitialized={(instance) => setCropperInstance(instance)} // Salvar a instância do Cropper
            style={{ width: '100%', maxWidth: '500px' }}
            aspectRatio={16 / 9}
            guides={false}
          />
          <button
            onClick={processImage}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Processar Imagem
          </button>
        </div>
      )}
      
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
  )
}
