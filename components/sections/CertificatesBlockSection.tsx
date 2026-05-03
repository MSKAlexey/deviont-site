import SectionCardImage from './SectionCardImage'
import SectionHeading from './SectionHeading'
import {urlFor} from '../../sanity/lib/image'

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function resolveCertificateItems(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.filter(
    (item) =>
      item &&
      typeof item.title === 'string' &&
      item.title.trim().length > 0 &&
      item.image?.asset
  )
}

function formatIssuedAt(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return null
  }

  const parsedDate = new Date(`${value}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return dateFormatter.format(parsedDate)
}

function resolveCertificateHref(item) {
  if (typeof item?.file?.asset?.url === 'string' && item.file.asset.url.length > 0) {
    return item.file.asset.url
  }

  if (item?.image?.asset) {
    return urlFor(item.image).width(1800).url()
  }

  return null
}

function CertificateCard({item}) {
  const href = resolveCertificateHref(item)
  const issuedAt = formatIssuedAt(item.issuedAt)
  const cardBody = (
    <>
      <SectionCardImage
        image={item.image}
        alt={item.title}
        width={760}
        sizes="(max-width: 720px) calc(100vw - 72px), (max-width: 1180px) calc((100vw - 154px) / 2), 327px"
        wrapperClassName="certificateCardMedia"
        imageClassName="certificateCardImage"
      />

      <div className="certificateCardBody">
        <h3 className="certificateCardTitle">{item.title}</h3>

        <div className="certificateCardMeta">
          <p className="certificateCardIssuer">{item.issuer}</p>
          {issuedAt ? <p className="certificateCardDate">{issuedAt}</p> : null}
        </div>
      </div>
    </>
  )

  if (href) {
    return (
      <a
        className="infoCard certificateCard certificateCardLink"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        {cardBody}
      </a>
    )
  }

  return <article className="infoCard certificateCard">{cardBody}</article>
}

export default function CertificatesBlockSection({block, sectionId}) {
  const items = resolveCertificateItems(block?.items)

  if (!block?.title || items.length === 0) {
    return null
  }

  return (
    <section className="section" id={sectionId}>
      <div className="container">
        <SectionHeading title={block.title} />

        <div className="sectionCardsGrid sectionCardsGridThree">
          {items.map((item, index) => (
            <CertificateCard
              key={item._key || `${item.title}-${index}`}
              item={item}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
