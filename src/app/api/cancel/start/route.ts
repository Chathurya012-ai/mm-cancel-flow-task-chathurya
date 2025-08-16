
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// Remove unused NextRequest import
import { randomInt } from 'crypto';

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 });
    }
    const { userId, reason } = await request.json();
    if (!userId || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Missing userId or reason' }, { status: 400 });
    }
    const trimmed = reason.trim();
    if (trimmed.length < 2 || trimmed.length > 200) {
      return NextResponse.json({ error: 'Reason must be 2-200 characters.' }, { status: 400 });
    }

    // Check last variant for user, else assign securely
    let variant = 'A';
    const { data: last, error: selErr } = await supabaseAdmin
      .from('cancellations')
      .select('downsell_variant')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (selErr) {
      return NextResponse.json({ error: selErr.message }, { status: 500 });
    }
    if (last && last.length > 0 && last[0].downsell_variant) {
      variant = last[0].downsell_variant;
    } else {
      variant = randomInt(2) === 0 ? 'A' : 'B';
    }

    // Mark subscription as pending_cancellation (stub: update subscriptions table)
    const { error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'pending_cancellation' })
      .eq('user_id', userId);
    if (subErr) {
      return NextResponse.json({ error: subErr.message }, { status: 500 });
    }
    // Insert cancellation reason
    const { error: insErr } = await supabaseAdmin.from('cancellations').insert({
      user_id: userId,
      downsell_variant: variant,
      reason: trimmed,
      accepted_downsell: false,
      created_at: new Date().toISOString(),
    });
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
