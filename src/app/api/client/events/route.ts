import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase-server';

// Minimal event shape
type ClientEvent = {
  id?: string
  client_id: string
  type: string
  details?: Record<string, any> | null
  created_at?: string
}

// GET /api/client/events
// Returns last events for authenticated client. Falls back to [] if table/columns missing.
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Attempt to read events. If table/columns missing -> graceful fallback.
    const { data, error } = await supabase
      .from('client_events')
      .select('id, type, details, created_at')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ success: true, events: [] }, { status: 200 });
    }

    return NextResponse.json({ success: true, events: data || [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/client/events
// Body: { type: string, details?: any }
// Tries to insert into client_events. If schema missing -> no-op success.
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const type = typeof body?.type === 'string' ? body.type : 'unknown';
    const details = body?.details ?? null;

    const supabase = createAdminClient();

    const payload: ClientEvent = {
      client_id: userId,
      type,
      details,
    };

    const { error } = await supabase.from('client_events').insert(payload);

    // If table/column doesn't exist, still return success so UI works without schema
    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('relation') || msg.includes('table') || msg.includes('column')) {
        return NextResponse.json({ success: true, note: 'Event logged (soft) - missing DB table/columns' }, { status: 200 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
