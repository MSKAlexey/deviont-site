import {defineField, defineType} from 'sanity'
import {defineImageField} from './lib/defineImageField.js'

export const service = defineType({
  name: 'service',
  title: 'Услуги 1С',
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
      isVisible: 'isVisible',
      media: 'image',
    },
    prepare({title, isVisible, media}) {
      const visibilityLabel = isVisible === false ? ' • скрыта' : ''

      return {
        title: title || 'Без названия',
        subtitle: `Карточка услуги 1С${visibilityLabel}`,
        media,
      }
    },
  },
})
