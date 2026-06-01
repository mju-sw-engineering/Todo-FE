const COMPRESSIBLE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_DIMENSION = 1280
const JPEG_QUALITY = 0.8

function getCompressedFileName(fileName: string): string {
  const trimmed = fileName.trim()
  const dotIndex = trimmed.lastIndexOf('.')
  const baseName = dotIndex > 0 ? trimmed.slice(0, dotIndex) : trimmed || 'image'
  return `${baseName}.jpg`
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('이미지를 불러오지 못했습니다.'))
    }
    image.src = url
  })
}

function getResizedDimensions(width: number, height: number): { width: number; height: number } {
  const longestSide = Math.max(width, height)
  if (longestSide <= MAX_IMAGE_DIMENSION) return { width, height }

  const scale = MAX_IMAGE_DIMENSION / longestSide
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

export async function compressImageFile(file: File): Promise<File> {
  if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type)) return file
  if (typeof window === 'undefined') return file

  try {
    const image = await loadImage(file)
    const { width, height } = getResizedDimensions(image.naturalWidth, image.naturalHeight)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) return file

    context.drawImage(image, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    })

    if (!blob) return file

    return new File([blob], getCompressedFileName(file.name), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    return file
  }
}
