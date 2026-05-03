import SectionCardImage from './SectionCardImage'
import SectionHeading from './SectionHeading'

function normalizeImageSize(value) {
  return value === 'small' || value === 'large' ? value : 'medium'
}

function normalizeListItem(item) {
  if (typeof item === 'string') {
    const text = item.trim()

    return text
      ? {title: '', description: '', text, image: null, showImage: true, imageSize: 'medium'}
      : null
  }

  if (item && typeof item === 'object') {
    const title = typeof item.title === 'string' ? item.title.trim() : ''
    const description = typeof item.description === 'string' ? item.description.trim() : ''
    const text = typeof item.text === 'string' ? item.text.trim() : ''
    const showImage = item.showImage === false ? false : true
    const imageSize = normalizeImageSize(item.imageSize)

    if (!title && !description && !text) {
      return null
    }

    return {
      title,
      description,
      text,
      image: item.image || null,
      showImage,
      imageSize,
    }
  }

  return null
}

function splitListItemText(text) {
  if (typeof text !== 'string') {
    return {title: '', description: ''}
  }

  const normalizedText = text.trim()
  const lineParts = normalizedText
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (lineParts.length > 1) {
    return {
      title: lineParts[0],
      description: lineParts.slice(1).join(' '),
    }
  }

  const spacedParts = normalizedText
    .split(/\s{3,}/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (spacedParts.length > 1) {
    return {
      title: spacedParts[0],
      description: spacedParts.slice(1).join(' '),
    }
  }

  return {
    title: normalizedText,
    description: '',
  }
}

function getListItemContent(item) {
  if (item.title && item.description) {
    return {
      title: item.title,
      description: item.description,
    }
  }

  return splitListItemText(item.text)
}

export default function ListBlockSection({block, sectionId}) {
  const items = Array.isArray(block?.items)
    ? block.items.map(normalizeListItem).filter(Boolean)
    : []

  if (!block?.title || items.length === 0) {
    return null
  }

  return (
    <section className="section" id={sectionId}>
      <div className="container">
        <SectionHeading title={block.title} />

        <ol className="workflowGrid">
          {items.map((item, index) => {
            const hasImage = item.showImage && Boolean(item.image?.asset)
            const {title, description} = getListItemContent(item)
            const cardClassName = [
              'workflowCard',
              hasImage && item.imageSize !== 'small' ? 'workflowCardWithImage' : '',
              hasImage && item.imageSize === 'small' ? 'workflowCardWithSmallImage' : '',
              hasImage && item.imageSize === 'large' ? 'workflowCardWithLargeImage' : '',
            ]
              .filter(Boolean)
              .join(' ')
            const mediaClassName = [
              'workflowCardMedia',
              item.imageSize === 'small' ? 'workflowCardMediaSmall' : '',
              item.imageSize === 'large' ? 'workflowCardMediaLarge' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <li className={cardClassName} key={`${block._key || block.title}-${index + 1}`}>
                {hasImage && item.imageSize === 'small' ? (
                  <div className="workflowCardCopy">
                    <div className="workflowCardHeader">
                      <SectionCardImage
                        image={item.image}
                        alt={title || item.text}
                        width={112}
                        sizes="56px"
                        wrapperClassName={mediaClassName}
                        imageClassName="workflowCardImage workflowCardImageSmall"
                      />

                      <p className="workflowCardTitle">{title}</p>
                    </div>

                    {description ? <p className="workflowCardText">{description}</p> : null}
                  </div>
                ) : hasImage ? (
                  <>
                    <SectionCardImage
                      image={item.image}
                      alt={title || item.text}
                      width={item.imageSize === 'small' ? 96 : item.imageSize === 'large' ? 720 : 520}
                      sizes="(max-width: 720px) calc(100vw - 72px), (max-width: 1180px) calc((100vw - 154px) / 2), 230px"
                      wrapperClassName={mediaClassName}
                      imageClassName="workflowCardImage"
                    />

                    <div className="workflowCardCopy">
                      <p className="workflowCardTitle">{title}</p>
                      {description ? <p className="workflowCardText">{description}</p> : null}
                    </div>
                  </>
                ) : item.title && item.description ? (
                  <div className="workflowCardCopy">
                    <p className="workflowCardTitle">{item.title}</p>
                    <p className="workflowCardText">{item.description}</p>
                  </div>
                ) : (
                  <p className="workflowCardText">{item.text}</p>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
