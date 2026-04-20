import {defineField, defineType} from 'sanity'
import {defineImageField} from './lib/defineImageField.js'

export const article = defineType({
  name: 'article',
  title: 'Статьи',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
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
    defineImageField(),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
  },
})
