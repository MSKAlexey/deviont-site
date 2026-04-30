import {Fragment} from 'react'
import type {ReactNode} from 'react'
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
}

type PortableTextBlock = {
  _type?: string
  _key?: string
  style?: string
  listItem?: string
  children?: PortableTextSpan[]
  markDefs?: PortableTextMarkDef[]
}

function renderMultilineText(text: string, keyPrefix: string) {
  return text.split(/\r\n|\r|\n/).map((line, index, items) => (
    <Fragment key={`${keyPrefix}-${index}`}>
      {line}
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

function renderBlockContent(block: PortableTextBlock, blockIndex: number) {
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
