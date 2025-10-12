import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase-server';
import { ensureUUID } from '@/lib/id';

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
      .eq('client_id', ensureUUID(userId))
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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const clientId = ensureUUID(userId);

    // Ensure client profile exists to satisfy FK (client_quotes.client_id → client_profiles.id)
    let profileExists = true;
    const { data: profile, error: profileErr } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('id', clientId)
      .single();

    if (profileErr || !profile) {
      profileExists = false;
    }

    // Auto-create client profile if missing (Clerk -> Supabase)
    if (!profileExists) {
      const clerkUser = await currentUser().catch(() => null);

      const firstName = (clerkUser as any)?.firstName || 'Użytkownik';
      const lastName = (clerkUser as any)?.lastName || '';
      const email =
        (clerkUser as any)?.primaryEmailAddress?.emailAddress ||
        (clerkUser as any)?.emailAddresses?.[0]?.emailAddress ||
        '';

      if (!email) {
        return NextResponse.json({
          success: false,
          error: 'Brak profilu i adresu e-mail do utworzenia profilu klienta. Zaloguj się ponownie lub uzupełnij dane konta.'
        }, { status: 400 });
      }

      const { error: insertProfileErr } = await supabase
        .from('client_profiles')
        .insert({
          id: clientId,
          first_name: firstName,
          last_name: lastName,
          email
        });

      if (insertProfileErr) {
        return NextResponse.json({
          success: false,
          error: 'Nie udało się utworzyć profilu klienta: ' + insertProfileErr.message
        }, { status: 500 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const {
      area,
      floorSystem,
      substrateCondition,
      location,
      decorativeSystem,
      priceMin,
      priceMax,
      totalMin,
      totalMax,
      contactPreferences,
      consents
    } = body || {};

    if (!area || !floorSystem || !substrateCondition || !location || !decorativeSystem) {
      return NextResponse.json({
        success: false,
        error: 'Wszystkie pola kalkulacji są wymagane (area, floorSystem, substrateCondition, location, decorativeSystem).'
      }, { status: 400 });
    }

    const insertPayload = {
      client_id: clientId,
      area,
      floor_system: floorSystem,
      substrate_condition: substrateCondition,
      location,
      decorative_system: decorativeSystem,
      price_min: priceMin ?? null,
      price_max: priceMax ?? null,
      total_min: totalMin ?? null,
      total_max: totalMax ?? null,
      status: 'saved' as const,
      contact_preferences: contactPreferences ?? null,
      consents: consents ?? null
    };

    const { data, error } = await supabase
      .from('client_quotes')
      .insert(insertPayload)
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
