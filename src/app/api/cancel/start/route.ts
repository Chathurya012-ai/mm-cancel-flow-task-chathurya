
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { NextRequest } from 'next/server';
import { randomInt } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    if (!supabase) {
      console.error('500: Supabase client not configured');
      return NextResponse.json({ error: 'Supabase client not configured' }, { status: 500 });
    }
    const { userId, reason } = await req.json();
    if (!userId || typeof reason !== 'string') {
      console.error('400: Missing userId or reason', { userId, reason });
      return NextResponse.json({ error: 'Missing userId or reason' }, { status: 400 });
    }
    const trimmed = reason.trim();
    if (trimmed.length < 2 || trimmed.length > 200) {
      console.error('400: Reason length invalid', { reason });
      return NextResponse.json({ error: 'Reason must be 2-200 characters.' }, { status: 400 });
    }

    // Check last variant for user, else assign securely
    let variant = 'A';
    const { data: last, error: selErr } = await supabase
      .from('cancellations')
      .select('downsell_variant')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (selErr) {
      console.error('500: Supabase select error', selErr);
      return NextResponse.json({ error: selErr.message }, { status: 500 });
    }
    if (last && last.length > 0 && last[0].downsell_variant) {
      variant = last[0].downsell_variant;
    } else {
      variant = randomInt(2) === 0 ? 'A' : 'B';
    }

    // Mark subscription as pending_cancellation (stub: update subscriptions table)
    const { error: subErr } = await supabase
      .from('subscriptions')
      .update({ status: 'pending_cancellation' })
      .eq('user_id', userId);
    if (subErr) {
      console.error('500: Supabase update error', subErr);
      return NextResponse.json({ error: subErr.message }, { status: 500 });
    }
    // Insert cancellation reason
    const { error: insErr } = await supabase.from('cancellations').insert({
      user_id: userId,
      downsell_variant: variant,
      reason: trimmed,
      accepted_downsell: false,
      created_at: new Date().toISOString(),
    });
    if (insErr) {
      console.error('500: Supabase insert error', insErr);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
    return NextResponse.json({ variant });
  } catch (err) {
    console.error('500: Unexpected error', err);
    return NextResponse.json({ error: 'Unexpected server error', details: String(err) }, { status: 500 });
  }
}
