import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import HeaderClient from '../../../components/HeaderClient'
import ArticleBody from '../../../components/articles/ArticleBody'
import ArticleMeta, {
  formatArticleDate,
  getArticleTypeLabel,
} from '../../../components/articles/ArticleMeta'
import ContactModalTrigger from '../../../components/contact/ContactModalTrigger'
import {client} from '../../../sanity/lib/client'
import {
  articleBySlugQuery,
  articleSeoBySlugQuery,
  relatedArticlesQuery,
  siteSettingsQuery,
} from '../../../sanity/lib/queries'

export const revalidate = 60

type ArticlePageProps = {
  params: Promise<{slug: string}>
}

function Footer({settings}: {settings: any}) {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footerInner">
        <div>{`© ${year} ${settings?.companyName || 'Интегратор 1С'}`}</div>
        <div>{settings?.subtitle || 'Интегратор 1С'}</div>
      </div>
    </footer>
  )
}

function normalizeConfiguredSections(settings: any) {
  if (!Array.isArray(settings?.sections)) {
    return []
  }

  return settings.sections
    .map((section: any) => {
      if (!section || section.isActive === false) {
        return null
      }

      if (section._type === 'reference') {
        if (!section.contentBlock) {
          return null
        }

        section = {
          ...section.contentBlock,
          _key: section._key || section.contentBlock._id,
        }
      }

      if (typeof section._type === 'string' && section._type.endsWith('Item')) {
        return {
          ...section,
          _type: section._type.replace(/Item$/, ''),
        }
      }

      return section
    })
    .filter(Boolean)
}

function getArticleTypeClass(value?: string | null) {
  if (value === 'instruction') {
    return 'articleTypeBadgeInstruction'
  }

  if (value === 'error') {
    return 'articleTypeBadgeError'
  }

  return 'articleTypeBadgeArticle'
}

function getVisibleRelatedService(article: any) {
  if (!article?.relatedService || article.relatedService.isVisible === false) {
    return null
  }

  return article.relatedService
}

function getDateLabel(article: any) {
  if (article?.updatedAt) {
    return 'Обновлено'
  }

  return 'Опубликовано'
}

function hasSimilarArticleCardData(article: any) {
  if (!article?.title || !article?.slug) {
    return false
  }

  const relatedService = getVisibleRelatedService(article)

  return Boolean(
    article.excerpt ||
      article.oneCConfiguration ||
      article.oneCVersion ||
      article.updatedAt ||
      article.publishedAt ||
      relatedService?.title
  )
}

function ArticleCard({article}: {article: any}) {
  const relatedService = getVisibleRelatedService(article)

  return (
    <Link href={`/articles/${article.slug}`} className="articleCardLink">
      <article className="infoCard articleCard articleMaterialCard articleSimilarCard">
        <div className="articleCardBody">
          <span className={`articleTypeBadge ${getArticleTypeClass(article.materialType)}`}>
            {getArticleTypeLabel(article.materialType)}
          </span>
          <h3 className="articleCardTitle">{article.title}</h3>
          <div className="articleCardFooter">
            <ArticleMeta
              publishedAt={article.publishedAt}
              updatedAt={article.updatedAt}
              oneCConfiguration={article.oneCConfiguration}
              oneCVersion={article.oneCVersion}
              relatedServiceTitle={relatedService?.title}
            />
            <span className="articleCardMore">Читать →</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export async function generateMetadata({params}: ArticlePageProps): Promise<Metadata> {
  const {slug} = await params
  const article = await client.fetch(articleSeoBySlugQuery, {slug})

  if (!article) {
    return {
      title: 'Статья не найдена — ДЕВИОНТ',
    }
  }

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
  }
}

export default async function ArticlePage({params}: ArticlePageProps) {
  const {slug} = await params

  const [settings, article, similarArticles] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch(articleBySlugQuery, {slug}),
    client.fetch(relatedArticlesQuery, {slug}),
  ])

  if (!article) {
    notFound()
  }

  const sections = normalizeConfiguredSections(settings)
  const relatedService = getVisibleRelatedService(article)
  const formattedDate = formatArticleDate(article.updatedAt || article.publishedAt)
  const metaItems = [
    article.oneCConfiguration
      ? {label: 'Конфигурация', value: article.oneCConfiguration}
      : null,
    article.oneCVersion ? {label: 'Версия', value: article.oneCVersion} : null,
    formattedDate ? {label: getDateLabel(article), value: formattedDate} : null,
  ].filter(Boolean) as Array<{label: string; value: string}>
  const resolvedSimilarArticles = Array.isArray(similarArticles)
    ? similarArticles.filter(hasSimilarArticleCardData)
    : []

  return (
    <>
      <div id="top" />
      <HeaderClient settings={settings} sections={sections} />
      <main className="articlesPage">
        <section className="section sectionArticleDetail">
          <div className="container articleDetailContainer">
            <nav className="pageBackLinks articleBreadcrumbs" aria-label="Навигация">
              <Link href="/" className="articleBackLink">
                На главную
              </Link>
              <Link href="/articles" className="articleBackLink">
                Статьи и инструкции
              </Link>
            </nav>

            <div className="articleDetailLayout">
              <article className="articlePageCard articleDetailCard">
                <header className="articlePageHeader articleDetailHeader">
                  <div className="articleHeaderBadges">
                    <span className={`articleTypeBadge ${getArticleTypeClass(article.materialType)}`}>
                      {getArticleTypeLabel(article.materialType)}
                    </span>
                    {relatedService?.slug ? (
                      <Link
                        href={`/services/${relatedService.slug}`}
                        className="articleRelatedBadge"
                      >
                        {`Связано с услугой: ${relatedService.title}`}
                      </Link>
                    ) : null}
                  </div>

                  <h1 className="articlePageTitle">{article.title}</h1>
                  {article.excerpt ? (
                    <p className="articlePageExcerpt">{article.excerpt}</p>
                  ) : null}

                  {metaItems.length > 0 ? (
                    <div className="articleDetailMetaGrid">
                      {metaItems.map((item) => (
                        <div key={item.label} className="articleDetailMetaItem">
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </header>

                <ArticleBody value={article.body} />
              </article>

              <aside className="articleAside">
                {relatedService?.slug ? (
                  <section className="articleAsideCard">
                    <h2>Связанная услуга</h2>
                    <h3>{relatedService.title}</h3>
                    <Link href={`/services/${relatedService.slug}`} className="articleAsideLink">
                      Подробнее об услуге →
                    </Link>
                  </section>
                ) : null}

                <section className="articleAsideCard articleAsideCta">
                  <h2>Обсудим задачу</h2>
                  <p>
                    Нужна помощь с 1С или другой задачей? Расскажите нам, что нужно
                    сделать.
                  </p>
                  <ContactModalTrigger className="btnPrimary">Обсудить задачу</ContactModalTrigger>
                </section>
              </aside>
            </div>

            {resolvedSimilarArticles.length > 0 ? (
              <section className="articleSimilarSection">
                <h2>Похожие материалы</h2>
                <div className="articleSimilarGrid">
                  {resolvedSimilarArticles.map((similarArticle: any) => (
                    <ArticleCard key={similarArticle._id} article={similarArticle} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  )
}
