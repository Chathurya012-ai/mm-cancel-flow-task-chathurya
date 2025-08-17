
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
// Remove unused NextRequest import
import { randomInt } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body?.userId ?? "1";
    const reason = typeof body?.reason === "string" ? body.reason : null;

    let variant: 'A' | 'B' = 'A';
    const supabase = getSupabaseClient();
    if (supabase) {
      // Query for latest pending cancellation for this user
      const { data: last, error: selErr } = await supabase
        .from('cancellations')
        .select('downsell_variant')
        .eq('user_id', userId)
        .eq('pending_cancellation', true)
        .order('created_at', { ascending: false })
        .limit(1);
      if (!selErr && last && last.length > 0 && (last[0].downsell_variant === 'A' || last[0].downsell_variant === 'B')) {
        variant = last[0].downsell_variant;
      } else {
        variant = randomInt(0,2) === 0 ? 'A' : 'B';
        await supabase.from('cancellations').insert({
          user_id: userId,
          downsell_variant: variant,
          reason: reason ?? null,
          accepted_downsell: false,
          pending_cancellation: true,
          created_at: new Date().toISOString(),
        });
      }
    }
    return NextResponse.json({ ok: true, status: "started", variant });
  } catch {}
  return NextResponse.json({ ok: true, status: "started", variant: "A" });
}
