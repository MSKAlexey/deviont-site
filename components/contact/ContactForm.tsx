'use client'

import {useCallback, useState} from 'react'
import type {FormEvent} from 'react'
import YandexSmartCaptcha from './YandexSmartCaptcha'

const initialCaptcha = {
  left: 4,
  right: 7,
  answer: 11,
}

type CaptchaMode = 'none' | 'math' | 'smart'

type ContactFormProps = {
  buttonText?: string
  captchaMode?: CaptchaMode
  className?: string
  id?: string
  showCaptcha?: boolean
  submitClassName?: string
  commentLabel?: string
  commentPlaceholder?: string
}

const captchaErrorMessage = 'Подтвердите, что вы не робот.'
const genericErrorMessage = 'Проверьте поля формы и попробуйте еще раз.'
const successMessage = 'Спасибо, заявка отправлена. Мы свяжемся с вами.'

export default function ContactForm({
  buttonText = 'Оставить заявку',
  captchaMode: providedCaptchaMode = 'none',
  className = 'contactForm',
  id,
  showCaptcha = false,
  submitClassName = 'btnPrimary formSubmit',
  commentLabel = 'Комментарий',
  commentPlaceholder = 'Комментарий',
}: ContactFormProps) {
  const captchaMode = showCaptcha ? 'math' : providedCaptchaMode
  const [captchaValue, setCaptchaValue] = useState('')
  const [smartCaptchaToken, setSmartCaptchaToken] = useState('')
  const [smartCaptchaResetKey, setSmartCaptchaResetKey] = useState(0)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const normalizedCaptchaValue = captchaValue.trim()
  const captchaNumber = Number(normalizedCaptchaValue)
  const hasCaptchaValue = normalizedCaptchaValue.length > 0
  const isMathCaptchaValid =
    captchaMode !== 'math' ||
    (hasCaptchaValue && Number.isFinite(captchaNumber) && captchaNumber === initialCaptcha.answer)
  const siteKey = process.env.NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_SITE_KEY || ''
  const isSmartCaptchaRequired =
    captchaMode === 'smart' && (Boolean(siteKey) || process.env.NODE_ENV === 'production')

  const resetSmartCaptcha = useCallback(() => {
    setSmartCaptchaToken('')
    setSmartCaptchaResetKey((value) => value + 1)
  }, [])

  const handleSmartCaptchaToken = useCallback((token: string) => {
    setSmartCaptchaToken(token)
    setStatus('idle')
    setStatusMessage('')
  }, [])

  function showError(message: string) {
    setStatus('error')
    setStatusMessage(message)
  }

  function showSuccess() {
    setStatus('success')
    setStatusMessage(successMessage)
  }

  async function submitSmartCaptchaForm(form: HTMLFormElement, formData: FormData) {
    if (isSmartCaptchaRequired && !smartCaptchaToken) {
      showError(captchaErrorMessage)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: String(formData.get('name') || '').trim(),
          phone: String(formData.get('phone') || '').trim(),
          comment: String(formData.get('comment') || '').trim(),
          smartCaptchaToken,
        }),
      })
      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.ok) {
        showError(result?.error || genericErrorMessage)
        resetSmartCaptcha()
        return
      }

      form.reset()
      resetSmartCaptcha()
      showSuccess()
    } catch (error) {
      console.error(error)
      showError(genericErrorMessage)
      resetSmartCaptcha()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const phone = String(formData.get('phone') || '').trim()

    if (!phone) {
      showError(genericErrorMessage)
      return
    }

    if (!isMathCaptchaValid) {
      showError(genericErrorMessage)
      return
    }

    if (captchaMode === 'smart') {
      await submitSmartCaptchaForm(form, formData)
      return
    }

    form.reset()
    setCaptchaValue('')
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
                setStatusMessage('')
              }}
              aria-invalid={hasCaptchaValue && !isMathCaptchaValid}
            />
          </label>
          {hasCaptchaValue && !isMathCaptchaValid ? (
            <p className="formHint formHintError">Ответ не совпадает</p>
          ) : null}
        </>
      ) : null}

      {captchaMode === 'smart' ? (
        <div className="smartCaptchaField">
          <YandexSmartCaptcha
            onTokenChange={handleSmartCaptchaToken}
            resetKey={smartCaptchaResetKey}
          />
          <input type="hidden" name="smartCaptchaToken" value={smartCaptchaToken} />
        </div>
      ) : null}

      {status === 'success' ? (
        <p className="formHint formHintSuccess">{statusMessage || successMessage}</p>
      ) : null}
      {status === 'error' ? (
        <p className="formHint formHintError">{statusMessage || genericErrorMessage}</p>
      ) : null}

      <button
        type="submit"
        className={submitClassName}
        disabled={isSubmitting || (captchaMode === 'math' && !isMathCaptchaValid)}
      >
        {isSubmitting ? 'Отправляем...' : buttonText}
      </button>
    </form>
  )
}
