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

    // Try to load affiliate profile
    const { data, error } = await supabase
      .from('client_affiliate')
      .select('referral_code, referrals_count, discount_percentage, points, created_at')
      .eq('client_id', userId)
      .single();

    if (error || !data) {
      // Graceful default if table missing or not initialized
      const fallback = {
        referral_code: `DS-${userId.slice(0, 6).toUpperCase()}`,
        referrals_count: 0,
        discount_percentage: 0,
        points: 0,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, affiliate: fallback }, { status: 200 });
    }

    return NextResponse.json({ success: true, affiliate: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
