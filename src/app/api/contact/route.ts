import { NextRequest, NextResponse } from 'next/server'
import { verifyCaptcha, extractClientIp } from '@/lib/recaptcha'
import { notificationManager } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      name,
      email,
      phone,
      project_type,
      message,
      recaptchaToken,
    } = body as {
      name?: string
      email?: string
      phone?: string
      project_type?: string
      message?: string
      recaptchaToken?: string
    }

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Podaj poprawne imię i nazwisko' }, { status: 400 })
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Podaj poprawny adres e-mail' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Nieprawidłowy format adresu e-mail' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Wiadomość jest za krótka' }, { status: 400 })
    }

    // Verify reCAPTCHA (Enterprise if configured)
    const ip = extractClientIp(req.headers)
    const captcha = await verifyCaptcha(recaptchaToken, ip, 'contact')
    if (!captcha.success) {
      return NextResponse.json(
        { error: 'Weryfikacja antybot nie powiodła się', details: captcha['error-codes'] || [] },
        { status: 400 }
      )
    }

    // Send notification to admin (email channel simulated by NotificationManager)
    try {
      await notificationManager.createNotification(
        'consultation_new',
        'Nowa wiadomość z formularza kontaktowego',
        `Klient ${name} wysłał wiadomość przez formularz kontaktowy.`,
        ['admin@diablostudio.pl'],
        ['email'],
        {
          customer_name: name,
          customer_email: email,
          customer_phone: phone || '',
          project_type: project_type || 'Nieokreślony',
          project_description: message,
          priority: 'normal',
        },
        'medium'
      )
    } catch (e) {
      // Do not fail the request if notifications fail
      console.warn('Contact notification warning:', (e as any)?.message || e)
    }

    return NextResponse.json({
      success: true,
      message: 'Dziękujemy za wiadomość! Skontaktujemy się z Tobą w ciągu 24 godzin.',
    })
  } catch (e: any) {
    console.error('Contact POST error:', e?.message || e)
    return NextResponse.json({ error: 'Wewnętrzny błąd serwera' }, { status: 500 })
  }
}
