'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

/**
 * GoogleTagManagerReporter
 * - Pushes page_view events to dataLayer on App Router navigations for GTM.
 * - Use when NEXT_PUBLIC_GTM_ID is configured. GA pageviews should be handled inside GTM.
 */
export default function GoogleTagManagerReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GTM_ID) return;
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;

    const urlPath = pathname || '/';
    const query = searchParams?.toString();
    const page_path = query ? `${urlPath}?${query}` : urlPath;

    const push = () => {
      if (!Array.isArray(window.dataLayer)) return false;
      window.dataLayer.push({
        event: 'page_view',
        page_title: document.title,
        page_path,
        page_location: window.location.href,
      });
      return true;
    };

    let sent = push();
    let interval: number | undefined;

    // Retry for up to 5s until dataLayer is ready (handles race on first load)
    if (!sent) {
      interval = window.setInterval(() => {
        sent = push();
        if (sent && interval) {
          clearInterval(interval);
        }
      }, 500);

      window.setTimeout(() => {
        if (interval) clearInterval(interval);
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pathname, searchParams]);

  return null;
}
