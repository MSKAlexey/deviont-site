import SectionHeading from './SectionHeading'

export default function TextBlockSection({block, sectionId}) {
  if (!block?.title && !block?.text) {
    return null
  }

  return (
    <section className="section" id={sectionId}>
      <div className="container">
        <SectionHeading title={block.title} />

        <div className="infoCard builderTextCard">
          <p className="multilineText">{block.text}</p>
        </div>
      </div>
    </section>
  )
}
