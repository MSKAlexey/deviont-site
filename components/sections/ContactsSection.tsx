'use client'

import {useState} from 'react'
import SectionHeading from './SectionHeading'

const fallbackContactText = 'Опишите задачу — подготовим вариант реализации'
const fallbackContactButtonText = 'Оставить заявку'
const initialCaptcha = {
  left: 4,
  right: 7,
  answer: 11,
}

export default function ContactsSection({
  settings,
  block,
  sectionId = 'contacts',
}) {
  const contactTitle = block?.title || 'Связаться'
  const contactText = block?.text || settings?.contactText || fallbackContactText
  const contactButtonText =
    block?.buttonText || settings?.contactButtonText || fallbackContactButtonText
  const [captchaValue, setCaptchaValue] = useState('')
  const normalizedCaptchaValue = captchaValue.trim()
  const captchaNumber = Number(normalizedCaptchaValue)
  const hasCaptchaValue = normalizedCaptchaValue.length > 0
  const isCaptchaValid =
    hasCaptchaValue && Number.isFinite(captchaNumber) && captchaNumber === initialCaptcha.answer

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

            <label className="formField captchaField">
              <span>
                Проверка: {initialCaptcha.left} + {initialCaptcha.right} =
              </span>
              <input
                type="text"
                name="captcha"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ответ"
                value={captchaValue}
                onChange={(event) => setCaptchaValue(event.target.value)}
                aria-invalid={hasCaptchaValue && !isCaptchaValid}
              />
            </label>
            {hasCaptchaValue && !isCaptchaValid ? (
              <p className="formHint formHintError">Ответ не совпадает</p>
            ) : null}

            <button type="button" className="btnPrimary formSubmit" disabled={!isCaptchaValid}>
              {contactButtonText}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
