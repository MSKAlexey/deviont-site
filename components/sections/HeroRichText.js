import {Fragment} from 'react'
import {resolveHeroTypographyStyle} from './heroTypography'

const breakTagPattern = /<br\s*\/?>/gi
const lineBreakPattern = /\r\n|\r|\n/

export function normalizeHeroMultilineText(value) {
  return typeof value === 'string' ? value.replace(breakTagPattern, '\n') : ''
}

export function hasHeroPlainTextContent(value) {
  return normalizeHeroMultilineText(value).trim().length > 0
}

export function getHeroPlainText(value) {
  return normalizeHeroMultilineText(value).replace(lineBreakPattern, ' ').trim()
}

export function renderHeroMultilineText(value, keyPrefix = 'hero-text') {
  if (!hasHeroPlainTextContent(value)) {
    return null
  }

  const lines = normalizeHeroMultilineText(value).split(lineBreakPattern)

  return lines.map((line, index) => (
    <Fragment key={`${keyPrefix}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ))
}

export function hasHeroRichTextContent(value) {
  return Array.isArray(value)
    ? value.some(
        (block) =>
          block?._type === 'block' &&
          Array.isArray(block.children) &&
          block.children.some(
            (child) => child?._type === 'span' && typeof child.text === 'string' && child.text.length > 0
          )
      )
    : false
}

export function getHeroRichTextPlainText(value) {
  if (!hasHeroRichTextContent(value)) {
    return ''
  }

  return value
    .map((block) => {
      if (block?._type !== 'block' || !Array.isArray(block.children)) {
        return ''
      }

      return block.children
        .map((child) => (child?._type === 'span' ? getHeroPlainText(child.text) : ''))
        .join('')
    })
    .filter(Boolean)
    .join(' ')
    .trim()
}

function applyHeroMarks(content, marks, markDefs, keyPrefix) {
  return marks.reduce((result, mark, index) => {
    if (mark === 'strong') {
      return <strong key={`${keyPrefix}-strong-${index}`}>{result}</strong>
    }

    if (mark === 'em') {
      return <em key={`${keyPrefix}-em-${index}`}>{result}</em>
    }

    if (mark === 'underline') {
      return <u key={`${keyPrefix}-underline-${index}`}>{result}</u>
    }

    const markDef = markDefs.find((definition) => definition?._key === mark)

    if (markDef?._type === 'link' && typeof markDef.href === 'string' && markDef.href.trim()) {
      return (
        <a
          key={`${keyPrefix}-link-${index}`}
          href={markDef.href}
          rel="noreferrer"
          target="_blank"
        >
          {result}
        </a>
      )
    }

    if (markDef?._type === 'inlineTypography') {
      const style = resolveHeroTypographyStyle(markDef)

      return style ? (
        <span key={`${keyPrefix}-inline-typography-${index}`} style={style}>
          {result}
        </span>
      ) : (
        result
      )
    }

    return result
  }, content)
}

function renderHeroRichTextValue(value) {
  return value
    .map((block, blockIndex) => {
      if (block?._type !== 'block' || !Array.isArray(block.children)) {
        return null
      }

      const children = block.children
        .map((child, childIndex) => {
          if (child?._type !== 'span' || typeof child.text !== 'string') {
            return null
          }

          const text = renderHeroMultilineText(child.text, `hero-rich-${blockIndex}-${childIndex}`)

          if (!text) {
            return null
          }

          const marks = Array.isArray(child.marks) ? child.marks : []
          const markDefs = Array.isArray(block.markDefs) ? block.markDefs : []

          return (
            <Fragment key={`hero-rich-child-${blockIndex}-${childIndex}`}>
              {applyHeroMarks(text, marks, markDefs, `hero-rich-${blockIndex}-${childIndex}`)}
            </Fragment>
          )
        })
        .filter(Boolean)

      if (children.length === 0) {
        return null
      }

      return (
        <Fragment key={`hero-rich-block-${blockIndex}`}>
          {children}
          {blockIndex < value.length - 1 ? <br /> : null}
        </Fragment>
      )
    })
    .filter(Boolean)
}

export default function HeroRichText({
  as: Component = 'span',
  className = undefined,
  style = undefined,
  value,
}) {
  if (!hasHeroRichTextContent(value)) {
    return null
  }

  return (
    <Component className={className} style={style}>
      {renderHeroRichTextValue(value)}
    </Component>
  )
}
