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

export const article = defineType({
  name: 'article',
  title: 'Статьи',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Краткое описание',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'materialType',
      title: 'Тип материала',
      type: 'string',
      options: {
        list: [
          {title: 'Статья', value: 'article'},
          {title: 'Инструкция', value: 'instruction'},
          {title: 'Разбор ошибки', value: 'error'},
        ],
        layout: 'radio',
      },
      initialValue: 'article',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Дата публикации',
      type: 'datetime',
    }),
    defineField({
      name: 'updatedAt',
      title: 'Дата обновления',
      type: 'datetime',
    }),
    defineField({
      name: 'oneCConfiguration',
      title: 'Конфигурация 1С',
      type: 'string',
      description: 'Например: 1С:УТ 11.5 или 1С:Бухгалтерия.',
    }),
    defineField({
      name: 'oneCVersion',
      title: 'Версия 1С',
      type: 'string',
      description: 'Например: 11.5.16 или 3.0.142.',
    }),
    defineField({
      name: 'relatedService',
      title: 'Связанная услуга',
      type: 'reference',
      to: [{type: 'service'}],
    }),
    defineField({
      name: 'coverImage',
      title: 'Обложка',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'coverImageAlt',
      title: 'Alt обложки',
      type: 'string',
    }),
    defineField({
      ...defineImageField(),
      title: 'Картинка (legacy)',
      description: 'Старое поле. Оставлено для сохранения ранее введенных данных.',
      hidden: true,
    }),
    defineField({
      name: 'configVersion',
      title: 'Версия конфигурации 1С (legacy)',
      type: 'string',
      description: 'Например: УНФ 3.0.13.292 или УТ 11.5',
      hidden: true,
    }),
    defineField({
      name: 'body',
      title: 'Текст статьи',
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
                title: 'Внешняя ссылка',
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
              {
                name: 'articleLink',
                title: 'Ссылка на статью',
                type: 'object',
                fields: [
                  defineField({
                    name: 'article',
                    title: 'Статья',
                    type: 'reference',
                    to: [{type: 'article'}],
                  }),
                ],
              },
              {
                name: 'serviceLink',
                title: 'Ссылка на услугу',
                type: 'object',
                fields: [
                  defineField({
                    name: 'service',
                    title: 'Услуга',
                    type: 'reference',
                    to: [{type: 'service'}],
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          name: 'articleImage',
          title: 'Изображение',
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Подпись',
              type: 'string',
            }),
          ],
        }),
        defineArrayMember({
          name: 'articleNote',
          title: 'Примечание',
          type: 'object',
          fields: [
            defineField({
              name: 'noteType',
              title: 'Тип',
              type: 'string',
              options: {
                list: [
                  {title: 'Важно', value: 'important'},
                  {title: 'Совет', value: 'tip'},
                  {title: 'Ошибка', value: 'error'},
                  {title: 'Примечание', value: 'note'},
                ],
                layout: 'radio',
              },
              initialValue: 'note',
            }),
            defineField({
              name: 'text',
              title: 'Текст',
              type: 'text',
              rows: 3,
            }),
          ],
          preview: {
            select: {
              noteType: 'noteType',
              text: 'text',
            },
            prepare({noteType, text}) {
              const label =
                {
                  important: 'Важно',
                  tip: 'Совет',
                  error: 'Ошибка',
                  note: 'Примечание',
                }[noteType] || 'Примечание'

              return {
                title: label,
                subtitle: truncateText(text),
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      hidden: true,
    }),
    defineField({
      name: 'isVisible',
      title: 'Показывать',
      type: 'boolean',
      initialValue: true,
      hidden: true,
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      excerpt: 'excerpt',
      materialType: 'materialType',
      oneCConfiguration: 'oneCConfiguration',
      media: 'coverImage',
    },
    prepare({title, excerpt, materialType, oneCConfiguration, media}) {
      const materialTypeLabel =
        {
          article: 'Статья',
          instruction: 'Инструкция',
          error: 'Разбор ошибки',
        }[materialType] || 'Статья'
      const subtitle = [materialTypeLabel, truncateText(excerpt), oneCConfiguration]
        .filter(Boolean)
        .join(' • ')

      return {
        title: title || 'Статья без названия',
        subtitle,
        media,
      }
    },
  },
})
