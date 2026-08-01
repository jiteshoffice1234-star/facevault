/**
 * CLI quality check for the AI advisor (no server needed).
 * Run: npm run eval  (loads .env, hits the configured provider)
 */
import { generateAIAdvice, buildPrompt, aiConfigured } from './ai.js'

const synthetic = {
  compositeScore: 74,
  pslBand: 7,
  faceShape: 'Oval',
  genderGuess: 'neutral',
  categories: [
    { id: 'symmetry', label: 'Symmetry', score: 0.82 },
    { id: 'thirds', label: 'Facial thirds', score: 0.78 },
    { id: 'goldenRatio', label: 'Golden ratio', score: 0.61 },
    { id: 'jawline', label: 'Jawline', score: 0.55 },
    { id: 'cheekbones', label: 'Cheekbones', score: 0.7 },
    { id: 'eyes', label: 'Eyes', score: 0.8 },
    { id: 'lips', label: 'Lips', score: 0.88 },
    { id: 'nose', label: 'Nose', score: 0.66 },
    { id: 'chin', label: 'Chin', score: 0.72 },
  ],
  metrics: [
    { id: 'symmetry_avg', label: 'Overall symmetry', value: 0.11, ideal: 0, tolerance: 0.32, score: 0.66, unit: '' },
    { id: 'jaw_gonial', label: 'Gonial angle', value: 130, ideal: 124, tolerance: 8, score: 0.43, unit: 'deg' },
    { id: 'ratio_nose', label: 'Nose width / length', value: 0.74, ideal: 0.62, tolerance: 0.12, score: 0.45, unit: '' },
    { id: 'eye_tilt', label: 'Canthal tilt', value: -9, ideal: -5, tolerance: 6, score: 0.33, unit: 'deg' },
    { id: 'ratio_eye_face', label: 'Eye width / face width', value: 0.3, ideal: 0.31, tolerance: 0.04, score: 0.9, unit: '' },
  ],
}

console.log('AI configured:', aiConfigured())
console.log('\n--- PROMPT (what the model sees) ---\n')
console.log(buildPrompt(synthetic))
console.log('\n--- AI RESPONSE ---\n')
const result = await generateAIAdvice(synthetic)
console.log(JSON.stringify(result, null, 2))
