import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID } from '@/lib/env';
import { verifyReCaptcha, extractClientIp } from '@/lib/recaptcha';

export async function POST(req: NextRequest) {
  try {
    const { email, first_name, source, utm_source, utm_medium, utm_campaign, recaptchaToken } = await req.json();

    // Basic validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Verify Cloudflare Turnstile (anti-bot)
    const ip = extractClientIp(req.headers)
    const captcha = await verifyReCaptcha(recaptchaToken, ip)
    if (!captcha.success) {
      return NextResponse.json(
        { error: 'Weryfikacja antybot nie powiodła się', details: captcha['error-codes'] || [] },
        { status: 400 }
      )
    }

    // Beehiiv integration (v2)
    const publicationId = BEEHIIV_PUBLICATION_ID || 'pub_e22a5655-6655-43e5-a9c9-0dc17bc551f7';
    if (!BEEHIIV_API_KEY) {
      console.warn('BEEHIIV_API_KEY not set. Proceeding without remote subscription (dev fallback).');
    }

    let beehiivOk = false;
    let beehiivMessage = 'Zapisano do newslettera. Dziękujemy!';

    if (BEEHIIV_API_KEY && publicationId) {
      const payload: Record<string, any> = {
        email,
        reactivate_existing: true,
        send_welcome_email: true, // zgodnie z wymaganiem
      };
      if (utm_source) payload.utm_source = utm_source;
      if (utm_medium) payload.utm_medium = utm_medium;
      if (utm_campaign) payload.utm_campaign = utm_campaign;
      // Beehiiv v2 subscriptions API nie ma jawnego pola imienia w dokumentacji,
      // więc przekażemy je w referral_source, aby nie powodować 400.
      const referralCombined =
        first_name && source ? `${source}|first_name=${String(first_name).trim().slice(0, 100)}` :
        first_name ? `first_name=${String(first_name).trim().slice(0, 100)}` :
        source || undefined
      if (referralCombined) payload.referral_source = referralCombined;

      const res = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': BEEHIIV_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        beehiivOk = true;
      } else {
        // Try to parse error
        let details = '';
        try {
          const errJson = await res.json();
          details = errJson?.message || JSON.stringify(errJson);
        } catch {
          details = res.statusText;
        }

        // Treat conflict/already subscribed as success UX-wise
        if (res.status === 409 || (typeof details === 'string' && /exists|already/i.test(details))) {
          beehiivOk = true;
          beehiivMessage = 'Jesteś już zapisany/a. Dziękujemy!';
        } else {
          console.error('Beehiiv subscription error:', res.status, details);
          return NextResponse.json(
            { error: 'Błąd połączenia z systemem newslettera, spróbuj ponownie później.' },
            { status: 502 }
          );
        }
      }
    }

    // Optional local store (best-effort, do not fail request on error)
    try {
      const supabase = createAdminClient();
      await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          // jeśli tabela ma kolumnę first_name, wartość się zapisze; jeśli nie – blok try/catch przechwyci błąd
          first_name: first_name || null,
          source: source || null,
          created_at: new Date().toISOString(),
        });
    } catch (dbErr: any) {
      console.warn('Newsletter local insert warning:', dbErr?.message || dbErr);
    }

    return NextResponse.json({ success: true, message: beehiivMessage });
  } catch (e: any) {
    console.error('Newsletter POST error:', e?.message || e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
