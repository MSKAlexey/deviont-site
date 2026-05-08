import Link from 'next/link'
import {notFound} from 'next/navigation'
import HeaderClient from '../../../components/HeaderClient'
import ArticleBody from '../../../components/articles/ArticleBody'
import SectionCardImage from '../../../components/sections/SectionCardImage'
import {
  findServiceBySlug,
  getServiceCatalogEntry,
  getServiceHref,
  getServiceSummary,
  sortServices,
} from '../../../lib/services'
import {client} from '../../../sanity/lib/client'
import {servicesPageQuery, siteSettingsQuery} from '../../../sanity/lib/queries'

export const revalidate = 60

const hiddenRelatedServiceHrefs = new Set(['/services/obnovlenie-1c'])

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

function renderFallbackBody(text?: string | null) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return null
  }

  return (
    <div className="articleBody">
      {text
        .split(/\n\s*\n/g)
        .map((paragraph, index) =>
          paragraph.trim() ? <p key={`service-fallback-${index}`}>{paragraph.trim()}</p> : null
        )}
    </div>
  )
}

function getFilledStringItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []
}

export async function generateStaticParams() {
  const services = await client.fetch(servicesPageQuery)

  return sortServices(Array.isArray(services) ? services : [])
    .map((service) => getServiceHref(service))
    .filter(Boolean)
    .map((href) => ({slug: href.replace('/services/', '')}))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const {slug} = await params
  const services = await client.fetch(servicesPageQuery)
  const service = findServiceBySlug(Array.isArray(services) ? services : [], slug)
  const catalogEntry = getServiceCatalogEntry(slug)

  if (!service) {
    return {
      title: catalogEntry?.title || 'Услуга 1С',
      description: 'Услуга недоступна или скрыта.',
    }
  }

  const title = service.seoTitle || service.title
  const description =
    service.seoDescription || getServiceSummary(service) || 'Услуга 1С на отдельной странице.'

  return {
    title,
    description,
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const {slug} = await params
  const [settings, services] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch(servicesPageQuery),
  ])
  const resolvedServices = sortServices(Array.isArray(services) ? services : [])
  const service = findServiceBySlug(resolvedServices, slug)

  if (!service) {
    notFound()
  }

  const sections = normalizeConfiguredSections(settings)
  const summary = getServiceSummary(service)
  const serviceExamples = getFilledStringItems(service.examples)
  const serviceConfigurations = getFilledStringItems(service.configurations)
  const relatedServices = resolvedServices
    .filter((item) => {
      const href = getServiceHref(item)

      return item._id !== service._id && href && !hiddenRelatedServiceHrefs.has(href)
    })
    .slice(0, 5)

  return (
    <>
      <div id="top" />
      <HeaderClient settings={settings} sections={sections} />
      <main className="articlesPage">
        <section className="section sectionArticleDetail">
          <div className="container serviceContainer">
            <div className="pageBackLinks">
              <Link href="/" className="articleBackLink">
                На главную
              </Link>
              <Link href="/services" className="articleBackLink">
                Все услуги
              </Link>
            </div>

            <article className="articlePageCard servicePageCard">
              <header className="servicePageHeader">
                <h1 className="articlePageTitle">{service.title}</h1>
                {summary ? <p className="articlePageExcerpt">{summary}</p> : null}
              </header>

              {service.image?.asset ? (
                <SectionCardImage
                  image={service.image}
                  alt={service.title}
                  width={1440}
                  height={840}
                  fit="crop"
                  sizes="(max-width: 720px) calc(100vw - 72px), (max-width: 1180px) calc(100vw - 88px), 1092px"
                  wrapperClassName="articlePageMedia"
                  imageClassName="articlePageImage"
                />
              ) : null}

              <div className="servicePageLayout">
                <div className="servicePageMain">
                  {service.body?.length ? (
                    <section className="serviceSectionCard">
                      <ArticleBody value={service.body} />
                    </section>
                  ) : (
                    renderFallbackBody(service.text)
                  )}

                  {Array.isArray(service.includedItems) && service.includedItems.length > 0 ? (
                    <section className="serviceSectionCard">
                      <h2>Что входит в услугу</h2>
                      <ul className="serviceBulletList">
                        {service.includedItems.map((item: string, index: number) => (
                          <li key={`${service._id}-included-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {serviceExamples.length > 0 ? (
                    <section className="serviceSectionCard">
                      <h2>Примеры доработок 1С</h2>
                      <ul className="serviceBulletList">
                        {serviceExamples.map((item: string, index: number) => (
                          <li key={`${service._id}-examples-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {serviceConfigurations.length > 0 ? (
                    <section className="serviceSectionCard">
                      <h2>С какими конфигурациями работаем</h2>
                      <div className="articleBody">
                        <p>
                          Дорабатываем типовые и нетиповые базы 1С. Учитываем существующие
                          настройки, доработки и особенности работы пользователей.
                        </p>
                        <ul className="serviceBulletList">
                          {serviceConfigurations.map((item: string, index: number) => (
                            <li key={`${service._id}-configurations-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  ) : null}

                  {Array.isArray(service.taskItems) && service.taskItems.length > 0 ? (
                    <section className="serviceSectionCard">
                      <h2>Какие задачи решаем</h2>
                      <ul className="serviceBulletList">
                        {service.taskItems.map((item: string, index: number) => (
                          <li key={`${service._id}-tasks-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>

                <aside className="servicePageAside">
                  {(service.priceText || service.durationText) && (
                    <section className="serviceSectionCard">
                      <h2>Цена и условия</h2>
                      <div className="serviceConditionList">
                        {service.priceText ? (
                          <div className="serviceConditionItem">
                            <span className="serviceConditionLabel">Стоимость</span>
                            <p className="serviceConditionValue">{service.priceText}</p>
                          </div>
                        ) : null}
                        {service.durationText ? (
                          <div className="serviceConditionItem">
                            <span className="serviceConditionLabel">Сроки</span>
                            <p className="serviceConditionValue">{service.durationText}</p>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  )}

                  <section className="serviceSectionCard serviceCtaCard">
                    <h2>Обсудим задачу</h2>
                    <p>
                      Расскажите, что нужно настроить или доработать, и мы предложим
                      подходящий вариант реализации.
                    </p>
                    <Link href="/#contacts" className="btnPrimary">
                      Обсудить задачу
                    </Link>
                  </section>
                </aside>
              </div>

              {relatedServices.length > 0 ? (
                <section className="serviceSectionCard serviceRelatedSection">
                  <h2>Другие услуги</h2>
                  <div className="serviceRelatedLinks">
                    {relatedServices.map((item) => {
                      const href = getServiceHref(item)

                      if (!href) {
                        return null
                      }

                      return (
                        <Link key={item._id} href={href} className="serviceRelatedLink">
                          {item.title}
                        </Link>
                      )
                    })}
                  </div>
                </section>
              ) : null}
            </article>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  )
}
