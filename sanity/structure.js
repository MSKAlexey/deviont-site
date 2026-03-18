import {StructureBuilder} from 'sanity/structure'

export const structure = (S) =>
  S.list()
    .title('Контент')
    .items([
      S.listItem()
        .title('Настройки сайта')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),

      S.documentTypeListItem('pageSection').title('Секции страницы'),
      S.documentTypeListItem('service').title('Услуги'),
      S.documentTypeListItem('product').title('Решения 1С'),
      S.documentTypeListItem('taskItem').title('Примеры задач'),
      S.documentTypeListItem('article').title('Статьи'),
    ])