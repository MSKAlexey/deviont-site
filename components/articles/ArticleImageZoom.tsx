'use client'

import {useEffect, useId, useState, type KeyboardEvent, type MouseEvent} from 'react'
import SectionCardImage from '../sections/SectionCardImage'

type ArticleImageZoomProps = {
  image: {
    asset?: unknown
    alt?: string
    caption?: string
  }
  alt?: string
  caption?: string
  width: number
  height?: number
  fit?: string
  sizes: string
  figureClassName: string
}

export default function ArticleImageZoom({
  image,
  alt = '',
  caption = '',
  width,
  height = undefined,
  fit = undefined,
  sizes,
  figureClassName,
}: ArticleImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false)
  const captionId = useId()
  const imageAlt = alt || caption || ''

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!image?.asset) {
    return null
  }

  const openViewer = () => {
    setIsOpen(true)
  }

  const closeViewer = () => {
    setIsOpen(false)
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    openViewer()
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeViewer()
    }
  }

  return (
    <figure className={figureClassName}>
      <div
        aria-label="Увеличить изображение"
        className="articleImageZoomTrigger"
        onClick={openViewer}
        onKeyDown={handleTriggerKeyDown}
        role="button"
        tabIndex={0}
      >
        <SectionCardImage
          image={image}
          alt={imageAlt}
          width={width}
          height={height}
          fit={fit}
          sizes={sizes}
          wrapperClassName="articleBodyImageFrame"
          imageClassName="articleBodyImage"
        />
      </div>

      {caption ? <figcaption>{caption}</figcaption> : null}

      {isOpen ? (
        <div
          aria-label={caption ? undefined : 'Увеличенное изображение статьи'}
          aria-labelledby={caption ? captionId : undefined}
          aria-modal="true"
          className="articleImageViewer"
          onClick={handleBackdropClick}
          role="dialog"
        >
          <div className="articleImageViewerPanel">
            <button
              aria-label="Закрыть изображение"
              className="articleImageViewerClose"
              onClick={closeViewer}
              type="button"
            >
              ×
            </button>

            <SectionCardImage
              image={image}
              alt={imageAlt}
              width={1800}
              sizes="96vw"
              wrapperClassName="articleImageViewerFrame"
              imageClassName="articleImageViewerImage"
              ignoreCrop
            />
            {caption ? (
              <p className="articleImageViewerCaption" id={captionId}>
                {caption}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </figure>
  )
}
