import {defineType, defineField} from 'sanity'

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
    }),
    defineField({
      name: 'isVisible',
      title: 'Показывать',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})