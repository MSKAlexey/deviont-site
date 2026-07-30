import Link from 'next/link'
import ArticleMeta, {getArticleTypeLabel} from '../articles/ArticleMeta'
import SectionCardImage from './SectionCardImage'

function getArticleTypeClass(value?: string | null) {
  if (value === 'instruction') {
    return 'articleTypeBadgeInstruction'
  }

  if (value === 'error') {
    return 'articleTypeBadgeError'
  }

  return 'articleTypeBadgeArticle'
}

function ArticleTypeBadge({article}: {article: any}) {
  return (
    <span className={`articleTypeBadge ${getArticleTypeClass(article?.materialType)}`}>
      {getArticleTypeLabel(article?.materialType)}
    </span>
  )
}

function CompactArticle({article}: {article: any}) {
  return (
    <Link href={`/articles/${article.slug}`} className="homeArticleCompactLink">
      <article className="homeArticleCompact">
        <div className="homeArticleCompactTop">
          <ArticleTypeBadge article={article} />
          <ArticleMeta
            publishedAt={article.publishedAt}
            updatedAt={article.updatedAt}
            className="homeArticleCompactMeta"
          />
        </div>
        <h3 className="homeArticleCompactTitle">{article.title}</h3>
        <span className="homeArticleReadMore">Читать →</span>
      </article>
    </Link>
  )
}

export default function HomeArticlesSection({articles}: {articles: any[]}) {
  const resolvedArticles = Array.isArray(articles)
    ? articles.filter((article) => article?.slug && article?.title).slice(0, 4)
    : []
  const [featuredArticle, ...compactArticles] = resolvedArticles

  if (!featuredArticle) {
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

        <div className="homeArticlesLayout">
          <Link
            href={`/articles/${featuredArticle.slug}`}
            className="homeArticleFeaturedLink"
          >
            <article className="infoCard homeArticleFeatured">
              {featuredArticle.coverImage?.asset ? (
                <SectionCardImage
                  image={featuredArticle.coverImage}
                  alt={featuredArticle.coverImageAlt || featuredArticle.title}
                  width={880}
                  height={430}
                  fit="crop"
                  sizes="(max-width: 900px) calc(100vw - 48px), 620px"
                  wrapperClassName="homeArticleFeaturedMedia"
                  imageClassName="homeArticleFeaturedImage"
                />
              ) : (
                <div
                  className="homeArticleFeaturedMedia homeArticleFeaturedPlaceholder"
                  aria-hidden="true"
                >
                  <span>1С</span>
                </div>
              )}

              <div className="homeArticleFeaturedBody">
                <div className="homeArticleFeaturedMeta">
                  <span className="homeArticleNewLabel">Новая статья</span>
                  <ArticleMeta
                    publishedAt={featuredArticle.publishedAt}
                    updatedAt={featuredArticle.updatedAt}
                    className="homeArticleDate"
                  />
                </div>
                <h3 className="homeArticleFeaturedTitle">{featuredArticle.title}</h3>
                {featuredArticle.excerpt ? (
                  <p className="homeArticleFeaturedExcerpt">{featuredArticle.excerpt}</p>
                ) : null}
                <span className="homeArticleReadMore">Читать статью →</span>
              </div>
            </article>
          </Link>

          {compactArticles.length > 0 ? (
            <div className="homeArticleList">
              {compactArticles.map((article) => (
                <CompactArticle key={article._id || article.slug} article={article} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
