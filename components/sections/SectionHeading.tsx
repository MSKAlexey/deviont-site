export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  titleStyle,
  descriptionStyle,
}) {
  const className = align === 'center' ? 'sectionHead center' : 'sectionHead'

  return (
    <div className={className}>
      {eyebrow ? <div className="sectionEyebrow">{eyebrow}</div> : null}
      <h2 style={titleStyle}>{title}</h2>
      {description ? <p style={descriptionStyle}>{description}</p> : null}
    </div>
  )
}
