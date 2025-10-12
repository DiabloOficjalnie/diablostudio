import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase-server';
import { ensureUUID } from '@/lib/id';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('client_documents')
      .select('id, title, url, type, created_at')
      .eq('client_id', ensureUUID(userId))
      .order('created_at', { ascending: false });

    if (error) {
      // Graceful fallback if table missing or query error
      return NextResponse.json({ success: true, documents: [] }, { status: 200 });
    }

    return NextResponse.json({ success: true, documents: data || [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
