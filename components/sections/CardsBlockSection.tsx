import SectionCardImage from './SectionCardImage'
import SectionHeading from './SectionHeading'

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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
