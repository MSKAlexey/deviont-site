import {Fragment} from 'react'
import type {ReactNode} from 'react'
import SectionCardImage from '../sections/SectionCardImage'
import {resolveHeroTypographyStyle} from '../sections/heroTypography'

type PortableTextSpan = {
  _type?: string
  _key?: string
  text?: string
  marks?: string[]
}

type PortableTextMarkDef = {
  _key?: string
  _type?: string
  href?: string
  fontSize?: number | string
  article?: {
    title?: string
    slug?: string
  } | null
  service?: {
    title?: string
    slug?: string
    isVisible?: boolean
  } | null
}

type PortableTextBlock = {
  _type?: string
  _key?: string
  style?: string
  listItem?: string
  children?: PortableTextSpan[]
  markDefs?: PortableTextMarkDef[]
  asset?: unknown
  alt?: string
  caption?: string
  imageSize?: string
  imageAspectRatio?: string
  noteType?: string
  text?: string
}

type InlineLineSegment = {
  key: string
  marks: string[]
  text: string
}

const noteTypeLabels: Record<string, string> = {
  important: 'Важно',
  tip: 'Совет',
  error: 'Ошибка',
  note: 'Примечание',
}

const noteTypeClasses: Record<string, string> = {
  important: 'articleNoteImportant',
  tip: 'articleNoteTip',
  error: 'articleNoteError',
  note: 'articleNoteDefault',
}

const autoNoteMarkerTypes: Record<string, string> = {
  Внимание: 'important',
  Важно: 'important',
  Совет: 'tip',
  Ошибка: 'error',
  Примечание: 'note',
}

const articleImageSizeClasses: Record<string, string> = {
  compact: 'articleBodyFigureCompact',
  medium: 'articleBodyFigureMedium',
  wide: 'articleBodyFigureWide',
}

const articleImageAspectRatios: Record<string, {width: number; height: number} | null> = {
  original: null,
  portrait: {width: 3, height: 4},
  square: {width: 1, height: 1},
  landscape: {width: 16, height: 9},
  panorama: {width: 21, height: 9},
}

const articleImageAspectRatioClasses: Record<string, string> = {
  portrait: 'articleBodyFigurePortrait',
  square: 'articleBodyFigureSquare',
  landscape: 'articleBodyFigureLandscape',
  panorama: 'articleBodyFigurePanorama',
}

function getArticleImageSize(value?: string) {
  return value && articleImageSizeClasses[value] ? value : 'wide'
}

function getArticleImageAspectRatio(value?: string) {
  return value && Object.prototype.hasOwnProperty.call(articleImageAspectRatios, value)
    ? value
    : 'original'
}

