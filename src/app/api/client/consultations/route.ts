import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const date = url.searchParams.get('date');

    const supabase = createAdminClient();

    // If ?date=YYYY-MM-DD provided -> return booked slots for that date
    if (date) {
      const { data, error } = await supabase
        .from('consultation_requests')
        .select('preferred_time, status, preferred_date')
        .eq('preferred_date', date)
        .in('status', ['pending', 'confirmed']);

      if (error) {
        // Graceful fallback
        return NextResponse.json({ success: true, booked_slots: [] }, { status: 200 });
      }

      const booked = (data || []).map((r: any) => r.preferred_time).filter(Boolean);
      // Deduplicate
      const bookedUnique = Array.from(new Set(booked));

      return NextResponse.json({ success: true, booked_slots: bookedUnique }, { status: 200 });
    }

    // Otherwise return consultations for the logged in client
    const { data, error } = await supabase
      .from('consultation_requests')
      .select('id, quote_id, preferred_date, preferred_time, message, status, created_at')
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: true, consultations: [] }, { status: 200 });
    }

    return NextResponse.json({ success: true, consultations: data || [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const {
      quote_id = null,
      preferred_date,
      preferred_time,
      message = '',
      service_type = '',
      inquiry_type = ''
    } = payload || {};

    if (!preferred_date || !preferred_time || !service_type || !inquiry_type) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('consultation_requests')
      .insert({
        client_id: userId,
        quote_id,
        preferred_date,
        preferred_time,
        message,
        status: 'pending',
        service_type,
        inquiry_type
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Consultation request created', id: data?.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const { id, action, status } = payload || {};

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing consultation id' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Only allow cancelling by the owner; future: reschedule could be supported
    if (action === 'cancel' || status === 'cancelled') {
      const { error } = await supabase
        .from('consultation_requests')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('client_id', userId);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Consultation cancelled' }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
