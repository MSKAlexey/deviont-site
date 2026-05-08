import {defineArrayMember, defineField, defineType} from 'sanity'
import {defineImageField} from './lib/defineImageField.js'

function truncateText(value, maxLength = 90) {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length <= maxLength) {
    return trimmedValue
  }

  return `${trimmedValue.slice(0, maxLength).trim()}...`
}

function createServiceBodyField() {
  return defineField({
    name: 'body',
    title: 'Полное описание',
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [
          {title: 'Обычный', value: 'normal'},
          {title: 'Заголовок 2', value: 'h2'},
          {title: 'Заголовок 3', value: 'h3'},
          {title: 'Цитата', value: 'blockquote'},
        ],
        lists: [
          {title: 'Маркированный список', value: 'bullet'},
          {title: 'Нумерованный список', value: 'number'},
        ],
        marks: {
          decorators: [
            {title: 'Жирный', value: 'strong'},
            {title: 'Курсив', value: 'em'},
            {title: 'Подчеркнутый', value: 'underline'},
          ],
          annotations: [
            {
              name: 'link',
              title: 'Ссылка',
              type: 'object',
              fields: [
                defineField({
                  name: 'href',
                  title: 'URL',
                  type: 'url',
                  validation: (Rule) =>
                    Rule.uri({
                      allowRelative: true,
                      scheme: ['http', 'https', 'mailto', 'tel'],
                    }),
                }),
              ],
            },
          ],
        },
      }),
    ],
  })
}

function createStringListField(name, title, description) {
  return defineField({
    name,
    title,
    ...(description ? {description} : {}),
    type: 'array',
    of: [defineArrayMember({type: 'string'})],
    options: {
      sortable: true,
    },
  })
}

export const service = defineType({
  name: 'service',
  title: 'Услуги 1С',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description: 'Используется для адреса страницы услуги.',
    }),
    defineField({
      name: 'excerpt',
      title: 'Краткое описание',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'text',
      title: 'Полное описание (legacy)',
      type: 'text',
      rows: 4,
      hidden: true,
    }),
    createServiceBodyField(),
    defineField({
      name: 'priceText',
      title: 'Стоимость / условия',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'durationText',
      title: 'Срок / условия по срокам',
      type: 'text',
      rows: 2,
    }),
    createStringListField('includedItems', 'Что входит в услугу'),
    createStringListField(
      'examples',
      'Примеры доработок',
      'Список примеров работ, которые будут показаны на странице услуги.'
    ),
    createStringListField(
      'configurations',
      'С какими конфигурациями работаем',
      'Список конфигураций 1С, которые будут показаны на странице услуги.'
    ),
    defineField({
      name: 'configurationsIntro',
      title: 'Описание блока конфигураций',
      description: 'Текст под заголовком “С какими конфигурациями работаем”.',
      type: 'text',
      rows: 3,
    }),
    createStringListField(
      'workflowSteps',
      'Как проходит работа',
      'Список этапов работы, которые будут показаны на странице услуги.'
    ),
    createStringListField('taskItems', 'Какие задачи решаем'),
    defineImageField(),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'isVisible',
      title: 'Показывать на сайте',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      excerpt: 'excerpt',
      legacyText: 'text',
      isVisible: 'isVisible',
      media: 'image',
    },
    prepare({title, slug, excerpt, legacyText, isVisible, media}) {
      const previewText = excerpt || legacyText
      const subtitleParts = [
        slug ? `/${slug}` : 'без slug',
        truncateText(previewText),
        isVisible === false ? 'скрыта' : null,
      ].filter(Boolean)

      return {
        title: title || 'Услуга без названия',
        subtitle: subtitleParts.join(' • '),
        media,
      }
    },
  },
})
