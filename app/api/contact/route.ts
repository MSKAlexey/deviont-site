import {NextResponse} from 'next/server'

const captchaErrorMessage = 'Подтвердите, что вы не робот.'
const genericErrorMessage = 'Проверьте поля формы и попробуйте еще раз.'
const smartCaptchaValidateUrl = 'https://smartcaptcha.cloud.yandex.ru/validate'

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || ''
  }

  return request.headers.get('x-real-ip') || ''
}

async function verifySmartCaptcha(token: string, ip: string) {
  const secret = process.env.YANDEX_SMARTCAPTCHA_SECRET_KEY
  const isProduction = process.env.NODE_ENV === 'production'

  if (!secret) {
    if (isProduction) {
      return false
    }

    console.warn('YANDEX_SMARTCAPTCHA_SECRET_KEY is not configured.')
    return true
  }

  if (!token) {
    return false
  }

  const body = new URLSearchParams({
    secret,
    token,
  })

  if (ip) {
    body.set('ip', ip)
  }

  try {
    const response = await fetch(smartCaptchaValidateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error(`SmartCaptcha validation failed with HTTP ${response.status}.`)
      return false
    }

    const result = await response.json()

    return result?.status === 'ok'
  } catch (error) {
    console.error(error)
    return false
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ok: false, error: genericErrorMessage}, {status: 400})
  }

  const data = payload as {
    name?: unknown
    phone?: unknown
    comment?: unknown
    smartCaptchaToken?: unknown
  }
  const phone = typeof data.phone === 'string' ? data.phone.trim() : ''
  const smartCaptchaToken =
    typeof data.smartCaptchaToken === 'string' ? data.smartCaptchaToken.trim() : ''

  if (!phone) {
    return NextResponse.json({ok: false, error: genericErrorMessage}, {status: 400})
  }

  const isCaptchaValid = await verifySmartCaptcha(smartCaptchaToken, getRequestIp(request))

  if (!isCaptchaValid) {
    return NextResponse.json({ok: false, error: captchaErrorMessage}, {status: 400})
  }

  return NextResponse.json({ok: true})
}
