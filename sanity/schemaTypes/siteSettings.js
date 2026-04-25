import {ALL_FIELDS_GROUP, defineArrayMember, defineField, defineType} from 'sanity'
import CardsBlockArrayItem from '../components/CardsBlockArrayItem.js'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Главная страница',
  type: 'document',
  groups: [
    {
      name: 'sections',
      title: 'Секции главной',
      default: true,
    },
    {
      name: 'main',
      title: 'Основное',
    },
    {
      ...ALL_FIELDS_GROUP,
      hidden: true,
    },
  ],
  fields: [
    defineField({
      name: 'heroText',
      title: 'Текст первого экрана (legacy)',
      type: 'text',
      rows: 3,
      group: 'main',
    }),
    defineField({
      name: 'services',
      title: 'Услуги 1С на главной',
      description:
        'Используется как мягкий fallback для уже заполненных данных. Основная связка теперь настраивается в секции главной «Услуги 1С» через связанные документы.',
      type: 'array',
      group: 'main',
      hidden: true,
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'service'}],
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'steps',
      title: 'Порядок работы',
      type: 'array',
      group: 'main',
      hidden: true,
      initialValue: [
        'Определение задач и требований',
        'Настройка и доработка 1С',
        'Проверка и запуск в работу',
        'Дальнейшая поддержка',
      ],
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'supportText',
      title: 'Текст блока «Сопровождение 1С»',
      type: 'text',
      rows: 3,
      group: 'main',
      hidden: true,
      initialValue:
        'Регулярная работа с системой 1С в рамках фиксированного тарифа или почасовой оплаты.',
    }),
    defineField({
      name: 'supportPrice',
      title: 'Стоимость сопровождения 1С',
      type: 'text',
      rows: 3,
      group: 'main',
      hidden: true,
      initialValue:
        '25 000 ₽ / месяц — 10 часов работы включено.\nДополнительные работы — 3 000 ₽ / час.',
    }),
    defineField({
      name: 'advantages',
      title: 'Почему вам можно доверять',
      type: 'array',
      group: 'main',
      hidden: true,
      initialValue: [
        'Опыт работы с 1С более 10 лет',
        'Опыт разработки и внедрения сложных решений',
        'Работа с учетом реальных процессов компании',
        'Долгосрочная работа с клиентами',
      ],
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'contactText',
      title: 'Текст блока «Связаться»',
      type: 'text',
      rows: 2,
      group: 'main',
      hidden: true,
      initialValue: 'Опишите задачу — подготовим вариант реализации',
    }),
    defineField({
      name: 'contactButtonText',
      title: 'Текст кнопки блока «Связаться»',
      type: 'string',
      group: 'main',
      hidden: true,
      initialValue: 'Оставить заявку',
    }),
    defineField({
      name: 'tabTitle',
      title: 'Заголовок вкладки',
      type: 'string',
      group: 'main',
      description: 'Название, которое отображается во вкладке браузера.',
    }),
    defineField({
      name: 'companyName',
      title: 'Название компании',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'subtitle',
      title: 'Подзаголовок',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'phone',
      title: 'Телефон',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'city',
      title: 'Город',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'domain',
      title: 'Домен',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'logo',
      title: 'Логотип',
      type: 'image',
      options: {hotspot: true},
      group: 'main',
    }),
    defineField({
      name: 'sections',
      title: 'Секции главной',
      description:
        'Список блоков главной страницы. Добавляйте новые блоки прямо в этот список и меняйте их порядок drag-and-drop.',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({
          name: 'heroBlockItem',
          type: 'heroBlock',
          title: 'Главный экран',
          components: {
            item: CardsBlockArrayItem,
          },
        }),
        defineArrayMember({
          name: 'textBlockItem',
          type: 'textBlock',
          title: 'Текстовый блок',
          components: {
            item: CardsBlockArrayItem,
          },
        }),
        defineArrayMember({
          name: 'cardsBlockItem',
          type: 'cardsBlock',
          title: 'Блок карточек',
          components: {
            item: CardsBlockArrayItem,
          },
        }),
        defineArrayMember({
          name: 'certificatesBlockItem',
          type: 'certificatesBlock',
          title: 'Сертификаты',
          components: {
            item: CardsBlockArrayItem,
          },
        }),
        defineArrayMember({
          name: 'listBlockItem',
          type: 'listBlock',
          title: 'Блок списка',
          components: {
            item: CardsBlockArrayItem,
          },
        }),
        defineArrayMember({
          name: 'ctaBlockItem',
          type: 'ctaBlock',
          title: 'CTA блок',
          components: {
            item: CardsBlockArrayItem,
          },
        }),
        defineArrayMember({
          name: 'contactBlockItem',
          type: 'contactBlock',
          title: 'Контактный блок',
          components: {
            item: CardsBlockArrayItem,
          },
        }),
      ],
    }),
  ],
})
