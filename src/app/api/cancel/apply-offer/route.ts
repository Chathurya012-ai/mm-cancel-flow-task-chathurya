import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  // CSRF check
  const csrf = request.headers.get("CSRF-Token") || request.headers.get("x-csrf-token");
  if (!csrf) {
    return NextResponse.json({ ok: false, error: "Missing CSRF token" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { variant, reason, price } = body || {};
  if (!variant || !reason || typeof price !== "number") {
    return NextResponse.json({ error: "Invalid payload: price required" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Find latest cancellation for user_id = "1"
      const { data: rows, error } = await supabase
        .from("cancellations")
        .select("id, downsell_variant")
        .eq("user_id", "1")
        .order("created_at", { ascending: false })
        .limit(1);
      if (!error && rows && rows.length > 0) {
        const id = rows[0].id;
        const pinned = rows[0].downsell_variant;
        if (pinned === variant) {
          await supabase
            .from("cancellations")
            .update({
              accepted_downsell: true,
              pending_cancellation: false,
            })
            .eq("id", id);
        }
      }
    } catch {}
  }

  return NextResponse.json({ ok: true, status: "offer_applied" }, { status: 200 });
}
