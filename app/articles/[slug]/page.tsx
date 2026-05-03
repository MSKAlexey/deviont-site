import Link from 'next/link'
import {notFound} from 'next/navigation'
import HeaderClient from '../../../components/HeaderClient'
import ArticleBody from '../../../components/articles/ArticleBody'
import ArticleMeta from '../../../components/articles/ArticleMeta'
import SectionCardImage from '../../../components/sections/SectionCardImage'
import {client} from '../../../sanity/lib/client'
import {articleBySlugQuery, siteSettingsQuery} from '../../../sanity/lib/queries'

export const revalidate = 60

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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const {slug} = await params

  const [settings, article] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch(articleBySlugQuery, {slug}),
  ])

  if (!article) {
    notFound()
  }

  const sections = normalizeConfiguredSections(settings)

  return (
    <>
      <div id="top" />
      <HeaderClient settings={settings} sections={sections} />
      <main className="articlesPage">
        <section className="section sectionArticleDetail">
          <div className="container articleContainer">
            <Link href="/articles" className="articleBackLink">
              Все статьи
            </Link>

            <article className="articlePageCard">
              <header className="articlePageHeader">
                <h1 className="articlePageTitle">{article.title}</h1>
                <ArticleMeta
                  publishedAt={article.publishedAt}
                  configVersion={article.configVersion}
                />
                {article.excerpt ? (
                  <p className="articlePageExcerpt">{article.excerpt}</p>
                ) : null}
              </header>

              {article.image?.asset ? (
                <SectionCardImage
                  image={article.image}
                  alt={article.title}
                  width={1440}
                  height={840}
                  fit="crop"
                  sizes="(max-width: 720px) calc(100vw - 72px), (max-width: 1180px) calc(100vw - 88px), 1092px"
                  wrapperClassName="articlePageMedia"
                  imageClassName="articlePageImage"
                />
              ) : null}

              <ArticleBody value={article.body} />
            </article>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  )
}
