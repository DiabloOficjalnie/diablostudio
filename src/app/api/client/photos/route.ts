import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('client_photos')
      .select('id, title, url, thumbnail_url, created_at')
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      // Graceful fallback if table missing or query error
      return NextResponse.json({ success: true, photos: [] }, { status: 200 });
    }

    return NextResponse.json({ success: true, photos: data || [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
