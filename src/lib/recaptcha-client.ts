'use client'

import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY, NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED } from '@/lib/env'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
      enterprise?: {
        ready: (cb: () => void) => void
        execute: (siteKey: string, opts: { action: string }) => Promise<string>
      }
    }
  }
}

/**
 * Loads reCAPTCHA v3 script (standard or enterprise) once and caches it.
 */
export async function loadRecaptchaV3(): Promise<void> {
  const siteKey = NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  if (!siteKey) {
    throw new Error('Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY for reCAPTCHA v3')
  }

  const enterprise = (NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED || '').toLowerCase() === 'true'
  const base = enterprise
    ? 'https://www.google.com/recaptcha/enterprise.js'
    : 'https://www.google.com/recaptcha/api.js'

  // already present?
  const present = Array.from(document.scripts).some((s) => s.src?.startsWith(base))
  if (!present) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `${base}?render=${encodeURIComponent(siteKey)}`
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load reCAPTCHA v3 script'))
      document.head.appendChild(script)
    })
  } else {
    // ensure grecaptcha is ready if already loaded
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
  }
}

/**
 * Executes reCAPTCHA v3 for a given action and returns a token.
 * Docs: https://developers.google.com/recaptcha/docs/v3
 */
export async function executeRecaptcha(action: string): Promise<string> {
  const siteKey = NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  if (!siteKey) {
    throw new Error('Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY for reCAPTCHA v3')
  }
  await loadRecaptchaV3()

  const enterprise = (NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED || '').toLowerCase() === 'true'
  const gre = window.grecaptcha
  if (!gre) throw new Error('grecaptcha not available')

  // Wait for ready
  await new Promise<void>((resolve) => {
    const ready = enterprise && gre.enterprise?.ready ? gre.enterprise.ready : gre.ready
    if (typeof ready === 'function') {
      ready(() => resolve())
    } else {
      resolve()
    }
  })

  const exec = enterprise && gre.enterprise?.execute ? gre.enterprise.execute : gre.execute
  return exec(siteKey, { action })
}
