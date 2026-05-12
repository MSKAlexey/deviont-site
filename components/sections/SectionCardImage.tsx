/* eslint-disable @next/next/no-img-element */

import type {CSSProperties} from 'react'
import {urlFor} from '../../sanity/lib/image'

const responsiveImageWidths = [160, 240, 320, 480, 640, 720, 960, 1200, 1440]

type ImageWrapperStyle = CSSProperties & {
  '--image-aspect-ratio'?: string
}

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

function getAspectRatioValue(image) {
  const dimensions = getOriginalDimensions(image)

  return dimensions?.width && dimensions?.height
    ? `${dimensions.width} / ${dimensions.height}`
    : undefined
}

function getCandidateWidths(width) {
  return Array.from(
    new Set([
      ...responsiveImageWidths.filter((candidate) => candidate < width),
      width,
    ])
  )
}

function getImageSource(image, ignoreCrop) {
  const assetRef = getImageAssetRef(image)

  return ignoreCrop && assetRef ? assetRef : image
}

function getImageUrl(image, width, height, fit, ignoreCrop) {
  let imageBuilder = urlFor(getImageSource(image, ignoreCrop)).width(width)

  if (height && !ignoreCrop) {
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
  ignoreCrop = false,
}) {
  if (!image?.asset) {
    return null
  }

  const resolvedHeight = getDisplayHeight(image, width, ignoreCrop ? undefined : height)
  const imageAspectRatio = getAspectRatioValue(image)
  const wrapperStyle: ImageWrapperStyle | undefined = imageAspectRatio
    ? {'--image-aspect-ratio': imageAspectRatio}
    : undefined
  const srcSet = getCandidateWidths(width)
    .map((candidateWidth) => {
      const candidateHeight =
        height && !ignoreCrop ? Math.round((candidateWidth / width) * height) : undefined

      return `${getImageUrl(image, candidateWidth, candidateHeight, fit, ignoreCrop)} ${candidateWidth}w`
    })
    .join(', ')
  const resolvedLoading = loading === 'eager' ? 'eager' : 'lazy'
  const resolvedFetchPriority =
    fetchPriority === 'high' || fetchPriority === 'low' || fetchPriority === 'auto'
      ? fetchPriority
      : undefined

  return (
    <div
      className={wrapperClassName}
      style={wrapperStyle}
    >
      <img
        src={getImageUrl(image, width, height, fit, ignoreCrop)}
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
