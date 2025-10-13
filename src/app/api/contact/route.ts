import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase-server';
import { ensureUUID } from '@/lib/id';
import { verifyCaptcha, extractClientIp } from '@/lib/recaptcha';

type ContactPayload = {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  marketingConsent?: boolean;
  phoneConsent?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    // Optional auth – formularz kontaktowy może być anonimowy
    const { userId } = await auth().catch(() => ({ userId: null as string | null }));

    const body = (await req.json().catch(() => ({}))) as Partial<ContactPayload> & { recaptchaToken?: string };

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();
    const phone = body.phone ? String(body.phone).trim() : null;
    const marketingConsent = Boolean(body.marketingConsent);
    const phoneConsent = Boolean(body.phoneConsent);

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Wymagane pola: imię i nazwisko, e-mail, temat, wiadomość.' },
        { status: 400 }
      );
    }

    // Anti-bot verification (reCAPTCHA / Enterprise fallback)
    try {
      const ip = extractClientIp(req.headers)
      const captcha = await verifyCaptcha(body.recaptchaToken, ip, 'contact_form')
      if (!captcha.success) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Captcha verification failed (dev bypass):', captcha)
        } else {
          return NextResponse.json(
            { success: false, error: 'Weryfikacja antybot nie powiodła się.' },
            { status: 400 }
          )
        }
      }
    } catch (e: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Captcha verification error (dev bypass):', e?.message || e)
      } else {
        return NextResponse.json(
          { success: false, error: 'Weryfikacja antybot nie powiodła się.' },
          { status: 400 }
        )
      }
    }

    const supabase = createAdminClient();

    // Insert kontaktu (graceful fallback jeśli tabela nie istnieje)
    const insertPayload: any = {
      name,
      email,
      phone,
      subject,
      message,
      marketing_consent: marketingConsent,
      phone_consent: phoneConsent,
      created_at: new Date().toISOString(),
    };

    if (userId) {
      insertPayload.client_id = ensureUUID(userId);
    }

    let contactId: string | null = null;

    const { data, error } = await supabase
      .from('contact_messages')
      .insert(insertPayload)
      .select('id')
      .single();

    if (error) {
      // Graceful fallback jeśli schemat/tabela/kolumna brakują
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('relation') || msg.includes('table') || msg.includes('column')) {
        // Spróbuj zapisać chociaż event dla zalogowanego klienta
        if (userId) {
          try {
            await supabase.from('client_events').insert({
              client_id: ensureUUID(userId),
              type: 'contact_message',
              details: {
                name,
                email,
                phone,
                subject,
                // nie logujemy pełnej treści wiadomości dla prywatności
                has_message: Boolean(message && message.length > 0),
                marketing_consent: marketingConsent,
                phone_consent: phoneConsent,
              },
              created_at: new Date().toISOString(),
            });
          } catch {
            // no-op
          }
        }
        return NextResponse.json(
          { success: true, note: 'Kontakt zapisany (soft) — brak tabeli contact_messages. Zdarzenie klienta zarejestrowane (jeśli zalogowany).' },
          { status: 200 }
        );
      }
      // Inny błąd – zwróć jako 500
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } else {
      contactId = (data as any)?.id || null;
    }

    // Zaloguj zdarzenie w panelu klienta (jeśli zalogowany)
    if (userId) {
      try {
        await supabase.from('client_events').insert({
          client_id: ensureUUID(userId),
          type: 'contact_message',
          details: {
            id: contactId,
            subject,
            has_message: Boolean(message && message.length > 0),
          },
          created_at: new Date().toISOString(),
        });
      } catch {
        // no-op
      }
    }

    return NextResponse.json(
      { success: true, id: contactId, message: 'Dziękujemy! Skontaktujemy się w ciągu 24 godzin.' },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
