import {useEffect, useState} from 'react'
import {defineArrayMember, defineField, defineType, useClient} from 'sanity'
import HeroFieldWithoutTitle from '../components/HeroFieldWithoutTitle.js'
import HeroTextConfigInput from '../components/HeroTextConfigInput.js'
import {defineImageField} from './lib/defineImageField.js'

const API_VERSION = '2026-03-27'
const cardsBlockDetailTypeOptions = [
  {title: 'Цена', value: 'price'},
  {title: 'Срок', value: 'duration'},
  {title: 'Пример', value: 'example'},
]
const cardsBlockDetailTypeLabels = Object.fromEntries(
  cardsBlockDetailTypeOptions.map((item) => [item.value, item.title])
)
const CARDS_BLOCK_DOCUMENT_PREVIEW_QUERY = `
  coalesce(
    *[_id == $draftId][0]{
      "itemsCount": count(items)
    },
    *[_id == $publishedId][0]{
      "itemsCount": count(items)
    }
  )
`

function truncateText(value, maxLength = 90) {
  if (!value) {
    return ''
  }

  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trim()}...`
}

function resolvePreviewTitle(adminTitle, title, fallbackTitle) {
  return adminTitle || title || fallbackTitle
}

function getItemsCount(items) {
  if (typeof items === 'number') {
    return items
  }

  if (Array.isArray(items)) {
    return items.length
  }

  if (items && typeof items.length === 'number') {
    return items.length
  }

  return 0
}

function hasPortableTextContent(value) {
  return Array.isArray(value)
    ? value.some(
        (block) =>
          block?._type === 'block' &&
          Array.isArray(block.children) &&
          block.children.some(
            (child) => child?._type === 'span' && typeof child.text === 'string' && child.text.trim().length > 0
          )
      )
    : false
}

function extractPortableTextPlainText(value) {
  if (!hasPortableTextContent(value)) {
    return ''
  }

  return value
    .map((block) => {
      if (block?._type !== 'block' || !Array.isArray(block.children)) {
        return ''
      }

      return block.children
        .map((child) => {
          if (child?._type !== 'span' || typeof child.text !== 'string') {
            return ''
          }

          return child.text.replace(/<br\s*\/?>/gi, ' ').replace(/\r\n|\r|\n/g, ' ')
        })
        .join('')
    })
    .filter(Boolean)
    .join(' ')
    .trim()
}

function hasHeroFieldContent(parent, fieldName, formattedFieldName) {
  return Boolean(
    (typeof parent?.[fieldName] === 'string' && parent[fieldName].trim()) ||
      hasPortableTextContent(parent?.[formattedFieldName])
  )
}

function hasHeroTextConfigContent(value) {
  return hasPortableTextContent(value?.content)
}

function hasLegacyCardsContent(parent) {
  return getItemsCount(parent?.items) > 0
}

function hasLegacyHeroContent(parent) {
  return Boolean(
    parent?.titleContent ||
      parent?.subtitleContent ||
      parent?.preButtonContent ||
      parent?.primaryButtonContent ||
      hasHeroTextConfigContent(parent?.titleContent) ||
      hasHeroFieldContent(parent, 'title', 'titleFormatted') ||
      hasHeroTextConfigContent(parent?.subtitleContent) ||
      hasHeroFieldContent(parent, 'subtitle', 'subtitleFormatted') ||
      hasHeroTextConfigContent(parent?.preButtonContent) ||
      hasHeroFieldContent(parent, 'preButtonText', 'preButtonTextFormatted') ||
      parent?.preButtonIconPreset ||
      parent?.preButtonCustomIcon ||
      hasHeroTextConfigContent(parent?.primaryButtonContent) ||
      hasHeroFieldContent(parent, 'primaryButtonText', 'primaryButtonTextFormatted') ||
      parent?.titleTypography ||
      parent?.subtitleTypography ||
      parent?.preButtonTypography ||
      parent?.primaryButtonTypography
  )
}

function hasLegacyTextContent(parent) {
  return Boolean(parent?.title || parent?.text)
}

function hasLegacyListContent(parent) {
  return Boolean(parent?.title) || getItemsCount(parent?.items) > 0
}

function hasLegacyCtaContent(parent) {
  return Boolean(parent?.title || parent?.text || parent?.buttonText)
}

function shouldHideLocalFields(parent, hasLegacyContent) {
  return Boolean(parent?.contentDocument?._ref) || !hasLegacyContent(parent)
}

function validateLinkedOrLegacyField(value, context, hasLegacyContent, message) {
  if (context.parent?.contentDocument?._ref || !hasLegacyContent(context.parent)) {
    return true
  }

  return value ? true : message
}

function createContentDocumentField(documentType, documentLabel, hasLegacyContent) {
  return defineField({
    name: 'contentDocument',
    title: 'Контент',
    type: 'reference',
    to: [{type: documentType}],
    description: `Выберите существующий блок из "Контента" или создайте новый. Тогда главная будет брать данные из документа «${documentLabel}».`,
    validation: (Rule) =>
      Rule.custom((value, context) => {
        if (value?._ref || hasLegacyContent(context.parent)) {
          return true
        }

        return `Выберите или создайте блок «${documentLabel}» в "Контенте"`
      }),
  })
}

const heroPreButtonIconOptions = [
  {title: 'Без иконки', value: 'none'},
  {title: 'Искра', value: 'spark'},
  {title: 'Щит', value: 'shield'},
  {title: 'Часы', value: 'clock'},
  {title: 'Галочка', value: 'check'},
  {title: 'Поддержка', value: 'support'},
]

const heroTypographyFontFamilyOptions = [
  {title: 'По умолчанию', value: 'default'},
  {title: 'Segoe UI', value: 'segoe-ui'},
  {title: 'Noto Sans', value: 'noto-sans'},
  {title: 'Georgia', value: 'georgia'},
  {title: 'Trebuchet MS', value: 'trebuchet-ms'},
  {title: 'Courier New', value: 'courier-new'},
]

const heroTypographyFontWeightOptions = [
  {title: 'По умолчанию', value: 'default'},
  {title: '300', value: '300'},
  {title: '400', value: '400'},
  {title: '500', value: '500'},
  {title: '600', value: '600'},
  {title: '700', value: '700'},
  {title: '800', value: '800'},
  {title: '900', value: '900'},
]

function createHeroPortableTextField(name, title, hidden, rows = 3, description, fieldComponent) {
  return defineField({
    name,
    title,
    type: 'array',
    hidden,
    description,
    components: fieldComponent
      ? {
          field: fieldComponent,
        }
      : undefined,
    options: {
      rows,
    },
    of: [
      defineArrayMember({
        type: 'block',
        styles: [{title: 'Обычный', value: 'normal'}],
        lists: [],
        marks: {
          decorators: [
            {title: 'Жирный', value: 'strong'},
            {title: 'Подчёркнутый', value: 'underline'},
          ],
          annotations: [],
        },
      }),
    ],
  })
}

function createHeroTypographySettingFields() {
  return [
    defineField({
      name: 'fontFamily',
      title: 'Шрифт',
      type: 'string',
      initialValue: 'default',
      options: {
        list: heroTypographyFontFamilyOptions,
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'fontWeight',
      title: 'Вес',
      type: 'string',
      initialValue: 'default',
      options: {
        list: heroTypographyFontWeightOptions,
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'fontSize',
      title: 'Размер шрифта, px',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(160),
    }),
  ]
}

function createHeroLegacyTypographyField(name, title, hidden) {
  return defineField({
    name,
    title,
    type: 'object',
    hidden,
    fields: createHeroTypographySettingFields(),
  })
}

function validateHeroField(value, formattedValue, message) {
  return hasHeroFieldContent(
    {
      heroFieldValue: value,
      heroFormattedValue: formattedValue,
    },
    'heroFieldValue',
    'heroFormattedValue'
  )
    ? true
    : message
}

function validateHeroTextConfig(value, legacyText, legacyFormatted, message) {
  return hasHeroTextConfigContent(value) || validateHeroField(legacyText, legacyFormatted, message) === true
    ? true
    : message
}

function validateLinkedHeroField(value, context, formattedFieldName, message) {
  if (context.parent?.contentDocument?._ref || !hasLegacyHeroContent(context.parent)) {
    return true
  }

  return validateHeroField(value, context.parent?.[formattedFieldName], message)
}

function validateLinkedHeroTextConfig(
  value,
  context,
  legacyTextFieldName,
  legacyFormattedFieldName,
  message
) {
  if (context.parent?.contentDocument?._ref || !hasLegacyHeroContent(context.parent)) {
    return true
  }

  return validateHeroTextConfig(
    value,
    context.parent?.[legacyTextFieldName],
    context.parent?.[legacyFormattedFieldName],
    message
  )
}

function resolveHeroPreviewText(contentValue, text, formattedText) {
  return extractPortableTextPlainText(contentValue?.content) || text || extractPortableTextPlainText(formattedText)
}

function createHeroTextConfigField({
  name,
  title,
  rows = 3,
  hidden,
  legacyTextFieldName,
  legacyFormattedFieldName,
  validationMessage,
  validationBuilder,
}) {
  return defineField({
    name,
    title,
    type: 'object',
    hidden,
    description: 'Поддерживает жирный, подчёркнутый текст и переносы строк по Enter.',
    components: {
      input: HeroTextConfigInput,
    },
    fields: [
      createHeroPortableTextField('content', '', false, rows, undefined, HeroFieldWithoutTitle),
      ...createHeroTypographySettingFields(),
    ],
    validation: validationBuilder
      ? validationBuilder
      : (Rule) =>
          Rule.custom((value, context) =>
            validateHeroTextConfig(
              value,
              context.parent?.[legacyTextFieldName],
              context.parent?.[legacyFormattedFieldName],
              validationMessage
            )
          ),
  })
}

function createHeroPreButtonFields(isLinkedMode = false) {
  const hidden = isLinkedMode
    ? ({parent}) => shouldHideLocalFields(parent, hasLegacyHeroContent)
    : undefined

  return [
    createHeroTextConfigField({
      name: 'preButtonContent',
      title: 'Текст над кнопкой',
      rows: 2,
      hidden,
      legacyTextFieldName: 'preButtonText',
      legacyFormattedFieldName: 'preButtonTextFormatted',
      validationMessage: 'Заполните текст над кнопкой',
      validationBuilder: isLinkedMode
        ? (Rule) =>
            Rule.custom((value, context) =>
              validateLinkedHeroTextConfig(
                value,
                context,
                'preButtonText',
                'preButtonTextFormatted',
                'Заполните текст над кнопкой'
              )
            )
        : undefined,
    }),
    defineField({
      name: 'preButtonText',
      title: 'Текст над кнопкой (legacy)',
      type: 'string',
      hidden: true,
    }),
    createHeroPortableTextField(
      'preButtonTextFormatted',
      'Форматирование текста над кнопкой (legacy)',
      true,
      2
    ),
    createHeroLegacyTypographyField('preButtonTypography', 'Шрифт текста над кнопкой (legacy)', true),
    defineField({
      name: 'preButtonIconPreset',
      title: 'Иконка из набора',
      type: 'string',
      initialValue: 'none',
      hidden,
      options: {
        list: heroPreButtonIconOptions,
        layout: 'radio',
      },
    }),
    defineField({
      name: 'preButtonCustomIcon',
      title: 'Своя SVG-иконка',
      type: 'image',
      hidden,
      description: 'SVG-иконка имеет приоритет над иконкой из набора.',
      options: {
        accept: 'image/svg+xml,.svg',
      },
      validation: (Rule) =>
        Rule.custom((value) => {
          const assetRef = value?.asset?._ref

          if (!assetRef) {
            return true
          }

          return assetRef.endsWith('-svg') ? true : 'Загрузите SVG-иконку'
        }),
    }),
  ]
}




function createHeroFields() {
  return [
    createHeroTextConfigField({
      name: 'titleContent',
      title: 'Заголовок',
      rows: 1,
      legacyTextFieldName: 'title',
      legacyFormattedFieldName: 'titleFormatted',
      validationMessage: 'Заполните заголовок',
    }),
    defineField({
      name: 'title',
      title: 'Заголовок (legacy)',
      type: 'text',
      rows: 1,
      hidden: true,
    }),
    createHeroPortableTextField('titleFormatted', 'Форматирование заголовка (legacy)', true),
    createHeroLegacyTypographyField('titleTypography', 'Шрифт заголовка (legacy)', true),
    createHeroTextConfigField({
      name: 'subtitleContent',
      title: 'Подзаголовок',
      rows: 3,
      legacyTextFieldName: 'subtitle',
      legacyFormattedFieldName: 'subtitleFormatted',
      validationMessage: 'Заполните подзаголовок',
    }),
    defineField({
      name: 'subtitle',
      title: 'Подзаголовок (legacy)',
      type: 'text',
      rows: 3,
      hidden: true,
    }),
    createHeroPortableTextField('subtitleFormatted', 'Форматирование подзаголовка (legacy)', true),
    createHeroLegacyTypographyField('subtitleTypography', 'Шрифт подзаголовка (legacy)', true),
    ...createHeroPreButtonFields(),
    defineField({
      name: 'image',
      title: 'Картинка',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'favicon',
      title: 'Фавикон',
      type: 'image',
      options: {hotspot: true},
    }),
    createHeroTextConfigField({
      name: 'primaryButtonContent',
      title: 'Кнопка',
      rows: 2,
      legacyTextFieldName: 'primaryButtonText',
      legacyFormattedFieldName: 'primaryButtonTextFormatted',
      validationMessage: 'Заполните кнопку',
    }),
    defineField({
      name: 'primaryButtonText',
      title: 'Кнопка (legacy)',
      type: 'string',
      hidden: true,
    }),
    createHeroPortableTextField('primaryButtonTextFormatted', 'Форматирование текста кнопки (legacy)', true, 2),
    createHeroLegacyTypographyField('primaryButtonTypography', 'Шрифт текста кнопки (legacy)', true),
  ]
}

function createTextFields() {
  return [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Текст',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
  ]
}

function createLinkedHeroFields() {
  return [
    createContentDocumentField('heroBlockDocument', 'Главный экран', hasLegacyHeroContent),
    createHeroTextConfigField({
      name: 'titleContent',
      title: 'Заголовок',
      rows: 1,
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyHeroContent),
      legacyTextFieldName: 'title',
      legacyFormattedFieldName: 'titleFormatted',
      validationMessage: 'Заполните заголовок',
      validationBuilder: (Rule) =>
        Rule.custom((value, context) =>
          validateLinkedHeroTextConfig(
            value,
            context,
            'title',
            'titleFormatted',
            'Заполните заголовок'
          )
        ),
    }),
    defineField({
      name: 'title',
      title: 'Заголовок (legacy)',
      type: 'text',
      rows: 3,
      hidden: true,
    }),
    createHeroPortableTextField('titleFormatted', 'Форматирование заголовка (legacy)', true),
    createHeroLegacyTypographyField('titleTypography', 'Шрифт заголовка (legacy)', true),
    createHeroTextConfigField({
      name: 'subtitleContent',
      title: 'Подзаголовок',
      rows: 3,
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyHeroContent),
      legacyTextFieldName: 'subtitle',
      legacyFormattedFieldName: 'subtitleFormatted',
      validationMessage: 'Заполните подзаголовок',
      validationBuilder: (Rule) =>
        Rule.custom((value, context) =>
          validateLinkedHeroTextConfig(
            value,
            context,
            'subtitle',
            'subtitleFormatted',
            'Заполните подзаголовок'
          )
        ),
    }),
    defineField({
      name: 'subtitle',
      title: 'Подзаголовок (legacy)',
      type: 'text',
      rows: 3,
      hidden: true,
    }),
    createHeroPortableTextField('subtitleFormatted', 'Форматирование подзаголовка (legacy)', true),
    createHeroLegacyTypographyField('subtitleTypography', 'Шрифт подзаголовка (legacy)', true),
    ...createHeroPreButtonFields(true),
    defineField({
      name: 'image',
      title: 'Картинка',
      type: 'image',
      options: {hotspot: true},
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyHeroContent),
    }),
    defineField({
      name: 'favicon',
      title: 'Фавикон',
      type: 'image',
      options: {hotspot: true},
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyHeroContent),
    }),
    createHeroTextConfigField({
      name: 'primaryButtonContent',
      title: 'Кнопка',
      rows: 2,
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyHeroContent),
      legacyTextFieldName: 'primaryButtonText',
      legacyFormattedFieldName: 'primaryButtonTextFormatted',
      validationMessage: 'Заполните кнопку',
      validationBuilder: (Rule) =>
        Rule.custom((value, context) =>
          validateLinkedHeroTextConfig(
            value,
            context,
            'primaryButtonText',
            'primaryButtonTextFormatted',
            'Заполните кнопку'
          )
        ),
    }),
    defineField({
      name: 'primaryButtonText',
      title: 'Кнопка (legacy)',
      type: 'string',
      hidden: true,
    }),
    createHeroPortableTextField('primaryButtonTextFormatted', 'Форматирование текста кнопки (legacy)', true, 2),
    createHeroLegacyTypographyField('primaryButtonTypography', 'Шрифт текста кнопки (legacy)', true),
  ]
}

function createLinkedTextFields() {
  return [
    createContentDocumentField('textBlockDocument', 'Текстовый блок', hasLegacyTextContent),
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyTextContent),
      validation: (Rule) =>
        Rule.custom((value, context) =>
          validateLinkedOrLegacyField(
            value,
            context,
            hasLegacyTextContent,
            'Заполните заголовок'
          )
        ),
    }),
    defineField({
      name: 'text',
      title: 'Текст',
      type: 'text',
      rows: 5,
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyTextContent),
      validation: (Rule) =>
        Rule.custom((value, context) =>
          validateLinkedOrLegacyField(value, context, hasLegacyTextContent, 'Заполните текст')
        ),
    }),
  ]
}

function createCardsBlockDetailArrayMember() {
  return defineArrayMember({
    name: 'cardsBlockDetail',
    title: 'Строка',
    type: 'object',
    fields: [
      defineField({
        name: 'type',
        title: 'Тип строки',
        type: 'string',
        initialValue: 'price',
        options: {
          list: cardsBlockDetailTypeOptions,
          layout: 'radio',
        },
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: 'text',
        title: 'Текст',
        type: 'string',
        validation: (Rule) => Rule.required(),
      }),
    ],
    preview: {
      select: {
        type: 'type',
        title: 'text',
      },
      prepare({type, title}) {
        return {
          title: title || 'Строка без текста',
          subtitle: cardsBlockDetailTypeLabels[type] || 'Тип не выбран',
        }
      },
    },
  })
}

function createCardsItemsField(isLinkedMode = false) {
  return defineField({
    name: 'items',
    title: 'Карточки',
    type: 'array',
    of: [defineArrayMember({type: 'cardsBlockItem'})],
    hidden: isLinkedMode
      ? ({parent}) =>
          Boolean(parent?.contentDocument?._ref) || !hasLegacyCardsContent(parent)
      : false,
    validation: (Rule) =>
      Rule.custom((value, context) => {
        if (
          isLinkedMode &&
          (context.parent?.contentDocument?._ref || !hasLegacyCardsContent(context.parent))
        ) {
          return true
        }

        return Array.isArray(value) && value.length > 0
          ? true
          : 'Добавьте хотя бы одну карточку'
      }),
  })
}

function createCardsFields() {
  return [
    createContentDocumentField(
      'cardsBlockDocument',
      'Блок карточек',
      hasLegacyCardsContent
    ),
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      hidden: ({parent}) =>
        Boolean(parent?.contentDocument?._ref) || !hasLegacyCardsContent(parent),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (
            context.parent?.contentDocument?._ref ||
            !hasLegacyCardsContent(context.parent)
          ) {
            return true
          }

          return value ? true : 'Заполните заголовок'
        }),
    }),
    createCardsItemsField(true),
  ]
}

function createCardsDocumentFields() {
  return [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    createCardsItemsField(false),
  ]
}

function createListItemArrayMember() {
  return defineArrayMember({
    name: 'listBlockListItem',
    title: 'Пункт списка',
    type: 'object',
    fields: [
      defineField({
        name: 'title',
        title: 'Заголовок',
        type: 'string',
      }),
      defineField({
        name: 'description',
        title: 'Описание',
        type: 'text',
        rows: 3,
      }),
      defineField({
        name: 'text',
        title: 'Старый текст',
        type: 'string',
        hidden: true,
      }),
      defineField({
        name: 'showImage',
        title: 'Показывать картинку',
        type: 'boolean',
        initialValue: true,
      }),
      defineField({
        name: 'imageSize',
        title: 'Размер картинки',
        type: 'string',
        initialValue: 'medium',
        options: {
          list: [
            {title: 'Маленькая (иконка)', value: 'small'},
            {title: 'Средняя', value: 'medium'},
            {title: 'Большая', value: 'large'},
          ],
          layout: 'radio',
        },
      }),
      defineImageField(),
    ],
    validation: (Rule) =>
      Rule.custom((value) => {
        if (!value || typeof value !== 'object') {
          return 'Заполните заголовок и описание'
        }

        const hasLegacyText = typeof value.text === 'string' && value.text.trim().length > 0
        const hasStructuredFields =
          typeof value.title === 'string' &&
          value.title.trim().length > 0 &&
          typeof value.description === 'string' &&
          value.description.trim().length > 0

        return hasLegacyText || hasStructuredFields
          ? true
          : 'Заполните заголовок и описание'
      }),
    preview: {
      select: {
        title: 'title',
        subtitle: 'description',
        legacyText: 'text',
        media: 'image',
      },
      prepare({title, subtitle, legacyText, media}) {
        return {
          title: title || legacyText || 'Пункт без текста',
          subtitle: subtitle || undefined,
          media,
        }
      },
    },
  })
}

function createListFields() {
  return [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Элементы списка',
      type: 'array',
      of: [createListItemArrayMember()],
      validation: (Rule) => Rule.required().min(1),
    }),
  ]
}

function createLinkedListFields() {
  return [
    createContentDocumentField('listBlockDocument', 'Блок списка', hasLegacyListContent),
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyListContent),
      validation: (Rule) =>
        Rule.custom((value, context) =>
          validateLinkedOrLegacyField(
            value,
            context,
            hasLegacyListContent,
            'Заполните заголовок'
          )
        ),
    }),
    defineField({
      name: 'items',
      title: 'Элементы списка',
      type: 'array',
      of: [createListItemArrayMember()],
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyListContent),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (
            context.parent?.contentDocument?._ref ||
            !hasLegacyListContent(context.parent)
          ) {
            return true
          }

          return Array.isArray(value) && value.length > 0
            ? true
            : 'Добавьте хотя бы один пункт'
        }),
    }),
  ]
}

function createCtaFields() {
  return [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Текст',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buttonText',
      title: 'Текст кнопки',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ]
}

function createLinkedCtaFields(documentType, documentLabel) {
  return [
    defineAdminTitleField(),
    createContentDocumentField(documentType, documentLabel, hasLegacyCtaContent),
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyCtaContent),
      validation: (Rule) =>
        Rule.custom((value, context) =>
          validateLinkedOrLegacyField(
            value,
            context,
            hasLegacyCtaContent,
            'Заполните заголовок'
          )
        ),
    }),
    defineField({
      name: 'text',
      title: 'Текст',
      type: 'text',
      rows: 4,
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyCtaContent),
      validation: (Rule) =>
        Rule.custom((value, context) =>
          validateLinkedOrLegacyField(value, context, hasLegacyCtaContent, 'Заполните текст')
        ),
    }),
    defineField({
      name: 'buttonText',
      title: 'Текст кнопки',
      type: 'string',
      hidden: ({parent}) => shouldHideLocalFields(parent, hasLegacyCtaContent),
      validation: (Rule) =>
        Rule.custom((value, context) =>
          validateLinkedOrLegacyField(
            value,
            context,
            hasLegacyCtaContent,
            'Заполните текст кнопки'
          )
        ),
    }),
  ]
}

function defineIsActiveField() {
  return defineField({
    name: 'isActive',
    title: 'Показывать',
    type: 'boolean',
    initialValue: true,
    hidden: true,
  })
}

function defineAdminTitleField() {
  return defineField({
    name: 'adminTitle',
    title: 'Название в админке',
    type: 'string',
    description: 'Только для списка блоков в Studio. На сайт не выводится.',
  })
}

function CardsBlockPreview(props) {
  const client = useClient({apiVersion: API_VERSION})
  const publishedId =
    typeof props._id !== 'string'
      ? null
      : props._id.startsWith('drafts.')
        ? props._id.slice('drafts.'.length)
        : props._id
  const [documentItemsCountState, setDocumentItemsCountState] = useState({
    documentId: null,
    itemsCount: null,
  })
  const hasItems =
    Array.isArray(props.items) || (props.items && typeof props.items.length === 'number')
  const itemsCount = getItemsCount(props.items)

  useEffect(() => {
    if (!publishedId) {
      return
    }

    let isCancelled = false

    client
      .fetch(CARDS_BLOCK_DOCUMENT_PREVIEW_QUERY, {
        draftId: `drafts.${publishedId}`,
        publishedId,
      })
      .then((result) => {
        if (!isCancelled) {
          setDocumentItemsCountState({
            documentId: publishedId,
            itemsCount: typeof result?.itemsCount === 'number' ? result.itemsCount : null,
          })
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setDocumentItemsCountState({
            documentId: publishedId,
            itemsCount: null,
          })
        }
      })

    return () => {
      isCancelled = true
    }
  }, [client, props._updatedAt, publishedId])

  const documentItemsCount =
    documentItemsCountState.documentId === publishedId
      ? documentItemsCountState.itemsCount
      : null
  const resolvedItemsCount =
    typeof documentItemsCount === 'number'
      ? documentItemsCount
      : hasItems
        ? itemsCount
        : null
  const subtitle =
    typeof resolvedItemsCount === 'number'
      ? `${resolvedItemsCount} карточек`
      : typeof props.subtitle === 'string' && props.subtitle.length > 0
        ? props.subtitle
        : `${itemsCount} карточек`

  return props.renderDefault({
    ...props,
    subtitle,
  })
}

const heroPreview = {
  select: {
    titleContent: 'titleContent',
    title: 'title',
    titleFormatted: 'titleFormatted',
    subtitleContent: 'subtitleContent',
    subtitle: 'subtitle',
    subtitleFormatted: 'subtitleFormatted',
  },
  prepare({titleContent, title, titleFormatted, subtitleContent, subtitle, subtitleFormatted}) {
    const resolvedTitle = resolveHeroPreviewText(titleContent, title, titleFormatted)
    const resolvedSubtitle = resolveHeroPreviewText(subtitleContent, subtitle, subtitleFormatted)

    return {
      title: resolvedTitle || 'Главный экран',
      subtitle: truncateText(resolvedSubtitle),
    }
  },
}

const textPreview = {
  select: {
    title: 'title',
    subtitle: 'text',
  },
  prepare({title, subtitle}) {
    return {
      title: title || 'Текстовый блок',
      subtitle: truncateText(subtitle),
    }
  },
}

const cardsPreview = {
  select: {
    title: 'title',
    items: 'items',
    media: 'items.0.image',
  },
  prepare({title, items, media}) {
    const resolvedItemsCount = getItemsCount(items)

    return {
      title: title || 'Блок карточек',
      subtitle: `${resolvedItemsCount} карточек`,
      media,
    }
  },
}

const listPreview = {
  select: {
    title: 'title',
    items: 'items',
  },
  prepare({title, items}) {
    const itemsCount = Array.isArray(items) ? items.filter(Boolean).length : 0

    return {
      title: title || 'Блок списка',
      subtitle: `${itemsCount} пунктов`,
    }
  },
}

const ctaPreview = {
  select: {
    title: 'title',
    subtitle: 'text',
  },
  prepare({title, subtitle}) {
    return {
      title: title || 'CTA блок',
      subtitle: truncateText(subtitle),
    }
  },
}

const contactPreview = {
  select: {
    title: 'title',
    subtitle: 'text',
  },
  prepare({title, subtitle}) {
    return {
      title: title || 'Контактный блок',
      subtitle: truncateText(subtitle),
    }
  },
}

const heroBlockEditorPreview = {
  select: {
    adminTitle: 'adminTitle',
    titleContent: 'titleContent',
    title: 'title',
    titleFormatted: 'titleFormatted',
    subtitleContent: 'subtitleContent',
    subtitle: 'subtitle',
    subtitleFormatted: 'subtitleFormatted',
    linkedTitleContent: 'contentDocument.titleContent',
    linkedTitle: 'contentDocument.title',
    linkedTitleFormatted: 'contentDocument.titleFormatted',
    linkedSubtitleContent: 'contentDocument.subtitleContent',
    linkedSubtitle: 'contentDocument.subtitle',
    linkedSubtitleFormatted: 'contentDocument.subtitleFormatted',
  },
  prepare({
    adminTitle,
    titleContent,
    title,
    titleFormatted,
    subtitleContent,
    subtitle,
    subtitleFormatted,
    linkedTitleContent,
    linkedTitle,
    linkedTitleFormatted,
    linkedSubtitleContent,
    linkedSubtitle,
    linkedSubtitleFormatted,
  }) {
    const resolvedTitle =
      resolveHeroPreviewText(titleContent, title, titleFormatted) ||
      resolveHeroPreviewText(linkedTitleContent, linkedTitle, linkedTitleFormatted)
    const resolvedSubtitle =
      resolveHeroPreviewText(subtitleContent, subtitle, subtitleFormatted) ||
      resolveHeroPreviewText(linkedSubtitleContent, linkedSubtitle, linkedSubtitleFormatted)

    return {
      title: resolvedTitle || adminTitle || 'Главный экран',
      subtitle: truncateText(resolvedSubtitle),
    }
  },
}

const textBlockEditorPreview = {
  select: {
    adminTitle: 'adminTitle',
    title: 'title',
    subtitle: 'text',
  },
  prepare({adminTitle, title, subtitle}) {
    return {
      title: resolvePreviewTitle(adminTitle, title, 'Текстовый блок'),
      subtitle: truncateText(subtitle),
    }
  },
}

const cardsBlockEditorPreview = {
  select: {
    adminTitle: 'adminTitle',
    title: 'title',
    itemsCount: 'items.length',
    media: 'items.0.image',
  },
  prepare({adminTitle, title, itemsCount, media}) {
    const resolvedItemsCount = getItemsCount(itemsCount)

    return {
      title: resolvePreviewTitle(adminTitle, title, 'Блок карточек'),
      subtitle: `${resolvedItemsCount} карточек`,
      media,
    }
  },
}

const listBlockEditorPreview = {
  select: {
    adminTitle: 'adminTitle',
    title: 'title',
    items: 'items',
  },
  prepare({adminTitle, title, items}) {
    const itemsCount = Array.isArray(items) ? items.filter(Boolean).length : 0

    return {
      title: resolvePreviewTitle(adminTitle, title, 'Блок списка'),
      subtitle: `${itemsCount} пунктов`,
    }
  },
}

const ctaBlockEditorPreview = {
  select: {
    adminTitle: 'adminTitle',
    title: 'title',
    subtitle: 'text',
  },
  prepare({adminTitle, title, subtitle}) {
    return {
      title: resolvePreviewTitle(adminTitle, title, 'CTA блок'),
      subtitle: truncateText(subtitle),
    }
  },
}

const contactBlockEditorPreview = {
  select: {
    adminTitle: 'adminTitle',
    title: 'title',
    subtitle: 'text',
  },
  prepare({adminTitle, title, subtitle}) {
    return {
      title: resolvePreviewTitle(adminTitle, title, 'Контактный блок'),
      subtitle: truncateText(subtitle),
    }
  },
}

export const cardsBlockItem = defineType({
  name: 'cardsBlockItem',
  title: 'Карточка',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Описание',
      type: 'text',
      rows: 4,
      description: 'Короткий текст под заголовком. Строки с ценой, сроком и примером добавляются ниже отдельным списком.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'details',
      title: 'Строки карточки',
      type: 'array',
      description: 'Для каждой строки выберите тип: иконка подставится автоматически на сайте.',
      of: [createCardsBlockDetailArrayMember()],
    }),
    defineImageField(),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'text',
      details: 'details',
      media: 'image',
    },
    prepare({title, subtitle, details, media}) {
      const detailsCount = Array.isArray(details)
        ? details.filter((detail) => typeof detail?.text === 'string' && detail.text.trim()).length
        : 0
      const subtitleParts = [
        truncateText(subtitle),
        detailsCount > 0 ? `${detailsCount} строк` : null,
      ].filter(Boolean)

      return {
        title: title || 'Карточка без названия',
        subtitle: subtitleParts.join(' / '),
        media,
      }
    },
  },
})

export const heroBlock = defineType({
  name: 'heroBlock',
  title: 'Главный экран',
  type: 'object',
  fields: [defineAdminTitleField(), ...createLinkedHeroFields(), defineIsActiveField()],
  preview: heroBlockEditorPreview,
})

export const textBlock = defineType({
  name: 'textBlock',
  title: 'Текстовый блок',
  type: 'object',
  fields: [defineAdminTitleField(), ...createLinkedTextFields(), defineIsActiveField()],
  preview: textBlockEditorPreview,
})

export const cardsBlock = defineType({
  name: 'cardsBlock',
  title: 'Блок карточек',
  type: 'object',
  fields: [defineAdminTitleField(), ...createCardsFields(), defineIsActiveField()],
  preview: cardsBlockEditorPreview,
  components: {
    preview: CardsBlockPreview,
  },
})

export const listBlock = defineType({
  name: 'listBlock',
  title: 'Блок списка',
  type: 'object',
  fields: [defineAdminTitleField(), ...createLinkedListFields(), defineIsActiveField()],
  preview: listBlockEditorPreview,
})

export const ctaBlock = defineType({
  name: 'ctaBlock',
  title: 'CTA блок',
  type: 'object',
  fields: [...createLinkedCtaFields('ctaBlockDocument', 'CTA блок'), defineIsActiveField()],
  preview: ctaBlockEditorPreview,
})

export const contactBlock = defineType({
  name: 'contactBlock',
  title: 'Контактный блок',
  type: 'object',
  fields: [
    ...createLinkedCtaFields('contactBlockDocument', 'Контактный блок'),
    defineIsActiveField(),
  ],
  preview: contactBlockEditorPreview,
})

export const heroBlockDocument = defineType({
  name: 'heroBlockDocument',
  title: 'Главный экран',
  type: 'document',
  fields: createHeroFields(),
  preview: heroPreview,
})

export const textBlockDocument = defineType({
  name: 'textBlockDocument',
  title: 'Текстовый блок',
  type: 'document',
  fields: createTextFields(),
  preview: textPreview,
})

export const cardsBlockDocument = defineType({
  name: 'cardsBlockDocument',
  title: 'Блок карточек',
  type: 'document',
  fields: createCardsDocumentFields(),
  preview: cardsPreview,
  components: {
    preview: CardsBlockPreview,
  },
})

export const listBlockDocument = defineType({
  name: 'listBlockDocument',
  title: 'Блок списка',
  type: 'document',
  fields: createListFields(),
  preview: listPreview,
})

export const ctaBlockDocument = defineType({
  name: 'ctaBlockDocument',
  title: 'CTA блок',
  type: 'document',
  fields: createCtaFields(),
  preview: ctaPreview,
})

export const contactBlockDocument = defineType({
  name: 'contactBlockDocument',
  title: 'Контактный блок',
  type: 'document',
  fields: createCtaFields(),
  preview: contactPreview,
})
