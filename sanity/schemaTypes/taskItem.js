import {defineField, defineType} from 'sanity'
import {defineImageField} from './lib/defineImageField.js'

export const taskItem = defineType({
  name: 'taskItem',
  title: 'Примеры задач',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Текст',
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
