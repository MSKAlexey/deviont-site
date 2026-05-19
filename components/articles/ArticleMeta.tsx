const articleDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const articleTypeLabels: Record<string, string> = {
  article: 'Статья',
  instruction: 'Инструкция',
  error: 'Разбор ошибки',
}

export function getArticleTypeLabel(value?: string | null) {
  if (!value) {
    return articleTypeLabels.article
  }

  return articleTypeLabels[value] || articleTypeLabels.article
}

export function formatArticleDate(value?: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : articleDateFormatter.format(date)
}

export default function ArticleMeta({
  publishedAt,
  updatedAt,
  oneCConfiguration,
  oneCVersion,
  relatedServiceTitle,
  className = 'articleMeta',
}: {
  publishedAt?: string | null
  updatedAt?: string | null
  oneCConfiguration?: string | null
  oneCVersion?: string | null
  relatedServiceTitle?: string | null
  className?: string
}) {
  const formattedDate = formatArticleDate(updatedAt || publishedAt || undefined)
  const hasMeta = Boolean(
    formattedDate || oneCConfiguration || oneCVersion || relatedServiceTitle
  )

  if (!hasMeta) {
    return null
  }

  return (
    <div className={className}>
      {oneCConfiguration ? (
        <span className="articleMetaItem">{oneCConfiguration}</span>
      ) : null}
      {oneCVersion ? <span className="articleMetaItem">{oneCVersion}</span> : null}
      {formattedDate ? <span className="articleMetaItem">{formattedDate}</span> : null}
      {relatedServiceTitle ? (
        <span className="articleMetaTag">{relatedServiceTitle}</span>
      ) : null}
    </div>
  )
}
