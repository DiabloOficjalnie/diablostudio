import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase-server';
import { ensureUUID } from '@/lib/id';

// DELETE /api/client/quotes/:id
// Bezpieczne usuwanie wyceny należącej do zalogowanego klienta
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing quote id' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Usuń tylko wtedy, gdy rekord należy do bieżącego klienta
    const { error } = await supabase
      .from('client_quotes')
      .delete()
      .eq('id', id)
      .eq('client_id', ensureUUID(userId));

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
