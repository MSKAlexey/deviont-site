const cardsBlockItemsProjection = `
  items[]{
    ...,
    "service": service->{
      _id,
      title,
      "slug": slug.current,
      isVisible
    },
    image{
      ...,
      alt,
      asset
    }
  }
`

const certificatesBlockItemsProjection = `
  items[]{
    ...,
    image{
      ...,
      alt,
      asset
    },
    file{
      asset->{
        url,
        originalFilename
      }
    }
  }
`

const listBlockItemsProjection = `
  items[]{
    "title": select(_type == "listBlockListItem" => title, null),
    "description": select(_type == "listBlockListItem" => description, null),
    "text": select(_type == "listBlockListItem" => text, @),
    "showImage": select(_type == "listBlockListItem" => coalesce(showImage, true), true),
    "imageSize": select(_type == "listBlockListItem" => coalesce(imageSize, "medium"), "medium"),
    "image": select(
      _type == "listBlockListItem" => image{
        ...,
        alt,
        asset
      },
      null
    )
  }
`

const pageBuilderSectionProjection = `
  ...,
  "title": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->title,
    _type in ["textBlock", "textBlockItem"] && defined(contentDocument->_id) => contentDocument->title,
    _type in ["cardsBlock", "cardsBlockItem"] && defined(contentDocument->_id) => contentDocument->title,
    _type in ["certificatesBlock", "certificatesBlockItem"] && defined(contentDocument->_id) => contentDocument->title,
    _type in ["listBlock", "listBlockItem"] && defined(contentDocument->_id) => contentDocument->title,
    _type in ["ctaBlock", "ctaBlockItem"] && defined(contentDocument->_id) => contentDocument->title,
    _type in ["contactBlock", "contactBlockItem"] && defined(contentDocument->_id) => contentDocument->title,
    title
  ),
  "titleContent": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->titleContent,
    _type in ["cardsBlock", "cardsBlockItem"] && defined(contentDocument->_id) => contentDocument->titleContent,
    titleContent
  ),
  "titleFormatted": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->titleFormatted,
    titleFormatted
  ),
  "titleTypography": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->titleTypography,
    _type in ["cardsBlock", "cardsBlockItem"] && defined(contentDocument->_id) => contentDocument->titleTypography,
    titleTypography
  ),
  "subtitle": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->subtitle,
    subtitle
  ),
  "subtitleContent": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->subtitleContent,
    subtitleContent
  ),
  "subtitleFormatted": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->subtitleFormatted,
    subtitleFormatted
  ),
  "subtitleTypography": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->subtitleTypography,
    subtitleTypography
  ),
  "cardTitleTypography": select(
    _type in ["cardsBlock", "cardsBlockItem"] && defined(contentDocument->_id) => contentDocument->cardTitleTypography,
    cardTitleTypography
  ),
  "cardTextTypography": select(
    _type in ["cardsBlock", "cardsBlockItem"] && defined(contentDocument->_id) => contentDocument->cardTextTypography,
    cardTextTypography
  ),
  "detailTypography": select(
    _type in ["cardsBlock", "cardsBlockItem"] && defined(contentDocument->_id) => contentDocument->detailTypography,
    detailTypography
  ),
  "cardTypography": select(
    _type in ["cardsBlock", "cardsBlockItem"] && defined(contentDocument->_id) => contentDocument->cardTypography,
    cardTypography
  ),
  "preButtonText": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->preButtonText,
    preButtonText
  ),
  "preButtonContent": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->preButtonContent,
    preButtonContent
  ),
  "preButtonTextFormatted": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->preButtonTextFormatted,
    preButtonTextFormatted
  ),
  "preButtonTypography": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->preButtonTypography,
    preButtonTypography
  ),
  "preButtonIconPreset": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->preButtonIconPreset,
    preButtonIconPreset
  ),
  "preButtonCustomIcon": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->preButtonCustomIcon,
    preButtonCustomIcon
  ),
  "image": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->image,
    image
  ),
  "primaryButtonText": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->primaryButtonText,
    primaryButtonText
  ),
  "primaryButtonContent": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->primaryButtonContent,
    primaryButtonContent
  ),
  "primaryButtonTextFormatted": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->primaryButtonTextFormatted,
    primaryButtonTextFormatted
  ),
  "primaryButtonTypography": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->primaryButtonTypography,
    primaryButtonTypography
  ),
  "secondaryButtonText": select(
    _type in ["heroBlock", "heroBlockItem"] && defined(contentDocument->_id) => contentDocument->secondaryButtonText,
    secondaryButtonText
  ),
  "text": select(
    _type in ["textBlock", "textBlockItem"] && defined(contentDocument->_id) => contentDocument->text,
    _type in ["ctaBlock", "ctaBlockItem"] && defined(contentDocument->_id) => contentDocument->text,
    _type in ["contactBlock", "contactBlockItem"] && defined(contentDocument->_id) => contentDocument->text,
    text
  ),
  "textContent": select(
    _type in ["cardsBlock", "cardsBlockItem"] && defined(contentDocument->_id) => contentDocument->textContent,
    textContent
  ),
  "buttonText": select(
    _type in ["ctaBlock", "ctaBlockItem"] && defined(contentDocument->_id) => contentDocument->buttonText,
    _type in ["contactBlock", "contactBlockItem"] && defined(contentDocument->_id) => contentDocument->buttonText,
    buttonText
  ),
  "items": select(
    _type in ["cardsBlock", "cardsBlockItem"] && defined(contentDocument->_id) => contentDocument->${cardsBlockItemsProjection.trim()},
    _type in ["cardsBlock", "cardsBlockItem"] => ${cardsBlockItemsProjection.trim()},
    _type in ["certificatesBlock", "certificatesBlockItem"] && defined(contentDocument->_id) => contentDocument->${certificatesBlockItemsProjection.trim()},
    _type in ["certificatesBlock", "certificatesBlockItem"] => ${certificatesBlockItemsProjection.trim()},
    _type in ["listBlock", "listBlockItem"] && defined(contentDocument->_id) => contentDocument->${listBlockItemsProjection.trim()},
    _type in ["listBlock", "listBlockItem"] => ${listBlockItemsProjection.trim()},
    items
  ),
  "contentBlock": select(
    _type == "reference" && @->._type == "heroBlockDocument" => @->{
      _id,
      "_type": "heroBlock",
      title,
      titleContent,
      titleFormatted,
      titleTypography,
      subtitle,
      subtitleContent,
      subtitleFormatted,
      subtitleTypography,
      preButtonText,
      preButtonContent,
      preButtonTextFormatted,
      preButtonTypography,
      preButtonIconPreset,
      preButtonCustomIcon,
      image,
      primaryButtonText,
      primaryButtonContent,
      primaryButtonTextFormatted,
      primaryButtonTypography,
      secondaryButtonText
    },
    _type == "reference" && @->._type == "textBlockDocument" => @->{
      _id,
      "_type": "textBlock",
      title,
      text
    },
    _type == "reference" && @->._type == "cardsBlockDocument" => @->{
      _id,
      "_type": "cardsBlock",
      title,
      titleContent,
      titleTypography,
      cardTypography,
      cardTitleTypography,
      cardTextTypography,
      detailTypography,
      ${cardsBlockItemsProjection}
    },
    _type == "reference" && @->._type == "certificatesBlockDocument" => @->{
      _id,
      "_type": "certificatesBlock",
      title,
      ${certificatesBlockItemsProjection}
    },
    _type == "reference" && @->._type == "listBlockDocument" => @->{
      _id,
      "_type": "listBlock",
      title,
      ${listBlockItemsProjection}
    },
    _type == "reference" && @->._type == "ctaBlockDocument" => @->{
      _id,
      "_type": "ctaBlock",
      title,
      text,
      buttonText
    },
    _type == "reference" && @->._type == "contactBlockDocument" => @->{
      _id,
      "_type": "contactBlock",
      title,
      text,
      buttonText
    }
  )
`

