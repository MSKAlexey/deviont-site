const heroFontFamilyMap = {
  default: null,
  'segoe-ui': "'Segoe UI', 'Noto Sans', sans-serif",
  'noto-sans': "'Noto Sans', 'Segoe UI', sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  'trebuchet-ms': "'Trebuchet MS', 'Segoe UI', sans-serif",
  'courier-new': "'Courier New', monospace",
}

const heroFontWeightValues = new Set(['300', '400', '500', '600', '700', '800', '900'])

function normalizeFontSize(value) {
  const parsedValue = typeof value === 'number' ? value : Number.parseFloat(value)

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null
}

export function resolveHeroTypographyStyle(typography) {
  if (!typography || typeof typography !== 'object') {
    return undefined
  }

  const style = {}
  const fontFamily = heroFontFamilyMap[typography.fontFamily]
  const fontWeight = `${typography.fontWeight ?? ''}`
  const fontSize = normalizeFontSize(typography.fontSize)

  if (fontFamily) {
    style.fontFamily = fontFamily
  }

  if (heroFontWeightValues.has(fontWeight)) {
    style.fontWeight = Number.parseInt(fontWeight, 10)
  }

  if (fontSize) {
    style.fontSize = `${fontSize}px`
  }

  return Object.keys(style).length > 0 ? style : undefined
}
