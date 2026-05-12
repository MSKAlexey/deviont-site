'use client'

import ContactForm from '../contact/ContactForm'
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

          <ContactForm id="contact-form" buttonText={contactButtonText} showCaptcha />
        </div>
      </div>
    </section>
  )
}
