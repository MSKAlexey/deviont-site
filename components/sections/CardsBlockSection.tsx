import Link from 'next/link'
import {
  findServiceBySlug,
  findServiceByTitle,
  getServiceHref,
  isPromotedService,
  resolveServiceSlug,
} from '../../lib/services'
import ArticleBody from '../articles/ArticleBody'
import SectionCardImage from './SectionCardImage'
import SectionHeading from './SectionHeading'
import HeroRichText, {
  getHeroPlainText,
  getHeroRichTextPlainText,
  hasHeroRichTextContent,
  renderHeroMultilineText,
} from './HeroRichText'
import {resolveHeroTypographyStyle} from './heroTypography'

const detailIconConfig = {
  price: {
    className: 'builderCardDetailIconPrice',
    glyph: '₽',
  },
  duration: {
    className: 'builderCardDetailIconDuration',
    icon: (
      <>
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4.5 9h15" />
        <path d="M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
        <path d="M8 13h2" />
        <path d="M8 17h2" />
        <path d="M14 13h2" />
      </>
    ),
  },
  example: {
    className: 'builderCardDetailIconExample',
    icon: (
      <>
        <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </>
    ),
  },
}

const detailFontFamilyMap = {
  'segoe-ui': "'Segoe UI', 'Noto Sans', sans-serif",
  'noto-sans': "'Noto Sans', 'Segoe UI', sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  'trebuchet-ms': "'Trebuchet MS', 'Segoe UI', sans-serif",
  'courier-new': "'Courier New', monospace",
}

function renderCardDescription(text, richText, style) {
  if (hasHeroRichTextContent(richText)) {
    return (
      <div className="builderCardTextGroup" style={style}>
        <ArticleBody value={richText} className="builderCardRichText" />
      </div>
    )
  }

  if (typeof text !== 'string' || text.length === 0) {
    return null
  }

  const compactText = text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join('\n')

  if (compactText.length === 0) {
    return null
  }

  return (
    <p className="builderCardText" style={style}>
      {compactText}
    </p>
  )
}

function resolveDetailIconConfig(type) {
  switch (type) {
    case 'price':
      return detailIconConfig.price
    case 'duration':
    case 'term':
    case 'time':
    case 'deadline':
      return detailIconConfig.duration
    case 'example':
    case 'case':
    case 'document':
    default:
      return detailIconConfig.example
  }
}

function renderDetailIcon(type) {
  const config = resolveDetailIconConfig(type)

  return (
    <span className={`builderCardDetailIcon ${config.className}`} aria-hidden="true">
      {'glyph' in config ? (
        config.glyph
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {config.icon}
        </svg>
      )}
    </span>
  )
}

function getCardDetails(details) {
  if (!Array.isArray(details)) {
    return []
  }

  return details
    .map((detail) => ({
      ...detail,
      text: typeof detail?.text === 'string' ? detail.text.trim() : '',
    }))
    .filter((detail) => detail.text.length > 0)
}

function resolveDetailTextStyle(typography) {
  if (!typography || typeof typography !== 'object') {
    return undefined
  }

  const style = {
    fontFamily:
      typography.fontFamily && typography.fontFamily !== 'default'
        ? detailFontFamilyMap[typography.fontFamily]
        : undefined,
    fontWeight:
      typography.fontWeight && typography.fontWeight !== 'default'
        ? typography.fontWeight
        : undefined,
    fontSize:
      typeof typography.fontSize === 'number' && typography.fontSize > 0
        ? typography.fontSize
        : undefined,
  }

  return Object.values(style).some((value) => value !== undefined) ? style : undefined
}

function renderCardDetails(details, typography) {
  const resolvedDetails = getCardDetails(details)

  if (resolvedDetails.length === 0) {
    return null
  }

  const detailTextStyle = resolveDetailTextStyle(typography)

  return (
    <ul className="builderCardDetails">
      {resolvedDetails.map((detail, index) => (
        <li className="builderCardDetail" key={detail._key || `${detail.type}-${index}`}>
          {renderDetailIcon(detail.type)}
          <span className="builderCardDetailText" style={detailTextStyle}>
            {detail.text}
          </span>
        </li>
      ))}
    </ul>
  )
}

function getCardTitleValue(item) {
  const richTitle = getHeroRichTextPlainText(item?.titleContent?.content)

  if (richTitle) {
    return richTitle
  }

  return getHeroPlainText(item?.title)
}

