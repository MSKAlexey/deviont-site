import {defineType, defineField} from 'sanity'

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
    }),
    defineField({
      name: 'isVisible',
      title: 'Показывать',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})