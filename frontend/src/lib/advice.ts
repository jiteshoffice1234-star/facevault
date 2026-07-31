import type { CategoryId, Metric } from './metrics'

const HINTS: Record<string, string> = {
  symmetry_avg:
    'Your facial halves differ slightly. In photos, angle your stronger side toward the camera and keep your head level. Good sleep and reduced facial swelling help overall symmetry read better.',
  symmetry_local:
    'One feature pair is noticeably asymmetric. Pose and expression can minimize it; a slightly angled shot hides the mismatch.',
  thirds_forehead:
    'Your forehead third is off-balance. Hairstyles with volume on top or a fringe can visually rebalance the upper third.',
  thirds_midface:
    'Your midface third is off-balance. A lower-cut hairstyle or glasses can add visual weight where needed.',
  thirds_lower:
    'Your lower third is off-balance. Jawline training, posture, and reducing face puffiness (hydration, sleep, less sodium) can tighten this area.',
  ratio_face:
    'Your face width-to-length ratio is off the ~0.75 ideal. Hairstyle framing and camera angle (slightly below eye level) shift how wide your face reads.',
  ratio_eye_face:
    'Your eye-to-face width ratio is off the ideal. This is hard to change - focus on brow grooming and eye brightness (sleep, hydration) to maximize the features you have.',
  ratio_nose:
    'Your nose width-to-length ratio is off target. Contouring near the nose bridge and nose shadowing with makeup are the standard non-surgical adjustments.',
  ratio_mouth:
    'Your mouth-to-nose width ratio is off. Lip care and subtle lip enhancement around the edges can balance this.',
  ratio_phi_face:
    'Your face length-to-width ratio deviates from the phi-based ideal. Camera distance (35-50mm equivalent) and slight head tilt adjust how this reads in photos.',
  ratio_interocular:
    'Your interocular distance is off the one-eye-width ideal. Eyebrow grooming and eye makeup placement can optically adjust eye spacing.',
  jaw_width:
    'Your jaw width relative to face width is off. Jawline exercises, mewing posture, and reducing body fat can help define the gonial area.',
  jaw_gonial:
    'Your gonial angle is off the ~124deg ideal. Lower body fat, jawline training, and good posture are the practical levers.',
  jaw_defined:
    'Your jaw-to-cheek contrast is low. Improving jaw definition via lower-face leanness and posture will boost this.',
  cheek_ratio:
    'Your cheekbone ratio is off. Lowering body fat reveals the zygomatic arch; good lighting in photos emphasizes it.',
  cheek_face:
    'Your cheekbones read narrow relative to your face. Facial leanness and posing at a three-quarter angle highlight them.',
  eye_dist:
    'Your eye separation is off the ideal. Makeup (outer-corner liner) and eyebrow shaping can optically adjust it.',
  eye_ratio:
    'Your eye width-to-height ratio is off. Rest, hydration, and reduced puffiness make eyes read larger and more open.',
  eye_tilt:
    'Your canthal tilt is off the preferred angle. Outer-corner eyeliner and lash styling can create an upward tilt optically.',
  eye_brow:
    'Your brow-to-eye gap is off. Brow grooming and trimming the brow arch can balance this.',
  lip_width:
    'Your lip width ratio is off. Lip care (hydration, exfoliation) and subtle liner slightly outside the natural line can help.',
  lip_ratio:
    'Your upper-to-lower lip proportion is off. Lip care and subtle filler-free volume techniques can rebalance it.',
  lip_philtrum:
    'Your philtrum length is off. Keeping the upper lip area hydrated and subtle makeup highlight can optically shorten it.',
  nose_length:
    'Your nose length relative to face length is off. Contour shading at the tip and bridge, plus hairstyle framing, are the levers.',
  nose_width_face:
    'Your nose width relative to face width is off. Subtle contour along the nose sides narrows its appearance in photos.',
  chin_proj:
    'Your chin length is off. Posture, reducing face puffiness, and jawline definition exercises help the chin area read better.',
  chin_jaw:
    'Your chin-to-jaw relationship is off. Consistent jawline training and lower-face leanness are the practical improvements.',
}

const CATEGORY_BLURB: Record<CategoryId, string> = {
  symmetry: 'Symmetry is the single biggest driver of perceived attractiveness across cultures.',
  thirds: 'The face is ideally split into three equal vertical thirds.',
  goldenRatio: 'Many attractiveness models use the golden ratio (~1.618) as a reference for ideal proportions.',
  jawline: 'A defined jawline is a strong marker of facial attractiveness, especially for men.',
  cheekbones: 'Prominent, high cheekbones read as attractive and youthful.',
  eyes: 'Eye shape, spacing, and tilt strongly influence first impressions.',
  lips: 'Lip width and proportion contribute to facial balance.',
  nose: 'Nose proportions relative to the face affect overall harmony.',
  chin: 'Chin projection and length anchor the lower face.',
}

export function adviceFor(metric: Metric): string {
  return HINTS[metric.id] ?? `${CATEGORY_BLURB[metric.category]} Focus on the "${metric.label}" metric.`
}
