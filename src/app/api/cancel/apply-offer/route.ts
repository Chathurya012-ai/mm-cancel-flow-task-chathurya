
import { NextResponse } from 'next/server';

async function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

const USER_ID = "00000000-0000-0000-0000-000000000001";
const ORIGINAL_PRICE = 100;

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

  const supabase = await (await import("@/lib/supabase")).getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("offers").insert({
        user_id: userId ?? null,
        variant,
        reason,
        price: typeof price === "number" ? price : null,
      });
    } catch {}
  }

  return NextResponse.json({ ok: true, status: "offer_applied" }, { status: 200 });
}
