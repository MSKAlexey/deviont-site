import SectionHeading from './SectionHeading'

export default function TextBlockSection({block, sectionId}) {
  const title = typeof block?.title === 'string' ? block.title.trim() : ''
  const text = typeof block?.text === 'string' ? block.text : ''

  if (!title && !text) {
    return null
  }

  return (
    <section className="section" id={sectionId}>
      <div className="container">
        {title ? <SectionHeading title={title} /> : null}

        <div className="infoCard builderTextCard">
          <p className="multilineText">{text}</p>
        </div>
      </div>
    </section>
  )
}
