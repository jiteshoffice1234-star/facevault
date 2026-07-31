import type { Landmarks } from './geometry'

export type AvatarStyle = 'cartoon' | 'neon' | 'mono' | 'glow'

export interface AvatarResult {
  svg: string
  dataUrl: string
  landmarksJson: string
}

const IDX = {
  jawL: 234,
  jawR: 454,
  chin: 152,
  foreheadTop: 10,
  eyeLOuter: 33,
  eyeLInner: 133,
  eyeRInner: 362,
  eyeROuter: 263,
  eyeLUpper: 159,
  eyeLLower: 145,
  eyeRUpper: 386,
  eyeRLower: 374,
  browLInner: 70,
  browLOuter: 105,
  browRInner: 300,
  browROuter: 334,
  noseTip: 1,
  noseBase: 2,
  noseAlaL: 49,
  noseAlaR: 279,
  mouthCornerL: 61,
  mouthCornerR: 291,
  upperLip: 0,
  lowerLip: 17,
  irisL: 468,
  irisR: 473,
} as const

export function buildAvatar(lm: Landmarks, style: AvatarStyle, colors: { skin: string; hair: string; line: string; accent: string; bg: string }): AvatarResult {
  if (!lm || lm.length < 478) throw new Error('Invalid landmarks')

  const pad = 40
  const pts = new Map<number, { x: number; y: number }>()
  for (const key of Object.values(IDX)) {
    const p = lm[key]
    if (!p) continue
    pts.set(key, { x: p.x * 100 + pad, y: p.y * 100 + pad })
  }

  const minX = Math.min(...Object.values(IDX).map((i) => pts.get(i)!.x))
  const maxX = Math.max(...Object.values(IDX).map((i) => pts.get(i)!.x))
  const minY = Math.min(...Object.values(IDX).map((i) => pts.get(i)!.y))
  const maxY = Math.max(...Object.values(IDX).map((i) => pts.get(i)!.y))

  const viewBox = `${Math.floor(minX - 30)} ${Math.floor(minY - 30)} ${Math.ceil(maxX - minX + 60)} ${Math.ceil(maxY - minY + 60)}`

  const jawL = pts.get(IDX.jawL)!
  const jawR = pts.get(IDX.jawR)!
  const chin = pts.get(IDX.chin)!
  const top = pts.get(IDX.foreheadTop)!

  const facePath = `M ${jawL.x} ${jawL.y} Q ${(jawL.x + jawR.x) / 2} ${maxY + 6} ${jawR.x} ${jawR.y} Q ${top.x} ${top.y} ${jawL.x} ${jawL.y} Z`

  const eL = {
    outer: pts.get(IDX.eyeLOuter)!,
    inner: pts.get(IDX.eyeLInner)!,
    upper: pts.get(IDX.eyeLUpper)!,
    lower: pts.get(IDX.eyeLLower)!,
    iris: pts.get(IDX.irisL)!,
  }
  const eR = {
    outer: pts.get(IDX.eyeROuter)!,
    inner: pts.get(IDX.eyeRInner)!,
    upper: pts.get(IDX.eyeRUpper)!,
    lower: pts.get(IDX.eyeRLower)!,
    iris: pts.get(IDX.irisR)!,
  }
  const browL = { inner: pts.get(IDX.browLInner)!, outer: pts.get(IDX.browLOuter)! }
  const browR = { inner: pts.get(IDX.browRInner)!, outer: pts.get(IDX.browROuter)! }

  const noseTip = pts.get(IDX.noseTip)!
  const noseAlaL = pts.get(IDX.noseAlaL)!
  const noseAlaR = pts.get(IDX.noseAlaR)!

  const mouthL = pts.get(IDX.mouthCornerL)!
  const mouthR = pts.get(IDX.mouthCornerR)!
  const upperLip = pts.get(IDX.upperLip)!
  const lowerLip = pts.get(IDX.lowerLip)!

  const eyePath = (e: typeof eL) =>
    `M ${e.outer.x} ${(e.outer.y + e.upper.y) / 2} Q ${(e.outer.x + e.inner.x) / 2} ${e.upper.y - 2} ${e.inner.x} ${(e.inner.y + e.upper.y) / 2} Q ${(e.outer.x + e.inner.x) / 2} ${e.lower.y + 2} ${e.outer.x} ${(e.outer.y + e.upper.y) / 2} Z`

  const eyebrowPath = (b: typeof browL) =>
    `M ${b.inner.x} ${b.inner.y} Q ${(b.inner.x + b.outer.x) / 2} ${b.inner.y - 6} ${b.outer.x} ${b.outer.y} Q ${(b.inner.x + b.outer.x) / 2} ${b.outer.y - 4} ${b.inner.x} ${b.inner.y} Z`

  const nosePath = `M ${noseAlaL.x} ${noseAlaL.y} Q ${noseTip.x} ${noseTip.y + 4} ${noseAlaR.x} ${noseAlaR.y} Q ${(noseAlaL.x + noseAlaR.x) / 2} ${noseAlaL.y - 2} ${noseAlaL.x} ${noseAlaL.y} Z`

  const mouthPath = `M ${mouthL.x} ${mouthL.y} Q ${(mouthL.x + mouthR.x) / 2} ${upperLip.y - 3} ${mouthR.x} ${mouthR.y} Q ${(mouthL.x + mouthR.x) / 2} ${lowerLip.y + 6} ${mouthL.x} ${mouthL.y} Z`

  const hairStyle = `M ${jawL.x} ${top.y + 4} Q ${top.x} ${minY - 14} ${jawR.x} ${top.y + 4} Q ${(jawL.x + jawR.x) / 2} ${top.y - 16} ${jawL.x} ${top.y + 4} Z`

  const isDark = false
  void isDark

  const gradientDefs =
    style === 'glow'
      ? `<defs><linearGradient id="ac" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors.accent}" stop-opacity="0.9"/><stop offset="1" stop-color="${colors.accent}" stop-opacity="0.4"/></linearGradient></defs>`
      : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%">
${gradientDefs}
  <rect x="${Math.floor(minX - 30)}" y="${Math.floor(minY - 30)}" width="${Math.ceil(maxX - minX + 60)}" height="${Math.ceil(maxY - minY + 60)}" fill="${colors.bg}" rx="24"/>
  <path d="${hairStyle}" fill="${colors.hair}"/>
  <path d="${facePath}" fill="${colors.skin}" stroke="${colors.line}" stroke-width="1.2"/>
  <path d="${eyebrowPath(browL)}" fill="${colors.hair}"/>
  <path d="${eyebrowPath(browR)}" fill="${colors.hair}"/>
  <path d="${eyePath(eL)}" fill="${colors.line}"/>
  <path d="${eyePath(eR)}" fill="${colors.line}"/>
  <circle cx="${eL.iris.x}" cy="${eL.iris.y}" r="2.4" fill="${style === 'neon' ? colors.accent : '#fff'}"/>
  <circle cx="${eR.iris.x}" cy="${eR.iris.y}" r="2.4" fill="${style === 'neon' ? colors.accent : '#fff'}"/>
  <path d="${nosePath}" fill="${colors.skin}" stroke="${colors.line}" stroke-width="1" opacity="0.9"/>
  <path d="${mouthPath}" fill="${style === 'neon' ? colors.accent : colors.line}" stroke="${colors.line}" stroke-width="1"/>
  ${style === 'glow' ? `<circle cx="${(jawL.x + jawR.x) / 2}" cy="${(top.y + chin.y) / 2}" r="26" fill="url(#ac)" opacity="0.5"/>` : ''}
</svg>`

  const dataUrl = svgToDataUrl(svg)
  const landmarksJson = JSON.stringify(lm.map((p) => ({ x: p.x, y: p.y, z: p.z })))

  return { svg, dataUrl, landmarksJson }
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function downloadAvatar(result: AvatarResult, format: 'svg' | 'json' | 'png', filename: string): void {
  const ext = format === 'svg' ? 'svg' : format === 'json' ? 'json' : 'png'
  const blobTarget = filename.endsWith(ext) ? filename : `${filename}.${ext}`
  if (format === 'svg') {
    downloadBlob(new Blob([result.svg], { type: 'image/svg+xml' }), blobTarget)
  } else if (format === 'json') {
    downloadBlob(new Blob([result.landmarksJson], { type: 'application/json' }), blobTarget)
  } else {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width * 2
      canvas.height = img.height * 2
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, blobTarget)
      }, 'image/png')
    }
    img.src = result.dataUrl
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
