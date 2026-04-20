const sectionTypeIds = {
  hero: 'hero',
  process: 'process',
  services: 'services',
  support: 'support',
  advantages: 'advantages',
  products: 'products',
  tasks: 'tasks',
  articles: 'knowledge',
  knowledge: 'knowledge',
  cta: 'cta',
  contacts: 'contacts',
}

const titledSectionIds = {
  'главный экран': 'hero',
  'порядок работы': 'process',
  'услуги 1с': 'services',
  'сопровождение 1с': 'support',
  'почему вам можно доверять': 'advantages',
  'решения 1с': 'products',
  'примеры задач': 'tasks',
  'статьи': 'knowledge',
  'связаться': 'contacts',
}

export function resolveSectionId(section) {
  const sectionType = section?.sectionType || section?.sectionKey

  if (section?._type === 'heroBlock') {
    return 'hero'
  }

  if (section?._type === 'ctaBlock') {
    return 'cta'
  }

  if (section?._type === 'contactBlock') {
    return 'contacts'
  }

  if (sectionType && sectionTypeIds[sectionType]) {
    return sectionTypeIds[sectionType]
  }

  const normalizedTitle = section?.title?.trim().toLowerCase()

  if (normalizedTitle && titledSectionIds[normalizedTitle]) {
    return titledSectionIds[normalizedTitle]
  }

  return section?._key ? `section-${section._key}` : undefined
}
