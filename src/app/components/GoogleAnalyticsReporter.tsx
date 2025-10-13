'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * GoogleAnalyticsReporter
 * - Sends GA4 page_view events on App Router client-side navigations.
 * - Pair this with GA init in layout.tsx where send_page_view is disabled to prevent double counting.
 */
export default function GoogleAnalyticsReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;

    const urlPath = pathname || '/';
    const query = searchParams?.toString();
    const page_path = query ? `${urlPath}?${query}` : urlPath;

    const send = () => {
      if (typeof window.gtag !== 'function') return false;
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_path,
        page_location: window.location.href,
      });
      return true;
    };

    let sent = send();
    let interval: number | undefined;

    // Retry for up to 5s until gtag is ready (handles race on first load)
    if (!sent) {
      interval = window.setInterval(() => {
        sent = send();
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