function resolveLinkedService(item, services, sectionId) {
  if (!Array.isArray(services) || services.length === 0) {
    return null
  }

  const linkedSlug = resolveServiceSlug(item?.service)

  if (linkedSlug) {
    const linkedService = findServiceBySlug(services, linkedSlug)

    if (linkedService) {
      return linkedService
    }
  }

  if (sectionId !== 'services') {
    return null
  }

  const cardTitle = getCardTitleValue(item)

  return cardTitle ? findServiceByTitle(services, cardTitle) : null
}

function getCatalogServiceCount(services) {
  if (!Array.isArray(services)) {
    return 0
  }

  return services.filter(
    (service) =>
      service?.isVisible !== false &&
      Boolean(getServiceHref(service)) &&
      isPromotedService(service)
  ).length
}

export default function CardsBlockSection({block, sectionId, services}) {
  const sectionTitleContent = block?.titleContent?.content
  const sectionTitlePlainText = getHeroRichTextPlainText(sectionTitleContent)
  const hasSectionTitle = Boolean(sectionTitlePlainText || block?.title)

  if (!hasSectionTitle || !Array.isArray(block.items) || block.items.length === 0) {
    return null
  }

  const hasCardMedia = block.items.some((item) => item?.image?.asset)
  const sectionTitle = sectionTitlePlainText ? (
    renderHeroMultilineText(sectionTitlePlainText, 'cards-block-title')
  ) : (
    renderHeroMultilineText(block.title, 'cards-block-title')
  )
  const catalogServiceCount =
    sectionId === 'services' ? getCatalogServiceCount(services) : 0
  const displayedServiceCount = block.items.length
  const hasAdditionalServices = catalogServiceCount > displayedServiceCount
  const sectionTitleNode =
    sectionId === 'services' && !hasAdditionalServices ? (
      <Link href="/services" className="sectionTitleLink">
        {sectionTitle}
      </Link>
    ) : (
      sectionTitle
    )

  return (
    <section className="section" id={sectionId}>
      <div className="container">
        {hasAdditionalServices ? (
          <div className="servicesSectionHead">
            <SectionHeading title={sectionTitleNode} />
            <Link href="/services" className="servicesCatalogLink">
              {`Все ${catalogServiceCount} услуг`}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <SectionHeading title={sectionTitleNode} />
        )}

        <div className="sectionCardsGrid sectionCardsGridThree">
          {block.items.map((item) => {
            const sharedCardTypography = item?.cardTypography || block?.cardTypography
            const cardTitleContent = item?.titleContent?.content
            const cardTextContent = item?.textContent?.content
            const linkedService = resolveLinkedService(item, services, sectionId)
            const serviceHref = getServiceHref(linkedService)
            const cardTitleStyle = resolveHeroTypographyStyle(
              item?.titleContent ||
                item?.titleTypography ||
                sharedCardTypography ||
                block?.cardTitleTypography ||
                block?.cardTypography
            )
            const cardTextStyle = resolveHeroTypographyStyle(
              item?.textContent ||
                item?.textTypography ||
                sharedCardTypography ||
                block?.cardTextTypography ||
                block?.cardTypography
            )

            const cardContent = (
              <article className="infoCard builderCard" key={item._key || item.title}>
                {hasCardMedia ? (
                  item.image?.asset ? (
                    <SectionCardImage
                      image={item.image}
                      alt={item.title}
                      width={720}
                      height={420}
                      fit="crop"
                      sizes="(max-width: 720px) calc(100vw - 72px), (max-width: 1180px) calc((100vw - 154px) / 2), 327px"
                      wrapperClassName="builderCardMedia"
                      imageClassName="builderCardImage"
                    />
                  ) : (
                    <div aria-hidden="true" className="builderCardMedia builderCardMediaPlaceholder" />
                  )
                ) : null}

                <div className="builderCardBody">
                  <h3 className="builderCardTitle" style={cardTitleStyle}>
                    {hasHeroRichTextContent(cardTitleContent) ? (
                      <HeroRichText value={cardTitleContent} as="span" />
                    ) : (
                      renderHeroMultilineText(item.title, `cards-item-title-${item._key || item.title}`)
                    )}
                  </h3>
                  {renderCardDescription(item.text, cardTextContent, cardTextStyle)}
                  {renderCardDetails(
                    item.details,
                    sharedCardTypography || block?.detailTypography || item?.detailTypography
                  )}
                </div>
              </article>
            )

            if (!serviceHref) {
              return cardContent
            }

            return (
              <Link className="builderCardLink" href={serviceHref} key={item._key || item.title}>
                {cardContent}
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