function getClassName(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function renderMarkdownStrongText(text: string, keyPrefix: string) {
  const nodes: ReactNode[] = []
  const boldPattern = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null = boldPattern.exec(text)

  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    nodes.push(<strong key={`${keyPrefix}-strong-${match.index}`}>{match[1]}</strong>)
    lastIndex = match.index + match[0].length
    match = boldPattern.exec(text)
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : text
}

function renderMultilineText(text: string, keyPrefix: string) {
  return text.split(/\r\n|\r|\n/).map((line, index, items) => (
    <Fragment key={`${keyPrefix}-${index}`}>
      {renderMarkdownStrongText(line, `${keyPrefix}-${index}`)}
      {index < items.length - 1 ? <br /> : null}
    </Fragment>
  ))
}

function applyMarks(
  content: ReactNode,
  marks: string[] = [],
  markDefs: PortableTextMarkDef[] = [],
  keyPrefix: string
) {
  return marks.reduce<ReactNode>((result, mark, index) => {
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

    if (markDef?._type === 'link' && markDef.href) {
      const isExternal = /^https?:\/\//i.test(markDef.href)

      return (
        <a
          key={`${keyPrefix}-link-${index}`}
          href={markDef.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {result}
        </a>
      )
    }

    if (markDef?._type === 'articleLink' && markDef.article?.slug) {
      return (
        <a key={`${keyPrefix}-article-link-${index}`} href={`/articles/${markDef.article.slug}`}>
          {result}
        </a>
      )
    }

    if (
      markDef?._type === 'serviceLink' &&
      markDef.service?.slug &&
      markDef.service.isVisible !== false
    ) {
      return (
        <a key={`${keyPrefix}-service-link-${index}`} href={`/services/${markDef.service.slug}`}>
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

function renderInlineChildren(block: PortableTextBlock, blockIndex: number) {
  const markDefs = Array.isArray(block.markDefs) ? block.markDefs : []
  const children = Array.isArray(block.children) ? block.children : []

  return children.map((child, childIndex) => {
    if (child?._type !== 'span' || typeof child.text !== 'string') {
      return null
    }

    const content = renderMultilineText(child.text, `article-inline-${blockIndex}-${childIndex}`)

    return (
      <Fragment key={child._key || `article-child-${blockIndex}-${childIndex}`}>
        {applyMarks(
          content,
          Array.isArray(child.marks) ? child.marks : [],
          markDefs,
          `article-mark-${blockIndex}-${childIndex}`
        )}
      </Fragment>
    )
  })
}

function getInlineLineSegments(block: PortableTextBlock) {
  const children = Array.isArray(block.children) ? block.children : []
  const lines: InlineLineSegment[][] = [[]]

  children.forEach((child, childIndex) => {
    if (child?._type !== 'span' || typeof child.text !== 'string') {
      return
    }

    const parts = child.text.split(/(\r\n|\r|\n)/)

    parts.forEach((part, partIndex) => {
      if (/^(?:\r\n|\r|\n)$/.test(part)) {
        lines.push([])
        return
      }

      if (!part) {
        return
      }

      lines[lines.length - 1].push({
        key: `${child._key || `child-${childIndex}`}-${partIndex}`,
        marks: Array.isArray(child.marks) ? child.marks : [],
        text: part,
      })
    })
  })

  return lines
}

function getLineText(line: InlineLineSegment[]) {
  return line.map((segment) => segment.text).join('')
}

function removeLeadingText(line: InlineLineSegment[], length: number) {
  let remainingLength = length

  return line
    .map((segment) => {
      if (remainingLength <= 0) {
        return segment
      }

      if (segment.text.length <= remainingLength) {
        remainingLength -= segment.text.length
        return {
          ...segment,
          text: '',
        }
      }

      const nextSegment = {
        ...segment,
        text: segment.text.slice(remainingLength),
      }
      remainingLength = 0
      return nextSegment
    })
    .filter((segment) => segment.text)
}

function renderLineSegments(
  line: InlineLineSegment[],
  markDefs: PortableTextMarkDef[],
  keyPrefix: string
) {
  return line.map((segment, index) => (
    <Fragment key={`${keyPrefix}-${segment.key}-${index}`}>
      {applyMarks(
        renderMarkdownStrongText(segment.text, `${keyPrefix}-text-${index}`),
        segment.marks,
        markDefs,
        `${keyPrefix}-mark-${index}`
      )}
    </Fragment>
  ))
}

function detectAutoNoteMarker(lineText: string) {
  const markerMatch = lineText.match(
    /^\s*(?:>\s*)?(?:\*\*)?(Внимание|Важно|Совет|Ошибка|Примечание)(?:\*\*)?[:!](?:\*\*)?[ \t]*/
  )

  if (!markerMatch) {
    return null
  }

  return {
    noteType: autoNoteMarkerTypes[markerMatch[1]] || 'note',
    markerLength: markerMatch[0].length,
  }
}

function detectAutoNoteStart(lines: InlineLineSegment[][]) {
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const lineText = getLineText(lines[lineIndex])

    if (!lineText.trim()) {
      continue
    }

    const detectedNote = detectAutoNoteMarker(lineText)

    return detectedNote
      ? {
          ...detectedNote,
          lineIndex,
        }
      : null
  }

  return null
}

function trimEmptyEdgeLines(lines: InlineLineSegment[][]) {
  let startIndex = 0
  let endIndex = lines.length

  while (startIndex < endIndex && !getLineText(lines[startIndex]).trim()) {
    startIndex += 1
  }

  while (endIndex > startIndex && !getLineText(lines[endIndex - 1]).trim()) {
    endIndex -= 1
  }

  return lines.slice(startIndex, endIndex)
}

function renderAutoNoteParagraph(block: PortableTextBlock, blockIndex: number) {
  if (block.style && block.style !== 'normal') {
    return null
  }

  const markDefs = Array.isArray(block.markDefs) ? block.markDefs : []
  const lines = getInlineLineSegments(block)
  const detectedNote = detectAutoNoteStart(lines)

  if (!detectedNote) {
    return null
  }

  const markerLine = lines[detectedNote.lineIndex] || []
  const contentLines = trimEmptyEdgeLines([
    removeLeadingText(markerLine, detectedNote.markerLength),
    ...lines.slice(detectedNote.lineIndex + 1),
  ])

  if (contentLines.length === 0) {
    return null
  }

  const noteContent = contentLines.flatMap((line, lineIndex) => [
    ...renderLineSegments(line, markDefs, `article-auto-note-${blockIndex}-${lineIndex}`),
    lineIndex < contentLines.length - 1 ? (
      <br key={`article-auto-note-br-${blockIndex}-${lineIndex}`} />
    ) : null,
  ])

  return (
    <aside className={`articleNote ${noteTypeClasses[detectedNote.noteType]}`}>
      <strong>{noteTypeLabels[detectedNote.noteType]}</strong>
      <p>{noteContent}</p>
    </aside>
  )
}

function renderMarkdownTextLines(block: PortableTextBlock, blockIndex: number) {
  if (block.style && block.style !== 'normal') {
    return null
  }

  const markDefs = Array.isArray(block.markDefs) ? block.markDefs : []
  const lines = getInlineLineSegments(block)
  const hasMarkdownHeading = lines.some((line) => /^#{2,3}\s+/.test(getLineText(line)))
  const hasMarkdownList = lines.some((line) => /^-\s+/.test(getLineText(line)))

  if (!hasMarkdownHeading && !hasMarkdownList) {
    return null
  }

  const nodes: ReactNode[] = []
  let paragraphLines: InlineLineSegment[][] = []
  let listLines: InlineLineSegment[][] = []

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return
    }

    const paragraphContent = paragraphLines.flatMap((line, lineIndex) => [
      ...renderLineSegments(line, markDefs, `article-md-p-${blockIndex}-${nodes.length}-${lineIndex}`),
      lineIndex < paragraphLines.length - 1 ? (
        <br key={`article-md-p-br-${blockIndex}-${nodes.length}-${lineIndex}`} />
      ) : null,
    ])

    if (paragraphContent.some(Boolean)) {
      nodes.push(
        <p key={`article-md-p-${block._key || blockIndex}-${nodes.length}`}>
          {paragraphContent}
        </p>
      )
    }

    paragraphLines = []
  }

  const flushMarkdownList = () => {
    if (listLines.length === 0) {
      return
    }

    nodes.push(
      <ul key={`article-md-ul-${block._key || blockIndex}-${nodes.length}`}>
        {listLines.map((line, lineIndex) => (
          <li key={`article-md-li-${block._key || blockIndex}-${lineIndex}`}>
            {renderLineSegments(
              line,
              markDefs,
              `article-md-li-${blockIndex}-${nodes.length}-${lineIndex}`
            )}
          </li>
        ))}
      </ul>
    )

    listLines = []
  }

  lines.forEach((line, lineIndex) => {
    const lineText = getLineText(line)
    const h3Match = lineText.match(/^###\s+/)
    const h2Match = lineText.match(/^##\s+/)
    const listMatch = lineText.match(/^-\s+/)

    if (h3Match || h2Match) {
      flushParagraph()
      flushMarkdownList()

      const markerLength = (h3Match || h2Match)?.[0].length || 0
      const headingLine = removeLeadingText(line, markerLength)
      const headingContent = renderLineSegments(
        headingLine,
        markDefs,
        `article-md-heading-${blockIndex}-${lineIndex}`
      )

      if (h3Match) {
        nodes.push(
          <h3 key={`article-md-h3-${block._key || blockIndex}-${lineIndex}`}>
            {headingContent}
          </h3>
        )
      } else {
        nodes.push(
          <h2 key={`article-md-h2-${block._key || blockIndex}-${lineIndex}`}>
            {headingContent}
          </h2>
        )
      }

      return
    }

    if (listMatch) {
      flushParagraph()
      listLines.push(removeLeadingText(line, listMatch[0].length))
      return
    }

    flushMarkdownList()

    if (lineText.trim()) {
      paragraphLines.push(line)
    } else {
      flushParagraph()
      flushMarkdownList()
    }
  })

  flushMarkdownList()
  flushParagraph()

  return nodes.length > 0 ? nodes : null
}

function renderArticleImage(block: PortableTextBlock, blockIndex: number) {
  if (!block.asset) {
    return null
  }

  const imageSize = getArticleImageSize(block.imageSize)
  const imageAspectRatio = getArticleImageAspectRatio(block.imageAspectRatio)
  const ratio = articleImageAspectRatios[imageAspectRatio]
  const width = imageSize === 'compact' ? 760 : imageSize === 'medium' ? 960 : 1200
  const height = ratio ? Math.round((width / ratio.width) * ratio.height) : undefined

  return (
    <figure
      key={block._key || `article-image-${blockIndex}`}
      className={getClassName(
        'articleBodyFigure',
        articleImageSizeClasses[imageSize],
        articleImageAspectRatioClasses[imageAspectRatio]
      )}
    >
      <SectionCardImage
        image={block}
        alt={block.alt || block.caption || ''}
        width={width}
        height={height}
        fit={ratio ? 'crop' : undefined}
        sizes="(max-width: 720px) calc(100vw - 56px), (max-width: 1180px) calc(100vw - 112px), 820px"
        wrapperClassName="articleBodyImageFrame"
        imageClassName="articleBodyImage"
      />
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  )
}

function renderArticleNote(block: PortableTextBlock, blockIndex: number) {
  const text = typeof block.text === 'string' ? block.text.trim() : ''

  if (!text) {
    return null
  }

  const noteType = block.noteType && noteTypeLabels[block.noteType] ? block.noteType : 'note'

  return (
    <aside
      key={block._key || `article-note-${blockIndex}`}
      className={`articleNote ${noteTypeClasses[noteType]}`}
    >
      <strong>{noteTypeLabels[noteType]}</strong>
      <p>{renderMultilineText(text, `article-note-text-${blockIndex}`)}</p>
    </aside>
  )
}

function renderBlockContent(block: PortableTextBlock, blockIndex: number) {
  const autoNoteContent = renderAutoNoteParagraph(block, blockIndex)

  if (autoNoteContent) {
    return autoNoteContent
  }

  const markdownContent = renderMarkdownTextLines(block, blockIndex)

  if (markdownContent) {
    return markdownContent
  }

  const children = renderInlineChildren(block, blockIndex).filter(Boolean)

  if (children.length === 0) {
    return null
  }

  switch (block.style) {
    case 'h2':
      return <h2>{children}</h2>
    case 'h3':
      return <h3>{children}</h3>
    case 'blockquote':
      return <blockquote>{children}</blockquote>
    default:
      return <p>{children}</p>
  }
}

function renderObjectBlock(block: PortableTextBlock, blockIndex: number) {
  if (block._type === 'articleImage' || block._type === 'image') {
    return renderArticleImage(block, blockIndex)
  }

  if (block._type === 'articleNote') {
    return renderArticleNote(block, blockIndex)
  }

  return null
}

function flushList(
  items: PortableTextBlock[],
  listType: string | null,
  startIndex: number,
  target: ReactNode[]
) {
  if (items.length === 0 || !listType) {
    return
  }

  const ListTag = listType === 'number' ? 'ol' : 'ul'

  target.push(
    <ListTag key={`article-list-${listType}-${startIndex}`}>
      {items.map((item, itemIndex) => {
        const children = renderInlineChildren(item, startIndex + itemIndex).filter(Boolean)

        if (children.length === 0) {
          return null
        }

        return <li key={item._key || `article-list-item-${startIndex + itemIndex}`}>{children}</li>
      })}
    </ListTag>
  )
}

export default function ArticleBody({
  value,
  className = 'articleBody',
}: {
  value?: PortableTextBlock[] | null
  className?: string
}) {
  const blocks = Array.isArray(value) ? value : []

  if (blocks.length === 0) {
    return null
  }

  const nodes: ReactNode[] = []
  let listBuffer: PortableTextBlock[] = []
  let currentListType: string | null = null
  let listStartIndex = 0

  blocks.forEach((block, index) => {
    if (block?._type !== 'block') {
      flushList(listBuffer, currentListType, listStartIndex, nodes)
      listBuffer = []
      currentListType = null

      const objectContent = renderObjectBlock(block, index)

      if (objectContent) {
        nodes.push(objectContent)
      }

      return
    }

    if (block.listItem) {
      if (currentListType && currentListType !== block.listItem) {
        flushList(listBuffer, currentListType, listStartIndex, nodes)
        listBuffer = []
      }

      if (listBuffer.length === 0) {
        listStartIndex = index
      }

      currentListType = block.listItem
      listBuffer.push(block)
      return
    }

    flushList(listBuffer, currentListType, listStartIndex, nodes)
    listBuffer = []
    currentListType = null

    const content = renderBlockContent(block, index)

    if (content) {
      nodes.push(<Fragment key={block._key || `article-block-${index}`}>{content}</Fragment>)
    }
  })

  flushList(listBuffer, currentListType, listStartIndex, nodes)

  if (nodes.length === 0) {
    return null
  }

  return <div className={className}>{nodes}</div>
}
