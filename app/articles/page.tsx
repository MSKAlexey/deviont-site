import Link from 'next/link'
import HeaderClient from '../../components/HeaderClient'
import ArticleMeta from '../../components/articles/ArticleMeta'
import SectionCardImage from '../../components/sections/SectionCardImage'
import {client} from '../../sanity/lib/client'
import {articlesListQuery, siteSettingsQuery} from '../../sanity/lib/queries'

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

export default async function ArticlesPage() {
  const [settings, articles] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch(articlesListQuery),
  ])
  const sections = normalizeConfiguredSections(settings)
  const resolvedArticles = Array.isArray(articles) ? articles : []

  return (
    <>
      <div id="top" />
      <HeaderClient settings={settings} sections={sections} />
      <main className="articlesPage">
        <section className="section sectionArticlesIndex">
          <div className="container">
            <header className="articlesPageHead">
              <h1>Статьи</h1>
            </header>

            {resolvedArticles.length > 0 ? (
              <div className="sectionCardsGrid sectionCardsGridThree">
                {resolvedArticles.map((article: any) => (
                  <Link
                    key={article._id}
                    href={`/articles/${article.slug}`}
                    className="articleCardLink"
                  >
                    <article className="infoCard articleCard">
                      {article.image?.asset ? (
                        <SectionCardImage
                          image={article.image}
                          alt={article.title}
                          width={720}
                          height={420}
                          fit="crop"
                          sizes="(max-width: 720px) calc(100vw - 72px), (max-width: 1180px) calc((100vw - 154px) / 2), 327px"
                          wrapperClassName="articleCardMedia"
                          imageClassName="articleCardImage"
                        />
                      ) : null}

                      <div className="articleCardBody">
                        <ArticleMeta
                          publishedAt={article.publishedAt}
                          configVersion={article.configVersion}
                        />
                        <h2 className="articleCardTitle">{article.title}</h2>
                        {article.excerpt ? (
                          <p className="articleCardExcerpt">{article.excerpt}</p>
                        ) : null}
                        <span className="articleCardMore">Читать статью</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="infoCard articlesEmpty">Статей пока нет.</div>
            )}
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  )
}
