'use client'

import {useEffect, useRef, useState} from 'react'

type SmartCaptchaApi = {
  render: (
    container: HTMLElement | string,
    params: {
      sitekey: string
      callback?: (token: string) => void
      hl?: 'ru' | 'en'
    }
  ) => number
  reset: (widgetId?: number) => void
  destroy: (widgetId?: number) => void
}

declare global {
  interface Window {
    smartCaptcha?: SmartCaptchaApi
    __deviontSmartCaptchaOnload?: () => void
    __deviontSmartCaptchaPromise?: Promise<void>
  }
}

const smartCaptchaScriptSrc =
  'https://smartcaptcha.cloud.yandex.ru/captcha.js?render=onload&onload=__deviontSmartCaptchaOnload'

function loadSmartCaptchaScript() {
  if (window.smartCaptcha) {
    return Promise.resolve()
  }

  if (window.__deviontSmartCaptchaPromise) {
    return window.__deviontSmartCaptchaPromise
  }

  window.__deviontSmartCaptchaPromise = new Promise<void>((resolve, reject) => {
    window.__deviontSmartCaptchaOnload = () => resolve()

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-deviont-smartcaptcha]'
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), {once: true})
      existingScript.addEventListener('error', () => reject(new Error('SmartCaptcha load failed')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = smartCaptchaScriptSrc
    script.async = true
    script.defer = true
    script.dataset.deviontSmartcaptcha = 'true'
    script.onerror = () => reject(new Error('SmartCaptcha load failed'))
    document.head.appendChild(script)
  })

  return window.__deviontSmartCaptchaPromise
}

type YandexSmartCaptchaProps = {
  onTokenChange: (token: string) => void
  resetKey: number
}

export default function YandexSmartCaptcha({
  onTokenChange,
  resetKey,
}: YandexSmartCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const siteKey = process.env.NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_SITE_KEY || ''

  useEffect(() => {
    if (!siteKey) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_SITE_KEY is not configured.')
      }
      return
    }

    let isMounted = true

    loadSmartCaptchaScript()
      .then(() => {
        if (!isMounted || !containerRef.current || !window.smartCaptcha) {
          return
        }

        widgetIdRef.current = window.smartCaptcha.render(containerRef.current, {
          sitekey: siteKey,
          hl: 'ru',
          callback: (token) => {
            onTokenChange(token)
          },
        })
      })
      .catch((error) => {
        if (isMounted) {
          setLoadFailed(true)
          onTokenChange('')
        }
        console.error(error)
      })

    return () => {
      isMounted = false

      if (widgetIdRef.current !== null && window.smartCaptcha) {
        window.smartCaptcha.destroy(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [onTokenChange, siteKey])

  useEffect(() => {
    if (widgetIdRef.current !== null && window.smartCaptcha) {
      window.smartCaptcha.reset(widgetIdRef.current)
      onTokenChange('')
    }
  }, [onTokenChange, resetKey])

  if (!siteKey && process.env.NODE_ENV === 'production') {
    return <p className="formHint formHintError">Подтвердите, что вы не робот.</p>
  }

  if (!siteKey) {
    return (
      <p className="formHint">
        SmartCaptcha не настроена для локальной разработки.
      </p>
    )
  }

  if (loadFailed) {
    return <p className="formHint formHintError">Подтвердите, что вы не робот.</p>
  }

  return <div ref={containerRef} className="smartCaptchaBox" />
}
