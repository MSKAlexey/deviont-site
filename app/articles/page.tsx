import type {Metadata} from 'next'
import Link from 'next/link'
import HeaderClient from '../../components/HeaderClient'
import ArticleMeta, {getArticleTypeLabel} from '../../components/articles/ArticleMeta'
import ContactModalTrigger from '../../components/contact/ContactModalTrigger'
import {client} from '../../sanity/lib/client'
import {articlesListQuery, siteSettingsQuery} from '../../sanity/lib/queries'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Статьи и инструкции по 1С — ДЕВИОНТ',
  description: 'Экспертные статьи, инструкции и разборы ошибок по 1С для бизнеса.',
}

const articleFilters = [
  {label: 'Все', href: '/articles', value: null},
  {label: 'Статьи', href: '/articles?type=article', value: 'article'},
  {label: 'Инструкции', href: '/articles?type=instruction', value: 'instruction'},
  {label: 'Разбор ошибок', href: '/articles?type=error', value: 'error'},
]

type ArticleSearchParams = {
  type?: string | string[]
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

function resolveSelectedType(searchParams: ArticleSearchParams) {
  const requestedType = Array.isArray(searchParams.type) ? searchParams.type[0] : searchParams.type

  if (articleFilters.some((filter) => filter.value === requestedType)) {
    return requestedType || null
  }

  return null
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

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams?: Promise<ArticleSearchParams>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const selectedType = resolveSelectedType(resolvedSearchParams)
  const [settings, articles] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch(articlesListQuery, {type: selectedType}),
  ])
  const sections = normalizeConfiguredSections(settings)
  const resolvedArticles = Array.isArray(articles) ? articles : []

  return (
    <>
      <div id="top" />
      <HeaderClient settings={settings} sections={sections} />
      <main className="articlesPage">
        <section className="section sectionArticlesIndex">
          <div className="container articleIndexContainer">
            <nav className="pageBackLinks articleBreadcrumbs" aria-label="Навигация">
              <Link href="/" className="articleBackLink">
                На главную
              </Link>
            </nav>

            <header className="articlesPageHead articlesIndexHead">
              <h1>Статьи и инструкции</h1>
              <p>Экспертные материалы, пошаговые инструкции и разборы ошибок по 1С.</p>
            </header>

            <nav className="articleFilters" aria-label="Фильтр материалов">
              {articleFilters.map((filter) => {
                const isActive = filter.value === selectedType

                return (
                  <Link
                    key={filter.label}
                    href={filter.href}
                    className={`articleFilterButton${isActive ? ' articleFilterButtonActive' : ''}`}
                  >
                    {filter.label}
                  </Link>
                )
              })}
            </nav>

            {resolvedArticles.length > 0 ? (
              <div className="articleCardsGrid">
                {resolvedArticles.map((article: any) => {
                  const relatedService = getVisibleRelatedService(article)

                  return (
                    <Link
                      key={article._id}
                      href={`/articles/${article.slug}`}
                      className="articleCardLink"
                    >
                      <article className="infoCard articleCard articleMaterialCard">
                        <div className="articleCardBody">
                          <span
                            className={`articleTypeBadge ${getArticleTypeClass(article.materialType)}`}
                          >
                            {getArticleTypeLabel(article.materialType)}
                          </span>
                          <h2 className="articleCardTitle">{article.title}</h2>
                          {article.excerpt ? (
                            <p className="articleCardExcerpt">{article.excerpt}</p>
                          ) : null}
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
                })}
              </div>
            ) : (
              <div className="infoCard articlesEmpty">Материалов пока нет.</div>
            )}

            <section className="articlesCta infoCard">
              <div className="articlesCtaCopy">
                <h2>Не нашли ответ на свой вопрос?</h2>
                <p>
                  Расскажите о своей задаче, и мы подготовим материал или поможем решить
                  проблему.
                </p>
              </div>
              <ContactModalTrigger className="btnPrimary">Обсудить задачу</ContactModalTrigger>
            </section>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  )
}
