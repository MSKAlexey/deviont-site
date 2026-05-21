import {defineField, defineType} from 'sanity'
import {defineImageField} from './lib/defineImageField.js'
import {defineArticleBodyField} from './lib/articleBodyField.js'
import ArticleRevisionsInput from '../components/ArticleRevisionsInput.js'

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
      options: {
        list: [
          {
            title: '1С:Управление нашей фирмой, редакция 3.0',
            value: '1С:Управление нашей фирмой, редакция 3.0',
          },
          {
            title: '1С:Управление торговлей, редакция 11.5',
            value: '1С:Управление торговлей, редакция 11.5',
          },
          {
            title: '1С:Управление торговлей, редакция 10.3',
            value: '1С:Управление торговлей, редакция 10.3',
          },
          {
            title: '1С:Розница, редакция 3.0',
            value: '1С:Розница, редакция 3.0',
          },
          {
            title: '1С:Розница, редакция 2.3',
            value: '1С:Розница, редакция 2.3',
          },
          {
            title: '1С:Бухгалтерия предприятия, редакция 3.0',
            value: '1С:Бухгалтерия предприятия, редакция 3.0',
          },
        ],
        layout: 'dropdown',
      },
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
    defineArticleBodyField({
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
    defineField({
      name: 'articleRevisions',
      title: 'Версии статьи',
      type: 'string',
      readOnly: true,
      components: {
        input: ArticleRevisionsInput,
      },
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
