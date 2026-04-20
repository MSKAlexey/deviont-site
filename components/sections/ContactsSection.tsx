import SectionHeading from './SectionHeading'

const fallbackContactText = 'Опишите задачу — подготовим вариант реализации'
const fallbackContactButtonText = 'Оставить заявку'

export default function ContactsSection({
  settings,
  block,
  sectionId = 'contacts',
}) {
  const contactTitle = block?.title || 'Связаться'
  const contactText = block?.text || settings?.contactText || fallbackContactText
  const contactButtonText =
    block?.buttonText || settings?.contactButtonText || fallbackContactButtonText

  return (
    <section className="section sectionContact" id={sectionId}>
      <div className="container">
        <div className="contactPanel">
          <div className="contactCopy">
            <SectionHeading title={contactTitle} description={contactText} />
          </div>

          <form className="contactForm" id="contact-form">
            <label className="formField">
              <span>Имя</span>
              <input type="text" name="name" placeholder="Имя" />
            </label>

            <label className="formField">
              <span>Телефон</span>
              <input type="tel" name="phone" placeholder="Телефон" />
            </label>

            <label className="formField">
              <span>Комментарий</span>
              <textarea
                name="comment"
                rows={5}
                placeholder="Комментарий"
              />
            </label>

            <button type="button" className="btnPrimary formSubmit">
              {contactButtonText}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
