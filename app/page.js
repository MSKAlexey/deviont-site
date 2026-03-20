import {urlFor} from '../sanity/lib/image'
import HeaderClient from '../components/HeaderClient'
import {client} from '../sanity/lib/client'
import {
  siteSettingsQuery,
  servicesQuery,
  productsQuery,
  tasksQuery,
  articlesQuery,
  pageSectionsQuery,
} from '../sanity/lib/queries'

function Hero({settings}) {
  return (
    <section className="hero">
      <div className="container heroGrid">
        <div className="heroContent">
          <h1>{settings?.heroTitle || 'ДЕВИОНТ — интегратор 1С в Москве'}</h1>
          <p className="heroText">
            {settings?.heroText ||
              'Внедрение с этапами и контролем результата для торговых и производственных компаний'}
          </p>

          <div className="heroActions">
            <a className="btnPrimary" href="#cta">
              Получить консультацию
            </a>
          </div>
        </div>

        <div className="heroVisual">
          <div className="heroPanel">
            <div className="heroCard">
              <div className="heroCardTitle">Динамика прибыли</div>
              <div className="chartLine">
                <span />
              </div>
            </div>

            <div className="heroCard">
              <div className="heroCardTitle">Структура расходов</div>
              <div className="pieWrap">
                <div className="pieChart" />
                <div className="pieLegend">
                  <div><i className="dot red" /> Продажи</div>
                  <div><i className="dot yellow" /> Склад</div>
                  <div><i className="dot dark" /> Финансы</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProcessBlock() {
  return (
    <section className="section">
      <div className="container">
        <div className="sectionHead center">
          <h2>Как 1С помогает управлять бизнесом</h2>
          <p>
            Единая система учета объединяет ключевые процессы компании и
            позволяет руководителю видеть реальные показатели бизнеса.
          </p>
        </div>

        <div className="processBox">
          <div className="processRow">
            <div className="processItem">
              <div className="processIcon">🛒</div>
              <div className="processTitle">Продажи</div>
            </div>
            <div className="processArrow">→</div>

            <div className="processItem">
              <div className="processIcon">📦</div>
              <div className="processTitle">Закупки</div>
            </div>
            <div className="processArrow">→</div>

            <div className="processItem">
              <div className="processIcon">🏬</div>
              <div className="processTitle">Склад</div>
            </div>
            <div className="processArrow">→</div>

            <div className="processItem">
              <div className="processIcon">💳</div>
              <div className="processTitle">Финансы</div>
            </div>
            <div className="processArrow">→</div>

            <div className="processItem">
              <div className="processIcon">📊</div>
              <div className="processTitle">Отчеты</div>
            </div>
          </div>

          <div className="profitBlock">
            <div className="profitArrow">↓</div>
            <div className="profitBadge">Прибыль компании</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ServicesBlock({services}) {
  return (
    <section className="section sectionSoft" id="services">
      <div className="container">
        <div className="sectionHead">
          <h2>Наши услуги</h2>
        </div>

        <div className="grid grid4">
          {services?.map((item) => (
            <div className="card" key={item._id}>
  {item.image && (
    <img
      src={urlFor(item.image).width(400).url()}
      alt={item.title}
      className="cardImage"
    />
  )}

  <h3>{item.title}</h3>
  <p>{item.text}</p>
</div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductsBlock({products}) {
  return (
    <section className="section" id="products">
      <div className="container">
        <div className="sectionHead center">
          <h2>Работаем с решениями 1С</h2>
          <p>
            Настраиваем и дорабатываем типовые конфигурации 1С для торговых и
            производственных компаний.
          </p>
        </div>

        <div className="grid grid3">
          {products?.map((item) => (
            <div className="card productCard" key={item._id}>
              <div className="productMock">1C</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <a href="#contacts" className="linkMore">
                Подробнее
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TasksBlock({tasks}) {
  return (
    <section className="section sectionSoft">
      <div className="container">
        <div className="sectionHead">
          <h2>Примеры задач</h2>
        </div>

        <div className="grid grid3">
          {tasks?.map((item) => (
            <div className="card taskCard" key={item._id}>
              <div className="taskMark">✓</div>
              <div>{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function KnowledgeBlock({articles}) {
  return (
    <section className="section" id="knowledge">
      <div className="container">
        <div className="sectionHead center">
          <h2>Статьи и инструкции</h2>
          <p>Полезные материалы по настройке 1С и автоматизации бизнеса.</p>
        </div>

        <div className="grid grid3">
          {articles?.map((item) => (
            <div className="card articleCard" key={item._id}>
              <div className="articleBadge">Статья</div>
              <h3>{item.title}</h3>
              <a href="#contacts" className="linkMore">
                Читать статью →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBlock() {
  return (
    <section className="section" id="cta">
      <div className="container">
        <div className="ctaBox">
          <div className="ctaText">
            <h2>Оставить заявку</h2>
            <p>
              Кратко опишите задачу, и мы предложим решение и следующий шаг по
              внедрению или доработке 1С.
            </p>
          </div>

          <form className="ctaForm">
            <input type="text" placeholder="Ваше имя" />
            <input type="tel" placeholder="Телефон" />
            <textarea placeholder="Кратко опишите задачу" rows="4" />
            <button type="button" className="btnPrimary">
              Отправить заявку
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function ContactsBlock({settings}) {
  const phone = settings?.phone || '+7 (999) 541-36-53'
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`
  const email = settings?.email || 'info@deviont.ru'
  const city = settings?.city || 'Москва'
  const domain = settings?.domain || 'deviont.ru'

  return (
    <section className="section sectionSoft" id="contacts">
      <div className="container">
        <div className="sectionHead">
          <h2>Контакты</h2>
        </div>

        <div className="contactsGrid">
          <div className="card contactsCard">
            <div className="contactItem">
              <span>Телефон</span>
              <a href={phoneHref}>{phone}</a>
            </div>
            <div className="contactItem">
              <span>Email</span>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
            <div className="contactItem">
              <span>Город</span>
              <strong>{city}</strong>
            </div>
            <div className="contactItem">
              <span>Сайт</span>
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {domain}
              </a>
            </div>
          </div>

          <div className="mapBox">
            <div className="mapLabel">Здесь будет Яндекс Карта</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer({settings}) {
  return (
    <footer className="footer">
      <div className="container footerInner">
        <div>© 2026 {settings?.companyName || 'ДЕВИОНТ'}</div>
        <div>{settings?.subtitle || 'Интегратор 1С в Москве'}</div>
      </div>
    </footer>
  )
}

function renderSection(sectionKey, data) {
  switch (sectionKey) {
    case 'hero':
      return <Hero settings={data.settings} />

    case 'process':
      return <ProcessBlock />

    case 'services':
      return <ServicesBlock services={data.services} />

    case 'products':
      return <ProductsBlock products={data.products} />

    case 'tasks':
      return <TasksBlock tasks={data.tasks} />

    case 'knowledge':
      return <KnowledgeBlock articles={data.articles} />

    case 'cta':
      return <CtaBlock />

    case 'contacts':
      return <ContactsBlock settings={data.settings} />

    default:
      return null
  }
}

export default async function Page() {
const [settings, services, products, tasks, articles, sections] = await Promise.all([
  client.fetch(siteSettingsQuery),
  client.fetch(servicesQuery),
  client.fetch(productsQuery),
  client.fetch(tasksQuery),
  client.fetch(articlesQuery),
  client.fetch(pageSectionsQuery),
])

  return (
    <>
      <div id="top" />
      <HeaderClient settings={settings} />

 <main>
  {sections?.map((section) => (
    <div key={section._id}>
      {renderSection(section.sectionKey, {
        settings,
        services,
        products,
        tasks,
        articles,
      })}
    </div>
  ))}
</main>

      <Footer settings={settings} />
    </>
  )
}
