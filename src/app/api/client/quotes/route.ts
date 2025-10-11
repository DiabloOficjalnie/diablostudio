import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase-server';

// GET - return quotes for the authenticated client
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('client_quotes')
      .select('id, area, floor_system, substrate_condition, location, decorative_system, price_min, price_max, total_min, total_max, status, created_at')
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      // Graceful fallback if table missing or query error
      console.error('Error fetching client quotes (client route):', error);
      return NextResponse.json({ success: true, quotes: [] }, { status: 200 });
    }

    return NextResponse.json({ success: true, quotes: data || [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
