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
    defineImageField(),
    defineField({
      name: 'publishedAt',
      title: 'Дата публикации',
      type: 'datetime',
    }),
    defineField({
      name: 'configVersion',
      title: 'Версия конфигурации 1С',
      type: 'string',
      description: 'Например: УНФ 3.0.13.292 или УТ 11.5',
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
  ],
  preview: {
    select: {
      title: 'title',
      excerpt: 'excerpt',
      configVersion: 'configVersion',
      media: 'image',
    },
    prepare({title, excerpt, configVersion, media}) {
      const subtitle = [truncateText(excerpt), configVersion].filter(Boolean).join(' • ')

      return {
        title: title || 'Статья без названия',
        subtitle,
        media,
      }
    },
  },
})
