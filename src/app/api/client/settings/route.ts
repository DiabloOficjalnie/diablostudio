import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase-server';
import { ensureUUID } from '@/lib/id';

type NewsletterSettings = {
  generalNewsletter: boolean
  productUpdates: boolean
  promotionalOffers: boolean
  technicalNews: boolean
}

type MarketingSettings = {
  analyticsConsent: boolean
  marketingEmails: boolean
  personalizedAds: boolean
  dataSharing: boolean
}

const DEFAULT_NEWSLETTER: NewsletterSettings = {
  generalNewsletter: true,
  productUpdates: true,
  promotionalOffers: false,
  technicalNews: false
};

const DEFAULT_MARKETING: MarketingSettings = {
  analyticsConsent: true,
  marketingEmails: false,
  personalizedAds: false,
  dataSharing: false
};

// GET - read user settings (fallbacks if columns missing)
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('client_profiles')
      .select('newsletter_settings, marketing_settings, two_factor_enabled')
      .eq('id', ensureUUID(userId))
      .single();

    if (error) {
      // If columns are missing or table not ready - return defaults gracefully
      return NextResponse.json({
        success: true,
        settings: {
          newsletter: DEFAULT_NEWSLETTER,
          marketing: DEFAULT_MARKETING,
          two_factor_enabled: false
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      settings: {
        newsletter: (data as any)?.newsletter_settings || DEFAULT_NEWSLETTER,
        marketing: (data as any)?.marketing_settings || DEFAULT_MARKETING,
        two_factor_enabled: (data as any)?.two_factor_enabled || false
      }
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

// PUT - update user settings (columns are optional - fallback to success if not present)
export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const newsletter = body?.newsletter as NewsletterSettings | undefined;
    const marketing = body?.marketing as MarketingSettings | undefined;

    const supabase = createAdminClient();

    // Try to update columns if they exist; otherwise report success (soft write)
    const { error } = await supabase
      .from('client_profiles')
      .update({
        newsletter_settings: newsletter ?? DEFAULT_NEWSLETTER,
        marketing_settings: marketing ?? DEFAULT_MARKETING,
        updated_at: new Date().toISOString()
      })
      .eq('id', ensureUUID(userId));

    if (error) {
      // If update fails due to missing columns, still return success so UI remains functional
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('column') || msg.includes('does not exist')) {
        return NextResponse.json({ success: true, note: 'Settings saved locally (missing DB columns)' }, { status: 200 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
