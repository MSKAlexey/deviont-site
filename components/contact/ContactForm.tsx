'use client'

import {useState} from 'react'
import type {FormEvent} from 'react'

const initialCaptcha = {
  left: 4,
  right: 7,
  answer: 11,
}

type ContactFormProps = {
  buttonText?: string
  className?: string
  id?: string
  showCaptcha?: boolean
  submitClassName?: string
  commentLabel?: string
  commentPlaceholder?: string
}

export default function ContactForm({
  buttonText = 'Оставить заявку',
  className = 'contactForm',
  id,
  showCaptcha = false,
  submitClassName = 'btnPrimary formSubmit',
  commentLabel = 'Комментарий',
  commentPlaceholder = 'Комментарий',
}: ContactFormProps) {
  const [captchaValue, setCaptchaValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const normalizedCaptchaValue = captchaValue.trim()
  const captchaNumber = Number(normalizedCaptchaValue)
  const hasCaptchaValue = normalizedCaptchaValue.length > 0
  const isCaptchaValid =
    !showCaptcha ||
    (hasCaptchaValue && Number.isFinite(captchaNumber) && captchaNumber === initialCaptcha.answer)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const phone = String(formData.get('phone') || '').trim()

    if (!phone || !isCaptchaValid) {
      setStatus('error')
      return
    }

    event.currentTarget.reset()
    setCaptchaValue('')
    setStatus('success')
  }

  return (
    <form
      className={className}
      id={id}
      onSubmit={handleSubmit}
      onChange={() => {
        if (status !== 'idle') {
          setStatus('idle')
        }
      }}
    >
      <label className="formField">
        <span>Имя</span>
        <input type="text" name="name" placeholder="Имя" />
      </label>

      <label className="formField">
        <span>Телефон</span>
        <input type="tel" name="phone" placeholder="Телефон" />
      </label>

      <label className="formField">
        <span>{commentLabel}</span>
        <textarea name="comment" rows={5} placeholder={commentPlaceholder} />
      </label>

      {showCaptcha ? (
        <>
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
              onChange={(event) => {
                setCaptchaValue(event.target.value)
                setStatus('idle')
              }}
              aria-invalid={hasCaptchaValue && !isCaptchaValid}
            />
          </label>
          {hasCaptchaValue && !isCaptchaValid ? (
            <p className="formHint formHintError">Ответ не совпадает</p>
          ) : null}
        </>
      ) : null}

      {status === 'success' ? (
        <p className="formHint formHintSuccess">Спасибо, заявка отправлена. Мы свяжемся с вами.</p>
      ) : null}
      {status === 'error' ? (
        <p className="formHint formHintError">Проверьте поля формы и попробуйте еще раз.</p>
      ) : null}

      <button type="submit" className={submitClassName} disabled={!isCaptchaValid}>
        {buttonText}
      </button>
    </form>
  )
}
