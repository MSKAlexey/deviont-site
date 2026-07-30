import Link from 'next/link'
import ArticleMeta, {getArticleTypeLabel} from '../articles/ArticleMeta'
import SectionCardImage from './SectionCardImage'

function getPlaceholderLabel(article: any) {
  const title = String(article?.title || '').toLocaleLowerCase('ru-RU')

  if (title.includes('рмк')) {
    return 'РМК'
  }

  if (title.includes('обмен') || title.includes('регистрац')) {
    return '↻'
  }

  return '1С'
}

function HomeArticleCard({article}: {article: any}) {
  const hasDate = article?.updatedAt || article?.publishedAt

  return (
    <Link href={`/articles/${article.slug}`} className="homeArticleCardLink">
      <article className="infoCard homeArticleCard">
        {article.coverImage?.asset ? (
          <SectionCardImage
            image={article.coverImage}
            alt={article.coverImageAlt || article.title}
            width={720}
            height={430}
            fit="crop"
            sizes="(max-width: 720px) calc(100vw - 64px), (max-width: 1024px) 50vw, 33vw"
            wrapperClassName="homeArticleCardMedia"
            imageClassName="homeArticleCardImage"
          />
        ) : (
          <div className="homeArticleCardMedia homeArticleCardPlaceholder" aria-hidden="true">
            <span>{getPlaceholderLabel(article)}</span>
          </div>
        )}

        <div className="homeArticleCardBody">
          {hasDate ? (
            <ArticleMeta
              publishedAt={article.publishedAt}
              updatedAt={article.updatedAt}
              className="homeArticleCardMeta"
            />
          ) : (
            <span className="homeArticleCardType">
              {getArticleTypeLabel(article.materialType)}
            </span>
          )}
          <h3>{article.title}</h3>
          {article.excerpt ? <p>{article.excerpt}</p> : null}
        </div>
      </article>
    </Link>
  )
}

export default function HomeArticlesSection({articles}: {articles: any[]}) {
  const resolvedArticles = Array.isArray(articles)
    ? articles.filter((article) => article?.slug && article?.title).slice(0, 3)
    : []

  if (resolvedArticles.length === 0) {
    return null
  }

  return (
    <section className="section homeArticlesSection" id="home-articles">
      <div className="container">
        <div className="homeArticlesHead">
          <h2>Статьи</h2>
          <Link href="/articles" className="homeArticlesAllLink">
            Все статьи
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="homeArticleGrid">
          {resolvedArticles.map((article) => (
            <HomeArticleCard key={article._id || article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}
