'use client'

import { useEffect, useId, useRef } from 'react'
import { NEXT_PUBLIC_TURNSTILE_SITE_KEY } from '@/lib/env'

declare global {
  interface Window {
    turnstile?: {
      render: (selectorOrElement: string | HTMLElement, options?: any) => void
      reset: (widgetId?: string | HTMLElement) => void
      remove: (widgetId?: string | HTMLElement) => void
    }
  }
}

type Props = {
  siteKey?: string
  onVerify: (token: string) => void
  onError?: (err?: any) => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact' | 'flexible'
  className?: string
}

export default function TurnstileWidget({
  siteKey = '',
  onVerify,
  onError,
  theme = 'auto',
  size = 'normal',
  className = '',
}: Props) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const resolvedSiteKey = siteKey || NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

  useEffect(() => {
    // Guard: need site key
    if (!resolvedSiteKey) {
      console.warn('Turnstile: missing NEXT_PUBLIC_TURNSTILE_SITE_KEY (and no siteKey prop provided).')
      return
    }

    // Inject script once
    const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
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
      if (!window.turnstile || !containerRef.current) {
        // try again on next frame
        requestAnimationFrame(tryRender)
        return
      }
      try {
        window.turnstile.render(containerRef.current, {
          sitekey: resolvedSiteKey,
          theme,
          size,
          callback: (token: string) => onVerify(token),
          'error-callback': () => onError?.(),
          'expired-callback': () => onError?.(new Error('expired')),
          'timeout-callback': () => onError?.(new Error('timeout')),
        })
        rendered = true
      } catch (e) {
        onError?.(e)
      }
    }

    tryRender()

    return () => {
      // best-effort cleanup
      try {
        if (containerRef.current && window.turnstile) {
          window.turnstile.remove(containerRef.current)
        }
      } catch {}
    }
  }, [siteKey, theme, size, onVerify, onError])

  // container div for rendering widget
  return (
    <div
      id={`turnstile-${id}`}
      ref={containerRef}
      className={className}
      data-testid="turnstile-container"
    />
  )
}
