function resolveInlineTypographyStyle(value) {
  const fontSize = Number.parseFloat(value?.fontSize)

  return Number.isFinite(fontSize) && fontSize > 0 ? {fontSize: `${fontSize}px`} : undefined
}

export default function InlineTypographyAnnotation(props) {
  const style = resolveInlineTypographyStyle(props.value)
  const content = props.renderDefault ? props.renderDefault(props) : props.children

  return style ? <span style={style}>{content}</span> : content
}
