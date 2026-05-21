import {defineField, defineType} from 'sanity'
import {defineArticleBodyField} from './lib/articleBodyField.js'

const revisionTypeTitles = {
  manual: 'Ручное сохранение',
  beforePublish: 'Перед публикацией',
  restorePoint: 'Точка восстановления',
}

function formatDateTime(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('ru-RU')
}

export const articleRevision = defineType({
  name: 'articleRevision',
  title: 'Версии статей',
  type: 'document',
  fields: [
    defineField({
      name: 'article',
      title: 'Статья',
      type: 'reference',
      to: [{type: 'article'}],
      weak: true,
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'articleTitle',
      title: 'Название статьи',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'articleSlug',
      title: 'Slug статьи',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'excerpt',
      title: 'Краткое описание',
      type: 'text',
      rows: 4,
      readOnly: true,
    }),
    defineArticleBodyField({
      readOnly: true,
      referenceWeak: true,
    }),
    defineField({
      name: 'coverImage',
      title: 'Обложка',
      type: 'image',
      options: {hotspot: true},
      readOnly: true,
    }),
    defineField({
      name: 'coverImageAlt',
      title: 'Alt обложки',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      readOnly: true,
    }),
    defineField({
      name: 'materialType',
      title: 'Тип материала',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          {title: 'Статья', value: 'article'},
          {title: 'Инструкция', value: 'instruction'},
          {title: 'Разбор ошибки', value: 'error'},
        ],
      },
    }),
    defineField({
      name: 'oneCConfiguration',
      title: 'Конфигурация 1С',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'oneCVersion',
      title: 'Версия 1С',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'relatedService',
      title: 'Связанная услуга',
      type: 'reference',
      to: [{type: 'service'}],
      weak: true,
      readOnly: true,
    }),
    defineField({
      name: 'sourceArticleUpdatedAt',
      title: 'Дата обновления исходной статьи',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'revisionCreatedAt',
      title: 'Дата создания версии',
      type: 'datetime',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'revisionComment',
      title: 'Комментарий к версии',
      type: 'text',
      rows: 3,
      readOnly: true,
    }),
    defineField({
      name: 'revisionType',
      title: 'Тип версии',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          {title: revisionTypeTitles.manual, value: 'manual'},
          {title: revisionTypeTitles.beforePublish, value: 'beforePublish'},
          {title: revisionTypeTitles.restorePoint, value: 'restorePoint'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'articleTitle',
      slug: 'articleSlug',
      revisionCreatedAt: 'revisionCreatedAt',
      revisionType: 'revisionType',
      media: 'coverImage',
    },
    prepare({title, slug, revisionCreatedAt, revisionType, media}) {
      return {
        title: title || 'Версия статьи',
        subtitle: [
          slug,
          formatDateTime(revisionCreatedAt),
          revisionTypeTitles[revisionType] || revisionType,
        ]
          .filter(Boolean)
          .join(' • '),
        media,
      }
    },
  },
})
