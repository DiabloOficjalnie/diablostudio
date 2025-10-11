'use client'

import { useEffect } from 'react'

type Props = {
  siteKey?: string
  onVerify?: (token: string) => void
  onError?: (err?: any) => void
  theme?: 'light' | 'dark'
  size?: 'normal' | 'compact'
  className?: string
}

/**
 * Deprecated: This project now uses reCAPTCHA v3 programmatic execution via executeRecaptcha(action).
 * This placeholder remains only to avoid import errors if any stale references exist.
 * It renders nothing and does not declare any global grecaptcha types to avoid TS conflicts.
 */
export default function ReCaptchaWidget(_props: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('ReCaptchaWidget is deprecated. Use executeRecaptcha(action) from src/lib/recaptcha-client.ts instead.')
    }
  }, [])
  return null
}
