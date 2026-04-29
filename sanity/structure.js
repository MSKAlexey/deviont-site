export const structure = (S) =>
  S.list()
    .title('Навигация')
    .items([
      S.listItem()
        .title('Сайт')
        .child(
          S.list()
            .title('Сайт')
            .items([
              S.listItem()
                .title('Главная страница')
                .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
              S.listItem()
                .title('Услуги')
                .child(
                  S.list()
                    .title('Услуги')
                    .items([S.documentTypeListItem('service').title('Все услуги')])
                ),
            ])
        ),
      S.listItem()
        .title('Контент')
        .child(
          S.list()
            .title('Контент')
            .items([
              S.documentTypeListItem('heroBlockDocument').title('Главный экран'),
              S.documentTypeListItem('textBlockDocument').title('Текстовые блоки'),
              S.documentTypeListItem('cardsBlockDocument').title('Блоки карточек'),
              S.documentTypeListItem('service').title('Услуги 1С'),
              S.documentTypeListItem('article').title('Статьи'),
              S.documentTypeListItem('certificatesBlockDocument').title('Сертификаты'),
              S.documentTypeListItem('listBlockDocument').title('Списки'),
              S.documentTypeListItem('ctaBlockDocument').title('CTA блоки'),
              S.documentTypeListItem('contactBlockDocument').title('Контактные блоки'),
            ])
        ),
    ])
