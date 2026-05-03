/* eslint-disable @next/next/no-img-element */

import {urlFor} from '../../sanity/lib/image'

const responsiveImageWidths = [160, 240, 320, 480, 640, 720, 960, 1200, 1440]

function getImageAssetRef(image) {
  const asset = image?.asset

  return typeof asset?._ref === 'string' ? asset._ref : typeof asset?._id === 'string' ? asset._id : ''
}

function getOriginalDimensions(image) {
  const match = getImageAssetRef(image).match(/-(\d+)x(\d+)-[a-z0-9]+$/i)

  if (!match) {
    return null
  }

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  }
}

function getDisplayHeight(image, width, height) {
  if (height) {
    return height
  }

  const dimensions = getOriginalDimensions(image)

  if (!dimensions?.width || !dimensions?.height) {
    return undefined
  }

  return Math.round((width / dimensions.width) * dimensions.height)
}

function getCandidateWidths(width) {
  return Array.from(
    new Set([
      ...responsiveImageWidths.filter((candidate) => candidate < width),
      width,
    ])
  )
}

function getImageUrl(image, width, height, fit) {
  let imageBuilder = urlFor(image).width(width)

  if (height) {
    imageBuilder = imageBuilder.height(height)
  }

  if (fit) {
    imageBuilder = imageBuilder.fit(fit)
  }

  return imageBuilder.url()
}

export default function SectionCardImage({
  image,
  alt,
  wrapperClassName = undefined,
  imageClassName = 'cardImage',
  width = 960,
  height = undefined,
  fit = undefined,
  sizes = '100vw',
  loading = 'lazy',
  fetchPriority = undefined,
}) {
  if (!image?.asset) {
    return null
  }

  const resolvedHeight = getDisplayHeight(image, width, height)
  const srcSet = getCandidateWidths(width)
    .map((candidateWidth) => {
      const candidateHeight = height ? Math.round((candidateWidth / width) * height) : undefined

      return `${getImageUrl(image, candidateWidth, candidateHeight, fit)} ${candidateWidth}w`
    })
    .join(', ')
  const resolvedLoading = loading === 'eager' ? 'eager' : 'lazy'
  const resolvedFetchPriority =
    fetchPriority === 'high' || fetchPriority === 'low' || fetchPriority === 'auto'
      ? fetchPriority
      : undefined

  return (
    <div className={wrapperClassName}>
      <img
        src={getImageUrl(image, width, height, fit)}
        srcSet={srcSet}
        sizes={sizes}
        alt={image.alt || alt || ''}
        className={imageClassName}
        width={width}
        height={resolvedHeight}
        loading={resolvedLoading}
        fetchPriority={resolvedFetchPriority}
        decoding="async"
      />
    </div>
  )
}
