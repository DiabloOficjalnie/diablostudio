'use client'

import { useEffect, useId, useRef } from 'react'
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY, NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED } from '@/lib/env'

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string
          theme?: 'light' | 'dark'
          size?: 'normal' | 'compact'
          callback?: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
        }
      ) => number
      reset: (opt_widget_id?: number) => void
      getResponse: (opt_widget_id?: number) => string
      ready?: (cb: () => void) => void
      enterprise?: {
        render: (
          container: HTMLElement | string,
          parameters: {
            sitekey: string
            theme?: 'light' | 'dark'
            size?: 'normal' | 'compact'
            callback?: (token: string) => void
            'error-callback'?: () => void
            'expired-callback'?: () => void
          }
        ) => number
        reset: (opt_widget_id?: number) => void
        getResponse: (opt_widget_id?: number) => string
        ready?: (cb: () => void) => void
      }
    }
  }
}

type Props = {
  siteKey?: string
  onVerify: (token: string) => void
  onError?: (err?: any) => void
  theme?: 'light' | 'dark'
  size?: 'normal' | 'compact'
  className?: string
}

export default function ReCaptchaWidget({
  siteKey = '',
  onVerify,
  onError,
  theme = 'light',
  size = 'normal',
  className = '',
}: Props) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<number | null>(null)
  const resolvedSiteKey = siteKey || NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''
  const enterpriseEnabled = (NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_ENABLED || '').toLowerCase() === 'true'

  useEffect(() => {
    if (!resolvedSiteKey) {
      console.warn('reCAPTCHA: missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY (and no siteKey prop provided).')
      return
    }

    // Inject script once
    const SCRIPT_SRC = enterpriseEnabled
      ? 'https://www.google.com/recaptcha/enterprise.js'
      : 'https://www.google.com/recaptcha/api.js'
    const present = Array.from(document.scripts).some((s) => s.src?.startsWith(SCRIPT_SRC))
    if (!present) {
      const script = document.createElement('script')
      script.src = `${SCRIPT_SRC}?render=explicit`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    let rendered = false
    const tryRender = () => {
      if (rendered) return
      if (!window.grecaptcha || !containerRef.current) {
        requestAnimationFrame(tryRender)
        return
      }

      try {
        const renderNow = () => {
          if (!containerRef.current) return
          // If already rendered, skip
          if (typeof widgetIdRef.current === 'number') return

          const renderFn =
            enterpriseEnabled && window.grecaptcha?.enterprise
              ? window.grecaptcha.enterprise.render
              : window.grecaptcha!.render

          widgetIdRef.current = renderFn(containerRef.current, {
            sitekey: resolvedSiteKey,
            theme,
            size,
            callback: (token: string) => onVerify(token),
            'error-callback': () => onError?.(),
            'expired-callback': () => onError?.(new Error('expired')),
          })
          rendered = true
        }

        if (typeof window.grecaptcha.ready === 'function') {
          window.grecaptcha.ready(renderNow)
        } else {
          renderNow()
        }
      } catch (e) {
        onError?.(e)
      }
    }

    tryRender()

    return () => {
      // best-effort cleanup
      try {
        if (typeof widgetIdRef.current === 'number' && window.grecaptcha) {
          window.grecaptcha.reset(widgetIdRef.current)
        }
      } catch {}
    }
  }, [siteKey, theme, size, onVerify, onError])

  return (
    <div
      id={`recaptcha-${id}`}
      ref={containerRef}
      className={className}
      data-testid="recaptcha-container"
    />
  )
}
