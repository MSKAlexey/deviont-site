import {defineType, defineField} from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Услуги',
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
      rows: 4,
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
    defineField({
  name: 'image',
  title: 'Картинка',
  type: 'image',
  options: { hotspot: true },
}),
  ],
})