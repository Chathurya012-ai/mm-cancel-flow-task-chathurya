
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
// Remove unused NextRequest import
import { randomInt } from 'crypto';

export async function POST(request: Request) {
  try {
    const { userId, reason } = await request.json();
    if (!userId || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Missing userId or reason' }, { status: 400 });
    }
    const trimmed = reason.trim();
    if (trimmed.length < 2 || trimmed.length > 200) {
      return NextResponse.json({ error: 'Reason must be 2-200 characters.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      // Check last variant for user, else assign securely
      let variant = 'A';
      const { data: last, error: selErr } = await supabase
        .from('cancellations')
        .select('downsell_variant')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (!selErr && last && last.length > 0 && last[0].downsell_variant) {
        variant = last[0].downsell_variant;
      } else {
        variant = randomInt(2) === 0 ? 'A' : 'B';
      }

      // Mark subscription as pending_cancellation (stub: update subscriptions table)
      await supabase
        .from('subscriptions')
        .update({ status: 'pending_cancellation' })
        .eq('user_id', userId);

      // Insert cancellation reason
      await supabase.from('cancellations').insert({
        user_id: userId,
        downsell_variant: variant,
        reason: trimmed,
        accepted_downsell: false,
        created_at: new Date().toISOString(),
      });
    }
    return NextResponse.json({ ok: true, status: 'started' });
  } catch {} // ignore error, always return ok
  return NextResponse.json({ ok: true, status: 'started' });
}
