import {defineArrayMember, defineField} from 'sanity'

function truncateText(value, maxLength = 90) {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length <= maxLength) {
    return trimmedValue
  }

  return `${trimmedValue.slice(0, maxLength).trim()}...`
}

export function defineArticleBodyField({
  name = 'body',
  title = 'Текст статьи',
  readOnly = false,
  referenceWeak = false,
  validation = undefined,
} = {}) {
  return defineField({
    name,
    title,
    type: 'array',
    readOnly,
    of: [
      defineArrayMember({
        type: 'block',
        styles: [
          {title: 'Обычный', value: 'normal'},
          {title: 'Заголовок 2', value: 'h2'},
          {title: 'Заголовок 3', value: 'h3'},
          {title: 'Цитата', value: 'blockquote'},
        ],
        lists: [
          {title: 'Маркированный список', value: 'bullet'},
          {title: 'Нумерованный список', value: 'number'},
        ],
        marks: {
          decorators: [
            {title: 'Жирный', value: 'strong'},
            {title: 'Курсив', value: 'em'},
            {title: 'Подчеркнутый', value: 'underline'},
          ],
          annotations: [
            {
              name: 'link',
              title: 'Внешняя ссылка',
              type: 'object',
              fields: [
                defineField({
                  name: 'href',
                  title: 'URL',
                  type: 'url',
                  validation: (Rule) =>
                    Rule.uri({
                      allowRelative: true,
                      scheme: ['http', 'https', 'mailto', 'tel'],
                    }),
                }),
              ],
            },
            {
              name: 'articleLink',
              title: 'Ссылка на статью',
              type: 'object',
              fields: [
                defineField({
                  name: 'article',
                  title: 'Статья',
                  type: 'reference',
                  to: [{type: 'article'}],
                  ...(referenceWeak ? {weak: true} : {}),
                }),
              ],
            },
            {
              name: 'serviceLink',
              title: 'Ссылка на услугу',
              type: 'object',
              fields: [
                defineField({
                  name: 'service',
                  title: 'Услуга',
                  type: 'reference',
                  to: [{type: 'service'}],
                  ...(referenceWeak ? {weak: true} : {}),
                }),
              ],
            },
          ],
        },
      }),
      defineArrayMember({
        name: 'articleImage',
        title: 'Изображение',
        type: 'image',
        options: {hotspot: true},
        fields: [
          defineField({
            name: 'alt',
            title: 'Alt',
            type: 'string',
          }),
          defineField({
            name: 'caption',
            title: 'Подпись',
            type: 'string',
          }),
          defineField({
            name: 'imageSize',
            title: 'Размер на сайте',
            type: 'string',
            options: {
              list: [
                {title: 'Компактный', value: 'compact'},
                {title: 'Средний', value: 'medium'},
                {title: 'Широкий', value: 'wide'},
              ],
              layout: 'dropdown',
            },
            initialValue: 'wide',
          }),
          defineField({
            name: 'imageAspectRatio',
            title: 'Формат на сайте',
            type: 'string',
            description: 'Выберите формат отображения картинки в статье. Обрезка берется из Hotspot & Crop.',
            options: {
              list: [
                {title: 'Оригинал', value: 'original'},
                {title: '3:4', value: 'portrait'},
                {title: 'Квадрат', value: 'square'},
                {title: '16:9', value: 'landscape'},
                {title: 'Панорама', value: 'panorama'},
              ],
              layout: 'dropdown',
            },
            initialValue: 'original',
          }),
        ],
      }),
      defineArrayMember({
        name: 'articleNote',
        title: 'Примечание',
        type: 'object',
        fields: [
          defineField({
            name: 'noteType',
            title: 'Тип',
            type: 'string',
            options: {
              list: [
                {title: 'Важно', value: 'important'},
                {title: 'Совет', value: 'tip'},
                {title: 'Ошибка', value: 'error'},
                {title: 'Примечание', value: 'note'},
              ],
              layout: 'radio',
            },
            initialValue: 'note',
          }),
          defineField({
            name: 'text',
            title: 'Текст',
            type: 'text',
            rows: 3,
          }),
        ],
        preview: {
          select: {
            noteType: 'noteType',
            text: 'text',
          },
          prepare({noteType, text}) {
            const label =
              {
                important: 'Важно',
                tip: 'Совет',
                error: 'Ошибка',
                note: 'Примечание',
              }[noteType] || 'Примечание'

            return {
              title: label,
              subtitle: truncateText(text),
            }
          },
        },
      }),
    ],
    validation,
  })
}
