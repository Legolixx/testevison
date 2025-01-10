"use server";

import cv from "opencv-ts";

async function preprocessImageWithOpenCV(
  imageDataUrl: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
      // Criar canvas e context para desenhar a imagem
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Failed to get canvas context");

      ctx.drawImage(img, 0, 0);
      const src = cv.imread(canvas);

      // Conversão para escala de cinza
      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

      // Aplicação de filtro para remover ruído
      cv.medianBlur(src, src, 5); // Alternativa: cv.GaussianBlur

      // Dilatação para preencher lacunas nos números
      const kernel = cv.getStructuringElement(
        cv.MORPH_RECT,
        new cv.Size(3, 3),
        new cv.Point(-1, -1)
      );
      cv.dilate(src, src, kernel);

      // Binarização adaptativa
      cv.adaptiveThreshold(
        src,
        src,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        11,
        2
      );

      // Erosão leve para refinar o resultado
      cv.erode(src, src, kernel);

      // Exibir ou retornar a imagem processada
      cv.imshow(canvas, src);
      const processedImageDataUrl = canvas.toDataURL("image/png");
      resolve(processedImageDataUrl);

      // Limpeza
      src.delete();
    };
    img.onerror = (err) => reject(err);
  });
}

export default preprocessImageWithOpenCV;
