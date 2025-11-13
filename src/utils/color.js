export function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!match) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  }
}

export function rgbToHsl({ r, g, b }) {
  const [rNorm, gNorm, bNorm] = [r, g, b].map(v => v / 255)
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const delta = max - min
  const lightness = (max + min) / 2

  if (delta === 0) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) }
  }

  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min)

  const hue = max === rNorm
    ? ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6
    : max === gNorm
    ? ((bNorm - rNorm) / delta + 2) / 6
    : ((rNorm - gNorm) / delta + 4) / 6

  return {
    h: Math.round(hue * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100)
  }
}

function rgbToXyz({ r, g, b }) {
  const normalize = (val) => {
    val = val / 255
    return val > 0.04045
      ? Math.pow((val + 0.055) / 1.055, 2.4)
      : val / 12.92
  }

  const [rNorm, gNorm, bNorm] = [r, g, b].map(normalize)
  const [rLin, gLin, bLin] = [rNorm * 100, gNorm * 100, bNorm * 100]

  return {
    x: rLin * 0.4124564 + gLin * 0.3575761 + bLin * 0.1804375,
    y: rLin * 0.2126729 + gLin * 0.7151522 + bLin * 0.0721750,
    z: rLin * 0.0193339 + gLin * 0.1191920 + bLin * 0.9503041
  }
}

function xyzToLab({ x, y, z }) {
  const [xn, yn, zn] = [95.047, 100.000, 108.883]
  const normalize = (val, ref) => {
    val = val / ref
    return val > 0.008856
      ? Math.pow(val, 1 / 3)
      : (7.787 * val + 16 / 116)
  }

  const [fx, fy, fz] = [
    normalize(x, xn),
    normalize(y, yn),
    normalize(z, zn)
  ]

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  }
}

function labToLch({ l, a, b }) {
  const c = Math.sqrt(a * a + b * b)
  const h = Math.atan2(b, a) * (180 / Math.PI)
  return {
    l: Math.round(l),
    c: Math.round(c),
    h: Math.round(h < 0 ? h + 360 : h)
  }
}

export function rgbToLch(rgb) {
  const xyz = rgbToXyz(rgb)
  const lab = xyzToLab(xyz)
  return labToLch(lab)
}

function hslToRgb({ h, s, l }) {
  const hNorm = h / 360
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1))
  const m = lNorm - c / 2

  let r, g, b
  if (hNorm < 1/6) [r, g, b] = [c, x, 0]
  else if (hNorm < 2/6) [r, g, b] = [x, c, 0]
  else if (hNorm < 3/6) [r, g, b] = [0, c, x]
  else if (hNorm < 4/6) [r, g, b] = [0, x, c]
  else if (hNorm < 5/6) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function getLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function generatePalette(hex) {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb)
  
  const complementary = {
    h: (hsl.h + 180) % 360,
    s: hsl.s,
    l: hsl.l
  }
  
  const triadic1 = {
    h: (hsl.h + 120) % 360,
    s: hsl.s,
    l: hsl.l
  }
  
  const triadic2 = {
    h: (hsl.h + 240) % 360,
    s: hsl.s,
    l: hsl.l
  }
  
  const analogous1 = {
    h: (hsl.h + 30) % 360,
    s: hsl.s,
    l: hsl.l
  }
  
  const analogous2 = {
    h: (hsl.h - 30 + 360) % 360,
    s: hsl.s,
    l: hsl.l
  }
  
  const splitComp1 = {
    h: (hsl.h + 150) % 360,
    s: hsl.s,
    l: hsl.l
  }
  
  const splitComp2 = {
    h: (hsl.h + 210) % 360,
    s: hsl.s,
    l: hsl.l
  }
  
  return {
    complementary: rgbToHex(hslToRgb(complementary)),
    triadic: [
      rgbToHex(hslToRgb(triadic1)),
      rgbToHex(hslToRgb(triadic2))
    ],
    analogous: [
      rgbToHex(hslToRgb(analogous1)),
      rgbToHex(hslToRgb(analogous2))
    ],
    splitComplementary: [
      rgbToHex(hslToRgb(splitComp1)),
      rgbToHex(hslToRgb(splitComp2))
    ]
  }
}

export function generateVariations(hex) {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb)
  
  const tints = Array.from({ length: 5 }, (_, i) => {
    const l = Math.min(100, hsl.l + (i + 1) * 10)
    return rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l }))
  })
  
  const shades = Array.from({ length: 5 }, (_, i) => {
    const l = Math.max(0, hsl.l - (i + 1) * 10)
    return rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l }))
  })
  
  const tones = Array.from({ length: 5 }, (_, i) => {
    const s = Math.max(0, hsl.s - (i + 1) * 15)
    return rgbToHex(hslToRgb({ h: hsl.h, s, l: hsl.l }))
  })
  
  return { tints, shades, tones }
}

export function calculateContrasts(hex) {
  const rgb = hexToRgb(hex)
  const white = { r: 255, g: 255, b: 255 }
  const black = { r: 0, g: 0, b: 0 }
  
  return {
    white: Math.round(getContrastRatio(rgb, white) * 100) / 100,
    black: Math.round(getContrastRatio(rgb, black) * 100) / 100
  }
}

export function convertColor(hex) {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb)
  const lch = rgbToLch(rgb)
  const palette = generatePalette(hex)
  const variations = generateVariations(hex)
  const contrasts = calculateContrasts(hex)
  return { rgb, hsl, lch, palette, variations, contrasts }
}

