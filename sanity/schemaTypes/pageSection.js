import {defineType, defineField} from 'sanity'

export const pageSection = defineType({
  name: 'pageSection',
  title: 'Секции страницы',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название в админке',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sectionKey',
      title: 'Ключ секции',
      type: 'string',
      options: {
        list: [
          {title: 'Hero', value: 'hero'},
          {title: 'Процесс', value: 'process'},
          {title: 'Услуги', value: 'services'},
          {title: 'Продукты', value: 'products'},
          {title: 'Задачи', value: 'tasks'},
          {title: 'Статьи', value: 'knowledge'},
          {title: 'CTA', value: 'cta'},
          {title: 'Контакты', value: 'contacts'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isVisible',
      title: 'Показывать',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})