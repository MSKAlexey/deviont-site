import {defineArrayMember, defineField, defineType} from 'sanity'

const sectionTypeOptions = [
  {title: 'Главный экран', value: 'hero'},
  {title: 'Порядок работы', value: 'process'},
  {title: 'Услуги 1С', value: 'services'},
  {title: 'Сопровождение 1С', value: 'support'},
  {title: 'Почему вам можно доверять', value: 'advantages'},
  {title: 'Связаться', value: 'contacts'},
  {title: 'Решения 1С', value: 'products'},
  {title: 'Примеры задач', value: 'tasks'},
  {title: 'Статьи', value: 'knowledge'},
  {title: 'Связаться', value: 'cta'},
]

const sectionTypeLabels = Object.fromEntries(
  sectionTypeOptions.map((item) => [item.value, item.title])
)

const sectionContentTypeBySectionKey = {
  services: 'service',
  products: 'product',
  tasks: 'taskItem',
  knowledge: 'article',
}

const sectionSourceLabels = {
  hero: 'Источник: Главная страница -> Главный экран',
  process: 'Источник: Главная страница -> Порядок работы',
  services: 'Источник: связанные документы "Услуги 1С"',
  support: 'Источник: Главная страница -> Сопровождение 1С',
  advantages: 'Источник: Главная страница -> Почему вам можно доверять',
  contacts: 'Источник: Главная страница -> Связаться',
  products: 'Источник: связанные документы "Решения 1С"',
  tasks: 'Источник: связанные документы "Примеры задач"',
  knowledge: 'Источник: связанные документы "Статьи"',
  cta: 'Источник: Главная страница -> Связаться',
}

export const pageSection = defineType({
  name: 'pageSection',
  title: 'Секции главной',
  type: 'document',
  liveEdit: true,
  fields: [
    defineField({
      name: 'title',
      title: 'Название в админке',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sectionKey',
      title: 'Тип секции',
      type: 'string',
      description:
        'Определяет, какой компонент будет отрисован на главной странице. Для главного экрана, порядка работы, сопровождения, преимуществ и блока «Связаться» контент редактируется в документе «Главная страница». Для карточечных секций ниже появляется список связанных документов.',
      options: {
        list: sectionTypeOptions,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contentItems',
      title: 'Связанный контент',
      type: 'array',
      hidden: ({document}) => !sectionContentTypeBySectionKey[document?.sectionKey],
      description:
        'Добавляйте сюда уже созданные документы или создавайте новые. Порядок в этом списке определяет состав и порядок карточек на главной. Если список ещё не заполнен, фронтенд временно использует старый источник данных.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [
            {type: 'service'},
            {type: 'product'},
            {type: 'taskItem'},
            {type: 'article'},
          ],
          options: {
            filter: ({document}) => {
              const contentType =
                sectionContentTypeBySectionKey[document?.sectionKey]

              if (!contentType) {
                return undefined
              }

              return {
                filter: '_type == $contentType',
                params: {contentType},
              }
            },
          },
        }),
      ],
      validation: (Rule) => [
        Rule.unique(),
        Rule.custom((value, context) => {
          const supportsLinkedContent = Boolean(
            sectionContentTypeBySectionKey[context.document?.sectionKey]
          )

          if (supportsLinkedContent || !Array.isArray(value) || value.length === 0) {
            return true
          }

          return 'Для этого типа секции связанный контент не используется. Очистите список.'
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Порядок (legacy)',
      type: 'number',
      hidden: true,
      description:
        'Больше не используется, если секции настроены в Настройках сайта -> sections. Оставлено как fallback для старых данных.',
    }),
    defineField({
      name: 'isVisible',
      title: 'Показывать секцию',
      type: 'boolean',
      initialValue: true,
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      sectionKey: 'sectionKey',
      isVisible: 'isVisible',
      contentItems: 'contentItems',
    },
    prepare({title, sectionKey, isVisible, contentItems}) {
      const sectionLabel =
        sectionTypeLabels[sectionKey] || sectionKey || 'Без типа'
      const visibility = isVisible === false ? ' • скрыта' : ''
      const sourceLabel =
        sectionSourceLabels[sectionKey] || 'Источник контента не настроен'
      const contentCount = sectionContentTypeBySectionKey[sectionKey]
        ? ` • ${Array.isArray(contentItems) ? contentItems.length : 0} поз.`
        : ''

      return {
        title: title || 'Без названия',
        subtitle: `${sectionLabel}${visibility} • ${sourceLabel}${contentCount}`,
      }
    },
  },
})
