import {defineType, defineField} from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Решения 1С',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Описание',
      type: 'text',
      rows: 5,
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