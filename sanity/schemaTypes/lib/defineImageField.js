import {defineField} from 'sanity'

export function defineImageField() {
  return defineField({
    name: 'image',
    title: 'Картинка',
    type: 'image',
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt',
        type: 'string',
      }),
    ],
  })
}
