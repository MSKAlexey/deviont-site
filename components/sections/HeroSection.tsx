import {Fragment} from 'react'

import HeroPreButton from './HeroPreButton'
import HeroRichText, {
  getHeroPlainText,
  getHeroRichTextPlainText,
  hasHeroRichTextContent,
  renderHeroMultilineText,
} from './HeroRichText'
import SectionCardImage from './SectionCardImage'
import {resolveHeroTypographyStyle} from './heroTypography'

const fallbackHeroTitle = 'Внедряем и дорабатываем 1С под ваши процессы'
const fallbackHeroText =
  'Контроль продаж и закупок, остатков товаров на складах и взаиморасчётов с клиентами и поставщиками'
const fallbackPrimaryButtonText = 'Обсудить проект'

function renderHeroTextLine(line, keyPrefix) {
  const emphasisPattern = /25\s*000\s*₽\s*\/\s*мес\.?/i
  const match = line.match(emphasisPattern)

  if (!match || typeof match.index !== 'number') {
    return line
  }

  const start = match.index
  const end = start + match[0].length

  return (
    <Fragment key={`${keyPrefix}-line`}>
      {line.slice(0, start)}
      <span className="heroTextEmphasis">{line.slice(start, end)}</span>
      {line.slice(end)}
    </Fragment>
  )
}

function renderHeroSubtitle(text) {
  const normalizedText = typeof text === 'string' ? text.replace(/<br\s*\/?>/gi, '\n') : ''
  const lines = normalizedText.split(/\r\n|\r|\n/)

  return lines.map((line, index) => (
    <Fragment key={`hero-subtitle-line-${index}`}>
      {renderHeroTextLine(line, `hero-subtitle-${index}`)}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ))
}

function getHeroTitlePlainText(title, formattedTitle) {
  return getHeroRichTextPlainText(formattedTitle) || getHeroPlainText(title)
}

export default function HeroSection({settings, block, sectionId = 'hero'}) {
  const heroTitleContent = block?.titleContent || null
  const heroSubtitleContent = block?.subtitleContent || null
  const heroPreButtonContent = block?.preButtonContent || null
  const heroPrimaryButtonContent = block?.primaryButtonContent || null
  const heroTitle = block?.title || fallbackHeroTitle
  const heroTitleFormatted = heroTitleContent?.content || block?.titleFormatted
  const heroTitlePlainText = getHeroTitlePlainText(heroTitle, heroTitleFormatted)
  const heroText = block?.subtitle || settings?.heroText || fallbackHeroText
  const heroTextFormatted = heroSubtitleContent?.content || block?.subtitleFormatted
  const heroButtonPrimary = block?.primaryButtonText || fallbackPrimaryButtonText
  const heroButtonPrimaryFormatted = heroPrimaryButtonContent?.content || block?.primaryButtonTextFormatted
  const heroPreButtonText = block?.preButtonText || ''
  const heroPreButtonTextFormatted = heroPreButtonContent?.content || block?.preButtonTextFormatted
  const heroPreButtonIconPreset = block?.preButtonIconPreset || 'none'
  const heroPreButtonCustomIcon = block?.preButtonCustomIcon || null
  const heroImage = block?.image
  const titleStyle = resolveHeroTypographyStyle(heroTitleContent || block?.titleTypography)
  const subtitleStyle = resolveHeroTypographyStyle(heroSubtitleContent || block?.subtitleTypography)
  const buttonStyle = resolveHeroTypographyStyle(
    heroPrimaryButtonContent || block?.primaryButtonTypography
  )
  const hasFormattedTitle = hasHeroRichTextContent(heroTitleFormatted)
  const hasFormattedSubtitle = hasHeroRichTextContent(heroTextFormatted)
  const hasFormattedButtonText = hasHeroRichTextContent(heroButtonPrimaryFormatted)

  return (
    <section className="hero" id={sectionId}>
      <div className="container">
        <div className="heroShell">
          <div className="heroContent">
            {hasFormattedTitle ? (
              <HeroRichText value={heroTitleFormatted} as="h1" style={titleStyle} />
            ) : (
              <h1 style={titleStyle}>{renderHeroMultilineText(heroTitle, 'hero-title')}</h1>
            )}

            {hasFormattedSubtitle ? (
              <HeroRichText
                value={heroTextFormatted}
                as="p"
                className="heroText"
                style={subtitleStyle}
              />
            ) : (
              <p className="heroText" style={subtitleStyle}>
                {renderHeroSubtitle(heroText)}
              </p>
            )}

            <HeroPreButton
              text={heroPreButtonText}
              richText={heroPreButtonTextFormatted}
              iconPreset={heroPreButtonIconPreset}
              customIcon={heroPreButtonCustomIcon}
              typography={heroPreButtonContent || block?.preButtonTypography}
            />

            <div className="heroActions">
              <a className="btnPrimary" href="#contact-form">
                {hasFormattedButtonText ? (
                  <HeroRichText
                    value={heroButtonPrimaryFormatted}
                    as="span"
                    className="heroButtonText"
                    style={buttonStyle}
                  />
                ) : (
                  <span className="heroButtonText" style={buttonStyle}>
                    {renderHeroMultilineText(heroButtonPrimary, 'hero-button')}
                  </span>
                )}
              </a>
            </div>
          </div>

          <SectionCardImage
            image={heroImage}
            alt={heroTitlePlainText}
            wrapperClassName="heroMedia"
            imageClassName="heroImage"
            width={1200}
          />
        </div>
      </div>
    </section>
  )
}
