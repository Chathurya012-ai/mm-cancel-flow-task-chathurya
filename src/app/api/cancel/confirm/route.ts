import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  const csrf = request.headers.get('CSRF-Token');
  if (!csrf) {
    return NextResponse.json({ ok: false, error: 'Missing CSRF-Token' }, { status: 400 });
  }

  // Get userId from request body (or session in production)
  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Missing userId' }, { status: 400 });
  }

  // Update the latest cancellations row for this user
  const { error } = await supabaseAdmin
    .from('cancellations')
    .update({ accepted_downsell: false, pending_cancellation: false })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, status: 'canceled' });
}
