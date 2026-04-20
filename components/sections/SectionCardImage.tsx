/* eslint-disable @next/next/no-img-element */

import {urlFor} from '../../sanity/lib/image'

export default function SectionCardImage({
  image,
  alt,
  wrapperClassName,
  imageClassName = 'cardImage',
  width = 960,
  height,
  fit,
}) {
  if (!image?.asset) {
    return null
  }

  let imageBuilder = urlFor(image).width(width)

  if (height) {
    imageBuilder = imageBuilder.height(height)
  }

  if (fit) {
    imageBuilder = imageBuilder.fit(fit)
  }

  return (
    <div className={wrapperClassName}>
      <img
        src={imageBuilder.url()}
        alt={image.alt || alt || ''}
        className={imageClassName}
        loading="lazy"
      />
    </div>
  )
}
