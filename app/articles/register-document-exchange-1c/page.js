import Link from 'next/link'
import HeaderClient from '../../../components/HeaderClient'
import {client} from '../../../sanity/lib/client'
import {siteSettingsQuery} from '../../../sanity/lib/queries'

export const revalidate = 60

export const metadata = {
  title: 'Как зарегистрировать приходную накладную к обмену в 1С:УНФ 3.0 | ДЕВИОНТ',
  description:
    'Пошаговая инструкция по ручной регистрации приходной накладной к обмену в 1С:Управление нашей фирмой 3.0.',
}

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

export default async function RegisterDocumentExchangeArticlePage() {
  const settings = await client.fetch(siteSettingsQuery)

  return (
    <>
      <HeaderClient settings={settings} sections={[]} />
      <main className="articlesPage">
        <section className="section">
          <div className="container articleDetailContainer">
            <div className="pageBackLinks">
              <Link className="articleBackLink" href="/articles">
                Все статьи
              </Link>
              <Link className="articleBackLink" href="/">
                На главную
              </Link>
            </div>

            <div className="articleDetailLayout">
              <article className="articlePageCard articleDetailCard">
                <header className="articlePageHeader articleDetailHeader">
                  <div className="articleHeaderBadges">
                    <span className="articleTypeBadge articleTypeBadgeInstruction">Инструкция</span>
                    <span className="articleRelatedBadge">1С:УНФ 3.0</span>
                    <span className="articleRelatedBadge">Синхронизация данных</span>
                  </div>

                  <h1 className="articlePageTitle">
                    Как зарегистрировать приходную накладную к обмену в 1С:УНФ 3.0
                  </h1>

                  <p className="articlePageExcerpt">
                    Инструкция показывает, как вручную добавить конкретную приходную накладную в отправляемые данные обмена, если документ не попал в синхронизацию автоматически.
                  </p>

                  <div className="articleDetailMetaGrid">
                    <div className="articleDetailMetaItem">
                      <span>Конфигурация</span>
                      <strong>1С:Управление нашей фирмой 3.0</strong>
                    </div>
                    <div className="articleDetailMetaItem">
                      <span>Раздел</span>
                      <strong>Синхронизация данных</strong>
                    </div>
                    <div className="articleDetailMetaItem">
                      <span>Объект</span>
                      <strong>Приходная накладная</strong>
                    </div>
                  </div>
                </header>

                <div className="articleBody">
                  <p>
                    В 1С:УНФ документы для обмена передаются через механизм регистрации изменений. Обычно программа сама отслеживает измененные документы, но иногда нужный документ приходится зарегистрировать вручную. Это нужно, например, когда приходная накладная уже создана, но в базу-получатель она не выгрузилась.
                  </p>

                  <div className="articleNote articleNoteImportant">
                    <strong>Важно</strong>
                    <p>
                      Регистрировать нужно не просто вид документа, а конкретную приходную накладную для конкретного узла обмена. Если выбрать другой узел, документ уйдет не туда или не уйдет вообще.
                    </p>
                  </div>

                  <h2>Когда нужна ручная регистрация документа</h2>
                  <p>
                    Ручная регистрация пригодится, если документ есть в УНФ, но после синхронизации он не появился в другой базе. Также этот способ используют после изменения правил обмена, даты начала выгрузки или состава отправляемых документов.
                  </p>
                  <p>
                    В примере ниже используется обмен УНФ с бухгалтерией через универсальный формат. Название узла обмена в вашей базе может отличаться.
                  </p>

                  <h2>Шаг 1. Откройте настройки синхронизации</h2>
                  <ol>
                    <li>Перейдите в раздел <strong>Настройки</strong>.</li>
                    <li>Откройте пункт <strong>Синхронизация данных</strong>.</li>
                    <li>В списке настроенных обменов выделите нужный обмен. В примере это узел <strong>AMOPE</strong>.</li>
                  </ol>

                  <h2>Шаг 2. Откройте отправляемые данные</h2>
                  <ol>
                    <li>В списке синхронизаций выделите строку нужного обмена.</li>
                    <li>Нажмите <strong>Еще</strong>.</li>
                    <li>Выберите команду <strong>Отправляемые данные</strong>.</li>
                  </ol>
                  <p>
                    Откроется окно регистрации изменений для выбранного узла обмена. В нем слева отображаются объекты конфигурации, а справа — конкретные объекты, которые зарегистрированы к отправке.
                  </p>

                  <h2>Шаг 3. Выберите вид документа</h2>
                  <ol>
                    <li>В левой части окна найдите раздел с документами.</li>
                    <li>Выберите строку <strong>Приходная накладная</strong>.</li>
                    <li>Проверьте правую часть окна: там будут показаны приходные накладные, зарегистрированные к отправке.</li>
                  </ol>

                  <h2>Шаг 4. Добавьте нужную приходную накладную</h2>
                  <p>
                    Если нужная накладная уже есть справа и в колонке <strong>№ отправленного</strong> указано <strong>Не выгружалось</strong>, значит документ уже стоит в очереди на отправку. В этом случае ничего добавлять не нужно — можно запускать синхронизацию.
                  </p>
                  <p>
                    Если нужной приходной накладной справа нет, добавьте ее вручную:
                  </p>
                  <ol>
                    <li>Оставьте слева выбранным вид документа <strong>Приходная накладная</strong>.</li>
                    <li>В правой части окна нажмите <strong>Добавить</strong>.</li>
                    <li>Выберите нужную приходную накладную из списка документов.</li>
                    <li>Убедитесь, что документ появился в правой таблице.</li>
                  </ol>

                  <div className="articleNote articleNoteTip">
                    <strong>Безопасный вариант</strong>
                    <p>
                      Для регистрации одного документа лучше использовать кнопку <strong>Добавить</strong> в правой части окна. Кнопка <strong>Зарегистрировать</strong> слева чаще нужна для массовой регистрации изменений по выбранному виду объектов.
                    </p>
                  </div>

                  <h2>Шаг 5. Запустите синхронизацию</h2>
                  <ol>
                    <li>Закройте окно регистрации изменений.</li>
                    <li>Вернитесь в список настроек синхронизации данных.</li>
                    <li>Выделите нужный обмен.</li>
                    <li>Нажмите <strong>Синхронизировать</strong>.</li>
                  </ol>
                  <p>
                    После выполнения обмена проверьте документ в базе-получателе. Если приходная накладная ушла успешно, в списке отправляемых данных она больше не должна оставаться как невыгруженная.
                  </p>

                  <h2>Что проверить, если документ все равно не выгружается</h2>
                  <ul>
                    <li>Дата документа должна попадать в период выгрузки, указанный в настройках обмена.</li>
                    <li>Организация документа должна входить в состав отправляемых данных.</li>
                    <li>Вид документа должен быть разрешен к отправке в настройках синхронизации.</li>
                    <li>Документ должен быть проведен, если правила обмена выгружают только проведенные документы.</li>
                    <li>В базе-получателе не должно быть ошибок загрузки по этому объекту.</li>
                  </ul>

                  <h2>Краткий порядок действий</h2>
                  <ol>
                    <li><strong>Настройки</strong> → <strong>Синхронизация данных</strong>.</li>
                    <li>Выделить нужный обмен.</li>
                    <li><strong>Еще</strong> → <strong>Отправляемые данные</strong>.</li>
                    <li>Слева выбрать <strong>Приходная накладная</strong>.</li>
                    <li>Справа нажать <strong>Добавить</strong>.</li>
                    <li>Выбрать нужную приходную накладную.</li>
                    <li>Запустить синхронизацию.</li>
                  </ol>
                </div>
              </article>

              <aside className="articleAside">
                <div className="articleAsideCard articleAsideCta">
                  <h2>Нужна помощь с обменом 1С?</h2>
                  <p>
                    Проверим настройки синхронизации, состав отправляемых данных и ошибки обмена между базами.
                  </p>
                  <a className="btnPrimary" href="/#contacts">
                    Получить консультацию
                  </a>
                </div>

                <div className="articleAsideCard">
                  <h3>В статье</h3>
                  <p>Регистрация изменений, отправляемые данные, приходная накладная, синхронизация УНФ и БП.</p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  )
}