export const siteSettingsQuery = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  companyName,
  subtitle,
  phone,
  email,
  city,
  domain,
  heroText,
  heroButtonSecondary,
  steps,
  supportText,
  supportPrice,
  advantages,
  contactText,
  contactButtonText,
  logo,
  "sections": coalesce(sections, [])[]{
    ${pageBuilderSectionProjection}
  }
}`

const articleListProjection = `
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  configVersion,
  image{
    ...,
    alt,
    asset
  }
`

const articlePageProjection = `
  ${articleListProjection},
  body
`

const serviceListProjection = `
  _id,
  _createdAt,
  isVisible,
  title,
  text,
  excerpt,
  "slug": slug.current,
  image{
    ...,
    alt,
    asset
  },
  priceText,
  durationText,
  includedItems,
  taskItems,
  seoTitle,
  seoDescription
`

const servicePageProjection = `
  ${serviceListProjection},
  body,
  whenNeededItems,
  examples,
  configurations,
  workflowSteps,
  faqItems[]{
    question,
    answer
  }
`

export const articlesListQuery = `*[
  _type == "article" &&
  isVisible != false &&
  defined(slug.current)
] | order(coalesce(publishedAt, _createdAt) desc, _createdAt desc){
  ${articleListProjection}
}`

export const articleBySlugQuery = `*[
  _type == "article" &&
  isVisible != false &&
  slug.current == $slug
][0]{
  ${articlePageProjection}
}`

export const servicesListQuery = `*[
  _type == "service" &&
  isVisible != false
]{
  ${serviceListProjection}
}`

export const servicesPageQuery = `*[
  _type == "service" &&
  isVisible != false
]{
  ${servicePageProjection}
}`
