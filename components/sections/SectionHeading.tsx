export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}) {
  const className = align === 'center' ? 'sectionHead center' : 'sectionHead'

  return (
    <div className={className}>
      {eyebrow ? <div className="sectionEyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  )
}
