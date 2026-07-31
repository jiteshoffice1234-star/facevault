import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'
import type { Landmarks } from './geometry'

export interface EngineImage {
  width: number
  height: number
  data: Uint8ClampedArray
}

export interface DetectionResult {
  landmarks: Landmarks
  confidence: number
}

let landmarker: FaceLandmarker | null = null
let loadingPromise: Promise<FaceLandmarker> | null = null

// Base-aware paths: works at '/' (local dev, Capacitor) and under a subpath
// like '/facevault/' (GitHub Pages).
const base = import.meta.env.BASE_URL ?? '/'
export const WASM_PATH = `${base}models/wasm`
export const MODEL_PATH = `${base}models/face_landmarker.task`

export async function getLandmarker(): Promise<FaceLandmarker> {
  if (landmarker) return landmarker
  if (loadingPromise) return loadingPromise
  loadingPromise = (async () => {
    const fileset = await FilesetResolver.forVisionTasks(WASM_PATH)
    const tryCreate = (delegate: 'GPU' | 'CPU') =>
      FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: MODEL_PATH,
          delegate,
        },
        outputFaceBlendshapes: false,
        runningMode: 'IMAGE',
        numFaces: 1,
      })
    try {
      landmarker = await tryCreate('GPU')
    } catch {
      landmarker = await tryCreate('CPU')
    }
    return landmarker
  })().catch((e) => {
    // Clear the cached failure so a later attempt can retry.
    loadingPromise = null
    throw e
  })
  return loadingPromise
}

export function toEngineImage(source: ImageBitmap | HTMLCanvasElement | HTMLVideoElement): EngineImage {
  const w = source.width
  const h = source.height
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(source, 0, 0)
  const data = ctx.getImageData(0, 0, w, h).data
  return { width: w, height: h, data }
}

export function imageBitmapFromFile(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file)
}

export async function detectFromImage(image: EngineImage): Promise<DetectionResult | null> {
  const lm = await getLandmarker()
  const source = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height)
  const result = lm.detect(source)
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null
  const face = result.faceLandmarks[0]
  const landmarks: Landmarks = face.map((pt) => ({ x: pt.x, y: pt.y, z: pt.z }))
  return { landmarks, confidence: 1 }
}

export function releaseLandmarker(): void {
  if (landmarker) {
    try {
      landmarker.close()
    } catch {
      /* ignore */
    }
  }
  landmarker = null
  loadingPromise = null
}
