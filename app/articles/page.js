import Link from 'next/link'
import HeaderClient from '../../components/HeaderClient'
import {client} from '../../sanity/lib/client'
import {siteSettingsQuery} from '../../sanity/lib/queries'

export const revalidate = 60

export const metadata = {
  title: 'Статьи и инструкции по 1С | ДЕВИОНТ',
  description: 'Практические инструкции по настройке, сопровождению и обменам данных в 1С.',
}

const articles = [
  {
    title: 'Как зарегистрировать приходную накладную к обмену в 1С:УНФ 3.0',
    href: '/articles/register-document-exchange-1c',
    type: 'Инструкция',
    excerpt:
      'Пошаговая инструкция: где открыть регистрацию изменений, как выбрать узел обмена, добавить приходную накладную в отправляемые данные и проверить, что она уйдет при синхронизации.',
    meta: ['1С:УНФ 3.0', 'Синхронизация данных', 'Обмен с БП'],
  },
]

function Footer({settings}) {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footerInner">
        <div>{`© ${year} ${settings?.companyName || 'ДЕВИОНТ'}`}</div>
        <div>{settings?.subtitle || 'интегратор 1С'}</div>
      </div>
    </footer>
  )
}

export default async function ArticlesPage() {
  const settings = await client.fetch(siteSettingsQuery)

  return (
    <>
      <HeaderClient settings={settings} sections={[]} />
      <main className="articlesPage">
        <section className="section">
          <div className="container articleIndexContainer">
            <div className="articlesPageHead articlesIndexHead">
              <span className="sectionEyebrow">База знаний</span>
              <h1>Статьи и инструкции по 1С</h1>
              <p>
                Практические материалы по настройке, сопровождению и обменам данных в 1С для бизнеса.
              </p>
            </div>

            <div className="articleCardsGrid">
              {articles.map((article) => (
                <Link key={article.href} className="articleCardLink" href={article.href}>
                  <article className="infoCard articleCard articleMaterialCard">
                    <div className="articleCardBody">
                      <span className="articleTypeBadge articleTypeBadgeInstruction">{article.type}</span>
                      <h2 className="articleCardTitle">{article.title}</h2>
                      <p className="articleCardExcerpt">{article.excerpt}</p>
                      <div className="articleCardFooter">
                        <div className="articleMeta">
                          {article.meta.map((item) => (
                            <span key={item} className="articleMetaTag">
                              {item}
                            </span>
                          ))}
                        </div>
                        <span className="articleCardMore">Читать инструкцию →</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  )
}
