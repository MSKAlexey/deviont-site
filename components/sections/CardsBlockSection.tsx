import SectionCardImage from './SectionCardImage'
import SectionHeading from './SectionHeading'

const detailIconConfig = {
  price: {
    className: 'builderCardDetailIconPrice',
    icon: (
      <>
        <path d="M4 5.5V11l7.5 7.5 6-6L10 5H4z" />
        <path d="M8 8h.01" />
      </>
    ),
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

function renderCardDescription(text) {
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

  return <p className="builderCardText">{compactText}</p>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {config.icon}
      </svg>
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

function renderCardDetails(details) {
  const resolvedDetails = getCardDetails(details)

  if (resolvedDetails.length === 0) {
    return null
  }

  return (
    <ul className="builderCardDetails">
      {resolvedDetails.map((detail, index) => (
        <li className="builderCardDetail" key={detail._key || `${detail.type}-${index}`}>
          {renderDetailIcon(detail.type)}
          <span className="builderCardDetailText">{detail.text}</span>
        </li>
      ))}
    </ul>
  )
}

export default function CardsBlockSection({block, sectionId}) {
  if (!block?.title || !Array.isArray(block.items) || block.items.length === 0) {
    return null
  }

  const hasCardMedia = block.items.some((item) => item?.image?.asset)

  return (
    <section className="section" id={sectionId}>
      <div className="container">
        <SectionHeading title={block.title} />

        <div className="sectionCardsGrid sectionCardsGridThree">
          {block.items.map((item) => (
            <article className="infoCard builderCard" key={item._key || item.title}>
              {hasCardMedia ? (
                item.image?.asset ? (
                  <SectionCardImage
                    image={item.image}
                    alt={item.title}
                    width={720}
                    height={420}
                    fit="crop"
                    wrapperClassName="builderCardMedia"
                    imageClassName="builderCardImage"
                  />
                ) : (
                  <div aria-hidden="true" className="builderCardMedia builderCardMediaPlaceholder" />
                )
              ) : null}

              <div className="builderCardBody">
                <h3 className="builderCardTitle">{item.title}</h3>
                {renderCardDescription(item.text)}
                {renderCardDetails(item.details)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
