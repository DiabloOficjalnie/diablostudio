import { TURNSTILE_SECRET_KEY } from '@/lib/env'

export type TurnstileVerifyResult = {
  success: boolean
  'error-codes'?: string[]
  action?: string
  cdata?: string
}

/**
 * Verify Cloudflare Turnstile token server-side
 * @param token token received from the Turnstile widget
 * @param ip optional user IP (helps CF risk assessment). Use CF-Connecting-IP/X-Forwarded-For if available.
 */
export async function verifyTurnstile(token: string | undefined | null, ip?: string | null): Promise<TurnstileVerifyResult> {
  if (!token) {
    return { success: false, 'error-codes': ['missing-input-response'] }
  }
  if (!TURNSTILE_SECRET_KEY) {
    // In dev, allow pass-through if no secret configured (avoid hard failing local)
    if (process.env.NODE_ENV !== 'production') {
      return { success: true }
    }
    return { success: false, 'error-codes': ['missing-secret-key'] }
  }

  try {
    const form = new URLSearchParams()
    form.append('secret', TURNSTILE_SECRET_KEY)
    form.append('response', token)
    if (ip) form.append('remoteip', ip)

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    })

    if (!res.ok) {
      return { success: false, 'error-codes': ['bad-gateway'] }
    }

    const data = (await res.json()) as TurnstileVerifyResult
    return data
  } catch (e) {
    return { success: false, 'error-codes': ['network-error'] }
  }
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
