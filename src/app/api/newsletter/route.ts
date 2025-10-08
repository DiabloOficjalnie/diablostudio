import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Attempt to insert subscription. If the table doesn't exist yet, respond Accepted.
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Newsletter insert error (table may not exist yet):', error.message);
      return NextResponse.json(
        { success: true, message: 'Zapis przyjęty. Dziękujemy! (konfiguracja w toku)' },
        { status: 202 }
      );
    }

    return NextResponse.json({ success: true, message: 'Zapisano do newslettera. Dziękujemy!' });
  } catch (e: any) {
    console.error('Newsletter POST error:', e?.message || e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
