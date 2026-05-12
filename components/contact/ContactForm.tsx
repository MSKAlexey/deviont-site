'use client'

import {useState} from 'react'
import type {FormEvent} from 'react'

type CaptchaMode = 'none' | 'math'

type MathCaptcha = {
  left: number
  right: number
  answer: number
}

type ContactFormProps = {
  buttonText?: string
  captchaMode?: CaptchaMode
  className?: string
  generateCaptchaOnMount?: boolean
  id?: string
  showCaptcha?: boolean
  submitClassName?: string
  commentLabel?: string
  commentPlaceholder?: string
}

const captchaErrorMessage = 'Проверьте ответ на проверочный вопрос.'
const genericErrorMessage = 'Проверьте поля формы и попробуйте еще раз.'
const successMessage = 'Спасибо, заявка отправлена. Мы свяжемся с вами.'
const initialMathCaptcha = {
  left: 4,
  right: 7,
  answer: 11,
}

function createMathCaptcha(): MathCaptcha {
  const left = Math.floor(Math.random() * 7) + 2
  const right = Math.floor(Math.random() * 7) + 2

  return {
    left,
    right,
    answer: left + right,
  }
}

export default function ContactForm({
  buttonText = 'Оставить заявку',
  captchaMode: providedCaptchaMode = 'none',
  className = 'contactForm',
  generateCaptchaOnMount = false,
  id,
  showCaptcha = false,
  submitClassName = 'btnPrimary formSubmit',
  commentLabel = 'Комментарий',
  commentPlaceholder = 'Комментарий',
}: ContactFormProps) {
  const captchaMode = showCaptcha ? 'math' : providedCaptchaMode
  const [captcha, setCaptcha] = useState(() =>
    generateCaptchaOnMount ? createMathCaptcha() : initialMathCaptcha
  )
  const [captchaValue, setCaptchaValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const normalizedCaptchaValue = captchaValue.trim()
  const captchaNumber = Number(normalizedCaptchaValue)
  const hasCaptchaValue = normalizedCaptchaValue.length > 0
  const isCaptchaValid =
    captchaMode !== 'math' ||
    (hasCaptchaValue && Number.isFinite(captchaNumber) && captchaNumber === captcha.answer)

  function resetCaptcha() {
    setCaptcha(createMathCaptcha())
    setCaptchaValue('')
  }

  function showError(message: string) {
    setStatus('error')
    setStatusMessage(message)
  }

  function showSuccess() {
    setStatus('success')
    setStatusMessage(successMessage)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const phone = String(formData.get('phone') || '').trim()

    if (!phone) {
      showError(genericErrorMessage)
      return
    }

    if (!isCaptchaValid) {
      showError(captchaErrorMessage)
      return
    }

    form.reset()
    resetCaptcha()
    showSuccess()
  }

  return (
    <form
      className={className}
      id={id}
      onSubmit={handleSubmit}
      onChange={() => {
        if (status !== 'idle') {
          setStatus('idle')
          setStatusMessage('')
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

      {captchaMode === 'math' ? (
        <>
          <label className="formField captchaField">
            <span>Проверочный вопрос: сколько будет {captcha.left} + {captcha.right}?</span>
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
                setStatusMessage('')
              }}
              aria-invalid={hasCaptchaValue && !isCaptchaValid}
            />
          </label>
          {hasCaptchaValue && !isCaptchaValid ? (
            <p className="formHint formHintError">{captchaErrorMessage}</p>
          ) : null}
        </>
      ) : null}

      {status === 'success' ? (
        <p className="formHint formHintSuccess">{statusMessage || successMessage}</p>
      ) : null}
      {status === 'error' ? (
        <p className="formHint formHintError">{statusMessage || genericErrorMessage}</p>
      ) : null}

      <button type="submit" className={submitClassName}>
        {buttonText}
      </button>
    </form>
  )
}
