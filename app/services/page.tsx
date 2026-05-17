import Link from 'next/link'
import HeaderClient from '../../components/HeaderClient'
import SectionCardImage from '../../components/sections/SectionCardImage'
import {getServiceHref, getServiceSummary, isPromotedService, sortServices} from '../../lib/services'
import {client} from '../../sanity/lib/client'
import {servicesListQuery, siteSettingsQuery} from '../../sanity/lib/queries'

export const revalidate = 60

export const metadata = {
  title: 'Услуги 1С',
  description:
    'Отдельные услуги 1С: внедрение, сопровождение, доработка, интеграция, обновление и другие направления работы.',
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

export default async function ServicesPage() {
  const [settings, services] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch(servicesListQuery),
  ])
  const sections = normalizeConfiguredSections(settings)
  const resolvedServices = sortServices(
    (Array.isArray(services) ? services : []).filter(
      (service) => Boolean(getServiceHref(service)) && isPromotedService(service)
    )
  )

  return (
    <>
      <div id="top" />
      <HeaderClient settings={settings} sections={sections} />
      <main className="articlesPage">
        <section className="section sectionArticlesIndex">
          <div className="container">
            <Link href="/" className="articleBackLink">
              На главную
            </Link>

            <header className="articlesPageHead">
              <h1>Услуги</h1>
            </header>

            {resolvedServices.length > 0 ? (
              <div className="sectionCardsGrid sectionCardsGridThree servicesCardsGrid">
                {resolvedServices.map((service: any) => {
                  const summary = getServiceSummary(service)
                  const href = getServiceHref(service)

                  if (!href) {
                    return null
                  }

                  return (
                    <Link key={service._id} href={href} className="serviceCardLink">
                      <article className="infoCard serviceCard">
                        {service.image?.asset ? (
                          <SectionCardImage
                            image={service.image}
                            alt={service.title}
                            width={720}
                            height={420}
                            fit="max"
                            sizes="(max-width: 720px) calc(100vw - 72px), (max-width: 1180px) calc((100vw - 154px) / 2), 327px"
                            wrapperClassName="serviceCardMedia"
                            imageClassName="serviceCardImage"
                            ignoreCrop
                          />
                        ) : null}

                        <div className="serviceCardBody">
                          <h2 className="serviceCardTitle">{service.title}</h2>
                          {summary ? <p className="serviceCardExcerpt">{summary}</p> : null}

                          {service.priceText || service.durationText ? (
                            <div className="serviceMeta">
                              {service.priceText ? (
                                <span className="serviceMetaTag">{service.priceText}</span>
                              ) : null}
                              {service.durationText ? (
                                <span className="serviceMetaItem">{service.durationText}</span>
                              ) : null}
                            </div>
                          ) : null}

                          <span className="serviceCardMore">Подробнее</span>
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="infoCard servicesEmpty">
                В разделе пока нет опубликованных услуг.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  )
}
