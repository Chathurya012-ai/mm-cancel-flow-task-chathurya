
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { rating, comment, reason, userId } = await request.json();
  if (
    typeof rating !== 'number' ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await (await import("@/lib/supabase")).getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("cancel_feedback").insert({
        user_id: userId ?? null,
        rating,
        comment: comment ?? null,
        reason: reason ?? null,
      });
    } catch {}
  }
  return NextResponse.json({ ok: true });

}
