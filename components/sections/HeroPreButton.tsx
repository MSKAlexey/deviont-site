/* eslint-disable @next/next/no-img-element */

import {urlFor} from '../../sanity/lib/image'
import HeroRichText, {hasHeroRichTextContent, hasHeroPlainTextContent, renderHeroMultilineText} from './HeroRichText'
import {resolveHeroTypographyStyle} from './heroTypography'

const presetIcons = {
  spark: function SparkIcon() {
    return (
      <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 1.75L10.65 6.35L15.25 8L10.65 9.65L9 14.25L7.35 9.65L2.75 8L7.35 6.35L9 1.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  shield: function ShieldIcon() {
    return (
      <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 2.25L13.5 4V7.75C13.5 10.5 11.9 13.03 9.4 14.28L9 14.5L8.6 14.28C6.1 13.03 4.5 10.5 4.5 7.75V4L9 2.25Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  clock: function ClockIcon() {
    return (
      <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="5.75" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5.75V9L11.25 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  check: function CheckIcon() {
    return (
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="8" fill="#39B54A" />
        <path
          d="M4.8 8.25L6.9 10.35L11.2 6.05"
          stroke="#FFFFFF"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  support: function SupportIcon() {
    return (
      <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4.25 8.25C4.25 5.63 6.38 3.5 9 3.5C11.62 3.5 13.75 5.63 13.75 8.25V10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect x="3" y="8" width="2.5" height="4.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12.5" y="8" width="2.5" height="4.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12.5 13H10.5C10.5 13.83 9.83 14.5 9 14.5H8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
}

function PresetIcon({name}) {
  const Icon = name ? presetIcons[name] : null

  return Icon ? <Icon /> : null
}

export default function HeroPreButton({text, richText, iconPreset, customIcon, typography}) {
  const hasRichText = hasHeroRichTextContent(richText)
  const hasText = hasRichText || hasHeroPlainTextContent(text)
  const hasCustomIcon = Boolean(customIcon?.asset)
  const hasPresetIcon = Boolean(iconPreset && iconPreset !== 'none' && presetIcons[iconPreset])
  const textStyle = resolveHeroTypographyStyle(typography)

  if (!hasText) {
    return null
  }

  return (
    <div className="heroPreButton">
      {hasCustomIcon ? (
        <span className="heroPreButtonIcon" aria-hidden="true">
          <img
            src={urlFor(customIcon).url()}
            alt=""
            className="heroPreButtonIconImage"
          />
        </span>
      ) : hasPresetIcon ? (
        <span className="heroPreButtonIcon" aria-hidden="true">
          <PresetIcon name={iconPreset} />
        </span>
      ) : null}

      {hasRichText ? (
        <HeroRichText
          value={richText}
          as="span"
          className="heroPreButtonText"
          style={textStyle}
        />
      ) : (
        <span className="heroPreButtonText" style={textStyle}>
          {renderHeroMultilineText(text, 'hero-pre-button')}
        </span>
      )}
    </div>
  )
}
