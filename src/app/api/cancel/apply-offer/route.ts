import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  // CSRF check
  const csrf = request.headers.get("CSRF-Token") || request.headers.get("x-csrf-token");
  if (!csrf) {
    return NextResponse.json({ ok: false, error: "Missing CSRF token" }, { status: 403 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { variant, reason, price, userId } = data || {};
  if (!variant || !reason) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Persist offer if needed
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("offers").insert({
        user_id: userId ?? null,
        variant,
        reason,
        price: typeof price === "number" ? price : null,
      });
    } catch {
      // Optionally log error
    }
  }

  return NextResponse.json({ ok: true, status: "offer_applied" }, { status: 200 });
}
