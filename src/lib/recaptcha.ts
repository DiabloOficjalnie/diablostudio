import { RECAPTCHA_SECRET_KEY, NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED } from '@/lib/env'
import { verifyReCaptchaEnterprise, isEnterpriseConfigured } from '@/lib/recaptcha-enterprise'

export type RecaptchaVerifyResult = {
  success: boolean
  'error-codes'?: string[]
  action?: string
  hostname?: string
  challenge_ts?: string
  score?: number
}

/**
 * Verify Google reCAPTCHA token server-side
 * @param token token received from the reCAPTCHA widget
 * @param ip optional user IP (helps Google risk assessment). Use CF-Connecting-IP/X-Forwarded-For if available.
 */
export async function verifyReCaptcha(token: string | undefined | null, ip?: string | null): Promise<RecaptchaVerifyResult> {
  if (!token) {
    return { success: false, 'error-codes': ['missing-input-response'] }
  }
  if (!RECAPTCHA_SECRET_KEY) {
    // In dev, allow pass-through if no secret configured (avoid hard failing local)
    if (process.env.NODE_ENV !== 'production') {
      return { success: true }
    }
    return { success: false, 'error-codes': ['missing-secret-key'] }
  }

  try {
    const form = new URLSearchParams()
    form.append('secret', RECAPTCHA_SECRET_KEY)
    form.append('response', token)
    if (ip) form.append('remoteip', ip)

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    })

    if (!res.ok) {
      return { success: false, 'error-codes': ['bad-gateway'] }
    }

    const data = (await res.json()) as RecaptchaVerifyResult
    return data
  } catch (e) {
    return { success: false, 'error-codes': ['network-error'] }
  }
}

/**
 * Unified verification that prefers reCAPTCHA Enterprise when configured and enabled.
 * Optionally checks action when Enterprise is used.
 */
export async function verifyCaptcha(
  token: string | undefined | null,
  ip?: string | null,
  action?: string
): Promise<RecaptchaVerifyResult> {
  try {
    if (isEnterpriseConfigured() && (NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED || '').toLowerCase() === 'true') {
      const res = await verifyReCaptchaEnterprise(token, action)
      if (!res.success) {
        return { success: false, 'error-codes': [res.error || 'enterprise-failed'], action: res.action, score: res.score }
      }
      return { success: true, action: res.action, score: res.score }
    }
  } catch {
    // fall through to standard verification
  }
  return verifyReCaptcha(token, ip)
}

/**
 * Best-effort extraction of client IP from NextRequest headers
 */
export function extractClientIp(headers: Headers): string | null {
  const cfIp = headers.get('CF-Connecting-IP')
  if (cfIp) return cfIp
  const xff = headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp
  return null
}
