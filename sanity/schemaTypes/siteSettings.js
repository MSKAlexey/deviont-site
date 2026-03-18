import {defineType, defineField} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Настройки сайта',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Название компании',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Подзаголовок',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Телефон',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'city',
      title: 'Город',
      type: 'string',
    }),
    defineField({
      name: 'domain',
      title: 'Домен',
      type: 'string',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Заголовок первого экрана',
      type: 'string',
    }),
    defineField({
      name: 'heroText',
      title: 'Текст первого экрана',
      type: 'text',
      rows: 3,
    }),
        defineField({
      name: 'logo',
      title: 'Логотип',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})