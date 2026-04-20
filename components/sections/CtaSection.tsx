const fallbackTitle = 'Обсудим задачу и предложим рабочий маршрут внедрения'
const fallbackText =
  'Кратко опишите ваш процесс, ограничения и желаемый результат. Мы вернемся с понятным следующим шагом по внедрению или доработке 1С.'
const fallbackButtonText = 'Отправить заявку'

export default function CtaSection({settings, block, sectionId = 'cta'}) {
  const phone = settings?.phone || '+7 (999) 541-36-53'
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`
  const email = settings?.email || 'info@deviont.ru'
  const title = block?.title || fallbackTitle
  const text = block?.text || fallbackText
  const buttonText = block?.buttonText || fallbackButtonText

  return (
    <section className="section" id={sectionId}>
      <div className="container">
        <div className="ctaBox">
          <div className="ctaText">
            <div className="sectionEyebrow">Следующий шаг</div>
            <h2>{title}</h2>
            <p>{text}</p>

            <div className="ctaContacts">
              <a className="ctaContactChip" href={phoneHref}>
                {phone}
              </a>
              <a className="ctaContactChip" href={`mailto:${email}`}>
                {email}
              </a>
            </div>
          </div>

          <form className="ctaForm">
            <input type="text" placeholder="Ваше имя" />
            <input type="tel" placeholder="Телефон" />
            <textarea placeholder="Кратко опишите задачу" rows={4} />
            <button type="button" className="btnPrimary">
              {buttonText}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
