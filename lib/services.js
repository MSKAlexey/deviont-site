export const serviceCatalog = [
  {
    slug: 'vnedrenie-1c',
    title: 'Внедрение 1С',
    aliases: ['Внедрение 1С'],
  },
  {
    slug: 'soprovozhdenie-1c',
    title: 'Сопровождение 1С',
    aliases: ['Сопровождение 1С'],
  },
  {
    slug: 'dorabotka-1c',
    title: 'Доработка 1С',
    aliases: [
      'Доработка 1С',
      'Доработка функционала 1С',
      'Доработка стандартного функционала 1С',
    ],
  },
  {
    slug: 'obnovlenie-1c',
    title: 'Обновление 1С',
    aliases: ['Обновление 1С'],
  },
  {
    slug: 'nastroyka-1c',
    title: 'Настройка 1С',
    aliases: ['Настройка 1С'],
  },
  {
    slug: 'integraciya-1c-s-saytom',
    title: 'Интеграция 1С с сайтом',
    aliases: ['Интеграция 1С с сайтом'],
  },
  {
    slug: 'markirovka-1c',
    title: 'Маркировка в 1С',
    aliases: ['Маркировка в 1С'],
  },
  {
    slug: 'edo-diadok-1c',
    title: 'ЭДО и Диадок в 1С',
    aliases: ['ЭДО и Диадок в 1С', 'ЭДО / Диадок в 1С'],
  },
  {
    slug: 'otchety-1c',
    title: 'Отчеты в 1С',
    aliases: ['Отчеты в 1С', 'Отчёты в 1С'],
  },
]

const legacyServiceIdToSlug = {
  'service-implementation-1c': 'vnedrenie-1c',
  'service-support-1c': 'soprovozhdenie-1c',
  'service-customization-1c': 'dorabotka-1c',
}

const serviceCatalogBySlug = Object.fromEntries(
  serviceCatalog.map((item, index) => [item.slug, {...item, order: index}])
)

function stripDraftPrefix(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.startsWith('drafts.') ? value.slice('drafts.'.length) : value
}

function normalizeServiceValue(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .replace(/ё/gi, 'е')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function resolveSlugFromCatalogTitle(title) {
  const normalizedTitle = normalizeServiceValue(title)

  if (!normalizedTitle) {
    return null
  }

  const matchedItem = serviceCatalog.find((item) =>
    [item.title, ...(item.aliases || [])].some(
      (candidate) => normalizeServiceValue(candidate) === normalizedTitle
    )
  )

  return matchedItem?.slug || null
}

export function resolveServiceSlug(service) {
  if (!service) {
    return null
  }

  if (typeof service === 'string') {
    return resolveSlugFromCatalogTitle(service) || serviceCatalogBySlug[service]?.slug || null
  }

  const currentSlug =
    typeof service?.slug === 'string'
      ? service.slug
      : typeof service?.slug?.current === 'string'
        ? service.slug.current
        : null

  if (currentSlug) {
    return currentSlug
  }

  const id = stripDraftPrefix(service?._id)

  if (id && legacyServiceIdToSlug[id]) {
    return legacyServiceIdToSlug[id]
  }

  return resolveSlugFromCatalogTitle(service?.title)
}

export function getServiceHref(service) {
  const slug = resolveServiceSlug(service)

  return slug ? `/services/${slug}` : null
}

export function findServiceBySlug(services, slug) {
  if (!Array.isArray(services) || typeof slug !== 'string') {
    return null
  }

  return services.find((service) => resolveServiceSlug(service) === slug) || null
}

export function findServiceByTitle(services, title) {
  const slug = resolveSlugFromCatalogTitle(title)

  return slug ? findServiceBySlug(services, slug) : null
}

export function sortServices(services) {
  if (!Array.isArray(services)) {
    return []
  }

  return [...services].sort((left, right) => {
    const leftSlug = resolveServiceSlug(left)
    const rightSlug = resolveServiceSlug(right)
    const leftOrder =
      typeof serviceCatalogBySlug[leftSlug]?.order === 'number'
        ? serviceCatalogBySlug[leftSlug].order
        : Number.MAX_SAFE_INTEGER
    const rightOrder =
      typeof serviceCatalogBySlug[rightSlug]?.order === 'number'
        ? serviceCatalogBySlug[rightSlug].order
        : Number.MAX_SAFE_INTEGER

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder
    }

    return String(left?.title || '').localeCompare(String(right?.title || ''), 'ru')
  })
}

export function getServiceSummary(service) {
  if (!service || typeof service !== 'object') {
    return ''
  }

  return typeof service.excerpt === 'string' && service.excerpt.trim()
    ? service.excerpt.trim()
    : typeof service.text === 'string'
      ? service.text.trim()
      : ''
}

export function getServiceCatalogEntry(serviceOrSlug) {
  const slug =
    typeof serviceOrSlug === 'string' ? serviceOrSlug : resolveServiceSlug(serviceOrSlug)

  return slug ? serviceCatalogBySlug[slug] || null : null
}
