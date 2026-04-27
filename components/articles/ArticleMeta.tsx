const articleDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatArticleDate(value?: string) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : articleDateFormatter.format(date)
}

export default function ArticleMeta({
  publishedAt,
  configVersion,
}: {
  publishedAt?: string | null
  configVersion?: string | null
}) {
  const formattedDate = formatArticleDate(publishedAt || undefined)
  const hasMeta = Boolean(formattedDate || configVersion)

  if (!hasMeta) {
    return null
  }

  return (
    <div className="articleMeta">
      {formattedDate ? <span className="articleMetaItem">{formattedDate}</span> : null}
      {configVersion ? <span className="articleMetaTag">{configVersion}</span> : null}
    </div>
  )
}
